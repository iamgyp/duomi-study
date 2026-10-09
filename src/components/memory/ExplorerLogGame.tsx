'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  EXPLORER_LESSONS,
  type ExplorerLesson,
  type ExplorerTimelineEvent,
  getExplorerLesson,
} from '@/lib/memory/data-explorer';
import { speakChinese, setTtsEnabled } from '@/lib/typing/tts';
import {
  unlockMemoryAudio,
  playMatchSuccessSound,
  playMismatchSound,
  playVictorySound,
} from '@/lib/memory/sound-effects';

interface LessonViewProps {
  lesson: ExplorerLesson;
  onNextLesson: () => void;
  onRestart: () => void;
}

function ExplorerLessonView({ lesson, onNextLesson, onRestart }: LessonViewProps) {
  // 流程阶段: 1(故事展示) -> 2A(时序重构) -> 2B(要素分类可选) -> 3(语义与逻辑验证) -> complete(结算)
  const [stage, setStage] = useState<'story' | 'timeline' | 'category' | 'quiz' | 'complete'>('story');

  // 阶段 1 状态
  const [showPinyin, setShowPinyin] = useState(true);
  const [ttsPlaying, setTtsPlaying] = useState(false);

  // 阶段 2A 时序重构状态 (打乱的卡片)
  const [shuffledTimeline, setShuffledTimeline] = useState<ExplorerTimelineEvent[]>(() => {
    let shuffled = [...lesson.timelineEvents].sort(() => Math.random() - 0.5);
    while (
      shuffled.length > 2 &&
      shuffled.every((item, idx) => item.order === lesson.timelineEvents[idx].order)
    ) {
      shuffled = [...lesson.timelineEvents].sort(() => Math.random() - 0.5);
    }
    return shuffled;
  });
  const [timelineFeedback, setTimelineFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // 阶段 2B 要素分类状态
  const [categoryAssignments, setCategoryAssignments] = useState<Record<string, 'A' | 'B'>>({});
  const [categoryFeedback, setCategoryFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // 阶段 3 逻辑验证答题状态
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredState, setAnsweredState] = useState<'idle' | 'answered'>('idle');
  const [quizScore, setQuizScore] = useState(0);

  // 朗读故事
  const handlePlayTts = () => {
    unlockMemoryAudio();
    setTtsEnabled(true);
    setTtsPlaying(true);
    const cleanText = lesson.story.text.replace(/【|】/g, '');
    speakChinese(cleanText, 0.82);
    setTimeout(() => setTtsPlaying(false), 8000);
  };

  // 进入阶段 2A
  const handleStartChallenge = () => {
    unlockMemoryAudio();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setStage('timeline');
  };

  // 时序卡片上移/下移
  const moveTimelineItem = (index: number, direction: 'up' | 'down') => {
    unlockMemoryAudio();
    const newItems = [...shuffledTimeline];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setShuffledTimeline(newItems);
    setTimelineFeedback('idle');
  };

  // 检验时序重构
  const checkTimelineOrder = () => {
    unlockMemoryAudio();
    const isCorrect = shuffledTimeline.every((item, idx) => item.order === idx + 1);

    if (isCorrect) {
      playMatchSuccessSound();
      setTimelineFeedback('correct');
      setTimeout(() => {
        if (lesson.categoryTask && lesson.categoryTask.items.length > 0) {
          setStage('category');
        } else {
          setStage('quiz');
        }
      }, 900);
    } else {
      playMismatchSound();
      setTimelineFeedback('wrong');
    }
  };

  // 分类归属切换
  const toggleItemBucket = (itemId: string, bucketId: 'A' | 'B') => {
    unlockMemoryAudio();
    setCategoryAssignments((prev) => ({
      ...prev,
      [itemId]: bucketId,
    }));
    setCategoryFeedback('idle');
  };

  // 检验分类
  const checkCategory = () => {
    unlockMemoryAudio();
    if (!lesson.categoryTask) return;

    const allAssigned = lesson.categoryTask.items.every(
      (item) => categoryAssignments[item.id] !== undefined
    );
    if (!allAssigned) {
      playMismatchSound();
      setCategoryFeedback('wrong');
      return;
    }

    const isAllCorrect = lesson.categoryTask.items.every(
      (item) => categoryAssignments[item.id] === item.correctBucketId
    );

    if (isAllCorrect) {
      playMatchSuccessSound();
      setCategoryFeedback('correct');
      setTimeout(() => {
        setStage('quiz');
      }, 900);
    } else {
      playMismatchSound();
      setCategoryFeedback('wrong');
    }
  };

  // 答题选择
  const handleSelectOption = (optIdx: number) => {
    if (answeredState === 'answered') return;
    unlockMemoryAudio();
    setSelectedAnswer(optIdx);
    setAnsweredState('answered');

    const curQ = lesson.questions[questionIndex];
    if (optIdx === curQ.correctIndex) {
      playMatchSuccessSound();
      setQuizScore((s) => s + 1);
    } else {
      playMismatchSound();
    }
  };

  // 下一题 / 完成关卡
  const handleNextQuestion = () => {
    unlockMemoryAudio();
    if (questionIndex < lesson.questions.length - 1) {
      setQuestionIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnsweredState('idle');
    } else {
      playVictorySound();
      setStage('complete');
    }
  };

  return (
    <>
      {/* 认知三阶段进度条 */}
      <div className="w-full max-w-4xl mb-4 bg-black/40 border border-white/20 p-2 rounded-lg flex items-center justify-around text-xs">
        <div
          className={`flex items-center gap-1.5 font-bold ${
            stage === 'story' ? 'text-yellow-300 scale-105' : 'text-gray-400'
          }`}
        >
          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
            1
          </span>
          <span>场景沉浸展示</span>
        </div>
        <span className="text-gray-600">&rarr;</span>
        <div
          className={`flex items-center gap-1.5 font-bold ${
            stage === 'timeline' || stage === 'category'
              ? 'text-yellow-300 scale-105'
              : 'text-gray-400'
          }`}
        >
          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
            2
          </span>
          <span>时序与要素重构</span>
        </div>
        <span className="text-gray-600">&rarr;</span>
        <div
          className={`flex items-center gap-1.5 font-bold ${
            stage === 'quiz' || stage === 'complete'
              ? 'text-yellow-300 scale-105'
              : 'text-gray-400'
          }`}
        >
          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
            3
          </span>
          <span>语义提取与逻辑验证</span>
        </div>
      </div>

      {/* ── 阶段 1：场景与故事展示 ──────────────────────────── */}
      {stage === 'story' && (
        <div className="w-full max-w-3xl bg-[#1E232A] border-4 border-black rounded-2xl shadow-[8px_8px_0_rgba(0,0,0,0.8)] overflow-hidden font-[var(--font-pixel)] text-white">
          <div className={`p-4 sm:p-6 bg-gradient-to-r ${lesson.story.bgGradient} border-b-4 border-black flex items-center justify-between`}>
            <div>
              <div className="text-xs text-emerald-300 font-sans font-bold">
                {lesson.chapterTitle}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-yellow-300 mt-1">
                {lesson.story.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPinyin((p) => !p)}
                className={`px-3 py-1.5 text-xs font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 ${
                  showPinyin ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                {showPinyin ? '🔤 拼音开' : '🔤 拼音关'}
              </button>
              <button
                type="button"
                onClick={handlePlayTts}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-xs font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-1"
              >
                <span>🔊</span>
                <span>{ttsPlaying ? '正在朗读...' : '朗读故事'}</span>
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {showPinyin && (
              <div className="mb-3 px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-xs font-mono text-emerald-300/90 leading-relaxed tracking-wider select-none">
                {lesson.story.pinyin}
              </div>
            )}

            <div className="text-lg sm:text-2xl leading-relaxed sm:leading-loose font-sans font-medium text-gray-100 bg-black/30 p-5 rounded-xl border-2 border-black select-none">
              {lesson.story.text.split(/(【[^】]+】)/g).map((part, idx) => {
                if (part.startsWith('【') && part.endsWith('】')) {
                  const keyword = part.slice(1, -1);
                  return (
                    <span
                      key={idx}
                      className="inline-block mx-1 px-2.5 py-0.5 bg-yellow-500/30 text-yellow-300 font-black rounded-lg border-2 border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                    >
                      {keyword}
                    </span>
                  );
                }
                return <span key={idx}>{part}</span>;
              })}
            </div>

            <div className="mt-5">
              <div className="text-xs text-yellow-300 font-bold mb-2 flex items-center gap-1">
                <span>💡</span>
                <span>记忆小窍门：按时间顺序注意以下关键要素！</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {lesson.story.focusWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-gray-800 text-gray-200 text-xs font-sans font-bold border border-white/20 rounded-full"
                  >
                    🔍 {word}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleStartChallenge}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg sm:text-xl border-4 border-black rounded-xl shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 animate-bounce-once"
              >
                <span>🚀 我记好啦，进入挑战！</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 阶段 2A：时序重构拼图 ────────────────────────────── */}
      {stage === 'timeline' && (
        <div className="w-full max-w-2xl bg-[#1E232A] border-4 border-black p-5 sm:p-7 rounded-2xl shadow-[8px_8px_0_rgba(0,0,0,0.8)] font-[var(--font-pixel)] text-white">
          <div className="flex items-center justify-between border-b-2 border-white/20 pb-3 mb-4">
            <div>
              <div className="text-xs text-amber-400 font-sans font-bold">阶段二 · 时序重构</div>
              <h3 className="text-xl sm:text-2xl font-black text-yellow-300">
                🧩 事件先后顺序排序
              </h3>
            </div>
            <div className="text-xs text-gray-300 font-sans">
              点击上下箭头将事件按【发生顺序】排回正确位置
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {shuffledTimeline.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-[#2A3038] border-3 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center font-black text-yellow-300 text-sm">
                    {idx + 1}
                  </div>
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm sm:text-base font-bold font-sans text-gray-100">
                    {item.text}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveTimelineItem(idx, 'up')}
                    disabled={idx === 0}
                    className="w-8 h-8 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 border border-black rounded text-xs font-bold active:translate-y-0.5"
                    title="上移"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTimelineItem(idx, 'down')}
                    disabled={idx === shuffledTimeline.length - 1}
                    className="w-8 h-8 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 border border-black rounded text-xs font-bold active:translate-y-0.5"
                    title="下移"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>

          {timelineFeedback === 'wrong' && (
            <div className="mb-4 p-3 bg-red-900/70 border-2 border-red-500 rounded-lg text-xs font-sans text-red-200 text-center">
              ⚠️ 顺序还不正确哦，回想一下谁是先发生的，再调整试试看！
            </div>
          )}
          {timelineFeedback === 'correct' && (
            <div className="mb-4 p-3 bg-emerald-900/70 border-2 border-emerald-400 rounded-lg text-xs font-sans text-emerald-200 text-center font-bold">
              🎉 太厉害了！时序完全正确，正在前往下一步...
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStage('story')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-xs font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
            >
              👀 再看一眼故事
            </button>
            <button
              type="button"
              onClick={checkTimelineOrder}
              disabled={timelineFeedback === 'correct'}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-base border-3 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5"
            >
              ✓ 校验时序
            </button>
          </div>
        </div>
      )}

      {/* ── 阶段 2B：要素分类与归类 ──────────────────────────── */}
      {stage === 'category' && lesson.categoryTask && (
        <div className="w-full max-w-3xl bg-[#1E232A] border-4 border-black p-5 sm:p-7 rounded-2xl shadow-[8px_8px_0_rgba(0,0,0,0.8)] font-[var(--font-pixel)] text-white">
          <div className="border-b-2 border-white/20 pb-3 mb-4">
            <div className="text-xs text-amber-400 font-sans font-bold">阶段二 · 要素分类</div>
            <h3 className="text-xl sm:text-2xl font-black text-yellow-300">
              📦 物品与线索分类归位
            </h3>
            <p className="text-xs text-gray-300 font-sans mt-1">
              将下方的物品按属性分别放入正确的箱子中！
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-[#252A30] border-3 border-amber-600 rounded-xl min-h-[140px] flex flex-col">
              <div className="text-sm font-black text-amber-400 mb-2 border-b border-white/20 pb-1">
                {lesson.categoryTask.bucketAName}
              </div>
              <div className="flex-1 flex flex-wrap gap-2 items-start">
                {lesson.categoryTask.items
                  .filter((it) => categoryAssignments[it.id] === 'A')
                  .map((it) => (
                    <span
                      key={it.id}
                      className="px-3 py-1 bg-amber-900/60 border border-amber-400 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <span>{it.icon}</span>
                      <span>{it.name}</span>
                    </span>
                  ))}
              </div>
            </div>

            <div className="p-4 bg-[#252A30] border-3 border-emerald-600 rounded-xl min-h-[140px] flex flex-col">
              <div className="text-sm font-black text-emerald-400 mb-2 border-b border-white/20 pb-1">
                {lesson.categoryTask.bucketBName}
              </div>
              <div className="flex-1 flex flex-wrap gap-2 items-start">
                {lesson.categoryTask.items
                  .filter((it) => categoryAssignments[it.id] === 'B')
                  .map((it) => (
                    <span
                      key={it.id}
                      className="px-3 py-1 bg-emerald-900/60 border border-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <span>{it.icon}</span>
                      <span>{it.name}</span>
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-black/40 border-2 border-black rounded-xl mb-4">
            <div className="text-xs text-gray-300 font-sans mb-2 font-bold">
              👇 点击选择归入哪一个箱子：
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lesson.categoryTask.items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between p-2.5 bg-[#2D3238] border border-white/20 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{it.icon}</span>
                    <span className="text-xs sm:text-sm font-bold font-sans">{it.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleItemBucket(it.id, 'A')}
                      className={`px-2 py-1 text-[11px] font-bold rounded border ${
                        categoryAssignments[it.id] === 'A'
                          ? 'bg-amber-600 text-white border-amber-300'
                          : 'bg-gray-700 text-gray-300 border-black'
                      }`}
                    >
                      放箱A
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleItemBucket(it.id, 'B')}
                      className={`px-2 py-1 text-[11px] font-bold rounded border ${
                        categoryAssignments[it.id] === 'B'
                          ? 'bg-emerald-600 text-white border-emerald-300'
                          : 'bg-gray-700 text-gray-300 border-black'
                      }`}
                    >
                      放箱B
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {categoryFeedback === 'wrong' && (
            <div className="mb-4 p-3 bg-red-900/70 border-2 border-red-500 rounded-lg text-xs font-sans text-red-200 text-center">
              ⚠️ 还有物品放错或者漏放了哦，再检查一下分类！
            </div>
          )}
          {categoryFeedback === 'correct' && (
            <div className="mb-4 p-3 bg-emerald-900/70 border-2 border-emerald-400 rounded-lg text-xs font-sans text-emerald-200 text-center font-bold">
              🎉 完美归类！进入第三阶段深度推理...
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={checkCategory}
              disabled={categoryFeedback === 'correct'}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-base border-3 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5"
            >
              ✓ 校验分类
            </button>
          </div>
        </div>
      )}

      {/* ── 阶段 3：语义提取与逻辑验证 ──────────────────────── */}
      {stage === 'quiz' && (
        <div className="w-full max-w-2xl bg-[#1E232A] border-4 border-black p-5 sm:p-7 rounded-2xl shadow-[8px_8px_0_rgba(0,0,0,0.8)] font-[var(--font-pixel)] text-white">
          {(() => {
            const curQ = lesson.questions[questionIndex];
            return (
              <div>
                <div className="flex items-center justify-between border-b-2 border-white/20 pb-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-400 font-sans font-bold">阶段三 · 逻辑推理</span>
                      <span className="px-2 py-0.5 bg-purple-700/80 text-[10px] rounded font-sans font-bold">
                        {curQ.cognitionTag}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-yellow-300 mt-1">
                      第 {questionIndex + 1} / {lesson.questions.length} 题
                    </h3>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    得分: {quizScore}
                  </div>
                </div>

                <div className="text-base sm:text-xl font-sans font-bold text-gray-100 bg-black/40 p-4 rounded-xl border-2 border-black mb-5 leading-relaxed">
                  ❓ {curQ.question}
                </div>

                <div className="space-y-3 mb-5">
                  {curQ.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswer === optIdx;
                    const isCorrect = optIdx === curQ.correctIndex;
                    let btnStyle = 'bg-[#2A3038] hover:bg-[#343C46] border-black text-gray-100';

                    if (answeredState === 'answered') {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-700 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]';
                      } else if (isSelected) {
                        btnStyle = 'bg-red-800 border-red-400 text-white';
                      } else {
                        btnStyle = 'bg-gray-800/60 border-black text-gray-400';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        disabled={answeredState === 'answered'}
                        className={`w-full p-4 rounded-xl border-3 text-left font-sans font-bold text-sm sm:text-base transition-all flex items-center justify-between ${btnStyle} shadow-[3px_3px_0_rgba(0,0,0,0.6)] active:translate-y-0.5`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-black/30 border border-white/20 flex items-center justify-center font-mono text-xs">
                            {['A', 'B', 'C'][optIdx]}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {answeredState === 'answered' && isCorrect && (
                          <span className="text-emerald-300 text-lg">✓ 正确</span>
                        )}
                        {answeredState === 'answered' && isSelected && !isCorrect && (
                          <span className="text-red-300 text-lg">✗ 错误</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {answeredState === 'answered' && (
                  <div className="p-4 bg-black/50 border-2 border-purple-500/70 rounded-xl mb-5 text-xs sm:text-sm font-sans">
                    <div className="text-yellow-300 font-bold mb-1 flex items-center gap-1">
                      <span>💡</span>
                      <span>思维解析：</span>
                    </div>
                    <div className="text-gray-200 leading-relaxed">{curQ.explanation}</div>
                  </div>
                )}

                {answeredState === 'answered' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base border-3 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5"
                    >
                      {questionIndex < lesson.questions.length - 1 ? '下一题 &rarr;' : '查看探险成果 🏆'}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── 阶段 通关结算 ──────────────────────────────────── */}
      {stage === 'complete' && (
        <div className="w-full max-w-md bg-[#2D3238] border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0_rgba(0,0,0,1)] font-[var(--font-pixel)] text-white text-center">
          <div className="text-5xl mb-2">🎖️</div>
          <h3 className="text-2xl font-black text-yellow-300 mb-1">探险日志侦破成功！</h3>
          <p className="text-xs text-gray-300 font-sans mb-4">
            恭喜你！完整通过了【场景展示 ➔ 时序重构 ➔ 逻辑验证】的三重考验！
          </p>

          <div className="text-3xl mb-4">
            {quizScore === lesson.questions.length ? '⭐⭐⭐' : quizScore >= 1 ? '⭐⭐☆' : '⭐☆☆'}
          </div>

          <div className="bg-black/40 border-2 border-black p-4 rounded-xl mb-6 space-y-2 text-left font-sans text-xs">
            <div className="flex justify-between items-center text-emerald-400 font-bold">
              <span>🧩 时序空间重构</span>
              <span>满分完成 ✓</span>
            </div>
            <div className="flex justify-between items-center text-amber-400 font-bold">
              <span>🧮 逻辑验证与推理</span>
              <span>
                {quizScore} / {lesson.questions.length} 题正确
              </span>
            </div>
            <div className="flex justify-between items-center text-purple-300 font-bold">
              <span>🌟 探险家经验获得</span>
              <span>+60 XP 经验球</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={onRestart}
              className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
            >
              🔁 重新挑战
            </button>
            <button
              type="button"
              onClick={onNextLesson}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
            >
              📜 下一篇日志 &rarr;
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function ExplorerLogGame() {
  const [currentLessonId, setCurrentLessonId] = useState<string>('forest-steve-morning');
  const [lessonNonce, setLessonNonce] = useState(0);

  const lesson = getExplorerLesson(currentLessonId);

  const handleNextLesson = () => {
    const curIdx = EXPLORER_LESSONS.findIndex((l) => l.id === lesson.id);
    if (curIdx < EXPLORER_LESSONS.length - 1) {
      setCurrentLessonId(EXPLORER_LESSONS[curIdx + 1].id);
    } else {
      setCurrentLessonId(EXPLORER_LESSONS[0].id);
    }
    setLessonNonce((n) => n + 1);
  };

  const handleRestart = () => {
    setLessonNonce((n) => n + 1);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── 顶部关卡选择器 ──────────────────────────────────── */}
      <div className="w-full max-w-4xl bg-[#1E232A] border-4 border-black p-4 rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.6)] mb-6 text-white font-[var(--font-pixel)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-white/20 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{lesson.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-amber-300">
                  探险家日志 · {lesson.title}
                </h2>
                <span className="px-2 py-0.5 bg-amber-600/80 text-[10px] rounded font-sans font-bold">
                  {lesson.badge}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-sans">{lesson.description}</p>
            </div>
          </div>
          <Link
            href="/memory"
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            &larr; 返回神殿
          </Link>
        </div>

        {/* 关卡与篇章快速切换 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-yellow-300 font-bold whitespace-nowrap">📜 选择日志：</span>
          {EXPLORER_LESSONS.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setCurrentLessonId(l.id);
                setLessonNonce((n) => n + 1);
              }}
              className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black whitespace-nowrap transition-all ${
                l.id === lesson.id
                  ? 'bg-amber-600 text-white shadow-[2px_2px_0_rgba(0,0,0,1)]'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{l.icon} </span>
              <span>{l.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 关卡视图 (基于 Key 自动重置状态，无 set-state-in-effect) ── */}
      <ExplorerLessonView
        key={`${lesson.id}-${lessonNonce}`}
        lesson={lesson}
        onNextLesson={handleNextLesson}
        onRestart={handleRestart}
      />
    </div>
  );
}
