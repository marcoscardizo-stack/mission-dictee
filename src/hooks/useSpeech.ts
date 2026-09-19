import { useCallback, useEffect, useRef, useState } from 'react';

const NORMAL_RATE = 0.9;
const SLOW_RATE = 0.62;

const isSupported = () =>
  typeof window !== 'undefined' && !!window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function';

/** Choisit la meilleure voix française disponible. */
function pickFrenchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const fr = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('fr'));
  return (
    fr.find((v) => v.lang.replace('_', '-') === 'fr-FR' && v.localService) ??
    fr.find((v) => v.lang.replace('_', '-') === 'fr-FR') ??
    fr[0] ??
    null
  );
}

/** Découpe en phrases ; en mode lent, on découpe aussi aux virgules pour laisser des pauses. */
export function splitForSpeech(text: string, slow: boolean): string[] {
  const re = slow ? /[^.!?,;:]+[.!?,;:]*/g : /[^.!?]+[.!?]*/g;
  return (text.match(re) ?? [text]).map((s) => s.trim()).filter(Boolean);
}

export function useSpeech() {
  const supported = isSupported();
  const [speaking, setSpeaking] = useState(false);
  const [hasFrenchVoice, setHasFrenchVoice] = useState(true);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const runId = useRef(0);

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const load = () => {
      const voices = synth.getVoices();
      voiceRef.current = pickFrenchVoice(voices);
      setHasFrenchVoice(voices.length === 0 || voiceRef.current !== null);
    };
    load();
    synth.addEventListener?.('voiceschanged', load);
    return () => {
      synth.removeEventListener?.('voiceschanged', load);
      synth.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    runId.current++;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, opts: { slow?: boolean } = {}) => {
      if (!supported) return false;
      const synth = window.speechSynthesis;
      const id = ++runId.current;
      const parts = splitForSpeech(text, !!opts.slow);

      const start = () => {
        parts.forEach((part, i) => {
          const u = new SpeechSynthesisUtterance(part);
          u.lang = 'fr-FR';
          if (voiceRef.current) u.voice = voiceRef.current;
          u.rate = opts.slow ? SLOW_RATE : NORMAL_RATE;
          u.pitch = 1;
          if (i === parts.length - 1) {
            u.onend = () => id === runId.current && setSpeaking(false);
          }
          u.onerror = () => id === runId.current && setSpeaking(false);
          synth.speak(u);
        });
        setSpeaking(true);
      };

      if (synth.speaking || synth.pending) {
        synth.cancel();
        // Safari ignore parfois un speak() appelé juste après cancel().
        window.setTimeout(start, 80);
      } else {
        start();
      }
      return true;
    },
    [supported],
  );

  return { supported, speaking, hasFrenchVoice, speak, stop };
}
