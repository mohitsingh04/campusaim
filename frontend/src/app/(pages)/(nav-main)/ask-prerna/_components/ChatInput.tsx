"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LuMic, LuSend } from "react-icons/lu";
import { useSpeechToText } from "@/hooks/useSpeechtoText";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  hasStarted: boolean;
}

const quickActions = [
  "Top 10 Yoga Studio",
  "Yoga Studio in Rishikesh",
  "5 Star Rating Yoga Studio",
  "University",
  "Online Yoga Studio",
  "Colleges",
];

export function ChatInput({
  onSendMessage,
  isLoading,
  hasStarted,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { isListening, transcript, startListening, stopListening } =
    useSpeechToText();

  // Auto-update input when transcript changes
  useEffect(() => {
    if (transcript) setMessage(transcript);
  }, [transcript]);

  // Auto-send when user stops talking
  useEffect(() => {
    if (!isListening && transcript.trim()) {
      onSendMessage(transcript.trim());
      setMessage("");
    }
  }, [isListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleQuickAction = (action: string) => {
    if (!isLoading) {
      onSendMessage(action);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4 shadow-lg fixed bottom-0 w-full left-0">
      <div className="max-w-4xl mx-auto">
        {!hasStarted && (
          <div className="flex flex-wrap gap-2 mb-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                  className="rounded-full bg-gray-50 hover:bg-gray-100 transition-all shadow-xs inline-flex items-center justify-center whitespace-nowrap text-xs py-1 px-2"
                >
                  {action}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message or speak..."
              disabled={isLoading}
              className="rounded-full bg-white pr-14 h-12 focus-visible:ring-2 focus-visible:ring-gray-50 shadow-sm flex w-full px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 shadow-sm transition-all inline-flex items-center justify-center text-white"
            >
              <LuSend className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
            className={`flex-shrink-0 rounded-full inline-flex items-center justify-center h-10 w-10 transition-all ${
              isListening ? "bg-red-100" : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <LuMic
              className={`h-5 w-5 ${
                isListening ? "text-red-500 animate-pulse" : "text-gray-600"
              }`}
            />
          </button>
        </form>
      </div>
    </div>
  );
}
