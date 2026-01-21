import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export const useSpeechToText = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const checkSupport = async () => {
      if (typeof window === "undefined") return;

      const ua = navigator.userAgent;

      const isChrome =
        /Chrome/.test(ua) && !/Edg|OPR|Firefox|SamsungBrowser/i.test(ua);

      const isBrave =
        (navigator as any).brave && (await (navigator as any).brave.isBrave());

      // ✅ ONLY Chrome Desktop allowed
      if (!isChrome || isBrave || !("webkitSpeechRecognition" in window)) {
        setIsSupported(false);
        return;
      }

      setIsSupported(true);

      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          }
        }

        if (finalText) {
          setTranscript((prev) =>
            prev ? `${prev} ${finalText.trim()}` : finalText.trim()
          );
        }
      };

      recognition.onerror = () => stopListening();
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    };

    checkSupport();

    return () => recognitionRef.current?.stop();
  }, []);

  /* ================= CONTROLS ================= */
  const startListening = async () => {
    if (!isSupported || isListening) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
    } catch {
      alert("Microphone permission is required.");
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
  };
};
