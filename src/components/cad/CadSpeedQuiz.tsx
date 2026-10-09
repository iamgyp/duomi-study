'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CAD_COMMANDS, CadCommand } from '@/lib/cad/cad-data';
import {
  playCadKeyClick,
  playCadCommandSuccess,
  playCadError,
  playCadEscape,
  speakCadCommand,
  playCadMissionComplete,
} from '@/lib/cad/cad-sounds';
import { saveRecord } from '@/lib/study-storage';
import { Zap, Trophy, RotateCcw, Volume2, Sparkles, CheckCircle, XCircle } from 'lucide-react';

interface Question {
  cmd: CadCommand;
  prompt: string;
}

const TOTAL_QUESTIONS = 10;

function generateQuestions(): Question[] {
  // 从 20 个命令中剔除单纯控制键 SPACE 和 ESC，保留 18 个实战命令
  const pool = CAD_COMMANDS.filter((c) => c.key !== 'SPACE' && c.key !== 'ESC');
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, TOTAL_QUESTIONS);

  return selected.map((cmd) => {
    let prompt = `想要在图纸上完成【${cmd.chinese}】操作，应该输入什么命令？`;
    if (cmd.key === 'MI') prompt = '想用“照镜子魔法”把左边的东西一秒对称变到右边，敲什么键？';
    if (cmd.key === 'TR') prompt = '拿小剪刀咔嚓剪掉交叉的多余线条，敲什么快捷键？';
    if (cmd.key === 'REC') prompt = '拼出长方形大积木地基，敲什么快捷键？';
    if (cmd.key === 'C') prompt = '画出一个圆滚滚的轮子或圆形观星窗，敲什么键？';
    if (cmd.key === 'L') prompt = '像直直的铅笔一样，画一条笔直的线，敲什么键？';
    if (cmd.key === 'E') prompt = '像橡皮擦一样擦掉画错的线条，敲什么键？';
    if (cmd.key === 'CO') prompt = '双胞胎制造机！一键复制出相同的图形，敲什么键？';
    if (cmd.key === 'RO') prompt = '像大风车一样转个角度，敲什么旋转命令？';
    if (cmd.key === 'O') prompt = '等距离向外向内扩散一圈做双层墙，敲什么偏移命令？';
    if (cmd.key === 'A') prompt = '画出弯弯的彩虹、小拱桥和鼓起的帆，敲什么圆弧命令？';
    if (cmd.key === 'EL') prompt = '像压扁的鸡蛋和飞碟一样，画椭圆敲什么键？';
    if (cmd.key === 'F') prompt = '把尖锐扎手的直角磨成圆角，敲什么倒角命令？';
    if (cmd.key === 'SC') prompt = '像吃变大蘑菇一样成比例放大缩小，敲什么缩放命令？';
    if (cmd.key === 'DLI') prompt = '掏出工程尺测量物体的精确长度，敲什么尺寸命令？';

    return { cmd, prompt };
  });
}

export function CadSpeedQuiz() {
  const [questions, setQuestions] = useState<Question[]>(() => generateQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputBuffer, setInputBuffer] = useState('');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [answeredList, setAnsweredList] = useState<
    { cmd: CadCommand; isCorrect: boolean; userAnswer: string }[]
  >([]);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const startNewQuiz = () => {
    const q = generateQuestions();
    setQuestions(q);
    setCurrentIndex(0);
    setInputBuffer('');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setAnsweredList([]);
    setIsFinished(false);
    setFeedback(null);
  };

  useEffect(() => {
    if (!isFinished && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isFinished]);

  const currentQ = questions[currentIndex];

  const handleSubmit = useCallback((overrideBuffer?: string) => {
    if (!currentQ || isFinished || feedback !== null) return;
    const raw = (overrideBuffer !== undefined ? overrideBuffer : inputBuffer).trim().toUpperCase();
    if (!raw) return;

    const isCorrect = raw === currentQ.cmd.key.toUpperCase();

    if (isCorrect) {
      playCadCommandSuccess();
      speakCadCommand(currentQ.cmd.name, currentQ.cmd.chinese);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));
      setScore((prev) => prev + 10);
      setFeedback('correct');
      setAnsweredList((prev) => [
        ...prev,
        { cmd: currentQ.cmd, isCorrect: true, userAnswer: raw },
      ]);
    } else {
      playCadError();
      setCombo(0);
      setFeedback('wrong');
      setAnsweredList((prev) => [
        ...prev,
        { cmd: currentQ.cmd, isCorrect: false, userAnswer: raw },
      ]);
    }

    setTimeout(() => {
      setInputBuffer('');
      setFeedback(null);
      if (currentIndex + 1 >= questions.length) {
        setIsFinished(true);
        playCadMissionComplete();
        // 保存一条 5 分钟学习时长
        saveRecord({
          subject: 'cad',
          contentType: 'cad-drawing',
          contentTitle: 'CAD 快捷键闪电速认闯关',
          duration: 5,
          completedAt: new Date().toISOString(),
        });
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 1100);
  }, [currentQ, isFinished, feedback, inputBuffer, combo, currentIndex, questions.length]);

  // 全局键盘监听（字母 + 退格 + ESC + 空格提交）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || feedback !== null) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        playCadEscape();
        setInputBuffer('');
        return;
      }

      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        handleSubmit();
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        playCadKeyClick();
        setInputBuffer((prev) => prev.slice(0, -1));
        return;
      }

      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        e.preventDefault();
        playCadKeyClick();
        setInputBuffer((prev) => (prev + e.key.toUpperCase()).slice(0, 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, isFinished, feedback]);

  if (questions.length === 0) return null;

  // ── 结算成绩单 ──────────────────────────────────────────
  if (isFinished) {
    const stars = score >= 90 ? 3 : score >= 60 ? 2 : 1;
    return (
      <div className="bg-[#1C212A] border-4 border-[#2F3947] rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto text-center text-white shadow-2xl animate-fade-in select-none">
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full border-4 border-black mx-auto flex items-center justify-center text-5xl shadow-[4px_4px_0_rgba(0,0,0,1)] -mt-16 mb-4">
          <Trophy className="w-12 h-12 text-white" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-yellow-300 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] mb-2">
          ⚡ 闪电速认闯关完成！
        </h2>
        <p className="text-gray-300 text-sm sm:text-base font-sans mb-6">
          你的键盘盲打与 CAD 指令反射神经太厉害了！
        </p>

        {/* 核心指标统计 */}
        <div className="grid grid-cols-3 gap-3 bg-[#13161C] border-2 border-gray-700/80 rounded-2xl p-4 mb-6">
          <div>
            <span className="text-xs text-gray-400 font-mono block">最终得分</span>
            <span className="text-3xl sm:text-4xl font-black text-cyan-400">{score}</span>
            <span className="text-xs text-gray-500 font-mono block">/ 100</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-mono block">最高连击</span>
            <span className="text-3xl sm:text-4xl font-black text-yellow-400">🔥 {maxCombo}</span>
            <span className="text-xs text-gray-500 font-mono block">连中</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-mono block">星级评定</span>
            <span className="text-2xl sm:text-3xl block text-amber-400">
              {'⭐'.repeat(stars)}
            </span>
            <span className="text-xs text-gray-500 font-mono block">等级</span>
          </div>
        </div>

        {/* 答题明细列表 */}
        <div className="text-left mb-6 max-h-56 overflow-y-auto space-y-2 pr-1">
          {answeredList.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
                item.isCorrect
                  ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                  : 'bg-red-950/40 border-red-600/60 text-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.isCorrect ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span className="font-bold">{item.cmd.chinese}</span>
                <span className="text-gray-400 font-sans">({item.cmd.name})</span>
              </div>
              <div className="font-mono font-black flex items-center gap-2">
                <span>正解: {item.cmd.key}</span>
                {!item.isCorrect && (
                  <span className="text-red-400 text-xs">你的输入: {item.userAnswer || '空'}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={startNewQuiz}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black border-2 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 text-base flex items-center gap-2 mx-auto transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span>再来一轮挑战</span>
        </button>
      </div>
    );
  }

  // ── 答题主界面 ──────────────────────────────────────────
  return (
    <div className="bg-[#1C212A] border-4 border-[#2F3947] rounded-3xl p-5 sm:p-8 max-w-2xl mx-auto text-white shadow-2xl select-none">
      {/* 顶部状态条 */}
      <div className="flex items-center justify-between mb-4 text-xs sm:text-sm font-mono text-gray-400">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-300 font-bold">
            题号: {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {combo > 1 && (
          <div className="bg-amber-500/20 border border-amber-500 text-yellow-300 px-2.5 py-0.5 rounded-full text-xs font-bold animate-bounce flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>连击 Combo x{combo}！</span>
          </div>
        )}

        <div className="text-cyan-400 font-bold">得分: {score}</div>
      </div>

      {/* 进度条 */}
      <div className="w-full h-2.5 bg-gray-800 rounded-full border border-gray-700 overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-yellow-400 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 题目展示区 */}
      <div className="bg-[#141820] border-2 border-cyan-500/40 rounded-2xl p-6 text-center mb-6 relative overflow-hidden">
        <div className="text-5xl mb-3">{currentQ.cmd.icon}</div>

        <h3 className="text-lg sm:text-xl font-bold text-gray-100 leading-relaxed font-sans mb-2">
          {currentQ.prompt}
        </h3>

        <div className="flex items-center justify-center gap-2 text-sm text-yellow-300 font-bold">
          <span>英文名: {currentQ.cmd.name}</span>
          <button
            onClick={() => speakCadCommand(currentQ.cmd.name, currentQ.cmd.chinese)}
            className="p-1 rounded bg-gray-700 hover:bg-cyan-600 text-cyan-300 hover:text-white"
            title="听发音"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-gray-400 font-sans mt-2">
          💡 口诀提示：{currentQ.cmd.tip}
        </p>

        {/* 答案即时反馈浮层 */}
        {feedback && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md transition-all ${
              feedback === 'correct' ? 'bg-emerald-950/90 text-emerald-300' : 'bg-red-950/90 text-red-300'
            }`}
          >
            <div className="text-4xl mb-1">{feedback === 'correct' ? '🎉' : '❌'}</div>
            <div className="text-2xl font-black">
              {feedback === 'correct' ? '太棒了，完全正确！' : `答错了，正解是【${currentQ.cmd.key}】`}
            </div>
            <div className="text-sm font-sans mt-1 text-gray-200">
              {currentQ.cmd.name} · {currentQ.cmd.chinese}
            </div>
          </div>
        )}
      </div>

      {/* 命令行输入框 */}
      <div className="bg-[#111419] border-2 border-[#3A4556] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-gray-400 font-mono font-bold text-base">输入快捷键:</span>
          <div className="relative flex items-center min-w-[140px] bg-[#0A0C0F] px-4 py-2 rounded-xl border border-cyan-500/50">
            <span className="text-yellow-300 font-mono font-black text-2xl tracking-widest">
              {inputBuffer}
            </span>
            <span className="inline-block w-2.5 h-6 bg-yellow-400 ml-1 animate-pulse" />
            <input
              ref={inputRef}
              type="text"
              className="absolute inset-0 opacity-0 cursor-default"
              value={inputBuffer}
              onChange={(e) => setInputBuffer(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <button
          onClick={() => handleSubmit()}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold border-2 border-emerald-400/80 rounded-xl shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center justify-center gap-1.5 text-sm transition-all"
        >
          <span>␣</span>
          <span>拍空格确认 (Space)</span>
        </button>
      </div>

      {/* 快捷点击辅助胶囊 */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
        <span className="text-gray-500 text-[11px] mr-1">快捷备选:</span>
        {(['REC', 'L', 'C', 'CO', 'TR', 'RO', 'MI', 'O', 'PL', 'A', 'EL', 'F', 'SC', 'H', 'DLI', 'E'] as const).map(
          (key) => (
            <button
              key={key}
              onClick={() => {
                playCadKeyClick();
                setInputBuffer(key);
              }}
              className="px-2.5 py-1 bg-[#252B36] hover:bg-[#323A48] text-gray-200 rounded font-bold border border-gray-700 active:scale-95 transition-all"
            >
              {key}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
