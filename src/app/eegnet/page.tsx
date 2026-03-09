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
          <p className="text-neutral-500 text-sm italic mb-4">
            Covers: <code>generate_eeg_trial()</code>,{" "}
            <code>generate_batch()</code>
          </p>
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
            updates. Clarifying, the normalization process scales all input features equally,
            ensuring that sudden, high-voltage artifacts (i.e. eye blinks or muscle twitches) do not disproportionately skew
            the network's weights to one direction. A small &epsilon; is added to the denominator for numerical
            stability.
          </p>
          <p className="text-neutral-500 text-sm italic mb-4">
            Covers: <code>z_score_normalize()</code>
          </p>
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
          <p className="text-neutral-500 text-sm italic mb-4">
            Covers: <code>EEGNet.__init__()</code>
          </p>
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
          <p className="text-neutral-500 text-sm italic mb-4">
            Covers: <code>forward()</code> Stage 1
          </p>
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
          <p className="text-neutral-500 text-sm italic mb-4">
            Covers: <code>forward()</code> Stage 2,{" "}
            <code>spat_weights</code>
          </p>
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
          <p className="text-neutral-500 text-sm italic mb-4">
            Covers: <code>elu()</code>, <code>elu_derivative()</code>,{" "}
            <code>forward()</code> Stages 3–4
          </p>
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
          <p className="text-neutral-500 text-sm italic mb-4">
            Covers: <code>softmax()</code>,{" "}
            <code>cross_entropy_loss()</code>, <code>forward()</code> Stage 5
          </p>
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
          <p className="text-neutral-500 text-sm italic mb-4">
            Covers: <code>backward()</code>, <code>update_weights()</code>
          </p>
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
          <p className="text-neutral-500 text-sm italic mb-4">
            Covers: <code>train_eegnet()</code>,{" "}
            <code>cosine_similarity()</code>,{" "}
            <code>plot_training_results()</code>
          </p>
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
