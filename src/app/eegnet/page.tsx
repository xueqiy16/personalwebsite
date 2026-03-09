import InteractiveHeader from "./_components/InteractiveHeader";
import NarrativeSection from "./_components/NarrativeSection";
import NeuralNetworkViz from "./_components/NeuralNetworkViz";
import HeadMap from "./_components/HeadMap";
import TrialGenerator from "./_components/TrialGenerator";
import NormalizationDemo from "./_components/NormalizationDemo";
import ArchitectureDiagram from "./_components/ArchitectureDiagram";
import TemporalConvDemo from "./_components/TemporalConvDemo";
import SpatialConvDemo from "./_components/SpatialConvDemo";
import EluPoolDemo from "./_components/EluPoolDemo";
import ClassificationDemo from "./_components/ClassificationDemo";
import BackpropDemo from "./_components/BackpropDemo";
import TrainingSimulator from "./_components/TrainingSimulator";
import AnimatedWaveforms from "./_components/AnimatedWaveforms";
import ConfettiBanner from "./_components/ConfettiBanner";
import CodeToggle from "./_components/CodeToggle";

export const metadata = {
  title: "EEGNet — Signal Processing Documentation",
  description:
    "Interactive scroll-telling documentation for the EEGNet signal processing project.",
};

export default function EEGNetPage() {
  return (
    <div
      className="min-h-screen bg-white text-neutral-900"
      style={{ fontFamily: "'Calibri', 'Carlito', 'Segoe UI', sans-serif" }}
    >
      <InteractiveHeader />

      <div className="max-w-3xl mx-auto">
        {/* ── Section 0: Introduction ── */}
        <NarrativeSection id="intro">
          <NeuralNetworkViz />
        </NarrativeSection>

        {/* ── Section 1: What is the P300? ── */}
        <NarrativeSection id="section-1">
          <h2 className="text-3xl font-semibold mb-4">What is the P300?</h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            The P300 is an Event-Related Potential (ERP) — a measurable brain
            voltage change that occurs roughly 300 milliseconds after a person
            perceives an infrequent or meaningful stimulus. It is most commonly 
            produced when a subject is presented with a series of repetitive,
            frequent stimuli (e.g., a low-pitched tone or white image) and is then tasked with detecting
            or responding to a rare, different stimulus (e.g., a high-pitched tone or change in image color). It appears as a
            positive deflection in EEG recordings, most prominently at the
            parietal midline electrode <strong>Pz</strong> and the occipital
            electrode <strong>Oz</strong>. Click the electrodes below to see how the signal differs between P300 sites and
            non-P300 sites.
          </p>
        </NarrativeSection>

        {/* ── Section 2: Generating Synthetic Data ── */}
        <NarrativeSection id="section-2">
          <h2 className="text-3xl font-semibold mb-4">
            Generating Synthetic EEG Data
          </h2>
          <AnimatedWaveforms />
          <p className="text-neutral-700 leading-relaxed mb-4">
            Rather than using real recordings (which require ethics approval and
            specialised hardware), this implementation generates synthetic EEG
            trials, which are relatively easy to mimic compared to real EEG data.
            Each trial is an 8-channel &times; 100-sample matrix of
            Gaussian background noise. For &ldquo;Hit&rdquo; trials, a scaled copy of
            the P300 template is embedded in the Pz and Oz channels at
            time-indices 40&ndash;44 (out of 100 samples), simulating the
            positive deflection that occurs ~300&thinsp;ms after stimulus onset.
          </p>
          <p className="text-neutral-700 leading-relaxed mb-4">
            Training batches are balanced: half Hit, half No-Hit, then shuffled.
            This ensures the model cannot achieve high accuracy by simply
            predicting the majority class.
          </p>
          <CodeToggle
            label="generate_eeg_trial(), generate_batch()"
            code={`def generate_eeg_trial(has_p300=True, n_channels=8, n_time=100, noise_std=0.2):
    """Generate a single EEG trial with or without a P300 signal."""
    data = np.random.normal(0, noise_std, (n_channels, n_time))

    if has_p300:
        p300_onset = 40
        p300_length = len(P300_TEMPLATE)
        p300_amplitude = 1.5

        # Embed P300 in Pz (index 4) - primary P300 location
        data[4, p300_onset:p300_onset + p300_length] += P300_TEMPLATE * p300_amplitude

        # Embed P300 in Oz (index 7) - secondary P300 location (slightly weaker)
        data[7, p300_onset:p300_onset + p300_length] += P300_TEMPLATE * p300_amplitude * 0.8

    return data


def generate_batch(batch_size=32, n_channels=8, n_time=100):
    """Generate a balanced batch of EEG trials for training."""
    X = np.zeros((batch_size, n_channels, n_time))
    y = np.zeros(batch_size, dtype=int)

    # First half: Hit trials (P300 present)
    for i in range(batch_size // 2):
        X[i] = generate_eeg_trial(has_p300=True, n_channels=n_channels, n_time=n_time)
        y[i] = 1

    # Second half: No-Hit trials (noise only)
    for i in range(batch_size // 2, batch_size):
        X[i] = generate_eeg_trial(has_p300=False, n_channels=n_channels, n_time=n_time)
        y[i] = 0

    # Shuffle the batch
    perm = np.random.permutation(batch_size)
    return X[perm], y[perm]`}
          />
          <TrialGenerator />
        </NarrativeSection>

        {/* ── Section 3: Preprocessing ── */}
        <NarrativeSection id="section-3">
          <h2 className="text-3xl font-semibold mb-4">
            Preprocessing: Z-Score Normalization
          </h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            Before feeding a trial to the network, we apply global z-score
            normalization: subtract the mean and divide by the standard
            deviation. Now we apply this z-score normalization to ensure that all trials have zero mean and variance of 1,
            which prevents large-amplitude noise from dominating the gradient
            updates. Just to clarify, the normalization process scales all input features equally,
            which ensures that sudden, high-voltage artifacts (i.e. eye blinks or muscle twitches) do not disproportionately skew
            the network's weights to one direction. A small &epsilon; is added to the denominator for numerical
            stability.
          </p>
          <CodeToggle
            label="z_score_normalize()"
            code={`def z_score_normalize(x, epsilon=1e-6):
    """
    Apply global z-score normalization.

    This normalizes the entire input to have zero mean and unit variance,
    preserving the relative shape of patterns across channels.
    """
    mean = x.mean()
    std = x.std()
    x_norm = (x - mean) / (std + epsilon)
    return x_norm, mean, std`}
          />
          <NormalizationDemo />
        </NarrativeSection>

        {/* ── Section 4: Architecture Overview ── */}
        <NarrativeSection id="section-4">
          <h2 className="text-3xl font-semibold mb-4">Architecture Overview of EEGNet</h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            EEGNet [1][4] processes data through a compact pipeline: a temporal
            convolution extracts time-domain features, a spatial convolution
            learns which specific electrodes matter for the P300 detection, an ELU activation introduces
            non-linearity, average pooling compresses the temporal dimension, and
            a fully connected layer produces the final classification [5]. Hover over
            each block to see its weight shape and output dimensions; click to
            jump to that section.
          </p>
          <CodeToggle
            label="EEGNet.__init__()"
            code={`class EEGNet:
    """EEGNet-inspired architecture for P300 detection."""

    def __init__(self, n_channels=8, n_time=100, kernel_size=5, pool_size=4):
        self.n_channels = n_channels
        self.n_time = n_time
        self.kernel_size = kernel_size
        self.pool_size = pool_size

        # Compute dimensions through the network
        self.temporal_out_len = n_time - kernel_size + 1  # After temporal conv
        self.pooled_len = self.temporal_out_len // pool_size  # After pooling

        # LAYER 1: Temporal Convolution
        # A single kernel shared across all channels to detect time patterns
        self.temp_kernel = np.random.randn(kernel_size) * 0.1

        # LAYER 2: Spatial Convolution (Depthwise)
        # Learns which electrode locations are informative
        self.spat_weights = np.random.randn(n_channels) * np.sqrt(2.0 / n_channels)

        # LAYER 3: Fully Connected Classification
        # Maps pooled features to 2 classes (No-Hit, Hit)
        self.fc_weights = np.random.randn(2, self.pooled_len) * np.sqrt(2.0 / self.pooled_len)
        self.fc_bias = np.zeros(2)`}
          />
          <ArchitectureDiagram />
        </NarrativeSection>

        {/* ── Section 5: Temporal Convolution ── */}
        <NarrativeSection id="section-5">
          <h2 className="text-3xl font-semibold mb-4">Temporal Convolution</h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            The first layer slides a small kernel (size 5) across time for
            every channel independently. At each position, the kernel computes a
            dot product with the 5-sample window of z-score normalized EEG values beneath it. This is the
            classical 1-D convolution: the same set of weights is shared across
            all channels, so the kernel learns a single temporal pattern
            &mdash; ideally, the P300 shape.
            Note: Because the kernel is of size 5, the output will be 100 - 5 + 1 = 96 time points.
          </p>
          <p className="text-neutral-700 leading-relaxed mb-4">
            Press <strong>Play</strong> to watch the kernel slide across the Pz
            channel. Notice how the output peaks when the kernel aligns with the
            P300 peak around sample 40.
          </p>
          <CodeToggle
            label="forward() — Stage 1: Temporal Convolution"
            code={`# Inside EEGNet.forward():

# Store input for backward pass
self.input = x

# STAGE 1: Temporal Convolution
# Slides the kernel across time for each channel independently
# Output shape: (n_channels, temporal_out_len)
self.temp_out = np.zeros((self.n_channels, self.temporal_out_len))

for c in range(self.n_channels):
    for t in range(self.temporal_out_len):
        # Extract window of input at time t
        window = x[c, t:t + self.kernel_size]
        # Dot product with kernel (no bias)
        self.temp_out[c, t] = np.sum(window * self.temp_kernel)`}
          />
          <TemporalConvDemo />
        </NarrativeSection>

        {/* ── Section 6: Spatial Convolution ── */}
        <NarrativeSection id="section-6">
          <h2 className="text-3xl font-semibold mb-4">Spatial Convolution</h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            After the temporal convolution produces 8 feature maps (one per
            channel), the spatial convolution collapses them into a single
            time-series using a learned weighted sum. Each electrode gets its own
            weight — the network must learn that Pz and Oz carry the P300
            signal, while frontal and central electrodes contribute mostly noise.
          </p>
          <p className="text-neutral-700 leading-relaxed mb-4">
            Drag the sliders to see how different spatial weight configurations
            change the combined output. Click &ldquo;Learned weights&rdquo; to
            see the trained model&rsquo;s solution.
          </p>
          <CodeToggle
            label="forward() — Stage 2: Spatial Convolution"
            code={`# Inside EEGNet.forward() (continued):

# STAGE 2: Spatial Convolution
# Weighted sum across channels at each time point
# Output shape: (temporal_out_len,)
self.spat_out = np.zeros(self.temporal_out_len)

for t in range(self.temporal_out_len):
    # Weighted combination of all channels at time t
    self.spat_out[t] = np.sum(self.temp_out[:, t] * self.spat_weights)`}
          />
          <SpatialConvDemo />
        </NarrativeSection>

        {/* ── Section 7: Activation & Pooling ── */}
        <NarrativeSection id="section-7">
          <h2 className="text-3xl font-semibold mb-4">
            Activation &amp; Pooling
          </h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            The <strong>ELU</strong> (Exponential Linear Unit) activation function [6]
            introduces non-linearity. The previous steps (temporal and spatial convolutions) 
            are ultimately just linear mathematical operations (multiplying and adding weights).
             If you stacked them directly into a Fully Connected (FC) layer without this ELU activation
             function in between, the model would not be able to learn complex patterns in the data.
             Note: While ELU is the standard activation function for EEGNet, other activation functions
             may work as well, such as ReLU, Leaky ReLU, and PReLU [7].
          </p>
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-5 py-4 mb-4 font-mono text-sm text-neutral-700 flex items-center gap-2">
            <span>f(x) =</span>
            <svg viewBox="0 0 8 40" width="8" height="40" className="flex-shrink-0">
              <path d="M7,0 Q4,0 4,5 L4,15 Q4,20 1,20 Q4,20 4,25 L4,35 Q4,40 7,40" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <div className="flex flex-col gap-1">
              <div>x<span className="ml-6 text-neutral-400">if x &gt; 0</span></div>
              <div>&alpha; &middot; (e<sup>x</sup> &minus; 1)<span className="ml-4 text-neutral-400">if x &le; 0</span></div>
            </div>
          </div>
          <p className="text-neutral-700 leading-relaxed mb-4">
            Here &alpha; is a hyperparameter that controls the slope for
            negative inputs. Positive values pass through unchanged, while
            negative values are smoothly compressed toward &minus;&alpha;.
            Look at the graphical representation of the ELU function below to understand how ELU changes the shape of the signal.
          </p>
          <p className="text-neutral-700 leading-relaxed mb-4">
            <strong>Average pooling</strong> then divides the time axis into
            non-overlapping windows of size 4, replacing each window with its
            mean. This reduces 96 time points to 96 / 4 = 24 time points, which captures the essential
            trend while discarding noise. This is a common technique in time-series data analysis to reduce dimensionality and improve computational efficiency.
          </p>
          <CodeToggle
            label="elu(), elu_derivative(), forward() Stages 3–4"
            code={`def elu(self, x, alpha=1.0):
    """
    Exponential Linear Unit activation.
    ELU(x) = x if x > 0, else alpha * (exp(x) - 1)
    """
    return np.where(x > 0, x, alpha * (np.exp(x) - 1))

def elu_derivative(self, x, alpha=1.0):
    """
    Derivative of ELU for backpropagation.
    d/dx ELU(x) = 1 if x > 0, else alpha * exp(x)
    """
    return np.where(x > 0, 1.0, alpha * np.exp(x))


# Inside EEGNet.forward() (continued):

# STAGE 3: ELU Activation
self.elu_out = self.elu(self.spat_out)

# STAGE 4: Average Pooling
# Reduces temporal dimension by averaging over windows
# Output shape: (pooled_len,)
self.pool_out = np.zeros(self.pooled_len)

for i in range(self.pooled_len):
    start = i * self.pool_size
    end = start + self.pool_size
    self.pool_out[i] = np.mean(self.elu_out[start:end])`}
          />
          <EluPoolDemo />
        </NarrativeSection>

        {/* ── Section 8: Classification ── */}
        <NarrativeSection id="section-8">
          <h2 className="text-3xl font-semibold mb-4">
            Classification of Hit vs. No-Hit
          </h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            The pooled vector has 24 values. The Fully Connected (FC) layer
            multiplies it by a <strong>weight matrix W</strong> of shape
            (2,&thinsp;24) &mdash; two rows, one per class &mdash; and adds a
            bias. This produces two raw scores called <em>logits</em>.
            The <strong>softmax</strong> function (a generalization of the
            sigmoid function [3]) then converts these logits
            into probabilities that sum to&nbsp;1.
          </p>
          <p className="text-neutral-700 leading-relaxed mb-4">
            Where does the weight matrix come from? It is <strong>randomly
            initialized</strong> at the start and then <strong>learned</strong>{" "}
            during training via backpropagation &mdash; exactly like the
            temporal kernel and spatial weights. Toggle between Hit and No-Hit
            below to watch the full pipeline animate step by step.
          </p>
          <p className="text-neutral-700 leading-relaxed mb-4">
            <strong>Cross-entropy loss</strong> measures how wrong the
            prediction is: &minus;log(p<sub>correct</sub>). When the model is
            confident and correct, loss is near zero; when confident and wrong,
            loss spikes toward infinity.
          </p>
          <CodeToggle
            label="softmax(), cross_entropy_loss(), forward() Stage 5"
            code={`def softmax(self, x):
    """
    Softmax function for classification output.
    Converts logits to probabilities that sum to 1.
    """
    # Subtract max for numerical stability (prevents overflow)
    exp_x = np.exp(x - np.max(x))
    return exp_x / np.sum(exp_x)


def cross_entropy_loss(probs, target_label):
    """
    Compute cross-entropy loss for a single sample.
    Loss = -log(probability of correct class)
    """
    # Clip to avoid log(0)
    prob = np.clip(probs[target_label], 1e-15, 1.0 - 1e-15)
    return -np.log(prob)


# Inside EEGNet.forward() (continued):

# STAGE 5: Fully Connected + Softmax
self.logits = np.dot(self.fc_weights, self.pool_out) + self.fc_bias
self.probs = self.softmax(self.logits)

return self.probs`}
          />
          <ClassificationDemo />
        </NarrativeSection>

        <ConfettiBanner>
          <div className="text-2xl font-bold mb-3" style={{ color: "#4F46E5" }}>
            🎉 Congratulations!
          </div>
          <p className="text-neutral-700 leading-relaxed max-w-lg mx-auto">
            We just traversed the entire neural network forwards! The model has
            gone from taking in raw brainwave data to making a prediction on
            whether or not it contains the P300 spike.
          </p>
          <p className="text-neutral-700 leading-relaxed max-w-lg mx-auto mt-3">
            But what if the prediction was wrong? How can the model be refined?
            This is where <strong>Backpropagation</strong> comes in.
          </p>
        </ConfettiBanner>

        {/* ── Section 9: Backpropagation ── */}
        <NarrativeSection id="section-9">
          <h2 className="text-3xl font-semibold mb-4">Backpropagation</h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            Think of it this way: the model just made a guess. Maybe it was
            right, maybe it was completely wrong. Either way, the loss function
            gave us a single number that says <em>how inaccurate</em> that guess was.
            The question now is: Which weights in the network were most responsible for the inaccuracy of the prediction, and
            how should they change to do better next time?
          </p>
          <p className="text-neutral-700 leading-relaxed mb-4">
            That is exactly what backpropagation [2] answers. It walks backwards
            through the network — starting from the loss and working all the
            way back to the very first temporal kernel — and at every single
            layer it asks: &ldquo;if I nudged this weight up by a tiny amount,
            how much would the loss change?&rdquo; That ratio (change in loss /
            change in weight) is called the <strong>gradient</strong>, and it
            tells us both the <em>direction</em> and the <em>magnitude</em> of
            the adjustment we need to make.
          </p>
          <p className="text-neutral-700 leading-relaxed mb-4">
            The math behind this is the <strong>chain rule</strong> from
            calculus. Since the network is just a chain of operations (convolve
            → combine channels → ELU → pool → multiply by weights → softmax),
            the gradient at any layer is the product of all the local
            derivatives from the loss back to that layer.
          </p>
          <p className="text-neutral-700 leading-relaxed mb-4">
            Once all the gradients are computed, we <strong>update every
            weight</strong> by subtracting the gradient scaled by a small
            learning rate. That is one complete learning step: forward pass →
            compute loss → backpropagate gradients → update weights. Repeat this
            over and over again until the model steadily improves.
          </p>
          <p className="text-neutral-700 leading-relaxed mb-4">
            Step through each layer below to see exactly how the gradient flows
            from right to left — from the loss, all the way back to the
            temporal kernel.
          </p>
          <CodeToggle
            label="backward(), update_weights()"
            code={`def backward(self, target_label):
    """Backward pass: compute gradients for all parameters."""

    # GRADIENT OF CROSS-ENTROPY LOSS w.r.t. LOGITS
    # For softmax + cross-entropy: dL/dz = probs - one_hot(target)
    d_logits = self.probs.copy()
    d_logits[target_label] -= 1.0

    # GRADIENT OF FC LAYER
    d_fc_weights = np.outer(d_logits, self.pool_out)
    d_fc_bias = d_logits.copy()
    d_pool_out = np.dot(self.fc_weights.T, d_logits)

    # GRADIENT THROUGH AVERAGE POOLING
    d_elu_out = np.zeros(self.temporal_out_len)
    for i in range(self.pooled_len):
        start = i * self.pool_size
        end = start + self.pool_size
        d_elu_out[start:end] = d_pool_out[i] / self.pool_size

    # GRADIENT THROUGH ELU ACTIVATION
    d_spat_out = d_elu_out * self.elu_derivative(self.spat_out)

    # GRADIENT OF SPATIAL CONVOLUTION
    d_spat_weights = np.zeros(self.n_channels)
    d_temp_out = np.zeros((self.n_channels, self.temporal_out_len))
    for c in range(self.n_channels):
        for t in range(self.temporal_out_len):
            d_spat_weights[c] += d_spat_out[t] * self.temp_out[c, t]
            d_temp_out[c, t] = d_spat_out[t] * self.spat_weights[c]

    # GRADIENT OF TEMPORAL CONVOLUTION KERNEL (CRITICAL)
    # dL/d_kernel[k] = sum_{c,t} dL/d_temp_out[c,t] * input[c, t+k]
    d_temp_kernel = np.zeros(self.kernel_size)
    for k in range(self.kernel_size):
        for c in range(self.n_channels):
            for t in range(self.temporal_out_len):
                d_temp_kernel[k] += d_temp_out[c, t] * self.input[c, t + k]

    return {
        'temp_kernel': d_temp_kernel,
        'spat_weights': d_spat_weights,
        'fc_weights': d_fc_weights,
        'fc_bias': d_fc_bias
    }


def update_weights(self, gradients, learning_rate):
    """Update all weights using computed gradients."""
    self.temp_kernel -= learning_rate * gradients['temp_kernel']
    self.spat_weights -= learning_rate * gradients['spat_weights']
    self.fc_weights -= learning_rate * gradients['fc_weights']
    self.fc_bias -= learning_rate * gradients['fc_bias']`}
          />
          <BackpropDemo />
        </NarrativeSection>

        {/* ── Section 10: Training & Results ── */}
        <NarrativeSection id="section-10">
          <h2 className="text-3xl font-semibold mb-4">Training &amp; Results</h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            The training loop [2] generates a fresh batch each epoch, runs forward
            and backward passes for every sample, averages the gradients, and
            updates weights. A cosine-similarity regularization term gently
            steers the temporal kernel toward the P300 template shape.
          </p>
          <p className="text-neutral-700 leading-relaxed mb-4">
            Adjust the hyperparameters and press <strong>Train</strong> to
            run the full EEGNet training in your browser. Watch the loss
            decrease and accuracy climb proportionally. The temporal kernel should converge
            to the P300 bump shape. The spatial weights should peak at Pz
            and Oz.
          </p>
          <CodeToggle
            label="train_eegnet(), cosine_similarity()"
            code={`def cosine_similarity(a, b):
    """
    Compute cosine similarity between two vectors.
    A value of 1.0 means perfect alignment, -1.0 means opposite.
    """
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a < 1e-8 or norm_b < 1e-8:
        return 0.0
    return np.dot(a, b) / (norm_a * norm_b)


def train_eegnet(epochs=2000, batch_size=32, learning_rate=0.005):
    """Train the EEGNet model on synthetic P300 data."""

    model = EEGNet(n_channels=8, n_time=100, kernel_size=5, pool_size=4)
    initial_kernel = model.temp_kernel.copy()
    history = {'loss': [], 'accuracy': [], 'kernel_similarity': []}

    for epoch in range(epochs):
        X_batch, y_batch = generate_batch(batch_size=batch_size)

        batch_gradients = {
            'temp_kernel': np.zeros_like(model.temp_kernel),
            'spat_weights': np.zeros_like(model.spat_weights),
            'fc_weights': np.zeros_like(model.fc_weights),
            'fc_bias': np.zeros_like(model.fc_bias)
        }
        batch_loss = 0.0
        batch_correct = 0

        for i in range(batch_size):
            x = X_batch[i]
            y = y_batch[i]

            x_norm, _, _ = z_score_normalize(x)
            probs = model.forward(x_norm, training=True)
            loss = cross_entropy_loss(probs, y)
            batch_loss += loss

            prediction = np.argmax(probs)
            if prediction == y:
                batch_correct += 1

            gradients = model.backward(y)

            # Regularization: encourage kernel to match P300 template
            kernel_norm = model.temp_kernel / (np.linalg.norm(model.temp_kernel) + 1e-8)
            template_norm = P300_TEMPLATE / (np.linalg.norm(P300_TEMPLATE) + 1e-8)
            reg_lambda = 0.1
            gradients['temp_kernel'] += reg_lambda * (kernel_norm - template_norm)

            for key in batch_gradients:
                batch_gradients[key] += gradients[key]

        # Average gradients and update weights
        for key in batch_gradients:
            batch_gradients[key] /= batch_size
        model.update_weights(batch_gradients, learning_rate)

        avg_loss = batch_loss / batch_size
        accuracy = batch_correct / batch_size
        kernel_sim = cosine_similarity(model.temp_kernel, P300_TEMPLATE)

        history['loss'].append(avg_loss)
        history['accuracy'].append(accuracy)
        history['kernel_similarity'].append(kernel_sim)

    return model, history, initial_kernel`}
          />
          <TrainingSimulator />
        </NarrativeSection>

        <ConfettiBanner>
          <div className="text-2xl font-bold mb-3" style={{ color: "#4F46E5" }}>
            🎉 You made it!
          </div>
          <p className="text-neutral-700 leading-relaxed max-w-lg mx-auto">
            Congratulations, you have finished exploring the entire EEGNet architecture! That was a great journey, wasn't it?
          </p>
        </ConfettiBanner>

        {/* ── Section 11: References ── */}
        <NarrativeSection id="sources">
          <h2 className="text-3xl font-semibold mb-4">References</h2>
          <ol className="list-none space-y-3 text-neutral-700 leading-relaxed text-sm">
            <li>
              [1] Lawhern, V. J., Solon, A. J., Waytowich, N. R., Gordon, S. M.,
              Hung, C. P., &amp; Lance, B. J. (2018). EEGNet: a compact
              convolutional neural network for EEG-based brain–computer
              interfaces. <em>Journal of Neural Engineering</em>, 15(5), 056013.{" "}
              <a href="https://doi.org/10.1088/1741-2552/aace8c" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                https://doi.org/10.1088/1741-2552/aace8c
              </a>
            </li>
            <li>
              [2] Building a neural network FROM SCRATCH (no Tensorflow/Pytorch,
              just numpy &amp; math). (n.d.). YouTube.{" "}
              <a href="https://www.youtube.com/watch?v=w8yWXqWQYmU" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                https://www.youtube.com/watch?v=w8yWXqWQYmU
              </a>
            </li>
            <li>
              [3] Power, H. (2020, June 19). The Sigmoid Function Clearly
              Explained. YouTube.{" "}
              <a href="https://www.youtube.com/watch?v=TPqr8t919YM" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                https://www.youtube.com/watch?v=TPqr8t919YM
              </a>
            </li>
            <li>
              [4] Lawhern, V. J., Solon, A. J., Waytowich, N. R., Gordon, S. M.,
              Hung, C. P., &amp; Lance, B. J. (2016). EEGNet: A Compact
              Convolutional Network for EEG-based Brain-Computer Interfaces.
              arXiv.{" "}
              <a href="https://arxiv.org/abs/1611.08024" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                https://arxiv.org/abs/1611.08024
              </a>
            </li>
            <li>
              [5] Braindecode — EEGNet model documentation.{" "}
              <a href="https://braindecode.org/stable/generated/braindecode.models.EEGNet.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                https://braindecode.org/stable/generated/braindecode.models.EEGNet.html
              </a>
            </li>
            <li>
              [6] ELU Activation Function in Neural Network. GeeksforGeeks.{" "}
              <a href="https://www.geeksforgeeks.org/deep-learning/elu-activation-function-in-neural-network/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                https://www.geeksforgeeks.org/deep-learning/elu-activation-function-in-neural-network/
              </a>
            </li>
            <li>
              [7] ReLU Activation Function Variants Explained. YouTube.{" "}
              <a href="https://www.youtube.com/watch?v=ScGmrFBmoVI" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                https://www.youtube.com/watch?v=ScGmrFBmoVI
              </a>
            </li>
          </ol>
        </NarrativeSection>
      </div>
    </div>
  );
}
