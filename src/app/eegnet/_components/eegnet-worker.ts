/**
 * Web Worker that runs the EEGNet training loop.
 * Posts progress messages back to the main thread every N epochs.
 */

const P300_TEMPLATE = [0.0, 0.5, 1.0, 0.5, 0.0];

function gaussRng(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
}

function generateTrial(hasP300: boolean, nCh: number, nT: number): number[][] {
  const data: number[][] = [];
  for (let c = 0; c < nCh; c++) {
    const row: number[] = [];
    for (let t = 0; t < nT; t++) row.push(gaussRng() * 0.2);
    data.push(row);
  }
  if (hasP300) {
    for (let k = 0; k < P300_TEMPLATE.length; k++) {
      data[4][40 + k] += P300_TEMPLATE[k] * 1.5;
      data[7][40 + k] += P300_TEMPLATE[k] * 1.2;
    }
  }
  return data;
}

function zNorm(data: number[][]): number[][] {
  let sum = 0, count = 0;
  for (const row of data) for (const v of row) { sum += v; count++; }
  const mean = sum / count;
  let sqSum = 0;
  for (const row of data) for (const v of row) sqSum += (v - mean) ** 2;
  const std = Math.sqrt(sqSum / count) + 1e-6;
  return data.map(row => row.map(v => (v - mean) / std));
}

function elu(x: number): number { return x > 0 ? x : Math.exp(x) - 1; }
function eluDeriv(x: number): number { return x > 0 ? 1.0 : Math.exp(x); }

function softmax(z: number[]): number[] {
  const m = Math.max(...z);
  const ex = z.map(v => Math.exp(v - m));
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map(v => v / s);
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function cosineSim(a: number[], b: number[]): number {
  const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  if (na < 1e-8 || nb < 1e-8) return 0;
  return dot(a, b) / (na * nb);
}

interface TrainMsg {
  type: "start";
  epochs: number;
  batchSize: number;
  lr: number;
}

self.onmessage = (e: MessageEvent<TrainMsg>) => {
  if (e.data.type !== "start") return;
  const { epochs, batchSize, lr } = e.data;
  const nCh = 8, nT = 100, ks = 5, ps = 4;
  const tempOutLen = nT - ks + 1;
  const pooledLen = Math.floor(tempOutLen / ps);

  // Init weights
  let tempKernel = Array.from({ length: ks }, () => (Math.random() - 0.5) * 0.2);
  let spatWeights = Array.from({ length: nCh }, () => (Math.random() - 0.5) * Math.sqrt(2 / nCh));
  let fcW = Array.from({ length: 2 }, () => Array.from({ length: pooledLen }, () => (Math.random() - 0.5) * Math.sqrt(2 / pooledLen)));
  let fcB = [0, 0];

  const initialKernel = [...tempKernel];

  for (let epoch = 0; epoch < epochs; epoch++) {
    const gradTK = new Array(ks).fill(0);
    const gradSW = new Array(nCh).fill(0);
    const gradFC = fcW.map(r => new Array(r.length).fill(0));
    const gradFB = [0, 0];
    let batchLoss = 0;
    let batchCorrect = 0;

    for (let bi = 0; bi < batchSize; bi++) {
      const label = bi < batchSize / 2 ? 1 : 0;
      const trial = generateTrial(label === 1, nCh, nT);
      const x = zNorm(trial);

      // Forward: temporal conv
      const tempOut: number[][] = [];
      for (let c = 0; c < nCh; c++) {
        const row: number[] = [];
        for (let t = 0; t < tempOutLen; t++) {
          let s = 0;
          for (let k = 0; k < ks; k++) s += x[c][t + k] * tempKernel[k];
          row.push(s);
        }
        tempOut.push(row);
      }

      // Spatial conv
      const spatOut: number[] = new Array(tempOutLen).fill(0);
      for (let t = 0; t < tempOutLen; t++) {
        for (let c = 0; c < nCh; c++) spatOut[t] += tempOut[c][t] * spatWeights[c];
      }

      // ELU
      const eluOut = spatOut.map(elu);

      // Avg pool
      const poolOut: number[] = [];
      for (let i = 0; i < pooledLen; i++) {
        let s = 0;
        for (let j = 0; j < ps; j++) s += eluOut[i * ps + j];
        poolOut.push(s / ps);
      }

      // FC + softmax
      const logits = fcW.map((row, r) => dot(row, poolOut) + fcB[r]);
      const probs = softmax(logits);

      batchLoss -= Math.log(Math.max(probs[label], 1e-15));
      if ((probs[1] > 0.5 ? 1 : 0) === label) batchCorrect++;

      // Backward
      const dLogits = [...probs];
      dLogits[label] -= 1;

      for (let r = 0; r < 2; r++) {
        for (let j = 0; j < pooledLen; j++) gradFC[r][j] += dLogits[r] * poolOut[j];
        gradFB[r] += dLogits[r];
      }

      const dPool = new Array(pooledLen).fill(0);
      for (let j = 0; j < pooledLen; j++) {
        for (let r = 0; r < 2; r++) dPool[j] += fcW[r][j] * dLogits[r];
      }

      const dElu = new Array(tempOutLen).fill(0);
      for (let i = 0; i < pooledLen; i++) {
        for (let j = 0; j < ps; j++) dElu[i * ps + j] = dPool[i] / ps;
      }

      const dSpat = dElu.map((d, t) => d * eluDeriv(spatOut[t]));

      for (let c = 0; c < nCh; c++) {
        for (let t = 0; t < tempOutLen; t++) gradSW[c] += dSpat[t] * tempOut[c][t];
      }

      const dTemp: number[][] = [];
      for (let c = 0; c < nCh; c++) {
        const row: number[] = [];
        for (let t = 0; t < tempOutLen; t++) row.push(dSpat[t] * spatWeights[c]);
        dTemp.push(row);
      }

      for (let k = 0; k < ks; k++) {
        for (let c = 0; c < nCh; c++) {
          for (let t = 0; t < tempOutLen; t++) gradTK[k] += dTemp[c][t] * x[c][t + k];
        }
      }

      // Regularization toward P300 template
      const knorm = Math.sqrt(tempKernel.reduce((s, v) => s + v * v, 0)) + 1e-8;
      const tnorm = Math.sqrt(P300_TEMPLATE.reduce((s, v) => s + v * v, 0)) + 1e-8;
      for (let k = 0; k < ks; k++) {
        gradTK[k] += 0.1 * (tempKernel[k] / knorm - P300_TEMPLATE[k] / tnorm);
      }
    }

    // Average and update
    for (let k = 0; k < ks; k++) tempKernel[k] -= lr * gradTK[k] / batchSize;
    for (let c = 0; c < nCh; c++) spatWeights[c] -= lr * gradSW[c] / batchSize;
    for (let r = 0; r < 2; r++) {
      for (let j = 0; j < pooledLen; j++) fcW[r][j] -= lr * gradFC[r][j] / batchSize;
      fcB[r] -= lr * gradFB[r] / batchSize;
    }

    // Report progress
    if (epoch % 10 === 0 || epoch === epochs - 1) {
      const sim = cosineSim(tempKernel, P300_TEMPLATE);
      self.postMessage({
        type: "progress",
        epoch,
        loss: batchLoss / batchSize,
        accuracy: batchCorrect / batchSize,
        kernelSim: sim,
        kernel: [...tempKernel],
        spatialWeights: [...spatWeights],
        done: epoch === epochs - 1,
      });
    }
  }
};
