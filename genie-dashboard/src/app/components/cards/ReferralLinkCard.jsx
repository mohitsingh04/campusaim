import React, { useRef, useState, useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Copy, Share2, Trash2, Check } from "lucide-react";
import QRCode from "react-qr-code";

const CustomOption = (props) => {
    return (
        <components.Option {...props}>
            <div className="flex items-center justify-between w-full">
                <span className="truncate pr-2 text-white">{props.data.label}</span>
                {props.data.isRemovable && (
                    <button
                        type="button"
                        className="text-white/50 hover:text-red-300 transition-colors p-1 rounded-md hover:bg-white/10"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            props.selectProps.onRemoveWebsite(props.data.value);
                        }}
                        aria-label="Remove website"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </components.Option>
    );
};

export default function ReferralLinkCard() {
    const { authUser } = useAuth();
    const qrRef = useRef(null);
    const referralCode = authUser?.ref_code || "";

    const fallbackWebsite = import.meta.env.VITE_REFERRAL_URL || window.location.origin;
    const defaultWebsite = fallbackWebsite;

    const [customWebsites, setCustomWebsites] = useState([]);
    const [selectedWebsite, setSelectedWebsite] = useState(defaultWebsite);
    const [newWebsite, setNewWebsite] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("referralWebsites");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) setCustomWebsites(parsed);
            }
        } catch (err) {
            console.error("Failed to parse referralWebsites from localStorage:", err);
            localStorage.removeItem("referralWebsites");
        }
    }, []);

    const normalizeUrl = (url) => {
        if (!url) return "";
        let clean = url.trim();
        if (!clean.startsWith("http")) clean = `https://${clean}`;
        return clean.replace(/\/$/, "");
    };

    const handleSaveWebsite = () => {
        if (!newWebsite.trim()) return;

        const normalized = normalizeUrl(newWebsite);
        if (normalized === defaultWebsite || customWebsites.includes(normalized)) {
            setSelectedWebsite(normalized);
            setNewWebsite("");
            return;
        }

        const updated = [...customWebsites, normalized];
        setCustomWebsites(updated);
        setSelectedWebsite(normalized);
        setNewWebsite("");

        try {
            localStorage.setItem("referralWebsites", JSON.stringify(updated));
        } catch (err) {
            console.error("Failed to save to localStorage:", err);
        }
    };

    const handleRemoveWebsite = (siteToRemove) => {
        const updated = customWebsites.filter((site) => site !== siteToRemove);
        setCustomWebsites(updated);

        if (selectedWebsite === siteToRemove) {
            setSelectedWebsite(defaultWebsite);
        }

        try {
            localStorage.setItem("referralWebsites", JSON.stringify(updated));
        } catch (err) {
            console.error("Failed to update localStorage after removal:", err);
        }
    };

    const referralLink = useMemo(() => {
        if (!referralCode) return "";

        const baseToUse = newWebsite.trim() || selectedWebsite;
        const base = normalizeUrl(baseToUse);

        return `${base}?ref=${encodeURIComponent(referralCode)}`;
    }, [selectedWebsite, newWebsite, referralCode]);

    const selectOptions = useMemo(() => {
        const options = [{ value: defaultWebsite, label: defaultWebsite, isRemovable: false }];
        customWebsites.forEach((site) => {
            options.push({ value: site, label: site, isRemovable: true });
        });
        return options;
    }, [defaultWebsite, customWebsites]);

    const copyToClipboard = async () => {
        if (!referralLink) return;
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Clipboard write failed:", err);
        }
    };

    const handleDownloadQR = () => {
        try {
            const svg = qrRef.current?.querySelector("svg");
            if (!svg) throw new Error("SVG element not found");

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (!blob) return;
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `referral-qr-${authUser?.ref_code || 'link'}.png`;
                    link.click();
                    URL.revokeObjectURL(url);
                }, "image/png");
            };

            img.onerror = (err) => console.error("Image load error:", err);
            img.src = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgString)))}`;
        } catch (err) {
            console.error("QR download failed:", err);
        }
    };

    const handleShare = async () => {
        if (!referralLink) return;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Join using my referral",
                    text: "Sign up using my referral link",
                    url: referralLink,
                });
            } else {
                await copyToClipboard();
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("Share failed:", err);
            }
        }
    };

    if (!referralLink) return null;

    return (
        <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl overflow-hidden w-full">
            {/* Optional: Subtle background overlay for texture */}
            <div className="absolute inset-0 bg-white/5 pointer-events-none mix-blend-overlay"></div>

            <div className="relative z-10 space-y-8">

                {/* Configuration Area */}
                {/* <div className="space-y-4 pb-8 border-b border-white/10">
                    <label className="block text-sm font-medium text-white/90">
                        Referral Target URL
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            value={selectOptions.find((opt) => opt.value === selectedWebsite) || selectOptions[0]}
                            onChange={(option) => {
                                setSelectedWebsite(option.value);
                                setNewWebsite("");
                            }}
                            options={selectOptions}
                            components={{ Option: CustomOption }}
                            onRemoveWebsite={handleRemoveWebsite}
                            isSearchable={false}
                            classNamePrefix="react-select"
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    borderColor: state.isFocused ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.2)",
                                    borderRadius: "0.5rem",
                                    boxShadow: state.isFocused ? "0 0 0 2px rgba(255, 255, 255, 0.2)" : "none",
                                    "&:hover": { borderColor: "rgba(255, 255, 255, 0.4)" },
                                    minHeight: "42px"
                                }),
                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: "#3b0764", // Deep purple (fuchsia-950) to match the gradient tone solidly
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                                    zIndex: 50,
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused ? "rgba(255, 255, 255, 0.1)" : "transparent",
                                    color: "#ffffff",
                                    cursor: "pointer",
                                    "&:active": { backgroundColor: "rgba(255, 255, 255, 0.2)" }
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: "#ffffff",
                                }),
                            }}
                        />

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add custom domain..."
                                value={newWebsite}
                                onChange={(e) => setNewWebsite(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveWebsite()}
                                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                            />
                            <button
                                onClick={handleSaveWebsite}
                                disabled={!newWebsite.trim()}
                                className="flex items-center justify-center px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 disabled:bg-white/20 disabled:text-white/40 rounded-lg text-sm font-semibold transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div> */}

                {/* Output Area */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

                    {/* Link Interaction */}
                    <div className="flex-1 w-full space-y-4 min-w-0">
                        <h2 className="text-sm font-medium text-white/90">Your Unique Link</h2>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-black/20 rounded-lg px-4 py-3 border border-white/10 overflow-hidden relative shadow-inner">
                                <code
                                    className="text-sm font-mono text-blue-100 truncate block transition-all"
                                    title={referralLink}
                                >
                                    {referralLink}
                                </code>
                            </div>

                            <button
                                onClick={copyToClipboard}
                                className="flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white p-3 rounded-lg transition-colors shrink-0 backdrop-blur-sm"
                                aria-label="Copy link"
                            >
                                {copied ? <Check size={18} className="text-emerald-300" /> : <Copy size={18} />}
                            </button>

                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white p-3 rounded-lg transition-colors shrink-0 backdrop-blur-sm"
                                aria-label="Share link"
                            >
                                <Share2 size={18} />
                            </button>
                        </div>

                        <div className="h-4">
                            {copied && <p className="text-emerald-300 text-xs font-medium animate-pulse">Copied to clipboard!</p>}
                        </div>
                    </div>

                    {/* QR Interaction */}
                    <div className="flex flex-col items-center bg-white/10 p-5 rounded-2xl border border-white/20 shrink-0 min-w-[180px] backdrop-blur-sm shadow-lg">
                        <div ref={qrRef} className="p-2.5 bg-white rounded-xl mb-4 shadow-sm transition-opacity">
                            <QRCode value={referralLink} size={110} level="H" />
                        </div>
                        <button
                            onClick={handleDownloadQR}
                            className="w-full py-2.5 text-xs bg-white text-purple-700 hover:bg-blue-50 font-bold rounded-lg transition-colors shadow-sm"
                        >
                            Download QR
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}