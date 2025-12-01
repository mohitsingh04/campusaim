"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { FaUser, FaVolumeDown, FaVolumeUp } from "react-icons/fa";
import { AiPropertySugesstion } from "./AiPropertySuggestion";
import { PropertyProps } from "@/types/types";
import { AiEnquiryModal } from "./AiEnquiryModal";
import { useState } from "react";
import { AiPropertySummary } from "./AiPropertySummary";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { stripHtmlNoLimit } from "@/contexts/Callbacks";
import Image from "next/image";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content?: string;
  index?: number;
  timestamp: Date;
  property?: PropertyProps[];
  property_summary?: PropertyProps | null | undefined;
}

interface MessageBubbleProps {
  id?: string;
  role: "user" | "assistant";
  content?: string;
  index?: number;
  timestamp: Date;
  property?: PropertyProps[];
  property_summary?: PropertyProps;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

/* ---------------------------------- */
/*       Typing Indicator Bubble      */
/* ---------------------------------- */

export const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, x: -50, y: 20 }}
    animate={{ opacity: 1, x: 0, y: 0 }}
    exit={{ opacity: 0, x: -50, y: -20 }}
    className="flex justify-start mb-4"
  >
    <div className="flex items-start gap-2 max-w-[80%] sm:max-w-[70%]">
      {/* Company logo (hidden on mobile) */}
      <div className="flex-shrink-0 relative w-10 h-10 bg-gray-900 rounded-xl hidden sm:flex items-center justify-center shadow-md">
        <Image
          fill
          className="object-cover"
          src="/img/logo/logo-small-white.png"
          alt="Company Logo"
        />
      </div>

      {/* Typing dots */}
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay }}
            />
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

/* ---------------------------------- */
/*         Chat Message Bubble         */
/* ---------------------------------- */

export function MessageBubble({
  role,
  content,
  index,
  timestamp,
  property,
  setMessages,
  setIsLoading,
  property_summary,
}: MessageBubbleProps) {
  const isUser = role === "user";
  const [isEnquiryModal, setIsEnquiryModal] = useState<string | null>("");
  const { isSpeaking, speakText, stopSpeaking } = useTextToSpeech();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-5`}
    >
      <div className="flex items-start gap-3">
        {/* Assistant logo - hidden on mobile */}
        {!isUser && (
          <div className="flex-shrink-0 relative w-5 h-5 md:w-10 md:h-10 bg-gray-900 rounded-xl hidden sm:flex items-center justify-center shadow-md">
            <Image
              fill
              className="object-cover"
              src="/img/logo/logo-small-white.png"
              alt="Assistant Logo"
            />
          </div>
        )}

        {/* Chat bubble content */}
        <div className="flex flex-col gap-2 min-w-0">
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className={`px-2 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm z-0
           w-full
              overflow-hidden
              ${
                isUser
                  ? "bg-gray-900 text-white rounded-tr-md self-end"
                  : "bg-gray-100 text-gray-900 rounded-tl-md self-start"
              }
            `}
          >
            {/* Message text */}
            {content && (
              <p
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}

            {/* Property list suggestions */}
            {property?.length ? (
              <div className="mt-3 w-full">
                <AiPropertySugesstion
                  property={property}
                  index={index || 0}
                  setIsEnquiryModal={setIsEnquiryModal}
                  setMessages={setMessages}
                  setIsLoading={setIsLoading}
                />
              </div>
            ) : null}

            {/* Single property summary */}
            {property_summary && (
              <div className="mt-3 w-full">
                <AiPropertySummary
                  property={property_summary}
                  setIsEnquiryModal={setIsEnquiryModal}
                />
              </div>
            )}
          </motion.div>

          {/* Timestamp and controls */}
          <div
            className={`flex items-center gap-2 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            <span className="text-xs text-gray-500">
              {format(timestamp, "MMM d, yyyy 'at' h:mm a")}
            </span>

            {/* Listen / Stop buttons */}
            {!isUser && content && (
              <>
                {isSpeaking ? (
                  <button
                    onClick={stopSpeaking}
                    className="h-6 px-2 hover:bg-gray-200 rounded-lg flex-shrink-0 inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors"
                  >
                    <FaVolumeDown className="h-3 w-3 mr-1" />
                    <span className="text-xs">Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={() => speakText(stripHtmlNoLimit(content))}
                    className="h-6 px-2 hover:bg-gray-200 rounded-lg flex-shrink-0 inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors"
                  >
                    <FaVolumeUp className="h-3 w-3 mr-1" />
                    <span className="text-xs">Listen</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* User avatar - hidden on mobile */}
        {isUser && (
          <div className="flex-shrink-0 w-5 h-5 md:w-10 md:h-10 bg-gray-600 rounded-xl hidden sm:flex items-center justify-center shadow-md">
            <span className="text-white font-semibold text-sm">
              <FaUser />
            </span>
          </div>
        )}
      </div>

      {/* Enquiry modal */}
      {isEnquiryModal && (
        <AiEnquiryModal
          property_slug={isEnquiryModal}
          closeModal={() => setIsEnquiryModal("")}
        />
      )}
    </motion.div>
  );
}
