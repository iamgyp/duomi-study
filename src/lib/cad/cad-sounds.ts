/**
 * CAD 蓝图工坊合成音效与语音朗读
 * 纯 Web Audio API 合成，零外部音频资源依赖，即开即用
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;
let ttsEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    try {
      audioCtx = new AudioContextClass();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function setCadSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isCadSoundEnabled(): boolean {
  return soundEnabled;
}

export function setCadTtsEnabled(enabled: boolean) {
  ttsEnabled = enabled;
}

export function isCadTtsEnabled(): boolean {
  return ttsEnabled;
}

/** 辅助发声函数 */
function playTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainVal = 0.15,
  delay = 0,
  endFreq?: number,
) {
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t0 + duration);
  }
  gain.gain.setValueAtTime(gainVal, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration);
}

/** 键盘敲击声（机械键帽咔哒感） */
export function playCadKeyClick() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 600, 0.03, 'triangle', 0.12);
  playTone(ctx, 300, 0.04, 'sine', 0.08, 0.01);
}

/** 命令成功确认（清脆科技激光感） */
export function playCadCommandSuccess() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 523.25, 0.1, 'sine', 0.18, 0, 783.99); // C5 -> G5
  playTone(ctx, 783.99, 0.15, 'triangle', 0.15, 0.08, 1046.5); // G5 -> C6
}

/** 输入错误或未知命令提示（柔和低音提醒） */
export function playCadError() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 220, 0.15, 'sawtooth', 0.1, 0, 160);
}

/** ESC 键取消/重置音效 */
export function playCadEscape() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 400, 0.08, 'sine', 0.1, 0, 200);
}

/** 修剪小剪刀剪断音效 */
export function playCadTrim() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 1200, 0.04, 'triangle', 0.15, 0, 800);
  playTone(ctx, 1400, 0.04, 'triangle', 0.12, 0.05, 900);
}

/** 橡皮擦除音效 */
export function playCadErase() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 350, 0.12, 'sine', 0.1, 0, 180);
}

/** 蓝图通关大捷音效（Minecraft 风格胜利和弦） */
export function playCadMissionComplete() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const chord = [523.25, 659.25, 783.99, 1046.5]; // C E G C
  chord.forEach((freq, idx) => {
    playTone(ctx, freq, 0.4, 'triangle', 0.15, idx * 0.1, freq * 1.05);
  });
  playTone(ctx, 1046.5, 0.6, 'sine', 0.22, 0.45);
}

/** 播放 CAD 快捷键语音（英文全称 + 中文，帮助一年级孩子记住单词与含义） */
export function speakCadCommand(englishName: string, chineseMeaning: string) {
  if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();

    // 1. 先清晰读英文单词
    const enUtterance = new SpeechSynthesisUtterance(englishName);
    enUtterance.lang = 'en-US';
    enUtterance.rate = 0.9;
    enUtterance.pitch = 1.05;

    // 2. 接着读中文含义
    const zhUtterance = new SpeechSynthesisUtterance(chineseMeaning);
    zhUtterance.lang = 'zh-CN';
    zhUtterance.rate = 0.95;
    zhUtterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find((v) => v.lang.startsWith('en'));
    const zhVoice = voices.find((v) => v.lang.startsWith('zh'));
    if (enVoice) enUtterance.voice = enVoice;
    if (zhVoice) zhUtterance.voice = zhVoice;

    window.speechSynthesis.speak(enUtterance);
    window.speechSynthesis.speak(zhUtterance);
  } catch {
    // 忽略不受支持的浏览器 TTS 错误
  }
}
