import { Angry, Frown, Laugh, Meh, Smile } from "lucide-react";

export const FeedbackData = [
  {
    icon: Angry,
    label: "Very Dissatisfied",
    color: "text-[var(--yp-red-text)]",
    bg: "bg-[var(--yp-red-bg)]",
  },
  {
    icon: Frown,
    label: "Dissatisfied",
    color: "text-[var(--yp-orange-text)]",
    bg: "bg-[var(--yp-orange-bg)]",
  },
  {
    icon: Meh,
    label: "Neutral",
    color: "text-[var(--yp-yellow-text)]",
    bg: "bg-[var(--yp-yellow-bg)]",
  },
  {
    icon: Smile,
    label: "Satisfied",
    color: "text-[var(--yp-green-text)]",
    bg: "bg-[var(--yp-green-bg)]",
  },
  {
    icon: Laugh,
    label: "Very Satisfied",
    color: "text-[var(--yp-blue-text)]",
    bg: "bg-[var(--yp-blue-bg)]",
  },
];
