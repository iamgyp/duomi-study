/**
 * Web Speech API text-to-speech helper for the typing game.
 * Zero external dependencies, runs directly in the browser.
 */

let speechEnabled = true;

export function setTtsEnabled(enabled: boolean) {
  speechEnabled = enabled;
}

export function isTtsEnabled(): boolean {
  return speechEnabled;
}

/**
 * Speaks an English word or phrase using the browser's speech synthesis.
 */
export function speakEnglish(word: string, rate = 0.9) {
  if (typeof window === 'undefined' || !speechEnabled || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Try finding an English voice
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find((v) => v.lang.startsWith('en'));
    if (enVoice) utterance.voice = enVoice;

    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech errors on unsupported browsers
  }
}

/**
 * Speaks a Chinese character or word.
 */
export function speakChinese(text: string, rate = 0.85) {
  if (typeof window === 'undefined' || !speechEnabled || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find((v) => v.lang.startsWith('zh'));
    if (zhVoice) utterance.voice = zhVoice;

    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech errors
  }
}
