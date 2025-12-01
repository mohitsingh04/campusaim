"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaHistory } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { LuX } from "react-icons/lu";
import { useCallback, useEffect, useState } from "react";
import { UserProps } from "@/types/types";
import API from "@/contexts/API";
import { formatDateWithTime } from "@/contexts/Callbacks";
import { redirect } from "next/navigation";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: UserProps | null | undefined;
}

export function ChatSidebar({ isOpen, onClose, authUser }: SidebarProps) {
  const [history, setHistory] = useState<
    {
      title: string;
      createdAt: string;
      _id: string;
    }[]
  >([]);

  const getHistoryByUserId = useCallback(async () => {
    if (!authUser?._id) return;
    try {
      const response = await API.get(
        `/ai/prerna/property/histroy/${authUser?._id}`
      );
      setHistory(response?.data);
    } catch (error) {
      console.log(error);
    }
  }, [authUser]);

  useEffect(() => {
    getHistoryByUserId();
  }, [getHistoryByUserId]);
  // Example static history data — replace with dynamic if needed

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                  <Image
                    src="/img/logo/logo-small-black.png"
                    alt="AI Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Prerna</h2>
                  <p className="text-xs text-gray-500">Your yoga assistant</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex items-center justify-center text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto">
              {/* New Chat Button */}
              <Link
                href={`/ask-prerna`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl shadow-md hover:shadow-lg hover:from-gray-700 hover:to-gray-900 transition-all font-medium"
              >
                <FiMessageCircle className="h-5 w-5" />
                New Chat
              </Link>

              {/* History Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <FaHistory className="h-4 w-4 text-gray-500" />
                  Recent Chats
                </h3>

                <div className="space-y-2">
                  {history?.map((chat, index) => (
                    <motion.div
                      key={index}
                      onClick={() => redirect(`/ask-prerna/${chat?._id}`)}
                      className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all"
                    >
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateWithTime(chat?.createdAt)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Settings */}
            {/* <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
                <LuSettings className="h-5 w-5" />
                Settings
              </button>
            </div> */}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
