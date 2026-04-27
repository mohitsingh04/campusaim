import { CheckIcon, XIcon } from "lucide-react";

const ListItem = ({ text, type }: { text: string; type: string }) => (
  <li className="flex items-start gap-2 text-sm!">
    {type === "include" ? (
      <div className="bg-(--success-subtle) rounded-full w-5 h-5 flex items-center justify-center text-(--success-emphasis)">
        <CheckIcon className="shrink-0" size={12} />
      </div>
    ) : (
      <div className="bg-(--danger-subtle) rounded-full w-5 h-5 flex items-center justify-center text-(--danger-emphasis)">
        <XIcon className="mt-1 shrink-0" size={12} />
      </div>
    )}
    <span className="text-(--text-color)">{text}</span>
  </li>
);

export default ListItem;
