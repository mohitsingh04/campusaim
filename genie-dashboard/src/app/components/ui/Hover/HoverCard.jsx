import { useState } from "react";

export default function HoverCard({
    label,
    name,
    email,
    role,
}) {
    const [open, setOpen] = useState(false);

    const hasData = Boolean(name);

    return (
        <div className="relative inline-block w-full">
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            {/* When NO data */}
            {!hasData && (
                <p className="mt-1 text-sm text-gray-400">
                    N/A
                </p>
            )}

            {/* When data EXISTS */}
            {hasData && (
                <>
                    {/* Trigger */}
                    <button
                        type="button"
                        className="mt-1 text-sm text-gray-900 underline decoration-dotted cursor-pointer"
                        onClick={() => setOpen(o => !o)}     // mobile tap
                        onMouseEnter={() => setOpen(true)}   // desktop hover
                        onMouseLeave={() => setOpen(false)}
                        onFocus={() => setOpen(true)}        // keyboard
                        onBlur={() => setOpen(false)}
                    >
                        {name}
                    </button>

                    {/* Hover / Tap Card */}
                    {open && (
                        <div
                            className="
                                absolute z-50 mt-2
                                w-[90vw] max-w-xs
                                sm:w-72
                                rounded-lg border bg-white shadow-xl
                                left-1/2 -translate-x-1/2
                                sm:left-0 sm:translate-x-0
                            "
                        >
                            <div className="flex items-center gap-3 p-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                                    {name.charAt(0).toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {name}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">
                                        {email || "No email"}
                                    </p>
                                </div>
                            </div>

                            {role && (
                                <div className="border-t px-3 py-2 text-xs text-gray-600">
                                    Role: <span className="font-medium">{role}</span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
