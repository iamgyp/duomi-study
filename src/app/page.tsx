import Link from 'next/link';
import { DuomiSteve } from '@/components/DuomiSteve';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#8BC34A] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] flex flex-col items-center justify-center p-8 relative overflow-hidden font-[var(--font-pixel)]">
      
      {/* Background Decoration: Clouds */}
      <div className="absolute top-10 left-10 w-32 h-12 bg-white opacity-80" style={{ boxShadow: '8px 8px 0 rgba(0,0,0,0.1)' }}></div>
      <div className="absolute top-20 right-20 w-48 h-16 bg-white opacity-80" style={{ boxShadow: '8px 8px 0 rgba(0,0,0,0.1)' }}></div>

      {/* Header Container */}
      <div className="z-10 w-full max-w-4xl text-center mb-12">
        <div className="mc-card inline-block p-8 bg-[#E2E8F0] transform -rotate-1">
          <div className="flex flex-col items-center gap-4">
             <div className="border-4 border-black p-1 bg-[#F0A57C]">
                <DuomiSteve className="w-24 h-24" />
             </div>
             <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#333] drop-shadow-[4px_4px_0_rgba(255,255,255,1)]">
               多米习题站
             </h1>
             <p className="text-xl text-[#555] font-mono mt-2 bg-white px-4 py-1 border-2 border-black -rotate-1">
               Duomi Study: Craft Your Knowledge!
             </p>
          </div>
        </div>
      </div>

      {/* Main Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl z-10">
        
        {/* Math Block */}
        <Link href="/math" className="group">
          <div className="mc-card h-full p-6 bg-[#EF4444] hover:bg-[#DC2626] transition-transform hover:-translate-y-2 relative overflow-hidden">
             <div className="absolute top-2 right-2 text-4xl opacity-50 rotate-12">🧮</div>
             <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-md">数学工坊</h2>
             <p className="text-white/90 text-lg leading-relaxed font-sans">
               口算、凑十法、破十法。<br/>
               像挖矿一样解决难题！
             </p>
             <div className="mt-6 inline-block bg-black/20 px-4 py-2 text-white font-bold border-2 border-white/50 group-hover:bg-black/30">
               开始建造 &rarr;
             </div>
          </div>
        </Link>

        {/* Chinese Block */}
        <Link href="/chinese" className="group">
          <div className="mc-card h-full p-6 bg-[#F59E0B] hover:bg-[#D97706] transition-transform hover:-translate-y-2 relative overflow-hidden">
             <div className="absolute top-2 right-2 text-4xl opacity-50 rotate-12">📝</div>
             <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-md">语文书房</h2>
             <p className="text-white/90 text-lg leading-relaxed font-sans">
               田字格描红、古诗填空。<br/>
               书写你的冒险故事！
             </p>
             <div className="mt-6 inline-block bg-black/20 px-4 py-2 text-white font-bold border-2 border-white/50 group-hover:bg-black/30">
               开始书写 &rarr;
             </div>
          </div>
        </Link>

        {/* English Block */}
        <Link href="/english" className="group">
          <div className="mc-card h-full p-6 bg-[#3B82F6] hover:bg-[#2563EB] transition-transform hover:-translate-y-2 relative overflow-hidden">
             <div className="absolute top-2 right-2 text-4xl opacity-50 rotate-12">🔤</div>
             <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-md">英语港口</h2>
             <p className="text-white/90 text-lg leading-relaxed font-sans">
               单词拼写、句子练习。<br/>
               通往世界的传送门！
             </p>
             <div className="mt-6 inline-block bg-black/20 px-4 py-2 text-white font-bold border-2 border-white/50 group-hover:bg-black/30">
               开始航行 &rarr;
             </div>
          </div>
        </Link>

      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-[url('https://art.pixilart.com/sr2c2378d30e38a.png')] bg-repeat-x opacity-50 pointer-events-none"></div>
      
      <div className="mt-12 text-center text-white/80 font-bold text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm z-10">
        Created for Duomi with ❤️ | Version 1.0.0 (Beta)
      </div>
    </main>
  );
}
