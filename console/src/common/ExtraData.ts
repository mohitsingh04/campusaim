import { ClassNamesConfig } from "react-select";

export const BgColors = [
  "text-blue-500",
  "text-green-500",
  "text-red-500",
  "text-purple-500",
  "text-yellow-500",
];

export const colorsData = ["blue", "green", "red", "yellow", "gray"];

export const currencyOptions = ["INR", "USD", "EUR"];

export const reactSelectDesignClass: ClassNamesConfig<any, true> = {
  control: (state) =>
    `!rounded-md border ${
      state.isFocused
        ? "!border-gray-500"
        : "!border-[var(--yp-border-primary)]"
    } !bg-[var(--yp-input-primary)] !text-[var(--yp-text-primary)]`,
  menu: () => "!bg-[var(--yp-secondary)] !text-[var(--yp-text-primary)]",
  option: (state) =>
    `!cursor-pointer !px-3 !py-2 ${
      state.isSelected
        ? "!bg-[var(--yp-primary)] !text-[var(--yp-text-primary)]"
        : state.isFocused
        ? "!bg-[var(--yp-primary)]"
        : ""
    }`,
  multiValue: () => "!bg-[var(--yp-tertiary)] !px-2 !py-1 !mr-1",
  multiValueLabel: () => "!text-sm !text-[var(--yp-text-primary)]",
  multiValueRemove: () =>
    "hover:!bg-[var(--yp-secondary)] hover:!text-[var(--yp-red-text)] !cursor-pointer !ml-1",
  placeholder: () => "!text-[var(--yp-muted)]",
  singleValue: () => "!text-[var(--yp-text-primary)]",
  // ✅ Add this line for input text color
  input: () => "!text-[var(--yp-text-primary)]",
};

export const phoneInputClass = () => {
  const input =
    "!w-full !py-5 !border !border-[var(--yp-border-primary)] !rounded-lg !bg-[var(--yp-secondary)] !text-[var(--yp-text-secondary)]";
  const button =
    "!py-5 !border !border-[var(--yp-border-primary)] !rounded-lg !bg-[var(--yp-secondary)] !text-[var(--yp-text-secondary)]";
  const dropdown =
    "!bg-[var(--yp-primary)] !rounded-lg shadow-sm text-[var(--yp-text-primary)]";
  return { input, button, dropdown };
};

export const ProgressColor = {
  blue: {
    bg: "bg-[var(--yp-blue-bg)]",
    text: "text-[var(--yp-blue-text)]",
    stroke: "stroke-blue-400",
  },
  green: {
    bg: "bg-[var(--yp-green-bg)]",
    text: "text-[var(--yp-green-text)]",
    stroke: "stroke-green-400",
  },
  yellow: {
    bg: "bg-[var(--yp-yellow-bg)]",
    text: "text-[var(--yp-yellow-text)]",
    stroke: "stroke-yellow-400",
  },
  red: {
    bg: "bg-[var(--yp-red-bg)]",
    text: "text-[var(--yp-red-text)]",
    stroke: "stroke-red-400",
  },
  gray: {
    bg: "bg-[var(--yp-gray-bg)]",
    text: "text-[var(--yp-gray-text)]",
    stroke: "stroke-gray-400",
  },
} as const;
