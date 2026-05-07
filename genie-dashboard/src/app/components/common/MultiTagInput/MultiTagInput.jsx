import { useState } from "react";

export default function MultiTagInput({ label, value = [], onChange, options = [] }) {
    const [input, setInput] = useState("");

    const addTag = (val) => {
        const clean = val.trim();
        if (!clean) return;

        if (!value.includes(clean)) {
            onChange([...value, clean]);
        }
    };

    const removeTag = (tag) => {
        onChange(value.filter((v) => v !== tag));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(input);
            setInput("");
        }
    };

    return (
        <div>
            <label className="block text-sm mb-1">{label}</label>

            <div className="flex flex-wrap gap-2 border rounded px-2 py-2">
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1"
                    >
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>×</button>
                    </span>
                ))}

                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type and press Enter or comma"
                    className="flex-1 outline-none"
                />
            </div>

            {/* suggestions */}
            <div className="flex flex-wrap gap-2 mt-2">
                {options.map((opt) => (
                    <button
                        type="button"
                        key={opt}
                        onClick={() => addTag(opt)}
                        className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}