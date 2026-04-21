interface QuizProgressBarProps {
  answered: number;
  total: number;
}

export function QuizProgressBar({ answered, total }: QuizProgressBarProps) {
  const percentage = total > 0 ? (answered / total) * 100 : 0;

  return (
    <div className="w-full bg-black/30 rounded-sm border-2 border-white/20 h-6 overflow-hidden relative">
      <div
        className="h-full bg-[#4CAF50] transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
        {answered} / {total}
      </div>
    </div>
  );
}
