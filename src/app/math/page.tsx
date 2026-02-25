'use client';

'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, RefreshCw, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { generateMathQuestions, MathConfig, MathQuestion } from '@/lib/math-generator';
import { pdf } from '@react-pdf/renderer';
import { MathPdfDocument } from '@/lib/pdf-generator';

export default function MathPage() {
  const [config, setConfig] = useState<MathConfig>({
    operation: 'add',
    max: 20,
    count: 20,
    mode: 'normal',
  });

  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-8 font-[var(--font-pixel)]">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-xl">
          <ArrowLeft className="h-6 w-6" />
          BACK TO HOME
        </Link>
        
        <div className="flex items-center gap-4 bg-black/40 px-6 py-2 rounded-sm border-2 border-white/20 backdrop-blur-sm">
           <div className="text-4xl">🧮</div>
           <h1 className="text-4xl text-white drop-shadow-md tracking-wider">MATH WORKSHOP</h1>
        </div>
        
        <div className="w-48"></div> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 max-w-7xl mx-auto">
        
        {/* Sidebar: Crafting Table Style */}
        <div className="mc-card bg-[#C6C6C6] p-1 lg:col-span-1 h-fit">
           <div className="bg-[#8B8B8B] p-4 border-b-4 border-r-4 border-white/20 border-t-4 border-l-4 border-black/20">
              
              <div className="mb-6 flex items-center gap-2 text-2xl font-bold text-[#333] border-b-2 border-[#555] pb-2">
                <Settings2 className="h-6 w-6" />
                <span>SETTINGS</span>
              </div>

              <div className="space-y-6 font-sans">
                {/* Subject / Mode */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#333] uppercase">Game Mode</label>
                  <select 
                    className="w-full border-2 border-black bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono"
                    value={config.operation}
                    onChange={(e) => setConfig({ ...config, operation: e.target.value as any })}
                  >
                    <option value="add">Addition (+)</option>
                    <option value="sub">Subtraction (-)</option>
                    <option value="mul">Multiplication (×)</option>
                    <option value="mix">Mixed (+/-)</option>
                  </select>
                </div>

                {/* Difficulty / Range */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#333] uppercase">Max Level</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 50, 100].map((num) => (
                      <button
                        key={num}
                        onClick={() => setConfig({ ...config, max: num })}
                        className={`border-2 border-black py-1 text-sm font-bold transition-all active:translate-y-1 ${
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
                  <label className="mb-2 block text-sm font-bold text-[#333] uppercase">Inventory Size</label>
                  <div className="flex gap-2">
                     {[20, 50, 100].map((c) => (
                      <button
                        key={c}
                        onClick={() => setConfig({ ...config, count: c })}
                        className={`flex-1 border-2 border-black py-1 text-sm font-bold transition-all active:translate-y-1 ${
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
                  <label className="mb-2 block text-sm font-bold text-[#333] uppercase">Special Skills</label>
                  <div className="space-y-2">
                     <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded">
                      <input
                        type="radio"
                        checked={config.mode === 'normal'}
                        onChange={() => setConfig({ ...config, mode: 'normal' })}
                        className="text-black focus:ring-0 accent-black w-4 h-4"
                      />
                      <span className="text-sm font-bold">Standard</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded">
                      <input
                        type="radio"
                        checked={config.mode === 'make-ten'}
                        onChange={() => setConfig({ ...config, mode: 'make-ten', operation: 'add', max: 20 })}
                        className="text-black focus:ring-0 accent-black w-4 h-4"
                      />
                      <span className="text-sm font-bold">Make a Ten (凑十)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded">
                      <input
                        type="radio"
                        checked={config.mode === 'take-ten'}
                        onChange={() => setConfig({ ...config, mode: 'take-ten', operation: 'sub', max: 20 })}
                        className="text-black focus:ring-0 accent-black w-4 h-4"
                      />
                      <span className="text-sm font-bold">Take from Ten (破十)</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  className="mc-btn w-full mt-4 bg-[#4CAF50] text-white text-xl hover:bg-[#45a049] flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  CRAFT SHEET
                </button>
              </div>
           </div>
        </div>

        {/* Main Content: Preview */}
        <div className="lg:col-span-3 flex flex-col h-full">
           {/* Preview Toolbar */}
           <div className="mb-4 flex justify-between items-center bg-black/40 p-4 rounded-sm border-2 border-white/20 backdrop-blur-sm">
              <h2 className="text-2xl text-white font-bold tracking-wide">PREVIEW MAP</h2>
              <div className="flex gap-4">
                 <button 
                  disabled
                  className="mc-btn bg-[#FF9800] text-white text-sm py-2 px-4 opacity-50 cursor-not-allowed"
                 >
                   SHOW ANSWERS
                 </button>
                 <button 
                  onClick={handleDownload}
                  disabled={questions.length === 0 || isGenerating}
                  className="mc-btn bg-[#2196F3] text-white text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
                 >
                   <Printer className="h-4 w-4" />
                   {isGenerating ? 'CRAFTING...' : 'PRINT MAP'}
                 </button>
              </div>
           </div>

           {/* Paper Canvas */}
           <div className="flex-1 bg-[#dcdcdc] p-8 border-4 border-[#555] shadow-inner overflow-auto max-h-[800px] flex justify-center">
              <div className="bg-white p-12 shadow-2xl w-full max-w-[210mm] min-h-[297mm] relative transform origin-top scale-90 lg:scale-100 transition-transform">
                 {/* Decorative Header on Preview */}
                 <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-[#F0A57C] border-2 border-black flex items-center justify-center text-xs overflow-hidden">
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
                          <h1 className="text-2xl font-bold font-[var(--font-pixel)] leading-none">DUOMI STUDY</h1>
                          <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">{config.mode.replace('-', ' ')} LEVEL {config.max}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs text-gray-400 mb-1">SCORE: ____ / {questions.length}</div>
                       <div className="h-4 w-32 border border-gray-300 bg-gray-50"></div>
                    </div>
                 </div>

                 {questions.length === 0 ? (
                   <div className="flex h-64 items-center justify-center text-gray-400 flex-col border-2 border-dashed border-gray-300 rounded-lg">
                     <Settings2 className="h-16 w-16 mb-4 opacity-20" />
                     <p className="font-[var(--font-pixel)] text-xl text-gray-400">WAITING FOR INPUT...</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-x-16 gap-y-8 text-xl font-mono">
                     {questions.map((q, i) => (
                       <div key={q.id} className="flex items-start justify-between border-b border-gray-200 pb-2 min-h-[3rem]">
                         <span className="text-gray-400 text-sm w-6 font-[var(--font-pixel)] mt-2">{i + 1}.</span>
                         
                         <div className="flex-1 flex items-start justify-start gap-4 relative">
                           {/* Render Question */}
                           <div className="flex items-center gap-2 font-bold text-gray-800 text-2xl">
                               <div className="relative w-10 text-center">
                                  {q.num1}
                                  {/* Take-Ten Visual */}
                                  {q.decomposition && q.operator === '-' && (
                                     <div className="absolute top-8 left-0 w-full h-8 border-t border-l border-r border-gray-400 rounded-t-none opacity-50 flex justify-between text-[10px] px-1">
                                        <span>{q.decomposition.part1}</span>
                                        <span>{q.decomposition.part2}</span>
                                     </div>
                                  )}
                               </div>
                               
                               <span>{q.operator}</span>
                               
                               <div className="relative w-10 text-center">
                                  {q.num2}
                                  {/* Make-Ten Visual */}
                                  {q.decomposition && q.operator === '+' && (
                                      <div className="absolute top-8 left-0 w-full h-8 border-t border-l border-r border-gray-400 rounded-t-none opacity-50 flex justify-between text-[10px] px-1">
                                        <span>{q.decomposition.part1}</span>
                                        <span>{q.decomposition.part2}</span>
                                     </div>
                                  )}
                               </div>

                               <span>=</span>
                               <span className="w-16 h-8 border-b-2 border-black bg-gray-50"></span>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}

                 {/* Decorative Footer on Preview */}
                 <div className="absolute bottom-8 left-12 right-12 border-t-2 border-gray-300 pt-2 flex justify-between text-xs text-gray-400 font-mono">
                    <span>GENERATED BY DUOMI STUDY</span>
                    <span>PAGE 1</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
