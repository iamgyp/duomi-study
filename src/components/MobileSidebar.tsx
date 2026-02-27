'use client';

import { useState, useEffect } from 'react';
import { X, Settings2, ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileSidebarProps {
  children: React.ReactNode;
  title?: string;
}

export function MobileSidebar({ children, title = 'Settings' }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) {
    return (
      <div className="mc-card bg-[#C6C6C6] p-1 lg:col-span-1 h-fit">
        <div className="bg-[#8B8B8B] p-4 border-b-4 border-r-4 border-white/20 border-t-4 border-l-4 border-black/20">
          <div className="mb-6 flex items-center gap-2 text-2xl font-bold text-[#333] border-b-2 border-[#555] pb-2">
            <Settings2 className="h-6 w-6" />
            <span>{title}</span>
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#4CAF50] hover:bg-[#45a049] text-white p-4 rounded-full shadow-lg border-4 border-black transition-transform active:scale-95 lg:hidden"
      >
        <Settings2 className="h-8 w-8" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#C6C6C6] z-50 transform transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="bg-[#8B8B8B] h-full overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[#8B8B8B] p-4 border-b-4 border-black flex items-center justify-between">
            <div className="flex items-center gap-2 text-2xl font-bold text-[#333]">
              <Settings2 className="h-6 w-6" />
              <span>{title}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-black/20 rounded transition-colors"
            >
              <X className="h-8 w-8 text-[#333]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
