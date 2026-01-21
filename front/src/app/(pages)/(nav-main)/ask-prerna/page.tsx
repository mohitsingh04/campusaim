"use client";

import { useState, useRef, useEffect } from "react";
import { TopBar } from "./_components/Topbar";
import { ChatSidebar } from "./_components/ChatSidebar";
import { WelcomeScreen } from "./_components/WelcomeScreen";
import { ChatInput } from "./_components/ChatInput";
import { MessageBubble, TypingIndicator } from "./_components/MessageBubbles";
import { useRouter } from "next/navigation";
import { PropertyProps } from "@/types/PropertyTypes";
import { UserProps } from "@/types/UserTypes";
import { getProfile, getToken } from "@/context/getAssets";
import API from "@/context/API";
import LoginRequiredModal from "@/components/modals/LoginRequired";
import { getErrorResponse } from "@/context/Callbacks";

interface Message {
  id: string;
  role: "user" | "assistant";
  content?: string;
  index?: number;
  timestamp: string;
  property?: PropertyProps[];
  property_summary?: PropertyProps | null;
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState("");
  const [isNotLogin, setIsNotLogin] = useState(false);
  const router = useRouter();
  const [authuser, setAuthUser] = useState<UserProps | null>();

  // Load user token
  useEffect(() => {
    const getUserDetails = async () => {
      const token = await getProfile();
      setAuthUser(token);
    };
    getUserDetails();
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      setToken(token);
    };

    checkToken();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!hasStarted) setHasStarted(true);
    if (!token) {
      setIsNotLogin(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: `${new Date()}`,
    };

    // ✅ Add user message immediately and wait for DOM to update before API call
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Force a synchronous re-render flush
    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      const response = await API.post("/ai/prerna", {
        prompt: content,
        userTime: Date.now(),
        objectId: "",
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.message,
        timestamp: `${new Date()}`,
        property: response.data?.data,
      };

      router.push(`/ask-prerna/${response?.data?.chatId}`);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      getErrorResponse(error, true);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I'm having trouble connecting right now. This is a demo response.",
        timestamp: `${new Date()}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    setHasStarted(true);
  };

  return (
    <div className="min-h-screen bg-(--primary--bg)">
      <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        authUser={authuser}
      />

      <main className="pt-16">
        {!hasStarted ? (
          <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex-1 overflow-y-auto">
              <div className="">
                <WelcomeScreen
                  onStart={handleStart}
                  onSendMessage={handleSendMessage}
                  token={token}
                  hasStarted={hasStarted}
                  authUser={authuser}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex-1 overflow-y-auto">
              <div className="">
                {messages.length === 0 ? (
                  <WelcomeScreen
                    onStart={handleStart}
                    onSendMessage={handleSendMessage}
                    token={token}
                    hasStarted={hasStarted}
                    authUser={authuser}
                  />
                ) : (
                  <div className="mb-30">
                    {messages.map((message, index) => (
                      <MessageBubble
                        key={message?.id}
                        role={message?.role}
                        content={message?.content}
                        property={message?.property}
                        setMessages={setMessages}
                        property_summary={
                          message?.property_summary ?? undefined
                        }
                        index={index}
                        timestamp={message.timestamp}
                        setIsLoading={setIsLoading}
                      />
                    ))}
                    <div>{isLoading && <TypingIndicator />}</div>
                  </div>
                )}
              </div>
            </div>

            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              hasStarted={hasStarted}
            />
          </div>
        )}
      </main>
      {isNotLogin && (
        <LoginRequiredModal
          isOpen={isNotLogin}
          onClose={() => setIsNotLogin(false)}
        />
      )}
    </div>
  );
}
