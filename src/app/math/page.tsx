'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, RefreshCw, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { generateMathQuestions, MathConfig, MathQuestion } from '@/lib/math-generator';
import { pdf } from '@react-pdf/renderer';
import { MathPdfDocument } from '@/lib/pdf-generator';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { MobileSidebar } from '@/components/MobileSidebar';
import { useTranslation } from '@/hooks/useTranslation';

export default function MathPage() {
  const { t, mounted } = useTranslation();
  const [activeTab, setActiveTab] = useState<'basic' | 'algebra'>('basic');
  const [config, setConfig] = useState<MathConfig>({
    operation: 'add',
    max: 20,
    count: 20,
    mode: 'normal',
  });

  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const questionsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(questions.length / questionsPerPage));
  const currentQuestions = questions.slice((previewPage - 1) * questionsPerPage, previewPage * questionsPerPage);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGenerate = () => {
    const newQuestions = generateMathQuestions(config);
    setQuestions(newQuestions);
  };

  const handleDownload = async () => {
    if (questions.length === 0) return;
    
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <MathPdfDocument 
          questions={questions} 
          title={config.mode === 'normal' ? 'Math Worksheet' : (config.mode === 'make-ten' ? 'Make a Ten' : 'Take from Ten')}
          withAnswers={false}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `duomi-math-${config.mode}-${Date.now()}.pdf`;
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
           <div className="text-3xl sm:text-4xl">🧮</div>
           <h1 className="text-2xl sm:text-4xl text-white drop-shadow-md tracking-wider">{t('Math.title')}</h1>
        </div>
        
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile Language Switcher */}
      <div className="sm:hidden mb-4 flex justify-center">
        <LanguageSwitcher />
      </div>

      {/* Tab Navigation - Scrollable on mobile */}
      <div className="mb-4 sm:mb-6 flex justify-center gap-2 sm:gap-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 sm:px-8 py-2 sm:py-3 text-base sm:text-xl font-bold border-4 transition-all active:translate-y-1 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'basic'
              ? 'bg-[#4CAF50] text-white border-black shadow-lg'
              : 'bg-[#C6C6C6] text-gray-700 border-gray-400 hover:bg-gray-200'
          }`}
        >
          📝 {t('Math.basicTab')}
        </button>
        <Link
          href="/math/algebra"
          className={`px-4 sm:px-8 py-2 sm:py-3 text-base sm:text-xl font-bold border-4 transition-all active:translate-y-1 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'algebra'
              ? 'bg-[#FF9800] text-white border-black shadow-lg'
              : 'bg-[#C6C6C6] text-gray-700 border-gray-400 hover:bg-gray-200'
          }`}
        >
          🛒 {t('Math.algebraTab')}
        </Link>
      </div>

      {activeTab === 'basic' && (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 max-w-7xl mx-auto">
        
        {/* Sidebar Settings */}
        <MobileSidebar title={t('Common.settings')}>
          <div className="space-y-4 sm:space-y-6 font-sans">
            {/* Subject / Mode */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">{t('Math.gameMode')}</label>
              <select 
                className="w-full border-2 border-black bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono"
                value={config.operation}
                onChange={(e) => setConfig({ ...config, operation: e.target.value as any })}
              >
                <option value="add">{t('Math.operationAdd')}</option>
                <option value="sub">{t('Math.operationSub')}</option>
                <option value="mul">{t('Math.operationMul')}</option>
                <option value="mix">{t('Math.operationMix')}</option>
              </select>
            </div>

            {/* Difficulty / Range */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">{t('Math.maxLevel')}</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((num) => (
                  <button
                    key={num}
                    onClick={() => setConfig({ ...config, max: num })}
                    className={`border-2 border-black py-2 text-xs sm:text-sm font-bold transition-all active:translate-y-1 ${
                      config.max === num
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Question Count */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">{t('Math.inventorySize')}</label>
              <div className="flex gap-2">
                {[20, 50, 100].map((c) => (
                  <button
                    key={c}
                    onClick={() => setConfig({ ...config, count: c })}
                    className={`flex-1 border-2 border-black py-2 text-xs sm:text-sm font-bold transition-all active:translate-y-1 ${
                      config.count === c
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Modes */}
            <div className="border-t-2 border-[#777] pt-4 border-dashed">
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">{t('Math.specialSkills')}</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded">
                  <input
                    type="radio"
                    checked={config.mode === 'normal'}
                    onChange={() => setConfig({ ...config, mode: 'normal' })}
                    className="text-black focus:ring-0 accent-black w-4 h-4"
                  />
                  <span className="text-sm font-bold">{t('Math.standardMode')}</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded">
                  <input
                    type="radio"
                    checked={config.mode === 'make-ten'}
                    onChange={() => setConfig({ ...config, mode: 'make-ten', operation: 'add', max: 20 })}
                    className="text-black focus:ring-0 accent-black w-4 h-4"
                  />
                  <span className="text-sm font-bold">{t('Math.makeTen')}</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded">
                  <input
                    type="radio"
                    checked={config.mode === 'take-ten'}
                    onChange={() => setConfig({ ...config, mode: 'take-ten', operation: 'sub', max: 20 })}
                    className="text-black focus:ring-0 accent-black w-4 h-4"
                  />
                  <span className="text-sm font-bold">{t('Math.takeTen')}</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="mc-btn w-full mt-4 bg-[#4CAF50] text-white text-lg sm:text-xl hover:bg-[#45a049] flex items-center justify-center gap-2 py-3"
            >
              <RefreshCw className="h-5 w-5" />
              {t('Math.craftSheet')}
            </button>
          </div>
        </MobileSidebar>

        {/* Main Content: Preview */}
        <div className="lg:col-span-3 flex flex-col h-full">
          {/* Preview Toolbar */}
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-black/40 p-4 rounded-sm border-2 border-white/20 backdrop-blur-sm">
            <h2 className="text-xl sm:text-2xl text-white font-bold tracking-wide">{t('Math.previewMap')}</h2>
            <div className="flex gap-3 w-full sm:w-auto items-center">
              {/* Page Navigation */}
              {questions.length > questionsPerPage && (
                <div className="flex items-center gap-2 flex-1 sm:flex-none">
                  <button
                    onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                    disabled={previewPage === 1}
                    className="mc-btn bg-[#FF9800] text-white text-xs sm:text-sm py-2 px-3 disabled:opacity-50 disabled:grayscale"
                  >
                    ← Prev
                  </button>
                  <span className="text-white text-sm font-bold min-w-[80px] text-center">
                    Page {previewPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPreviewPage(p => Math.min(totalPages, p + 1))}
                    disabled={previewPage === totalPages}
                    className="mc-btn bg-[#FF9800] text-white text-xs sm:text-sm py-2 px-3 disabled:opacity-50 disabled:grayscale"
                  >
                    Next →
                  </button>
                </div>
              )}
              <button 
                onClick={handleDownload}
                disabled={questions.length === 0 || isGenerating}
                className="mc-btn bg-[#2196F3] text-white text-xs sm:text-sm py-2 px-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale flex-1 sm:flex-none"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">{isGenerating ? t('Math.crafting') : t('Math.printMap')}</span>
                <span className="sm:hidden">{isGenerating ? t('Math.crafting') : '📄'}</span>
              </button>
            </div>
          </div>

          {/* Paper Canvas */}
          <div className="flex-1 bg-[#dcdcdc] p-4 sm:p-8 border-4 border-[#555] shadow-inner overflow-auto flex justify-center">
            <div className="bg-white p-6 sm:p-12 shadow-2xl w-full max-w-[210mm] relative transform origin-top scale-75 sm:scale-90 lg:scale-100 transition-transform">
              {/* Decorative Header on Preview */}
              <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F0A57C] border-2 border-black flex items-center justify-center text-xs overflow-hidden">
                    {/* Mini Steve CSS representation */}
                    <div className="grid grid-cols-4 grid-rows-4 w-full h-full">
                      <div className="col-span-4 row-span-1 bg-[#4A3020]"></div>
                      <div className="col-span-1 row-span-1 col-start-1 row-start-2 bg-white"></div>
                      <div className="col-span-1 row-span-1 col-start-3 row-start-2 bg-white"></div>
                      <div className="col-span-1 row-span-1 col-start-2 row-start-2 bg-[#3B82F6]"></div>
                      <div className="col-span-1 row-span-1 col-start-4 row-start-2 bg-[#3B82F6]"></div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-2xl font-bold font-[var(--font-pixel)] leading-none">DUOMI STUDY</h1>
                    <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest hidden sm:block">{config.mode.replace('-', ' ')} LEVEL {config.max}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-1">{t('Common.score')}: ____ / {questions.length}</div>
                  <div className="h-3 sm:h-4 w-20 sm:w-32 border border-gray-300 bg-gray-50"></div>
                </div>
              </div>

              {questions.length === 0 ? (
                <div className="flex h-48 sm:h-64 items-center justify-center text-gray-400 flex-col border-2 border-dashed border-gray-300 rounded-lg">
                  <Settings2 className="h-12 w-12 sm:h-16 sm:w-16 mb-4 opacity-20" />
                  <p className="font-[var(--font-pixel)] text-lg sm:text-xl text-gray-400">{t('Math.waitingForInput')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-8 sm:gap-x-16 gap-y-6 sm:gap-y-8 text-lg sm:text-xl font-mono">
                  {currentQuestions.map((q, i) => (
                    <div key={q.id} className="flex items-start justify-between border-b border-gray-200 pb-2 min-h-[3rem]">
                      <span className="text-gray-400 text-xs sm:text-sm w-6 font-[var(--font-pixel)] mt-2">{i + 1}.</span>
                      
                      <div className="flex-1 flex items-start justify-start gap-3 sm:gap-4 relative">
                        <div className="flex items-center gap-2 font-bold text-gray-800 text-xl sm:text-2xl">
                          <div className="relative w-8 sm:w-10 text-center">
                            {q.num1}
                            {q.decomposition && q.operator === '-' && (
                              <div className="absolute top-6 sm:top-8 left-0 w-full h-6 sm:h-8 border-t border-l border-r border-gray-400 rounded-t-none opacity-50 flex justify-between text-[8px] sm:text-[10px] px-1">
                                <span>{q.decomposition.part1}</span>
                                <span>{q.decomposition.part2}</span>
                              </div>
                            )}
                          </div>
                          
                          <span>{q.operator}</span>
                          
                          <div className="relative w-8 sm:w-10 text-center">
                            {q.num2}
                            {q.decomposition && q.operator === '+' && (
                              <div className="absolute top-6 sm:top-8 left-0 w-full h-6 sm:h-8 border-t border-l border-r border-gray-400 rounded-t-none opacity-50 flex justify-between text-[8px] sm:text-[10px] px-1">
                                <span>{q.decomposition.part1}</span>
                                <span>{q.decomposition.part2}</span>
                              </div>
                            )}
                          </div>

                          <span>=</span>
                          <span className="w-12 sm:w-16 h-6 sm:h-8 border-b-2 border-black bg-gray-50"></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Decorative Footer on Preview */}
              <div className="absolute bottom-4 sm:bottom-8 left-8 sm:left-12 right-8 sm:right-12 border-t-2 border-gray-300 pt-2 flex justify-between text-xs text-gray-400 font-mono">
                <span className="hidden sm:inline">{t('Common.generatedBy')}</span>
                <span>{t('Common.page')} {previewPage}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'algebra' && (
        <div className="text-center py-12 sm:py-20">
          <p className="text-white text-lg sm:text-2xl mb-4">🛒 {t('Math.algebraTab')} is ready!</p>
          <Link href="/math/algebra" className="mc-btn bg-[#FF9800] text-white text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 inline-block">
            {t('Home.mathBtn')} →
          </Link>
        </div>
      )}
    </div>
  );
}
