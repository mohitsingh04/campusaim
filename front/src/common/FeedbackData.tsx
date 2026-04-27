import { Angry, Frown, Laugh, Meh, Smile } from "lucide-react";

export const FeedbackData = [
  {
    icon: Angry,
    label: "Very Dissatisfied",
    color: "text-[var(--danger-emphasis)]",
    bg: "bg-[var(--danger-subtle)]",
  },
  {
    icon: Frown,
    label: "Dissatisfied",
    color: "text-[var(--orange-emphasis)]",
    bg: "bg-[var(--orange-subtle)]",
  },
  {
    icon: Meh,
    label: "Neutral",
    color: "text-[var(--warning-emphasis)]",
    bg: "bg-[var(--warning-subtle)]",
  },
  {
    icon: Smile,
    label: "Satisfied",
    color: "text-[var(--success-emphasis)]",
    bg: "bg-[var(--success-subtle)]",
  },
  {
    icon: Laugh,
    label: "Very Satisfied",
    color: "text-[var(--blue-emphasis)]",
    bg: "bg-[var(--blue-subtle)]",
  },
];
