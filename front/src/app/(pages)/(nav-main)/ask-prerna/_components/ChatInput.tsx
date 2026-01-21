"use client";

import { useState, useEffect } from "react";
import { LuMic, LuSend } from "react-icons/lu";
import { useSpeechToText } from "@/hooks/useSpeechtoText";
import { trendingSearches } from "@/common/TrendingSearches";
import { useRotatingPlaceholder } from "@/hooks/useRotatingPlaceholder";
import { placeholderText } from "@/common/ExtraData";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  hasStarted: boolean;
}

type TrendingItem = {
  title: string;
};

export function ChatInput({
  onSendMessage,
  isLoading,
  hasStarted,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [randomTrending, setRandomTrending] = useState<TrendingItem[]>([]);
  const { value: rotatingPlaceholder } =
    useRotatingPlaceholder(placeholderText);
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
  } = useSpeechToText();

  // Pick 5 random trending searches once
  useEffect(() => {
    const shuffled = [...trendingSearches]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    setRandomTrending(shuffled);
  }, []);

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (!isListening && transcript.trim()) {
      onSendMessage(transcript.trim());
      setMessage("");
    }
  }, [isListening, transcript, onSendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isLoading) return;

    onSendMessage(message.trim());
    setMessage("");
  };

  const handleQuickAction = (action: string) => {
    if (!isLoading) {
      onSendMessage(action);
    }
  };

  return (
    <div className="border-t border-(--border) bg-(--secondary-bg) backdrop-blur-sm p-4 shadow-lg fixed bottom-0 w-full left-0">
      <div className="max-w-4xl mx-auto">
        {!hasStarted && (
          <div
            className="
              flex gap-2 mb-4
              overflow-x-auto overflow-y-hidden
              whitespace-nowrap
              scrollbar-hide
              pb-1
            "
          >
            {randomTrending.map((action, index) => (
              <div key={`${action.title}-${index}`} className="shrink-0">
                <button
                  onClick={() => handleQuickAction(action.title)}
                  disabled={isLoading}
                  className="rounded-full bg-(--primary-bg) hover:scale-95 text-(--text-color-emphasis) transition-all shadow-xs inline-flex items-center justify-center whitespace-nowrap text-xs py-1 px-3"
                >
                  {action.title}
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Search "${rotatingPlaceholder}"`}
              disabled={isLoading}
              className="rounded-full bg-(--primary-bg) pr-14 h-12 focus-visible:ring-2 focus-visible:ring-(--border) shadow-custom flex w-full px-3 py-2 text-sm placeholder:text-(--text-color-emphasis) focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-(--text-color)"
            />

            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 bg-(--secondary-bg) disabled:opacity-50 shadow-custom transition-all inline-flex items-center justify-center text-(--text-color-emphasis)"
            >
              <LuSend className="h-4 w-4" />
            </button>
          </div>

          {isSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              className={`shrink-0 rounded-full inline-flex items-center justify-center h-10 w-10 transition-all ${
                isListening
                  ? "bg-(--danger-subtle)"
                  : "bg-(--primary-bg) hover:opacity-80"
              }`}
            >
              <LuMic
                className={`h-5 w-5 ${
                  isListening
                    ? "text-(--danger-emphasis) animate-pulse"
                    : "text-(--text-color-emphasis)"
                }`}
              />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
