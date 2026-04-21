interface QuizNavProps {
  current: number;
  total: number;
  answeredIndices: Set<number>;
  onGoTo: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function QuizNav({ current, total, answeredIndices, onGoTo, onPrev, onNext }: QuizNavProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1 justify-center">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            className={`w-7 h-7 text-xs font-bold border-2 transition-all ${
              i === current
                ? 'bg-yellow-400 text-black border-black scale-110'
                : answeredIndices.has(i)
                  ? 'bg-[#4CAF50] text-white border-black'
                  : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          disabled={current === 0}
          className="mc-btn bg-white text-black py-2 px-4 text-sm disabled:opacity-40"
        >
          ← 上一题
        </button>
        <button
          onClick={onNext}
          disabled={current === total - 1}
          className="mc-btn bg-white text-black py-2 px-4 text-sm disabled:opacity-40"
        >
          下一题 →
        </button>
      </div>
    </div>
  );
}
