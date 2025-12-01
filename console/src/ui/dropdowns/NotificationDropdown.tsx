import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { usePopper } from "react-popper";
import Skeleton from "react-loading-skeleton";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  time?: string;
  unread: boolean;
  link?: string;
  count?: number;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  loading?: boolean;
  defaultTitle?: string;
  defaultHref?: string;
}

export function NotificationDropdown({
  notifications,
  loading = false,
  defaultTitle = "Notifications",
  defaultHref,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-end",
    modifiers: [
      { name: "offset", options: { offset: [0, 8] } },
      { name: "preventOverflow", options: { padding: 8 } },
    ],
  });

  const totalUnread = notifications.filter((n) => n.unread).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        referenceElement &&
        !referenceElement.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [referenceElement]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        ref={setReferenceElement}
        onClick={() => setOpen(!open)}
        className="p-2 text-[var(--yp-text-primary)] hover:opacity-70 hover:bg-[var(--yp-tertiary)]  rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-[var(--yp-red-bg)] text-[var(--yp-red-text)] text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          className="w-80 max-w-[95vw] bg-[var(--yp-tertiary)] rounded shadow-md z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--yp-border-primary)]">
            <h3 className="text-lg font-semibold text-[var(--yp-text-primary)]">
              {defaultTitle}
            </h3>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto scrollbar-hide">
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="p-4 border-b border-[var(--yp-border-primary)]"
                  >
                    <Skeleton height={20} width={`70%`} className="mb-1" />
                    <Skeleton height={14} width={`90%`} count={2} />
                  </div>
                ))
              : notifications.map((data) => (
                  <Link
                    key={data.id}
                    to={data.link || defaultHref || "#"}
                    onClick={() => setOpen(false)}
                    className={`flex flex-col p-4 transition-colors hover:opacity-90 border-b border-[var(--yp-border-primary)] ${
                      (data?.count || 0) > 0 ? "bg-[var(--yp-secondary)]" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-[var(--yp-text-primary)]">
                        {data.title}
                      </span>
                      {(data?.count || 0) > 0 && (
                        <span className="text-xs font-semibold text-white bg-[var(--yp-main)] rounded-full px-2 py-0.5">
                          {data.count}
                        </span>
                      )}
                    </div>
                    {data.message && (
                      <p className="text-sm text-[var(--yp-muted)] truncate">
                        {data.message}
                      </p>
                    )}
                    {data.type && (
                      <p className="text-sm text-[var(--yp-muted)] truncate">
                        {data.type}
                      </p>
                    )}
                    {data.time && (
                      <p className="text-xs text-[var(--yp-muted)] mt-1">
                        {data.time}
                      </p>
                    )}
                  </Link>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}
