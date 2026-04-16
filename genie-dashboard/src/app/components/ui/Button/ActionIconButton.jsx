import React from "react";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ActionIconButton = ({
    onClick,
    label,
    variant = "neutral",
    Icon,
}) => {
    const base =
        "relative inline-flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95";
    const variants = {
        neutral:
            "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 focus:ring-gray-300 shadow-sm",
        primary:
            "text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:text-blue-700 focus:ring-blue-300 shadow-sm",
        danger:
            "text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 hover:text-red-700 focus:ring-red-300 shadow-sm",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={`${base} ${variants[variant]}`}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
};

export const actionsColumn = (confirmDelete) => ({
    key: "actions",
    label: "Actions",
    render: (questionSet) => {
        const navigate = useNavigate(); // ensure hook is used in component scope if required
        return (
            <div className="flex items-center gap-2">
                <ActionIconButton
                    label="View"
                    Icon={Eye}
                    variant="neutral"
                    onClick={() =>
                        navigate(`/dashboard/question-set/view/${questionSet.slug}`)
                    }
                />

                <ActionIconButton
                    label="Edit"
                    Icon={SquarePen}
                    variant="primary"
                    onClick={() =>
                        navigate(`/dashboard/question-set/edit/${questionSet.slug}`)
                    }
                />

                <ActionIconButton
                    label="Delete"
                    Icon={Trash2}
                    variant="danger"
                    onClick={() => confirmDelete(questionSet._id)}
                />
            </div>
        );
    },
});
