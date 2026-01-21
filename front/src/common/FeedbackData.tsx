import { BiAngry, BiLaugh, BiMeh, BiSmile } from "react-icons/bi";
import { FiFrown } from "react-icons/fi";

export const FeedbackData = [
  {
    icon: BiAngry,
    label: "Very Dissatisfied",
    color: "text-[var(--danger-emphasis)]",
    bg: "bg-[var(--danger-subtle)]",
  },
  {
    icon: FiFrown,
    label: "Dissatisfied",
    color: "text-[var(--orange-emphasis)]",
    bg: "bg-[var(--orange-subtle)]",
  },
  {
    icon: BiMeh,
    label: "Neutral",
    color: "text-[var(--warning-emphasis)]",
    bg: "bg-[var(--warning-subtle)]",
  },
  {
    icon: BiSmile,
    label: "Satisfied",
    color: "text-[var(--success-emphasis)]",
    bg: "bg-[var(--success-subtle)]",
  },
  {
    icon: BiLaugh,
    label: "Very Satisfied",
    color: "text-[var(--blue-emphasis)]",
    bg: "bg-[var(--blue-subtle)]",
  },
];
