import { ArrowLeft, RefreshCw, Printer } from 'lucide-react';
import Link from 'next/link';

interface QuizResultProps {
  subject: string;
  totalQuestions: number;
  correctCount: number;
  elapsedSeconds: number;
  wrongAnswers: any[];
  onRetry: () => void;
  onExportPdf?: () => void;
}

export function QuizResult({
  subject,
  totalQuestions,
  correctCount,
  elapsedSeconds,
  wrongAnswers,
  onRetry,
  onExportPdf,
}: QuizResultProps) {
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const isPerfect = accuracy === 100;

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
      <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-2xl w-full text-center">
        <div className="text-6xl mb-4">{isPerfect ? '🏆' : '🎉'}</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#333] mb-2">
          {isPerfect ? '完美通关！' : '完成！'}
        </h1>
        <p className="text-lg text-gray-600 mb-6">{subject}</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border-2 border-black p-4">
            <div className="text-4xl font-bold text-[#4CAF50]">{accuracy}%</div>
            <div className="text-sm text-gray-500 mt-1">正确率</div>
            <div className="text-lg font-bold text-[#333] mt-1">{correctCount}/{totalQuestions}</div>
          </div>
          <div className="bg-white border-2 border-black p-4">
            <div className="text-4xl font-bold text-[#2196F3]">{minutes}:{seconds.toString().padStart(2, '0')}</div>
            <div className="text-sm text-gray-500 mt-1">用时</div>
          </div>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="mb-8 text-left">
            <h2 className="text-xl font-bold text-[#333] mb-3 flex items-center gap-2">
              <span className="text-red-500">❌</span> 错题回顾
            </h2>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {wrongAnswers.map((wa, i) => (
                <div key={i} className="bg-red-50 border-2 border-red-200 rounded p-3">
                  <div className="font-bold text-sm text-[#333] mb-2">
                    {wa.questionText}
                  </div>
                  {'lineText' in wa && wa.lineText ? (
                    <div className="text-xl sm:text-2xl font-serif text-center py-2 text-[#333]" style={{ fontFamily: '"KaiTi", "楷体", serif' }}>
                      {(wa.lineText as string).split('').map((char, ci) => {
                        if (ci === (wa as any).charIndex) {
                          return (
                            <span key={ci}>
                              <span className="line-through text-red-400 mr-1">{char}</span>
                              <span className="text-green-600 font-bold mx-1">→ {(wa as any).correctAnswer}</span>
                            </span>
                          );
                        }
                        return <span key={ci}>{char}</span>;
                      })}
                    </div>
                  ) : 'poemTitle' in wa ? (
                    <>
                      <div className="text-xs text-gray-500 mb-2">
                        {(wa as any).dynasty} {(wa as any).author}
                      </div>
                      <div className="space-y-1">
                        {(wa as any).lines.map((line: { text: string; wrongChars: { charIndex: number; userAnswer: string; correctAnswer: string }[] }, li: number) => (
                          <div key={li} className="text-lg sm:text-xl font-serif text-center text-[#333]" style={{ fontFamily: '"KaiTi", "楷体", serif' }}>
                            {line.text.split('').map((char: string, ci: number) => {
                              const wrongChar = line.wrongChars.find((wc: { charIndex: number }) => wc.charIndex === ci);
                              if (wrongChar) {
                                return (
                                  <span key={ci} className="inline-flex flex-col items-center mx-px">
                                    <span className="line-through text-red-400">{char}</span>
                                    <span className="text-green-600 font-bold text-sm">{wrongChar.correctAnswer}</span>
                                  </span>
                                );
                              }
                              return <span key={ci}>{char}</span>;
                            })}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm">
                      <span className="text-red-600">你的答案: {wa.userAnswer}</span>
                      <span className="text-green-600 ml-3">正确答案: {wa.correctAnswer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="mc-btn bg-[#4CAF50] text-white flex-1 py-3 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> 重新练习
          </button>
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="mc-btn bg-[#2196F3] text-white flex-1 py-3 flex items-center justify-center gap-2"
            >
              <Printer className="h-4 w-4" /> 导出PDF
            </button>
          )}
          <Link href="/" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
