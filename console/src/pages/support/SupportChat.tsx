import { useState, useRef, useEffect, useCallback } from "react";
import { FiPaperclip, FiSend, FiFile, FiDownload } from "react-icons/fi";
import { useOutletContext, useParams } from "react-router-dom";
import {
  DashboardOutletContextProps,
  SupportProps,
  UserProps,
} from "../../types/types";
import { API } from "../../contexts/API";
import {
  formatToAmPm,
  getErrorResponse,
  getStatusColor,
} from "../../contexts/Callbacks";
import Badge from "../../ui/badge/Badge";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import FeedbackModal from "./FeedbackModal";
import { FeedbackData } from "../../common/FeedbackData";

export default function SupportChat() {
  const { objectId } = useParams();
  const { authUser } = useOutletContext<DashboardOutletContextProps>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [support, setSupport] = useState<SupportProps | null>(null);
  const [participantsMap, setParticipantsMap] = useState<
    Record<string, UserProps>
  >({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supportFeedback, setSupportFeedback] = useState<{
    feedback: string;
  }>();

  // Fetch support and feedback info
  const getSupportEnquiry = useCallback(async () => {
    try {
      const [supportRes, feedbackRes] = await Promise.allSettled([
        API.get(`/support/${objectId}`),
        API.get(`/feedback/support/${objectId}`),
      ]);

      let supportEnded = false;
      if (supportRes.status === "fulfilled") {
        setSupport(supportRes.value.data);
        supportEnded = supportRes.value.data?.ended;
      } else {
        getErrorResponse(supportRes.reason, true);
      }

      let feedbackExists = false;
      if (feedbackRes.status === "fulfilled") {
        setSupportFeedback(feedbackRes?.value?.data);
        feedbackExists = !!feedbackRes.value?.data;
      }

      if (supportEnded && !feedbackExists) {
        setIsModalOpen(true);
      }
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [objectId]);

  useEffect(() => {
    getSupportEnquiry();
  }, [getSupportEnquiry]);

  // Mark messages as viewed
  const updateisView = useCallback(async () => {
    try {
      if (!objectId) return;
      await API.patch(`/support/update/view/${authUser?.uniqueId}/${objectId}`);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [authUser, objectId]);

  useEffect(() => {
    updateisView();
  }, [updateisView]);

  // Fetch messages and participants
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/support/chats/${objectId}`);
      const msgs = Array.isArray(res.data?.messages) ? res.data.messages : [];
      setMessages(msgs);

      const usersMap: Record<string, UserProps> = {};
      for (const msg of msgs) {
        if (!usersMap[msg.userId] && msg.userId !== authUser?.uniqueId) {
          try {
            const userRes = await API.get(
              `/profile/user/uniqueId/${msg.userId}`
            );
            usersMap[msg.userId] = userRes.data;
          } catch (error) {
            getErrorResponse(error, true);
          }
        }
      }
      setParticipantsMap(usersMap);
    } catch (error) {
      getErrorResponse(error, true);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [objectId, authUser?.uniqueId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;
    try {
      const formData = new FormData();
      formData.append("userId", String(authUser?.uniqueId || ""));
      formData.append(
        "senderType",
        authUser?.uniqueId === support?.userId ? "user" : "support"
      );
      if (input.trim()) formData.append("text", input.trim());
      for (const f of files) formData.append("files", f);

      const res = await API.post(
        `/support/chats/${objectId}/message`,
        formData
      );
      const newMsg = res?.data?.newMessage;
      setMessages((prev) => [...prev, newMsg]);
      setInput("");
      setFiles([]);
    } catch (error) {
      getErrorResponse(error, true);
    }
  };

  const handleCloseChat = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: "Close Chat?",
        text: "Are you sure you want to close this chat? You won’t be able to send more messages.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, close it",
      });

      if (result.isConfirmed) {
        const response = await API.patch(`/support/close/chat/${id}`);
        toast.success(response.data.message || "The chat has been closed.");
        getSupportEnquiry();
        setIsModalOpen(true);
      }
    } catch (error) {
      getErrorResponse(error);
    }
  };

  const getUser = (userId: number) => {
    if (userId === authUser?.uniqueId) return authUser;
    return participantsMap[userId] || { name: "Unknown", avatar: [] };
  };

  return (
    <div className="flex flex-col w-full h-screen rounded-xl">
      <Breadcrumbs
        title="Support"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Support", path: "/dashboard/support" },
          { label: support?.subject || "" },
        ]}
      />

      {/* Header */}
      <div className="px-4 sm:px-6 py-4 bg-[var(--yp-primary)] rounded-t-xl shadow flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--yp-main)] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[var(--yp-main)] flex items-center justify-center shrink-0">
              {participantsMap[support?.userId || ""]?.avatar?.[0] ? (
                <img
                  src={`${import.meta.env.VITE_MEDIA_URL}${
                    participantsMap[support?.userId || ""].avatar[0]
                  }`}
                  alt={participantsMap[support?.userId || ""].name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                participantsMap[
                  support?.userId || ""
                ]?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
          </div>
          <div>
            <h2 className="text-[var(--yp-text-primary)] font-semibold">
              {participantsMap[support?.userId || ""]?.name || "Support"}
            </h2>
            <p>
              <Badge
                label={support?.status}
                color={getStatusColor(support?.status || "")}
              />
            </p>
          </div>
        </div>
        <div>
          {authUser?.role === "Support" && !support?.ended && (
            <button
              onClick={() => handleCloseChat(objectId || "")}
              className="bg-[var(--yp-red-bg)] rounded text-[var(--yp-red-text)] px-2 py-1"
            >
              Close Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="bg-[var(--yp-tertiary)] flex-1 px-3 sm:px-6 py-4 space-y-4 overflow-y-auto scrollbar-hide">
        {messages.length <= 0 && !loading && (
          <div className="text-center text-[var(--yp-muted)] text-sm mt-10">
            No messages yet. Start the conversation!
          </div>
        )}

        {messages.map((msg, idx) => {
          const isCurrentUser = msg.userId === authUser?.uniqueId;
          const user = getUser(msg.userId);

          return (
            <div
              key={idx}
              className={`flex items-end gap-2 ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar on left only if not current user */}
              {!isCurrentUser && (
                <div className="w-8 h-8 rounded-full bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] flex items-center justify-center shadow-md font-bold shrink-0">
                  {user?.avatar?.[0] ? (
                    <img
                      src={`${import.meta.env.VITE_MEDIA_URL}${user.avatar[0]}`}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    user?.name?.[0]?.toUpperCase() || "U"
                  )}
                </div>
              )}

              {/* Message content */}
              <div
                className={`flex flex-col max-w-[75%] ${
                  isCurrentUser ? "items-end" : "items-start"
                }`}
              >
                {/* Files */}
                {msg?.files?.map((file: string, i: number) => {
                  const url = `${import.meta.env.VITE_MEDIA_URL}/${file}`;
                  const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(file);
                  const fileName = file.split("/").pop();
                  return (
                    <div key={i} className="mt-1">
                      {isImage ? (
                        <img
                          src={url}
                          alt={fileName}
                          className="rounded-lg w-72 h-auto object-cover shadow-md"
                        />
                      ) : (
                        <div className="px-3 py-2 rounded-lg text-sm shadow bg-[var(--yp-primary)] text-[var(--yp-text-primary)]">
                          <div className="flex items-center gap-2 mb-1">
                            <FiFile size={18} />
                            <p className="truncate">{fileName}</p>
                          </div>
                        </div>
                      )}
                      <div
                        className={`flex gap-2 mt-1 ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <a
                          href={url}
                          download={fileName}
                          target="_blank"
                          className="flex items-center gap-1 bg-[var(--yp-primary)] text-[var(--yp-text-primary)] px-3 py-1 rounded-lg text-sm hover:opacity-70 transition"
                        >
                          <FiDownload size={14} /> Download
                        </a>
                      </div>
                    </div>
                  );
                })}

                {/* Text */}
                {msg?.text && (
                  <div
                    className={`px-3 py-2 rounded-lg text-sm shadow break-words whitespace-pre-wrap mt-1 bg-[var(--yp-secondary)] text-[var(--yp-text-primary)]`}
                  >
                    {msg.text}
                  </div>
                )}

                {/* Timestamp */}
                {msg.createdAt && (
                  <div
                    className={`text-xs mt-1 px-1 text-[var(--yp-muted)] ${
                      isCurrentUser ? "text-right" : "text-left"
                    }`}
                  >
                    {formatToAmPm(msg.createdAt)}
                  </div>
                )}
              </div>

              {/* Avatar on right only if current user */}
              {isCurrentUser && (
                <div className="w-8 h-8 rounded-full bg-[var(--yp-primary)] text-[var(--yp-text-primary)] flex items-center justify-center shadow-md font-bold shrink-0">
                  {user?.avatar?.[0] ? (
                    <img
                      src={`${import.meta.env.VITE_MEDIA_URL}${user.avatar[0]}`}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    user?.name?.[0]?.toUpperCase()
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Message input OR closed banner */}
      {(authUser?.role !== "Support" ||
        Number(authUser?.uniqueId) === Number(support?.userId)) &&
      !support?.ended ? (
        <div className="p-3 sm:p-4 bg-[var(--yp-primary)] shadow-md flex flex-col rounded-b-xl  gap-2">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1 bg-[var(--yp-secondary)] rounded-md text-sm flex items-center gap-2"
                >
                  <span className="truncate max-w-[120px]">{f.name}</span>
                  <button
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-[var(--yp-red-text)] text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleAttachClick}
              className="flex items-center gap-1 text-[var(--yp-text-primary)] sm:gap-2 px-3 sm:px-4 py-2 bg-[var(--yp-tertiary)] rounded-lg text-sm hover:opacity-70 transition"
            >
              <FiPaperclip size={16} />
              <span className="hidden sm:inline">Attach</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="px-4 sm:px-5 py-2 bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] rounded-lg hover:opacity-70 active:scale-95 transition flex items-center gap-1 sm:gap-2 shadow-md"
            >
              <FiSend size={16} />{" "}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      ) : (
        support?.ended && (
          <div className="p-3 sm:p-4 bg-[var(--yp-tertiary)] rounded-b-xl text-center flex flex-col items-center gap-2">
            {Number(support?.userId) === Number(authUser?.uniqueId) && (
              <div>
                {FeedbackData.map((item) => {
                  if (supportFeedback?.feedback !== item?.label) return;
                  return (
                    <>
                      <div>
                        <item.icon className={`${item?.color} w-10 h-10`} />
                      </div>
                    </>
                  );
                })}
              </div>
            )}
            <p className="text-[var(--yp-text-secondary)] text-sm font-medium">
              -- This chat has been closed. You can no longer send messages. --
            </p>
          </div>
        )
      )}

      {Number(support?.userId) === Number(authUser?.uniqueId) && (
        <FeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          supportUserId={support?.userId}
          userId={authUser?.uniqueId}
        />
      )}
    </div>
  );
}
