'use client';

import { useState } from 'react';
import { ArrowLeft, Printer, RefreshCw, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { pdf } from '@react-pdf/renderer';
import { EnglishPdfDocument } from '@/lib/english-pdf-generator';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { MobileSidebar } from '@/components/MobileSidebar';
import { useTranslation } from '@/hooks/useTranslation';

export default function EnglishPage() {
  const { t, mounted } = useTranslation();
  const [text, setText] = useState('Apple Banana Cat Dog Elephant');
  const [config, setConfig] = useState({
    mode: 'word', 
    caseType: 'original', 
    traceColor: '#999999',
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  const processedText = () => {
    switch (config.caseType) {
      case 'upper': return text.toUpperCase();
      case 'lower': return text.toLowerCase();
      case 'capitalize': return text.replace(/\b\w/g, l => l.toUpperCase());
      default: return text;
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <EnglishPdfDocument text={processedText()} config={config} />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `duomi-english-${Date.now()}.pdf`;
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

  const words = processedText().split(/\s+/).filter(w => w.length > 0);

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
           <div className="text-3xl sm:text-4xl">🔤</div>
           <h1 className="text-2xl sm:text-4xl text-white drop-shadow-md tracking-wider">{t('English.title')}</h1>
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
            {/* Input Area */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">{t('English.enterWords')}</label>
              <textarea 
                className="w-full border-2 border-black bg-white p-2 text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-sans h-24 sm:h-32 resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter English words here..."
              />
            </div>

            {/* Case Options */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">{t('English.letterCase')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConfig({ ...config, caseType: 'original' })}
                  className={`border-2 border-black py-2 sm:py-3 text-xs sm:text-sm font-bold transition-all active:translate-y-1 ${
                    config.caseType === 'original' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-600'
                  }`}
                >
                  {t('English.original')}
                </button>
                <button
                  onClick={() => setConfig({ ...config, caseType: 'upper' })}
                  className={`border-2 border-black py-2 sm:py-3 text-xs sm:text-sm font-bold transition-all active:translate-y-1 ${
                    config.caseType === 'upper' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-600'
                  }`}
                >
                  {t('English.uppercase')}
                </button>
                <button
                  onClick={() => setConfig({ ...config, caseType: 'lower' })}
                  className={`border-2 border-black py-2 sm:py-3 text-xs sm:text-sm font-bold transition-all active:translate-y-1 ${
                    config.caseType === 'lower' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-600'
                  }`}
                >
                  {t('English.lowercase')}
                </button>
                 <button
                  onClick={() => setConfig({ ...config, caseType: 'capitalize' })}
                  className={`border-2 border-black py-2 sm:py-3 text-xs sm:text-sm font-bold transition-all active:translate-y-1 ${
                    config.caseType === 'capitalize' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-600'
                  }`}
                >
                  {t('English.capitalize')}
                </button>
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={isGenerating || text.length === 0}
              className="mc-btn w-full mt-4 bg-[#3B82F6] text-white text-lg sm:text-xl hover:bg-[#2563EB] flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:grayscale"
            >
              <Printer className="h-5 w-5" />
              {isGenerating ? t('Common.crafting') : t('English.savePdf')}
            </button>
          </div>
        </MobileSidebar>

        {/* Preview Area */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <div className="mb-4 bg-black/40 p-4 rounded-sm border-2 border-white/20 backdrop-blur-sm">
            <h2 className="text-xl sm:text-2xl text-white font-bold tracking-wide">{t('Common.preview')}</h2>
          </div>

          <div className="flex-1 bg-[#dcdcdc] p-4 sm:p-8 border-4 border-[#555] shadow-inner overflow-auto max-h-[60vh] sm:max-h-[800px] flex justify-center">
            <div className="bg-white p-6 sm:p-12 shadow-2xl w-full max-w-[210mm] min-h-[297mm] relative transform origin-top scale-75 sm:scale-90 lg:scale-100 transition-transform">
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
                    <h1 className="text-lg sm:text-2xl font-bold font-[var(--font-pixel)] leading-none">DUOMI ENGLISH</h1>
                    <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest hidden sm:block">{t('English.writingPractice')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-1">{t('Common.score')}: ____</div>
                  <div className="h-3 sm:h-4 w-20 sm:w-32 border border-gray-300 bg-gray-50"></div>
                </div>
              </div>

              {/* Preview Grid */}
              <div className="flex flex-col gap-4 sm:gap-6">
                {words.map((word, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4 items-center">
                    <div className="w-5 sm:w-6 text-gray-400 font-mono text-xs sm:text-sm">{i+1}.</div>
                    <div className="flex-1 relative h-12 sm:h-16 w-full">
                      <div className="absolute top-[20%] left-0 w-full h-px bg-red-300"></div>
                      <div className="absolute top-[40%] left-0 w-full h-px bg-blue-300 border-t border-dashed border-blue-300 opacity-50"></div>
                      <div className="absolute top-[60%] left-0 w-full h-px bg-red-300"></div>
                      <div className="absolute top-[80%] left-0 w-full h-px bg-blue-300 border-t border-dashed border-blue-300 opacity-50"></div>
                      <div className="absolute top-[16%] left-2 text-2xl sm:text-[40px] font-sans text-gray-400 tracking-widest" style={{ fontFamily: 'Arial Rounded MT Bold, sans-serif' }}>
                        {word}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
