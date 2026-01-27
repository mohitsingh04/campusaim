"use client";

import Image from "next/image";
import { FiMessageCircle } from "react-icons/fi";
import { LuX } from "react-icons/lu";
import { useCallback, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserProps } from "@/types/UserTypes";
import API from "@/context/API";
import { formatDateWithTime, getErrorResponse } from "@/context/Callbacks";
import { useTheme } from "@/hooks/useTheme";
import HeadingLine from "@/ui/headings/HeadingLine";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: UserProps | null | undefined;
}

export function ChatSidebar({ isOpen, onClose, authUser }: SidebarProps) {
  const { theme } = useTheme();
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
      getErrorResponse(error, true);
    }
  }, [authUser]);

  useEffect(() => {
    getHistoryByUserId();
  }, [getHistoryByUserId]);

  return (
    <>
      <div>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </div>

      <div>
        {isOpen && (
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-(--primary-bg) shadow-custom z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-(--border)">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl bg-(--secondary-bg)">
                  <Image
                    src={
                      theme === "dark"
                        ? "/img/logo/campusaim-logo.png"
                        : "/img/logo/campusaim-small-logo.png"
                    }
                    alt="AI Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-(--text-color-emphasis)">
                    Prerna
                  </h2>
                  <p className="text-xs text-(--text-color)">
                    Your yoga assistant
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex items-center justify-center text-(--text-color) transition-all"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto">
              {/* New Chat Button */}
              <Link
                href={`/ask-prerna`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 btn-shine rounded-custom"
              >
                <FiMessageCircle className="h-5 w-5" />
                New Chat
              </Link>

              {/* History Section */}
              <div>
                <HeadingLine title="Recent Chats" />

                <div className="space-y-2">
                  {history?.map((chat, index) => (
                    <div
                      key={index}
                      onClick={() => redirect(`/ask-prerna/${chat?._id}`)}
                      className="p-3 rounded-lg border border-(--border) hover:bg-(--secondary-bg) cursor-pointer transition-all"
                    >
                      <p className="text-sm font-medium text-(--text-color-emphasis) truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-(--text-color)">
                        {formatDateWithTime(chat?.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
