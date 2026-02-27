'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, RefreshCw, Settings2, PenTool } from 'lucide-react';
import Link from 'next/link';
import cnchar from 'cnchar';
import 'cnchar-order';
import 'cnchar-trad';
import { generateChineseImage } from '@/lib/chinese-canvas-generator';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';

export default function ChinesePage() {
  const { t, mounted } = useTranslation();
  const [text, setText] = useState('多米学习站');
  const [config, setConfig] = useState({
    gridType: 'tian', // tian (田), mi (米)
    showPinyin: true,
    mode: 'trace', // trace (描红 - 灰色), outline (空心 - 暂不支持需字体), normal (黑字)
    color: '#999999', // Default trace color
  });
  
  const [chars, setChars] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Parse text into characters with pinyin
  useEffect(() => {
    const newChars = text.split('').map(char => {
      // Get pinyin
      const pinyin = (cnchar as any).spell(char, 'tone');
      return {
        char,
        pinyin: Array.isArray(pinyin) ? pinyin[0] : pinyin
      };
    });
    setChars(newChars);
  }, [text]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // Generate Canvas Image URL
      const dataUrl = await generateChineseImage(chars, config);
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `duomi-chinese-${Date.now()}.jpg`; // Download as Image
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#795548] flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-8 font-[var(--font-pixel)]">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-xl">
          <ArrowLeft className="h-6 w-6" />
          {t('Common.backToHome')}
        </Link>
        
        <div className="flex items-center gap-4 bg-black/40 px-6 py-2 rounded-sm border-2 border-white/20 backdrop-blur-sm">
           <div className="text-4xl">📝</div>
           <h1 className="text-4xl text-white drop-shadow-md tracking-wider">{t('Chinese.title')}</h1>
        </div>
        
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 max-w-7xl mx-auto">
        
        {/* Sidebar: Crafting Table */}
        <div className="mc-card bg-[#C6C6C6] p-1 lg:col-span-1 h-fit">
           <div className="bg-[#8B8B8B] p-4 border-b-4 border-r-4 border-white/20 border-t-4 border-l-4 border-black/20">
              
              <div className="mb-6 flex items-center gap-2 text-2xl font-bold text-[#333] border-b-2 border-[#555] pb-2">
                <Settings2 className="h-6 w-6" />
                <span>{t('Common.settings')}</span>
              </div>

              <div className="space-y-6 font-sans">
                {/* Input Area */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#333] uppercase">{t('Chinese.enterText')}</label>
                  <textarea 
                    className="w-full border-2 border-black bg-white p-2 text-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-serif h-32 resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="在这里输入汉字..."
                  />
                  <p className="text-xs text-[#444] mt-1">{t('Chinese.supportPinyin')}</p>
                </div>

                {/* Grid Type */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#333] uppercase">{t('Chinese.gridStyle')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConfig({ ...config, gridType: 'tian' })}
                      className={`border-2 border-black py-2 text-sm font-bold transition-all active:translate-y-1 ${
                        config.gridType === 'tian' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-600'
                      }`}
                    >
                      {t('Chinese.tianGrid')}
                    </button>
                    <button
                      onClick={() => setConfig({ ...config, gridType: 'mi' })}
                      className={`border-2 border-black py-2 text-sm font-bold transition-all active:translate-y-1 ${
                        config.gridType === 'mi' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-600'
                      }`}
                    >
                      {t('Chinese.miGrid')}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="border-t-2 border-[#777] pt-4 border-dashed space-y-2">
                   <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={config.showPinyin}
                        onChange={(e) => setConfig({ ...config, showPinyin: e.target.checked })}
                        className="text-black focus:ring-0 accent-black w-4 h-4"
                      />
                      <span className="text-sm font-bold text-[#333]">{t('Chinese.showPinyin')}</span>
                   </label>
                   
                   <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={config.mode === 'trace'}
                        onChange={(e) => setConfig({ ...config, mode: e.target.checked ? 'trace' : 'normal', color: e.target.checked ? '#999999' : '#000000' })}
                        className="text-black focus:ring-0 accent-black w-4 h-4"
                      />
                      <span className="text-sm font-bold text-[#333]">{t('Chinese.traceMode')}</span>
                   </label>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={isGenerating || text.length === 0}
                  className="mc-btn w-full mt-4 bg-[#F59E0B] text-white text-xl hover:bg-[#D97706] flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  <Printer className="h-5 w-5" />
                  {isGenerating ? t('Common.crafting') : t('Chinese.saveImage')}
                </button>
              </div>
           </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3 flex flex-col h-full">
           <div className="mb-4 bg-black/40 p-4 rounded-sm border-2 border-white/20 backdrop-blur-sm">
              <h2 className="text-2xl text-white font-bold tracking-wide">{t('Common.preview')}</h2>
           </div>

           <div className="flex-1 bg-[#dcdcdc] p-8 border-4 border-[#555] shadow-inner overflow-auto max-h-[800px] flex justify-center">
              <div className="bg-white p-12 shadow-2xl w-full max-w-[210mm] min-h-[297mm] relative transform origin-top scale-90 lg:scale-100 transition-transform">
                 {/* Header */}
                 <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-[#F0A57C] border-2 border-black flex items-center justify-center text-xs overflow-hidden">
                          {/* Mini Steve */}
                          <div className="grid grid-cols-4 grid-rows-4 w-full h-full">
                             <div className="col-span-4 row-span-1 bg-[#4A3020]"></div>
                             <div className="col-span-1 row-span-1 col-start-1 row-start-2 bg-white"></div>
                             <div className="col-span-1 row-span-1 col-start-3 row-start-2 bg-white"></div>
                             <div className="col-span-1 row-span-1 col-start-2 row-start-2 bg-[#3B82F6]"></div>
                             <div className="col-span-1 row-span-1 col-start-4 row-start-2 bg-[#3B82F6]"></div>
                          </div>
                       </div>
                       <div>
                          <h1 className="text-2xl font-bold font-[var(--font-pixel)] leading-none">DUOMI CHINESE</h1>
                          <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">{t('Chinese.writingPractice')}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs text-gray-400 mb-1">{t('Common.score')}: ____</div>
                       <div className="h-4 w-32 border border-gray-300 bg-gray-50"></div>
                    </div>
                 </div>

                 {/* Grid Preview (Simplified HTML/CSS version of PDF) */}
                 <div className="flex flex-wrap gap-4 content-start">
                    {chars.map((c, i) => (
                       <div key={i} className="flex flex-col items-center">
                          {/* Pinyin */}
                          <div className="h-6 text-sm text-gray-600 font-mono">{config.showPinyin ? c.pinyin : ''}</div>
                          
                          {/* Box */}
                          <div className="w-16 h-16 border-2 border-red-500 relative flex items-center justify-center">
                             {/* Grid Lines */}
                             <div className="absolute top-0 left-1/2 w-px h-full bg-red-300 transform -translate-x-1/2 border-dashed border-l border-red-300"></div>
                             <div className="absolute top-1/2 left-0 w-full h-px bg-red-300 transform -translate-y-1/2 border-dashed border-t border-red-300"></div>
                             {config.gridType === 'mi' && (
                                <>
                                  <div className="absolute top-0 left-0 w-full h-full border-red-200 border-dashed" style={{ clipPath: 'polygon(0 0, 100% 100%, 100% 0, 0 100%)', opacity: 0.3 }}></div> 
                                  {/* Simple CSS cross is hard, SVG is better, but this is preview */}
                                </>
                             )}
                             
                             {/* Character */}
                             <span 
                               className="text-4xl font-serif z-10 relative"
                               style={{ 
                                 color: config.mode === 'trace' ? '#999' : '#000',
                                 fontFamily: '"KaiTi", "楷体", serif'
                               }}
                             >
                               {c.char}
                             </span>
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
