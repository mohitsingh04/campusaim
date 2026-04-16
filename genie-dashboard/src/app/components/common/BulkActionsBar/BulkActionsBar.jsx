// import React from "react";

// export default function BulkActionsBar({
//     selectedCount = 0,
//     actions = [],
//     onAction,
//     onClear,
// }) {
//     if (selectedCount === 0) return null;

//     if (typeof onAction !== "function" || typeof onClear !== "function") {
//         return null;
//     }

//     return (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                     <span className="text-sm font-medium text-blue-900">
//                         {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
//                     </span>

//                     <select
//                         className="px-3 py-1 border border-blue-300 rounded text-sm bg-white"
//                         defaultValue=""
//                         onChange={(e) => {
//                             const value = e.target.value;
//                             if (!value) return;
//                             onAction(value);
//                             e.target.value = "";
//                         }}
//                     >
//                         <option value="">Bulk Actions</option>
//                         {actions.map(({ label, action }) => (
//                             <option key={action} value={action}>
//                                 {label}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 <button
//                     type="button"
//                     onClick={onClear}
//                     className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//                 >
//                     Clear Selection
//                 </button>
//             </div>
//         </div>
//     );
// }


import React from "react";
import { Trash2, Download, UserPlus, X } from "lucide-react";

export default function BulkActionsBar({
    selectedCount = 0,
    actions = [],
    onAction,
    onClear,
}) {
    if (selectedCount === 0) return null;

    if (typeof onAction !== "function" || typeof onClear !== "function") {
        return null;
    }

    // map action → styles
    const getActionStyles = (action) => {
        switch (action) {
            case "delete":
                return "bg-red-100 text-red-700 hover:bg-red-200";
            case "export":
                return "bg-green-100 text-green-700 hover:bg-green-200";
            case "assign":
                return "bg-indigo-100 text-indigo-700 hover:bg-indigo-200";
            default:
                return "bg-gray-100 text-gray-700 hover:bg-gray-200";
        }
    };

    // map action → icon
    const getActionIcon = (action) => {
        switch (action) {
            case "delete":
                return <Trash2 size={16} />;
            case "export":
                return <Download size={16} />;
            case "assign":
                return <UserPlus size={16} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-blue-900">
                        {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
                    </span>

                    {/* ✅ Buttons with icons */}
                    {actions.map(({ label, action }) => (
                        <button
                            key={action}
                            type="button"
                            onClick={() => onAction(action)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition ${getActionStyles(action)}`}
                        >
                            {getActionIcon(action)}
                            {label}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onClear}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    <X size={16} />
                    Clear
                </button>
            </div>
        </div>
    );
}