import InteractiveHeader from "./_components/InteractiveHeader";
import NarrativeSection from "./_components/NarrativeSection";
import OriginNames from "./_components/OriginNames";
import Timeline from "./_components/Timeline";

export const metadata = {
    title: "Transfer Learning",
    description:
      "Interactive scroll-telling documentation for understanding Transfer Learning and its application to EEGs.",
  };
  
  export default function Transfer_LearningPage() {
    return (
        <div
            className="min-h-screen bg-white text-neutral-900"
            style={{ fontFamily: "'Calibri', 'Carlito', 'Segoe UI', sans-serif" }}
        >
            <InteractiveHeader />

            <div className="max-w-3xl mx-auto">
                {/* Introduction */}
                <NarrativeSection id="intro">
                    <h2 className="text-3xl font-semibold mb-4 pt-8 pb-4 md:py-8">What "Transfer"? What "Learn"?</h2>
                    <p className="text-neutral-700 leading-relaxed mb-4">
                        Conceptually, transfer learning (TL) refers to the passing of knowledge or experience from one related domain to another, mimicking the human learning or growth curve. For instance, 
                        learning to play the piano makes it vastly easier to learn another musical instrument. The same can be applied to machine learning algorithms!
                    </p>
                    <p className="text-neutral-700 leading-relaxed mb-4">
                        Before we explore this powerful concept, it's worthwhile to understand the origins of TL.
                    </p>
                    <p>
                        Historically, the pursuit of this 'reusable intelligence' has been refered to by many names, shown below in the orange, interminable doom-scroll.
                    </p>
                    <OriginNames />
                    <p className="text-neutral-700 leading-relaxed mb-4">
                        And what is the historical evolution of TL in EEG Decoding? Click on the nodes below to inspect.
                    </p>
                    <Timeline />  
                </NarrativeSection>

                {/* Definition of TL */}
                <NarrativeSection id="definition">
                    <h2 className="text-3xl font-semibold mb-4 pb-4 md:py-8">Defining Transfer Learning</h2>
                    <p className="text-neutral-700 leading-relaxed mb-4">
                        Now onto the fun part!
                    </p>
                    <p className="text-neutral-700 leading-relaxed mb-4">
                        To build our understand of TL from the basics, you are instructed to forget all your knowledge of transfer learning from the algorithmic perspective, human perspective, or any other perspective you choose to take. 
                    </p>
                    <p className="text-neutral-700 leading-relaxed mb-4">
                        Please achieve the state of the tabula rasa or "blank state". I'll give you white space to do this.
                    </p>
                    <p className="text-neutral-700 leading-relaxed mb-400">
                    </p>
                    <p>
                        Ok great, time to get started!
                    </p>
                </NarrativeSection>

                {/* References */}
                <NarrativeSection id="sources">
                <h2 className="text-3xl font-semibold mb-4">References</h2>
                <ol className="list-none space-y-3 text-neutral-700 leading-relaxed text-sm">
                    <li>
                    [1] Otarbay, Z., & Kyzyrkanov, A. (2025). Transfer learning for subject-independent motor imagery EEG classification using convolutional relational networks. Frontiers in Neuroscience, 19, Article 
                    1691929.{" "}
                    <a href="https://doi.org/10.3389/fnins.2025.1691929" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        https://doi.org/10.3389/fnins.2025.1691929
                    </a>
                    </li>
                    <li>
                    [2] Barachant, A., Bonnet, S., Congedo, M., & Jutten, C. (2012). Multiclass Brain–Computer Interface Classification by Riemannian Geometry. IEEE Transactions on Biomedical Engineering, 59(4), 
                    920–928.{" "}
                    <a href="https://doi.org/10.1109/tbme.2011.2172210" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        https://doi.org/10.1109/tbme.2011.2172210
                    </a>
                    </li>
                    <li>
                    [3] Zhang, Y., Nam, C. S., Zhou, G., Jin, J., Wang, X., & Cichocki, A. (2019). Temporally Constrained Sparse Group Spatial Patterns for Motor Imagery BCI. IEEE Transactions on Cybernetics, 49(9), 
                    3322–3332.{" "}
                    <a href="https://doi.org/10.1109/tcyb.2018.2841847" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        https://doi.org/10.1109/tcyb.2018.2841847
                    </a>
                    </li>
                    <li>
                    [4] Chang, Z., Zhang, C., & Li, C. (2022). Motor Imagery EEG Classification Based on Transfer Learning and Multi-Scale Convolution Network. Micromachines, 13(6), 
                    927.{" "}
                    <a href="https://doi.org/10.3390/mi13060927" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        https://doi.org/10.3390/mi13060927
                    </a>
                    </li>
                    <li>
                    [5] Zhang, J., Li, K., Yang, B., & Zhao, Z. (2025). Cross-dataset motor imagery decoding — A transfer learning assisted graph convolutional network approach. Biomedical Signal Processing and Control, 102, 
                    107213.{" "}
                    <a href="https://doi.org/10.1016/j.bspc.2024.107213" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        https://doi.org/10.1016/j.bspc.2024.107213
                    </a>
                    </li>
                    <li>
                    [6] Wu, H., Ma, Z., Guo, Z., Wu, Y., Zhang, J., Zhou, G., & Long, J. (2024). Online Privacy-Preserving EEG Classification by Source-Free Transfer Learning. IEEE Transactions on Neural Systems and Rehabilitation Engineering, 32, 
                    3059-3070.{" "}
                    <a href="https://doi.org/10.1109/tnsre.2024.3445115" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        https://doi.org/10.1109/tnsre.2024.3445115
                    </a>
                    </li>

                    
                </ol>
                </NarrativeSection>

            </div>
        </div>
    );
}