import React, { useState, useRef, useEffect } from "react";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import toast from "react-hot-toast";
import { API } from "../../services/API";
import ReactMarkdown from "react-markdown";

export default function Test() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const quickPrompts = [
        "How many leads do we have?",
        "Show recent leads",
        "Leads from Delhi",
        "Top cities for leads",
    ];

    const sendMessage = async (text) => {
        if (!text.trim() || loading) return;

        const userMessage = {
            id: Date.now(),
            role: "user",
            text,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await API.post("/chat", { message: text });

            const botMessage = {
                id: Date.now() + 1,
                role: "bot",
                text: res.data?.reply || "No response",
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            toast.error("AI request failed");

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: "bot",
                    text: "Error fetching response.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = () => sendMessage(input);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "AI Chat" },
                ]}
            />

            <div className="flex flex-col h-[70vh] bg-white border rounded-2xl shadow-sm overflow-hidden">

                {/* Header */}
                <div className="px-4 py-3 border-b text-sm font-medium text-gray-700">
                    AI Assistant (Superadmin Only)
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {messages.length === 0 && (
                        <div className="text-center space-y-4">
                            <p className="text-gray-400 text-sm">
                                Ask about leads, trends, or insights
                            </p>

                            {/* Quick Prompts */}
                            <div className="flex flex-wrap justify-center gap-2">
                                {quickPrompts.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className="text-xs px-3 py-1 border rounded-full hover:bg-gray-100"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${msg.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-800"
                                    }`}>
                                <div className="prose prose-sm">
                                    <ReactMarkdown>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="text-sm text-gray-400">AI is thinking...</div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-3 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about leads, trends, insights..."
                        disabled={loading}
                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />

                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}