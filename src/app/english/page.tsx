'use client';

import { useState } from 'react';
import { ArrowLeft, Printer, RefreshCw, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { generateEnglishImage } from '@/lib/english-canvas-generator';

export default function EnglishPage() {
  const [text, setText] = useState('Apple Banana Cat Dog Elephant');
  const [config, setConfig] = useState({
    mode: 'word', 
    caseType: 'original', 
    traceColor: '#999999',
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  // Text processing based on caseType
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
      const dataUrl = await generateEnglishImage(processedText(), config);
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `duomi-english-${Date.now()}.jpg`;
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

  const words = processedText().split(/\s+/).filter(w => w.length > 0);

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-8 font-[var(--font-pixel)]">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-xl">
          <ArrowLeft className="h-6 w-6" />
          BACK TO HOME
        </Link>
        
        <div className="flex items-center gap-4 bg-black/40 px-6 py-2 rounded-sm border-2 border-white/20 backdrop-blur-sm">
           <div className="text-4xl">🔤</div>
           <h1 className="text-4xl text-white drop-shadow-md tracking-wider">ENGLISH PORT</h1>
        </div>
        
        <div className="w-48"></div> 
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 max-w-7xl mx-auto">
        
        {/* Sidebar: Crafting Table */}
        <div className="mc-card bg-[#C6C6C6] p-1 lg:col-span-1 h-fit">
           <div className="bg-[#8B8B8B] p-4 border-b-4 border-r-4 border-white/20 border-t-4 border-l-4 border-black/20">
              
              <div className="mb-6 flex items-center gap-2 text-2xl font-bold text-[#333] border-b-2 border-[#555] pb-2">
                <Settings2 className="h-6 w-6" />
                <span>SETTINGS</span>
              </div>

              <div className="space-y-6 font-sans">
                {/* Input Area */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#333] uppercase">Enter Words/Sentences</label>
                  <textarea 
                    className="w-full border-2 border-black bg-white p-2 text-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-sans h-32 resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter English words here..."
                  />
                </div>

                {/* Case Options */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#333] uppercase">Letter Case</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConfig({ ...config, caseType: 'original' })}
                      className={`border-2 border-black py-2 text-sm font-bold transition-all active:translate-y-1 ${
                        config.caseType === 'original' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-600'
                      }`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setConfig({ ...config, caseType: 'upper' })}
                      className={`border-2 border-black py-2 text-sm font-bold transition-all active:translate-y-1 ${
                        config.caseType === 'upper' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-600'
                      }`}
                    >
                      UPPERCASE
                    </button>
                    <button
                      onClick={() => setConfig({ ...config, caseType: 'lower' })}
                      className={`border-2 border-black py-2 text-sm font-bold transition-all active:translate-y-1 ${
                        config.caseType === 'lower' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-600'
                      }`}
                    >
                      lowercase
                    </button>
                     <button
                      onClick={() => setConfig({ ...config, caseType: 'capitalize' })}
                      className={`border-2 border-black py-2 text-sm font-bold transition-all active:translate-y-1 ${
                        config.caseType === 'capitalize' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-600'
                      }`}
                    >
                      Capitalize
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={isGenerating || text.length === 0}
                  className="mc-btn w-full mt-4 bg-[#3B82F6] text-white text-xl hover:bg-[#2563EB] flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  <Printer className="h-5 w-5" />
                  {isGenerating ? 'CRAFTING...' : 'SAVE IMAGE'}
                </button>
              </div>
           </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3 flex flex-col h-full">
           <div className="mb-4 bg-black/40 p-4 rounded-sm border-2 border-white/20 backdrop-blur-sm">
              <h2 className="text-2xl text-white font-bold tracking-wide">PREVIEW BOOK</h2>
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
                          <h1 className="text-2xl font-bold font-[var(--font-pixel)] leading-none">DUOMI ENGLISH</h1>
                          <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">WRITING PRACTICE</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs text-gray-400 mb-1">SCORE: ____</div>
                       <div className="h-4 w-32 border border-gray-300 bg-gray-50"></div>
                    </div>
                 </div>

                 {/* Preview Grid */}
                 <div className="flex flex-col gap-6">
                    {words.map((word, i) => (
                       <div key={i} className="flex gap-4 items-center">
                          {/* Index */}
                          <div className="w-6 text-gray-400 font-mono text-sm">{i+1}.</div>
                          
                          {/* 4-Line Grid (CSS Mockup) */}
                          <div className="flex-1 relative h-16 w-full">
                              {/* Lines */}
                              <div className="absolute top-[20%] left-0 w-full h-px bg-red-300"></div> {/* Ascender */}
                              <div className="absolute top-[40%] left-0 w-full h-px bg-blue-300 border-t border-dashed border-blue-300 opacity-50"></div> {/* Mid */}
                              <div className="absolute top-[60%] left-0 w-full h-px bg-red-300"></div> {/* Base */}
                              <div className="absolute top-[80%] left-0 w-full h-px bg-blue-300 border-t border-dashed border-blue-300 opacity-50"></div> {/* Descender */}

                              {/* Text */}
                              <div className="absolute top-[16%] left-2 text-[40px] font-sans text-gray-400 tracking-widest" style={{ fontFamily: 'Arial Rounded MT Bold, sans-serif' }}>
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
