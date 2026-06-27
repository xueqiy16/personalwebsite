export default function OriginList() {
  const words = [
    "Learning to Learn", "Life-long Learning", "Knowledge Transfer", 
    "Inductive Transfer", "Multi-task Learning", "Knowledge Consolidation", 
    "Context-sensitive Learning", "Knowledge-Based Inductive Bias", 
    "Meta-learning", "Incremental Learning", "Cumulative Learning"
  ];

  return (
    <div className="w-full bg-white py-6">
        <div className="w-full overflow-hidden bg-orange-400 py-4">
        <style>{`
            @keyframes rtl { 
            0% { transform: translateX(0); } 
            100% { transform: translateX(-50%); } 
            }
            
            .marquee { 
            display: flex; 
            width: max-content; 
            gap: 3rem;
            animation: rtl 20s linear infinite; 
            }
        `}</style>

        <div className="marquee">
            {[...words, ...words].map((word, i) => (
            <span key={i} className="whitespace-nowrap font-medium text-white font-semibold">
                {word}
            </span>
            ))}
        </div>
        </div>
    </div>
  );
}