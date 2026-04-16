import React, { useState } from "react";
import { CheckCircle } from "lucide-react";

export default function TemplateQuestionsModal({
    questionSets = [],
    addedTemplateSlugs = new Set(),
    onClose,
    onSelectTemplate,
}) {
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const isAlreadyAdded = (set) => addedTemplateSlugs.has(set.slug);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Select Question Template</h3>

                <div className="max-h-80 overflow-y-auto space-y-2">
                    {questionSets.length === 0 && (
                        <p className="text-sm text-gray-500">No templates available</p>
                    )}

                    {questionSets.map((set) => {
                        const added = isAlreadyAdded(set);

                        return (
                            <button
                                key={set.slug}
                                type="button"
                                disabled={added}
                                onClick={() => setSelectedTemplate(set)}
                                className={`relative w-full text-left border rounded-lg px-4 py-3 transition
                  ${added ? "bg-green-50 border-green-300 cursor-not-allowed" :
                                        selectedTemplate?.slug === set.slug
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:bg-blue-50"}
                `}
                            >
                                {added && (
                                    <span className="absolute top-2 right-2 flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                                        <CheckCircle className="w-3 h-3" />
                                        Added
                                    </span>
                                )}

                                <p className="font-medium text-gray-900">{set.title}</p>
                                <p className="text-sm text-gray-600">{set.questionText}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {set.options?.length || 0} options
                                </p>
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 border rounded-md">
                        Cancel
                    </button>

                    <button
                        disabled={!selectedTemplate || isAlreadyAdded(selectedTemplate)}
                        onClick={() => {
                            if (!selectedTemplate) return;
                            onSelectTemplate(selectedTemplate);
                            onClose();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                    >
                        Use Template
                    </button>
                </div>
            </div>
        </div>
    );
}