"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { TopBar } from "../_components/Topbar";
import { ChatSidebar } from "../_components/ChatSidebar";
import { WelcomeScreen } from "../_components/WelcomeScreen";
import { ChatInput } from "../_components/ChatInput";
import { MessageBubble, TypingIndicator } from "../_components/MessageBubbles";
import { useParams } from "next/navigation";
import { PropertyProps } from "@/types/PropertyTypes";
import { UserProps } from "@/types/UserTypes";
import { getProfile, getToken } from "@/context/getAssets";
import API from "@/context/API";
import LoginRequiredModal from "@/components/modals/LoginRequired";
import { getErrorResponse } from "@/context/Callbacks";
import { CourseProps } from "@/types/Types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content?: string;
  index?: number;
  timestamp: string;
  property?: PropertyProps[];
  property_summary?: PropertyProps | null | undefined;
  course?: CourseProps[];
}

export default function PrernaAiChat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState("");
  const [isNotLogin, setIsNotLogin] = useState(false);
  const { chat_id } = useParams();
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

  const handlePropertySearchOnLoad = useCallback(async (objectId: string) => {
    try {
      const response = await API.post(`/ai/prerna/property/summary`, {
        objectId,
      });
      const data = response?.data?.summary_data;

      return data;
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  const getPropertiesData = useCallback(async (allid: string[]) => {
    try {
      const payload = {
        property_ids: allid,
      };
      const response = await API.post(`/property/multi/objectId`, payload);
      return response.data;
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  const getCoursesData = useCallback(async (allid: string[]) => {
    try {
      const payload = {
        course_ids: allid,
      };
      const response = await API.post(`/course/multi/objectId`, payload);
      return response.data;
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  // Fetch chat messages
  const getChatData = useCallback(async () => {
    setIsChatLoading(true);
    try {
      const response = await API.get(`/ai/prerna/property/chat/${chat_id}`);
      const chats = response?.data?.chats || [];

      // Map async and wait for all promises to resolve
      const formattedMessages: Message[] = (
        await Promise.all(
          chats.map(async (item: any, index: number) => {
            const userMessage: Message = {
              id: `user-${index}-${Date.now()}`,
              role: "user",
              content: item.user?.text,
              timestamp: `${new Date(item.user?.time)}`,
              index,
            };

            const assistantMessage: Message = {
              id: `assistant-${index}-${Date.now()}`,
              role: "assistant",
              content: item.assistant?.text || "",
              timestamp: `${new Date(item.assistant?.time)}`,
              index,
              property:
                (item?.assistant?.property_ids?.length || 0) > 0
                  ? await getPropertiesData(item.assistant.property_ids)
                  : [],
              course:
                (item?.assistant?.courses_ids?.length || 0) > 0
                  ? await getCoursesData(item.assistant.courses_ids)
                  : [],
              property_summary: item?.assistant?.property_summary_id
                ? await handlePropertySearchOnLoad(
                    item?.assistant?.property_summary_id
                  )
                : null,
            };
            return [userMessage, assistantMessage];
          })
        )
      ).flat();
      setMessages(formattedMessages);

      if (formattedMessages.length > 0 && !hasStarted) {
        setHasStarted(true);
      }
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setIsChatLoading(false);
    }
  }, [
    chat_id,
    getPropertiesData,
    handlePropertySearchOnLoad,
    getCoursesData,
    hasStarted,
  ]);

  useEffect(() => {
    getChatData();
  }, [getChatData, getPropertiesData, handlePropertySearchOnLoad, hasStarted]);

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

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Force re-render before API call
    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      const response = await API.post("/ai/prerna", {
        prompt: content,
        userTime: Date.now(),
        objectId: chat_id,
      });
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.message || "",
        timestamp: `${new Date()}`,
        property: response.data?.data || [],
        course: response?.data?.courseData || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I'm having trouble connecting right now. This is a demo response.",
        timestamp: `${new Date()}`,
      };
      getErrorResponse(error, true);
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => setHasStarted(true);

  return (
    <div className="min-h-screen bg-(--primary-bg)">
      <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        authUser={authuser}
      />
      <main className="pt-16">
        {!hasStarted || isChatLoading ? (
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
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-7xl mx-auto">
                <div className="mb-30">
                  {messages?.map((message, index) => (
                    <MessageBubble
                      key={message.id}
                      role={message.role}
                      content={message.content || ""}
                      property={message.property || []}
                      course={message?.course}
                      setMessages={setMessages}
                      property_summary={message.property_summary ?? undefined}
                      index={index}
                      timestamp={message.timestamp}
                      setIsLoading={setIsLoading}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                  <div>{isLoading && <TypingIndicator />}</div>
                </div>
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
      )}{" "}
    </div>
  );
}
