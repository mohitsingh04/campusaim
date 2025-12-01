import { useState, useRef, useEffect, useMemo } from "react";

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Voice keywords — including common Indian English voices
  const preferredVoiceNames = useMemo(
    () => [
      // Indian English variations
      "google hindi",
      "google indian english",
      "en-in",
      "india",
      "indian",
      // Common fallback English voices
      "samantha",
      "zira",
      "karen",
      "amelia",
      "ava",
      "victoria",
      "allison",
      "female",
      "google"
    ],
    []
  );

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!isSupported) return;

    synthRef.current = window.speechSynthesis;

    const loadVoices = () => {
      if (!synthRef.current) return;
      const voices = synthRef.current.getVoices();
      if (!voices.length) return;

      // ✅ Step 1: Prefer Indian English voices first
      let selected =
        voices.find((v) =>
          v.lang.toLowerCase().includes("en-in")
        ) ||
        voices.find((v) =>
          v.name.toLowerCase().includes("india")
        ) ||
        voices.find((v) =>
          v.name.toLowerCase().includes("indian")
        );

      // ✅ Step 2: Fallback to common female voices
      if (!selected) {
        selected =
          voices.find((v) =>
            preferredVoiceNames.some((n) =>
              v.name.toLowerCase().includes(n)
            )
          ) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];
      }

      voiceRef.current = selected;
      // console.log("🎤 Selected voice:", selected?.name, selected?.lang);
    };

    loadVoices();
    synthRef.current.onvoiceschanged = loadVoices;

    const handleUnload = () => synthRef.current?.cancel();
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      synthRef.current?.cancel();
      window.removeEventListener("beforeunload", handleUnload);
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = null;
      }
    };
  }, [isSupported, preferredVoiceNames]);

  const speakText = (text: string) => {
    if (!synthRef.current || !isSupported || !voiceRef.current) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voiceRef.current;
    utterance.lang = "en-IN"; // ✅ Force Indian English
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  return { isSpeaking, speakText, stopSpeaking, isSupported };
};