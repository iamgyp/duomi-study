'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AppWindow,
  Maximize,
  Minimize,
  Download,
  CheckCircle2,
  X,
  Laptop,
  Smartphone,
  Sparkles,
  Info
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface AppModeControlProps {
  /** 'header' for compact button in navbars; 'banner' for prominent card on home page */
  variant?: 'header' | 'banner';
  className?: string;
}

export function AppModeControl({ variant = 'header', className = '' }: AppModeControlProps) {
  const { t, mounted } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Check standalone mode and fullscreen state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkStandalone = () => {
      const isMQL = window.matchMedia('(display-mode: standalone)').matches;
      const isNavStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(Boolean(isMQL || isNavStandalone));
    };

    checkStandalone();

    const mql = window.matchMedia('(display-mode: standalone)');
    const handleMQLChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };
    mql.addEventListener('change', handleMQLChange);

    // Fullscreen change listener
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Listen for PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // When app is successfully installed
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setShowModal(false);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mql.removeEventListener('change', handleMQLChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger browser install prompt
  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
      } catch {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
    setShowMenu(false);
  }, [deferredPrompt]);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(async () => {
    setShowMenu(false);
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignored if browser policy blocks fullscreen
    }
  }, []);

  if (!mounted) {
    return null;
  }

  // --- Banner Variant (for Home Page) ---
  if (variant === 'banner') {
    return (
      <>
        <div
          className={`mc-card w-full p-4 sm:p-5 bg-gradient-to-r from-[#1E293B] to-[#0F172A] border-4 border-black text-white relative overflow-hidden shadow-[6px_6px_0_rgba(0,0,0,0.6)] ${className}`}
        >
          {/* Decorative Minecraft Pixel Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-600 border-2 border-black rounded-lg flex items-center justify-center shrink-0 shadow-[2px_2px_0_rgba(0,0,0,1)]">
                <AppWindow className="w-7 h-7 text-yellow-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-xl font-bold text-yellow-300 flex items-center gap-1.5">
                    {t('AppMode.appMode') || '浏览器应用程序模式'}
                  </span>
                  {isStandalone ? (
                    <span className="px-2 py-0.5 bg-emerald-700/80 border border-emerald-400 text-emerald-200 text-xs font-bold rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('AppMode.standaloneActive') || '已处于应用窗口'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-600/90 border border-amber-300 text-black text-xs font-black rounded uppercase">
                      推荐
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl">
                  {isStandalone
                    ? '当前已作为无边框独立窗口运行，支持离线打字、做题与无干扰全屏体验！'
                    : '将多米习题站安装为电脑桌面或平板独立应用，无浏览器地址栏与标签页干扰，纯净沉浸！'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
              {!isStandalone && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm border-2 border-black rounded-lg shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{deferredPrompt ? '立即安装为应用' : '开启应用模式'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                className="px-3.5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white font-bold text-sm border-2 border-black rounded-lg shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5"
                title={isFullscreen ? '退出全屏' : '全屏沉浸'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                <span className="hidden sm:inline">{isFullscreen ? '退出全屏' : '全屏模式'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="p-2 bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white border-2 border-black rounded-lg transition-colors"
                title="安装与使用指南"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Instructions Modal */}
        {showModal && <InstallGuideModal isStandalone={isStandalone} deferredPrompt={deferredPrompt} onInstall={handleInstallClick} onClose={() => setShowModal(false)} />}
      </>
    );
  }

  // --- Header Variant (Compact button for top bars) ---
  return (
    <>
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setShowMenu((prev) => !prev)}
          className={`px-2.5 py-1.5 rounded-sm border-2 border-black flex items-center gap-1.5 text-xs sm:text-sm font-bold shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all ${
            isStandalone
              ? 'bg-emerald-700 hover:bg-emerald-600 text-emerald-100'
              : 'bg-[#374151] hover:bg-[#4B5563] text-yellow-300'
          }`}
          title="应用程序模式与全屏"
        >
          <AppWindow className="w-4 h-4" />
          <span className="hidden md:inline">
            {isStandalone ? '应用模式' : deferredPrompt ? '安装应用' : '应用模式'}
          </span>
          {isStandalone && <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />}
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            <div className="fixed inset-0 z-[190]" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 mt-2 w-56 mc-card bg-[#2D3238] border-4 border-black text-white p-2 z-[200] shadow-[6px_6px_0_rgba(0,0,0,0.8)] rounded-lg">
              <div className="px-2 py-1.5 mb-1.5 border-b border-gray-700 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">🖥️ 应用程序模式</span>
                {isStandalone && (
                  <span className="text-[10px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500">
                    已激活
                  </span>
                )}
              </div>

              {!isStandalone && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full text-left px-2.5 py-2 hover:bg-gray-700 rounded flex items-center gap-2 text-xs font-bold text-yellow-300 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>{deferredPrompt ? '一键安装到桌面/平板' : '安装为独立应用程序'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-full text-left px-2.5 py-2 hover:bg-gray-700 rounded flex items-center gap-2 text-xs font-bold text-gray-200 transition-colors"
              >
                {isFullscreen ? (
                  <>
                    <Minimize className="w-4 h-4 text-amber-400" />
                    <span>退出全屏模式</span>
                  </>
                ) : (
                  <>
                    <Maximize className="w-4 h-4 text-sky-400" />
                    <span>切换全屏沉浸模式 (F11)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  setShowModal(true);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-gray-700 rounded flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors"
              >
                <Info className="w-4 h-4" />
                <span>安装指南与说明</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Instructions Modal */}
      {showModal && <InstallGuideModal isStandalone={isStandalone} deferredPrompt={deferredPrompt} onInstall={handleInstallClick} onClose={() => setShowModal(false)} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Install Guide Modal Component
// ─────────────────────────────────────────────────────────────
interface InstallGuideModalProps {
  isStandalone: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  onInstall: () => void;
  onClose: () => void;
}

function InstallGuideModal({ isStandalone, deferredPrompt, onInstall, onClose }: InstallGuideModalProps) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog Card */}
      <div className="relative mc-card bg-[#2D3238] border-4 border-black text-white p-5 sm:p-7 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-[10px_10px_0_rgba(0,0,0,0.85)] z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 border border-black rounded-lg">
              <AppWindow className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-yellow-300">
                浏览器应用程序模式 (PWA)
              </h3>
              <p className="text-xs sm:text-sm text-gray-300">
                无地址栏 · 独立桌面窗口 · 纯净防误触学习
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current State Indicator */}
        {isStandalone ? (
          <div className="mb-5 p-3 bg-emerald-950/80 border-2 border-emerald-500 rounded-lg flex items-center gap-3 text-emerald-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-xs sm:text-sm">
              <strong className="block text-emerald-300 font-bold">当前已处于应用程序模式！</strong>
              已拥有专属独立窗口，没有浏览器地址栏和标签页干扰，支持快速全屏与键盘守卫战！
            </div>
          </div>
        ) : deferredPrompt ? (
          <div className="mb-5 p-3.5 bg-yellow-950/70 border-2 border-yellow-500 rounded-lg flex items-center justify-between gap-3 text-yellow-200">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-yellow-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">
                当前浏览器已准备就绪，可一键安装！
              </span>
            </div>
            <button
              type="button"
              onClick={onInstall}
              className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black rounded border border-black shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 shrink-0"
            >
              立即一键安装
            </button>
          </div>
        ) : null}

        {/* Platform Guides */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <span>📖 各平台手动安装与开启步骤</span>
          </h4>

          {/* Windows / Mac PC Guide */}
          <div className="p-3.5 bg-gray-800/90 border-2 border-gray-700 rounded-xl">
            <div className="flex items-center gap-2 font-bold text-sky-400 text-sm mb-2">
              <Laptop className="w-4 h-4" />
              <span>电脑端 (Windows / macOS - Chrome / Edge)</span>
            </div>
            <ol className="list-decimal list-inside text-xs sm:text-sm text-gray-300 space-y-1.5">
              <li>
                点击浏览器最上方<strong>地址栏右侧</strong>的{' '}
                <span className="px-1.5 py-0.5 bg-gray-900 border border-gray-600 rounded text-yellow-300 font-mono">
                  🖥️ 安装
                </span>{' '}
                或 <span className="font-mono text-yellow-300">➕</span> 图标；
              </li>
              <li>
                或者点击浏览器右上角三点菜单{' '}
                <span className="text-yellow-300 font-mono font-bold">⋮</span> ➔{' '}
                <strong>「保存并共享 / 更多工具」</strong> ➔{' '}
                <strong>「安装多米习题站」</strong>；
              </li>
              <li>
                点击确认，即可在桌面生成图标，并以<strong>无网址栏的原生应用窗口</strong>启动！
              </li>
            </ol>
          </div>

          {/* iPad & iPhone Safari Guide */}
          <div className="p-3.5 bg-gray-800/90 border-2 border-gray-700 rounded-xl">
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm mb-2">
              <Smartphone className="w-4 h-4" />
              <span>平板与手机端 (iPad / iPhone - Safari 浏览器)</span>
            </div>
            <ol className="list-decimal list-inside text-xs sm:text-sm text-gray-300 space-y-1.5">
              <li>
                在 Safari 中点击页面底部（或顶部工具栏）的<strong>分享按钮</strong>{' '}
                <span className="px-1.5 py-0.5 bg-gray-900 border border-gray-600 rounded text-yellow-300">
                  ⬆️
                </span>；
              </li>
              <li>在弹出的分享菜单中向下滑动，选择<strong>「添加到主屏幕」</strong>；</li>
              <li>
                点击右上角「添加」，多米学习图标将常驻 iPad/iPhone 桌面，点击即可全屏无边框运行！
              </li>
            </ol>
          </div>

          {/* Android Chrome Guide */}
          <div className="p-3.5 bg-gray-800/90 border-2 border-gray-700 rounded-xl">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm mb-2">
              <Smartphone className="w-4 h-4" />
              <span>安卓平板 / 手机 (Chrome / 常用浏览器)</span>
            </div>
            <ol className="list-decimal list-inside text-xs sm:text-sm text-gray-300 space-y-1.5">
              <li>点击浏览器右上角菜单按钮 <span className="font-mono text-yellow-300">⋮</span>；</li>
              <li>选择<strong>「安装应用」</strong>或<strong>「添加到主屏幕」</strong>；</li>
              <li>安装后可享受原生 App 般的流畅离线体验。</li>
            </ol>
          </div>
        </div>

        {/* Benefits Box */}
        <div className="mt-5 p-3 bg-black/40 border border-gray-700 rounded-lg text-xs text-gray-400 space-y-1">
          <div className="font-bold text-gray-300 flex items-center gap-1.5">
            <span>✨ 应用程序模式优势：</span>
          </div>
          <div>• 杜绝孩子误按浏览器前进/后退/刷新或误点标签页切屏</div>
          <div>• 独立保存学习记录与打字闯关存档，与常规网页互不干扰</div>
          <div>• 支持离线运行，外出或断网状态下依然可练习口算与键盘打字</div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm rounded-lg border border-black transition-colors"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
}
