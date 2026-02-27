'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, RefreshCw, Settings2, PenTool } from 'lucide-react';
import Link from 'next/link';
import cnchar from 'cnchar';
import 'cnchar-order';
import 'cnchar-trad';
import { generateChineseImage } from '@/lib/chinese-canvas-generator';
import { generatePoemExercises, PoemConfig, getPoemDifficultyLabel } from '@/lib/poem-generator';
import { pdf } from '@react-pdf/renderer';
import { PoemPdfDocument } from '@/lib/poem-pdf-generator';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { MobileSidebar } from '@/components/MobileSidebar';
import { useTranslation } from '@/hooks/useTranslation';

export default function ChinesePage() {
  const { t, mounted } = useTranslation();
  const [activeMode, setActiveMode] = useState<'character' | 'poem'>('character');
  
  // Character mode state
  const [text, setText] = useState('多米学习站');
  const [charConfig, setCharConfig] = useState({
    gridType: 'tian' as 'tian' | 'mi',
    showPinyin: true,
    mode: 'trace' as 'trace' | 'normal',
    color: '#999999',
  });
  const [chars, setChars] = useState<any[]>([]);
  
  // Poem mode state
  const [poemConfig, setPoemConfig] = useState<PoemConfig>({
    difficulty: 1,
    count: 5,
    showAnswers: false,
    showPinyin: false,
  });
  const [poemExercises, setPoemExercises] = useState<any[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const newChars = text.split('').map(char => {
      const pinyin = (cnchar as any).spell(char, 'tone');
      return {
        char,
        pinyin: Array.isArray(pinyin) ? pinyin[0] : pinyin
      };
    });
    setChars(newChars);
  }, [text]);

  const handleGenerateCharacters = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateChineseImage(chars, charConfig);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `duomi-chinese-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Image generation failed. Check console.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePoems = () => {
    const exercises = generatePoemExercises(poemConfig);
    setPoemExercises(exercises);
  };

  const handleDownloadPoems = async () => {
    if (poemExercises.length === 0) return;
    
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <PoemPdfDocument 
          exercises={poemExercises}
          title="Poetry Practice"
          difficulty={poemConfig.difficulty}
          showAnswers={poemConfig.showAnswers}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `duomi-poem-${poemConfig.difficulty}star-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('PDF generation failed. Check console.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#795548] flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      
      {/* Header */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-7xl mx-auto">
        <Link href="/" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" />
          {t('Common.backToHome')}
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4 bg-black/40 px-4 sm:px-6 py-2 rounded-sm border-2 border-white/20 backdrop-blur-sm">
           <div className="text-3xl sm:text-4xl">📝</div>
           <h1 className="text-2xl sm:text-4xl text-white drop-shadow-md tracking-wider">{t('Chinese.title')}</h1>
        </div>
        
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile Language Switcher */}
      <div className="sm:hidden mb-4 flex justify-center">
        <LanguageSwitcher />
      </div>

      {/* Mode Tabs */}
      <div className="mb-4 sm:mb-6 flex justify-center gap-2 sm:gap-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveMode('character')}
          className={`px-4 sm:px-8 py-2 sm:py-3 text-base sm:text-xl font-bold border-4 transition-all active:translate-y-1 whitespace-nowrap flex-shrink-0 ${
            activeMode === 'character'
              ? 'bg-[#F59E0B] text-white border-black shadow-lg'
              : 'bg-[#C6C6C6] text-gray-700 border-gray-400 hover:bg-gray-200'
          }`}
        >
          ✏️ {t('Chinese.characterMode')}
        </button>
        <button
          onClick={() => setActiveMode('poem')}
          className={`px-4 sm:px-8 py-2 sm:py-3 text-base sm:text-xl font-bold border-4 transition-all active:translate-y-1 whitespace-nowrap flex-shrink-0 ${
            activeMode === 'poem'
              ? 'bg-[#9C27B0] text-white border-black shadow-lg'
              : 'bg-[#C6C6C6] text-gray-700 border-gray-400 hover:bg-gray-200'
          }`}
        >
          📜 {t('Chinese.poemMode')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 max-w-7xl mx-auto">
        
        {/* Sidebar Settings */}
        <MobileSidebar title={t('Common.settings')}>
          <div className="space-y-4 sm:space-y-6 font-sans">
            
            {activeMode === 'character' ? (
              // Character Mode Settings
              <>
                <div>
                  <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">{t('Chinese.enterText')}</label>
                  <textarea 
                    className="w-full border-2 border-black bg-white p-2 text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-serif h-24 sm:h-32 resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="在这里输入汉字..."
                  />
                  <p className="text-xs text-[#444] mt-1">{t('Chinese.supportPinyin')}</p>
                </div>

                <div>
                  <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">{t('Chinese.gridStyle')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCharConfig({ ...charConfig, gridType: 'tian' })}
                      className={`border-2 border-black py-2 sm:py-3 text-xs sm:text-sm font-bold transition-all active:translate-y-1 ${
                        charConfig.gridType === 'tian' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-600'
                      }`}
                    >
                      {t('Chinese.tianGrid')}
                    </button>
                    <button
                      onClick={() => setCharConfig({ ...charConfig, gridType: 'mi' })}
                      className={`border-2 border-black py-2 sm:py-3 text-xs sm:text-sm font-bold transition-all active:translate-y-1 ${
                        charConfig.gridType === 'mi' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-600'
                      }`}
                    >
                      {t('Chinese.miGrid')}
                    </button>
                  </div>
                </div>

                <div className="border-t-2 border-[#777] pt-4 border-dashed space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={charConfig.showPinyin}
                      onChange={(e) => setCharConfig({ ...charConfig, showPinyin: e.target.checked })}
                      className="text-black focus:ring-0 accent-black w-4 h-4"
                    />
                    <span className="text-sm font-bold text-[#333]">{t('Chinese.showPinyin')}</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={charConfig.mode === 'trace'}
                      onChange={(e) => setCharConfig({ ...charConfig, mode: e.target.checked ? 'trace' : 'normal', color: e.target.checked ? '#999999' : '#000000' })}
                      className="text-black focus:ring-0 accent-black w-4 h-4"
                    />
                    <span className="text-sm font-bold text-[#333]">{t('Chinese.traceMode')}</span>
                  </label>
                </div>

                <button
                  onClick={handleGenerateCharacters}
                  disabled={isGenerating || text.length === 0}
                  className="mc-btn w-full mt-4 bg-[#F59E0B] text-white text-lg sm:text-xl hover:bg-[#D97706] flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:grayscale"
                >
                  <Printer className="h-5 w-5" />
                  {isGenerating ? t('Common.crafting') : t('Chinese.saveImage')}
                </button>
              </>
            ) : (
              // Poem Mode Settings
              <>
                <div>
                  <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">{t('Chinese.difficultyLevel')}</label>
                  <div className="space-y-2">
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        onClick={() => setPoemConfig({ ...poemConfig, difficulty: level as 1 | 2 | 3 })}
                        className={`w-full border-2 border-black py-3 px-3 text-sm font-bold transition-all active:translate-y-1 text-left whitespace-normal ${
                          poemConfig.difficulty === level
                            ? 'bg-yellow-400 text-black'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {level === 1 ? t('Chinese.basicPoem') : level === 2 ? t('Chinese.intermediatePoem') : t('Chinese.advancedPoem')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">{t('Chinese.poemCount')}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 8, 10].map((c) => (
                      <button
                        key={c}
                        onClick={() => setPoemConfig({ ...poemConfig, count: c })}
                        className={`border-2 border-black py-2 text-xs sm:text-sm font-bold transition-all active:translate-y-1 ${
                          poemConfig.count === c
                            ? 'bg-yellow-400 text-black'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t-2 border-[#777] pt-4 border-dashed">
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={poemConfig.showAnswers}
                      onChange={(e) => setPoemConfig({ ...poemConfig, showAnswers: e.target.checked })}
                      className="text-black focus:ring-0 accent-black w-4 h-4"
                    />
                    <span className="text-sm font-bold text-[#333]">{t('Chinese.showAnswers')}</span>
                  </label>
                </div>

                <button
                  onClick={handleGeneratePoems}
                  className="mc-btn w-full mt-4 bg-[#9C27B0] text-white text-lg sm:text-xl hover:bg-[#7B1FA2] flex items-center justify-center gap-2 py-3"
                >
                  <RefreshCw className="h-5 w-5" />
                  {t('Chinese.generatePoems')}
                </button>

                {poemExercises.length > 0 && (
                  <button
                    onClick={handleDownloadPoems}
                    disabled={isGenerating}
                    className="mc-btn w-full mt-2 bg-[#2196F3] text-white text-lg sm:text-xl hover:bg-[#1976D2] flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:grayscale"
                  >
                    <Printer className="h-5 w-5" />
                    {isGenerating ? t('Common.crafting') : t('Chinese.savePdf')}
                  </button>
                )}
              </>
            )}
          </div>
        </MobileSidebar>

        {/* Preview Area */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <div className="mb-4 bg-black/40 p-4 rounded-sm border-2 border-white/20 backdrop-blur-sm">
            <h2 className="text-xl sm:text-2xl text-white font-bold tracking-wide">{t('Common.preview')}</h2>
          </div>

          <div className="flex-1 bg-[#dcdcdc] p-4 sm:p-8 border-4 border-[#555] shadow-inner overflow-auto flex justify-center">
            <div className="bg-white p-6 sm:p-12 shadow-2xl w-full max-w-[210mm] relative transform origin-top scale-75 sm:scale-90 lg:scale-100 transition-transform">
              {/* Header */}
              <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F0A57C] border-2 border-black flex items-center justify-center text-xs overflow-hidden">
                    <div className="grid grid-cols-4 grid-rows-4 w-full h-full">
                      <div className="col-span-4 row-span-1 bg-[#4A3020]"></div>
                      <div className="col-span-1 row-span-1 col-start-1 row-start-2 bg-white"></div>
                      <div className="col-span-1 row-span-1 col-start-3 row-start-2 bg-white"></div>
                      <div className="col-span-1 row-span-1 col-start-2 row-start-2 bg-[#3B82F6]"></div>
                      <div className="col-span-1 row-span-1 col-start-4 row-start-2 bg-[#3B82F6]"></div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-2xl font-bold font-[var(--font-pixel)] leading-none">
                      {activeMode === 'character' ? 'DUOMI CHINESE' : 'DUOMI POEMS'}
                    </h1>
                    <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest hidden sm:block">
                      {activeMode === 'character' ? t('Chinese.writingPractice') : getPoemDifficultyLabel(poemConfig.difficulty)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-1">{t('Common.score')}: ____</div>
                  <div className="h-3 sm:h-4 w-20 sm:w-32 border border-gray-300 bg-gray-50"></div>
                </div>
              </div>

              {activeMode === 'character' ? (
                // Character Preview
                <div className="flex flex-wrap gap-3 sm:gap-4 content-start">
                  {chars.map((c, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="h-5 sm:h-6 text-xs sm:text-sm text-gray-600 font-mono">{charConfig.showPinyin ? c.pinyin : ''}</div>
                      <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-red-500 relative flex items-center justify-center">
                        <div className="absolute top-0 left-1/2 w-px h-full bg-red-300 transform -translate-x-1/2 border-dashed border-l border-red-300"></div>
                        <div className="absolute top-1/2 left-0 w-full h-px bg-red-300 transform -translate-y-1/2 border-dashed border-t border-red-300"></div>
                        {charConfig.gridType === 'mi' && (
                          <div className="absolute top-0 left-0 w-full h-full border-red-200 border-dashed" style={{ clipPath: 'polygon(0 0, 100% 100%, 100% 0, 0 100%)', opacity: 0.3 }}></div>
                        )}
                        <span 
                          className="text-2xl sm:text-4xl font-serif z-10 relative"
                          style={{ 
                            color: charConfig.mode === 'trace' ? '#999' : '#000',
                            fontFamily: '"KaiTi", "楷体", serif'
                          }}
                        >
                          {c.char}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Poem Preview
                <div className="space-y-6">
                  {poemExercises.length === 0 ? (
                    <div className="flex h-48 sm:h-64 items-center justify-center text-gray-400 flex-col border-2 border-dashed border-gray-300 rounded-lg">
                      <PenTool className="h-12 w-12 sm:h-16 sm:w-16 mb-4 opacity-20" />
                      <p className="font-[var(--font-pixel)] text-lg sm:text-xl text-gray-400">{t('Math.waitingForInput')}</p>
                    </div>
                  ) : (
                    poemExercises.map((exercise, idx) => (
                      <div key={exercise.id} className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
                        <h3 className="text-lg font-bold text-center text-purple-900 mb-1">{exercise.poem.title}</h3>
                        <p className="text-xs text-center text-gray-600 mb-3">
                          【{exercise.poem.dynasty}】{exercise.poem.author}
                        </p>
                        <div className="space-y-2">
                          {exercise.poem.lines.map((line: any, lineIdx: number) => (
                            <div key={lineIdx} className="text-center text-lg font-serif leading-relaxed">
                              {line.text.split('').map((char: string, charIdx: number) => {
                                const isBlank = line.blanks.includes(charIdx);
                                return isBlank ? (
                                  <span key={charIdx} className="inline-block w-6 border-b-2 border-purple-800 mx-0.5">
                                    {poemConfig.showAnswers ? (
                                      <span className="text-red-600 font-bold">{char}</span>
                                    ) : (
                                      <span>&nbsp;</span>
                                    )}
                                  </span>
                                ) : (
                                  <span key={charIdx} className="text-gray-800">{char}</span>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
