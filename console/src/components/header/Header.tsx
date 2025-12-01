import { Sun, Moon, LogOut, User, SmilePlus, Settings } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { Link } from "react-router";
import { ProfileDropdown } from "../../ui/dropdowns/ProfileDropdown";
import { NotificationDropdown } from "../../ui/dropdowns/NotificationDropdown";
import { SupportProps, UserProps } from "../../types/types";
import { useCallback, useEffect, useState } from "react";
import { API } from "../../contexts/API";
import toast from "react-hot-toast";
import { getErrorResponse } from "../../contexts/Callbacks";
import CustomToast from "../../ui/toast/customtoast";
import { RiMenuFold3Line, RiMenuUnfold3Line } from "react-icons/ri";

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  time?: string;
  unread: boolean;
  link?: string;
  count?: number;
}

interface HeaderProps {
  onToggleCollapse: () => void;
  authUser: UserProps | null;
  isCollapsed: boolean;
}

export function Header({
  onToggleCollapse,
  authUser,
  isCollapsed,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [feedback, setFeedback] = useState("");
  const [support, setSupport] = useState<SupportProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);

  // Fetch user support tickets
  const getSupport = useCallback(async () => {
    if (!authUser?.uniqueId) return;
    setLoading(true);
    try {
      let response;
      if (authUser?.role !== "Property Manager" && authUser?.role !== "User") {
        response = await API.get(`/support`);
      } else {
        response = await API.get(`/support/user/${authUser.uniqueId}`);
      }
      setSupport(response.data || []);
    } catch (error) {
      getErrorResponse(error, true);
      setSupport([]);
    } finally {
      setLoading(false);
    }
  }, [authUser?.uniqueId, authUser?.role]);

  useEffect(() => {
    getSupport();
  }, [getSupport]);

  // Fetch unread support message count
  const getUnreadMessageCount = useCallback(async () => {
    try {
      const response = await API.get(`/support/get/unread`);
      setUnreadMessages(response.data || []); // fallback to empty array
    } catch (error) {
      getErrorResponse(error, true);
      setUnreadMessages([]); // fallback if request fails
    }
  }, []);

  useEffect(() => {
    getUnreadMessageCount();
  }, [getUnreadMessageCount]);

  // Fetch feedback status
  const getFeedback = useCallback(async () => {
    if (!authUser?.uniqueId) return;
    try {
      const response = await API.get(`/feedback/user/${authUser.uniqueId}`);
      setFeedback(response.data || ""); // fallback to empty string
    } catch (error) {
      getErrorResponse(error, true);
      CustomToast();
      setFeedback(""); // fallback if request fails
    }
  }, [authUser?.uniqueId]);

  useEffect(() => {
    getFeedback();
  }, [getFeedback]);

  const handleLogout = useCallback(async () => {
    try {
      const response = await API.get(`/profile/logout`);
      toast.success(response.data.message);
      window.location.reload();
    } catch (error) {
      getErrorResponse(error);
    }
  }, []);

  // Map support tickets + unread counts to notifications (only unread)
  const notifications: Notification[] = Array.isArray(support)
    ? support
        .map((ticket) => {
          const unread = (
            Array.isArray(unreadMessages) ? unreadMessages : []
          ).find((msg) => msg.supportId === ticket._id)?.unreadCount;

          return {
            id: ticket._id,
            type: "help & support",
            title: ticket.subject || "Support Ticket",
            unread: (unread || 0) > 0,
            link: `/dashboard/support/${ticket._id}`,
            count: unread || 0,
          };
        })
        .filter((notif) => notif.unread)
    : [];

  const avatarUrl = authUser?.avatar?.[0]
    ? authUser.avatar[0].startsWith("http")
      ? authUser.avatar[0]
      : `${import.meta.env.VITE_MEDIA_URL}/${authUser.avatar[0]}`
    : "/img/default-images/yp-user.webp";

  return (
    <header className="sticky top-0 bg-[var(--yp-primary)] border-b border-[var(--yp-border-primary)] px-4 lg:px-6 py-4 z-100">
      <div className="flex items-center justify-between">
        {/* Left: Collapse + Logo on mobile */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleCollapse}
            className="p-2 text-[var(--yp-text-primary)] hover:opacity-70 hover:bg-[var(--yp-tertiary)] rounded-lg transition-colors hidden lg:block"
          >
            {isCollapsed ? (
              <RiMenuUnfold3Line className="w-6 h-6" />
            ) : (
              <RiMenuFold3Line className="w-6 h-6" />
            )}
          </button>

          {/* Mobile Logo (hidden on lg+) */}
          <Link to="/" className="lg:hidden">
            {theme === "dark" ? (
              <img
                src="/img/logo/campusaim-logo.png"
                alt="Logo"
                className="h-6 w-auto ml-8"
              />
            ) : (
              <img
                src="/img/logo/campusaim-logo.png"
                alt="Logo"
                className="h-6 w-auto ml-8"
              />
            )}
          </Link>
        </div>

        {/* Right: Theme, Notifications, Feedback, Profile */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            title="Change Theme"
            className="p-2 text-[var(--yp-text-primary)] hover:opacity-70 hover:bg-[var(--yp-tertiary)]  rounded-lg transition-colors"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {(notifications?.length || 0) > 0 && (
            <NotificationDropdown
              notifications={notifications || []}
              loading={loading}
            />
          )}
          {!feedback && (
            <Link
              to={`/dashboard/give/feedback`}
              title="Give Feedback"
              className="p-2 text-[var(--yp-text-primary)] hover:opacity-70 hover:bg-[var(--yp-tertiary)]  rounded-lg transition-colors"
            >
              <SmilePlus />
            </Link>
          )}

          <ProfileDropdown
            username={authUser?.username}
            avatarUrl={avatarUrl}
            items={[
              {
                type: "link",
                label: "View Profile",
                icon: User,
                to: "/dashboard/profile",
              },
              {
                type: "link",
                label: "Settings",
                icon: Settings,
                to: "/dashboard/settings",
              },
              {
                type: "button",
                label: "Sign Out",
                icon: LogOut,
                onClick: handleLogout,
                danger: true,
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
