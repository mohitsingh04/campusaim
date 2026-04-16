import { FaAngry, FaFrown, FaLaugh, FaMeh, FaSmile } from "react-icons/fa";

export const FeedbackData = [
    {
        icon: FaAngry,
        value: 1,
        label: "Very Dissatisfied",
        color: "text-[var(--yp-danger-emphasis)]",
        bg: "bg-[var(--yp-danger-subtle)]",
    },
    {
        icon: FaFrown,
        value: 2,
        label: "Dissatisfied",
        color: "text-[var(--yp-gray-emphasis)]",
        bg: "bg-[var(--yp-gray-subtle)]",
    },
    {
        icon: FaMeh,
        value: 3,
        label: "Neutral",
        color: "text-[var(--yp-warning-emphasis)]",
        bg: "bg-[var(--yp-warning-subtle)]",
    },
    {
        icon: FaSmile,
        value: 4,
        label: "Satisfied",
        color: "text-[var(--yp-success-emphasis)]",
        bg: "bg-[var(--yp-success-subtle)]",
    },
    {
        icon: FaLaugh,
        value: 5,
        label: "Very Satisfied",
        color: "text-[var(--yp-blue-emphasis)]",
        bg: "bg-[var(--yp-blue-subtle)]",
    },
];
