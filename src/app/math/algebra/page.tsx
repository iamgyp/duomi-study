'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, RefreshCw, Settings2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { generateAlgebraQuestions, AlgebraConfig, AlgebraQuestion, McItem, getDifficultyLabel } from '@/lib/algebra-generator';
import { McItemIcon, ItemPriceList } from '@/components/McItemIcon';
import { pdf } from '@react-pdf/renderer';
import { AlgebraPdfDocument } from '@/lib/pdf-generator';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { MobileSidebar } from '@/components/MobileSidebar';
import { useTranslation } from '@/hooks/useTranslation';

export default function AlgebraPage() {
  const { t, mounted } = useTranslation();
  const [config, setConfig] = useState<AlgebraConfig>({
    difficulty: 2,
    count: 20,
    language: 'zh',
  });

  const [questions, setQuestions] = useState<AlgebraQuestion[]>([]);
  const [itemSets, setItemSets] = useState<McItem[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    const { questions: newQuestions, itemSets: newItemSets } = generateAlgebraQuestions(config);
    setQuestions(newQuestions);
    setItemSets(newItemSets);
  };

  const handleDownload = async () => {
    if (questions.length === 0) return;
    
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <AlgebraPdfDocument 
          questions={questions}
          itemSets={itemSets}
          title="Algebra Challenge"
          difficulty={config.difficulty}
          language={config.language}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `duomi-algebra-${config.difficulty}star-${config.language}-${Date.now()}.pdf`;
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
        <Link href="/math" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" />
          {t('Common.backToMath')}
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4 bg-black/40 px-4 sm:px-6 py-2 rounded-sm border-2 border-white/20 backdrop-blur-sm">
           <div className="text-3xl sm:text-4xl">🛒</div>
           <h1 className="text-2xl sm:text-4xl text-white drop-shadow-md tracking-wider">{t('Algebra.title')}</h1>
        </div>
        
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile Language Switcher */}
      <div className="sm:hidden mb-4 flex justify-center">
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 max-w-7xl mx-auto">
        
        {/* Sidebar Settings */}
        <MobileSidebar title={t('Common.settings')}>
          <div className="space-y-4 sm:space-y-6 font-sans">
            {/* Difficulty */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">{t('Algebra.difficultyLevel')}</label>
              <div className="space-y-2">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => setConfig({ ...config, difficulty: level as 1 | 2 | 3 })}
                    className={`w-full border-2 border-black py-3 px-3 text-sm font-bold transition-all active:translate-y-1 text-left whitespace-normal ${
                      config.difficulty === level
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {level === 1 ? t('Algebra.basic') : level === 2 ? t('Algebra.intermediate') : t('Algebra.advanced')}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">{t('Algebra.questionCount')}</label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 50].map((c) => (
                  <button
                    key={c}
                    onClick={() => setConfig({ ...config, count: c as 10 | 20 | 50 })}
                    className={`border-2 border-black py-2 text-xs sm:text-sm font-bold transition-all active:translate-y-1 ${
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

            {/* Language */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">{t('Algebra.language')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConfig({ ...config, language: 'zh' })}
                  className={`border-2 border-black py-2 text-xs sm:text-sm font-bold transition-all active:translate-y-1 ${
                    config.language === 'zh'
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🇨🇳 {t('Algebra.chinese')}
                </button>
                <button
                  onClick={() => setConfig({ ...config, language: 'en' })}
                  className={`border-2 border-black py-2 text-xs sm:text-sm font-bold transition-all active:translate-y-1 ${
                    config.language === 'en'
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🇺🇸 {t('Algebra.english')}
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="mc-btn w-full mt-4 bg-[#4CAF50] text-white text-lg sm:text-xl hover:bg-[#45a049] flex items-center justify-center gap-2 py-3"
            >
              <RefreshCw className="h-5 w-5" />
              {t('Algebra.generateQuestions')}
            </button>
          </div>
        </MobileSidebar>

        {/* Main Content: Preview */}
        <div className="lg:col-span-3 flex flex-col h-full">
          {/* Preview Toolbar */}
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-black/40 p-4 rounded-sm border-2 border-white/20 backdrop-blur-sm">
            <h2 className="text-xl sm:text-2xl text-white font-bold tracking-wide">{t('Common.preview')}</h2>
            <button 
              onClick={handleDownload}
              disabled={questions.length === 0 || isGenerating}
              className="mc-btn bg-[#2196F3] text-white text-xs sm:text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-50 disabled:grayscale w-full sm:w-auto justify-center"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">{isGenerating ? t('Common.crafting') : t('Algebra.printPdf')}</span>
              <span className="sm:hidden">{isGenerating ? t('Common.crafting') : '📄'}</span>
            </button>
          </div>

          {/* Paper Canvas */}
          <div className="flex-1 bg-[#dcdcdc] p-4 sm:p-8 border-4 border-[#555] shadow-inner overflow-auto max-h-[60vh] sm:max-h-[800px] flex justify-center">
            <div className="bg-white p-6 sm:p-12 shadow-2xl w-full max-w-[210mm] min-h-[297mm] relative transform origin-top scale-75 sm:scale-90 lg:scale-100 transition-transform">
              {/* Header */}
              <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
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
                    <h1 className="text-lg sm:text-2xl font-bold font-[var(--font-pixel)] leading-none">DUOMI ALGEBRA</h1>
                    <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest hidden sm:block">
                      {config.difficulty === 1 ? t('Algebra.basic') : config.difficulty === 2 ? t('Algebra.intermediate') : t('Algebra.advanced')} · {config.count} {t('Algebra.questionCount')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-1">{t('Common.score')}: ____ / {config.count}</div>
                  <div className="h-3 sm:h-4 w-20 sm:w-32 border border-gray-300 bg-gray-50"></div>
                </div>
              </div>

              {questions.length === 0 ? (
                <div className="flex h-48 sm:h-64 items-center justify-center text-gray-400 flex-col border-2 border-dashed border-gray-300 rounded-lg">
                  <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mb-4 opacity-20" />
                  <p className="font-[var(--font-pixel)] text-lg sm:text-xl text-gray-400">{t('Algebra.waitingToGenerate')}</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2">{t('Algebra.clickToStart')}</p>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  {itemSets.map((itemSet, setIndex) => {
                    const setQuestions = questions.slice(setIndex * 5, (setIndex + 1) * 5);
                    if (setQuestions.length === 0) return null;
                    
                    return (
                      <div key={setIndex} className="border-2 border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50">
                        {/* Item Price List for this set */}
                        <ItemPriceList items={itemSet} language={config.language} />
                        
                        {/* Questions Grid - Single column on mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-3 sm:gap-y-4 mt-3 sm:mt-4">
                          {setQuestions.map((q, i) => {
                            const globalIndex = setIndex * 5 + i;
                            return (
                              <div key={q.id} className="flex items-center gap-2 sm:gap-3 py-2 border-b border-gray-200">
                                <span className="text-gray-500 font-bold w-5 sm:w-6 text-xs sm:text-base">{globalIndex + 1}.</span>
                                <div className="flex-1 flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-mono flex-wrap">
                                  {q.items.map((itemData, idx) => (
                                    <span key={itemData.item.id} className="flex items-center gap-1">
                                      <img
                                        src={`/items/${itemData.item.icon}`}
                                        alt={itemData.item.name}
                                        className="w-5 h-5 sm:w-6 sm:h-6 object-contain inline-block"
                                        width={24}
                                        height={24}
                                      />
                                      <span className="text-xs sm:text-sm text-gray-500">× {itemData.quantity}</span>
                                      {idx < q.items.length - 1 && (
                                        <span className="text-gray-400 text-sm sm:text-base">+</span>
                                      )}
                                    </span>
                                  ))}
                                  <span className="text-gray-400 text-sm sm:text-base">=</span>
                                  <span className="w-12 sm:w-16 h-6 sm:h-8 border-b-2 border-black bg-gray-50 inline-block"></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              <div className="absolute bottom-4 sm:bottom-8 left-8 sm:left-12 right-8 sm:right-12 border-t-2 border-gray-300 pt-2 flex justify-between text-xs text-gray-400 font-mono">
                <span className="hidden sm:inline">{t('Common.generatedBy')}</span>
                <span>{t('Common.page')} 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
