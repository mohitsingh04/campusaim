// src/components/dashboard/SuperAdminDashboard.tsx
import {
  Users,
  Gem,
  GraduationCap,
  Briefcase,
  BookOpen,
  Hotel,
  Building2,
  FileText,
  CalendarDays,
  Inbox,
  Archive,
  Headset,
  User,
  Shield,
  Home,
  LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import DashboardCard from "../../../ui/cards/DashboardCard";
import DashboardSkeleton from "../../../ui/loadings/pages/DashboardSkeleton";
import { API } from "../../../contexts/API";
import {
  generateSlug,
  getErrorResponse,
  getFieldDataSimple,
} from "../../../contexts/Callbacks";
import {
  CourseProps,
  DashboardOutletContextProps,
  UserProps,
} from "../../../types/types";
import { colorsData } from "../../../common/ExtraData";

// ✅ Move outside component to prevent re-creation and flickering
const roleEndpoints: Record<string, string[]> = {
  "Super Admin": [
    "/profile/users",
    "/course",
    "/property",
    "/blog",
    "/events",
    "/retreat",
    "/enquiry",
    "/enquiry/archive/all",
    "/support",
  ],
  Editor: ["/course", "/property", "/blog", "/events", "/retreat", "/enquiry"],
  "Seo Manager": ["/course", "/property", "/blog", "/events", "/retreat"],
  "Property Manager": ["/property"],
  User: [],
  Support: ["/support"],
};

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<UserProps[]>([]);
  const [course, setCourse] = useState<CourseProps[]>([]);
  const [property, setProperty] = useState<any[]>([]);
  const [blog, setBlog] = useState<any[]>([]);
  const [event, setEvent] = useState<any[]>([]);
  const [retreat, setRetreat] = useState<any[]>([]);
  const [enquiry, setEnquiry] = useState<any[]>([]);
  const [archiveEnquiry, setArchiveEnquiry] = useState<any[]>([]);
  const [support, setSupport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { authUser, getRoleById } =
    useOutletContext<DashboardOutletContextProps>();

  const getDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      if (!authUser) return;

      const endpoints = roleEndpoints[authUser.role] || [];
      const results = await Promise.allSettled(
        endpoints.map((url) => API.get(url))
      );

      results.forEach((res, idx) => {
        if (res.status === "fulfilled") {
          const url = endpoints[idx];
          const data = res.value?.data || [];
          switch (url) {
            case "/profile/users": {
              const finalData = data?.map((item: UserProps) => ({
                ...item,
                role: getRoleById(item.role),
              }));
              setUsers(finalData);
              break;
            }
            case "/course":
              setCourse(data);
              break;
            case "/property":
              setProperty(data);
              break;
            case "/blog":
              setBlog(data);
              break;
            case "/events":
              setEvent(data);
              break;
            case "/retreat":
              setRetreat(data);
              break;
            case "/enquiry":
              setEnquiry(data);
              break;
            case "/enquiry/archive/all":
              setArchiveEnquiry(data);
              break;
            case "/support":
              setSupport(Array.isArray(data) ? data : []);
              break;
          }
        }
      });
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [authUser, getRoleById]);

  useEffect(() => {
    getDashboardData();
  }, [getDashboardData]);

  // Derived Data
  const totalUsers = users?.length || 0;

  const allEnquiriesCount =
    (enquiry?.length || 0) + (archiveEnquiry?.length || 0);

  const openSupportCount = support?.filter((item) => !item?.ended)?.length || 0;
  const closedSupportCount =
    support?.filter((item) => item?.ended)?.length || 0;

  const roleIcons: LucideIcon[] = [
    Users,
    GraduationCap,
    Gem,
    Shield,
    Briefcase,
    User,
  ];

  const usersCard = getFieldDataSimple(users, "role").map((item, index) => ({
    title: item.title,
    value: item.value,
    icon: roleIcons[index % roleIcons.length],
    link: `/dashboard/users?role=${generateSlug(item.title)}`,
    color: colorsData[4 % colorsData.length],
    role: ["Super Admin"],
  }));

  const cardData: {
    title: string;
    value: number;
    percentage?: number;
    icon: any;
    link: string;
    color: string;
    role: string[];
  }[] = [
    {
      title: "All Users",
      value: totalUsers,
      icon: Users,
      link: "/dashboard/users",
      color: colorsData[0 % colorsData.length],
      role: ["Super Admin"],
    },
    ...usersCard,
    {
      title: "All Courses",
      value: course?.length || 0,
      icon: BookOpen,
      link: "/dashboard/course",
      color: colorsData[6 % colorsData.length],
      role: ["Super Admin", "Editor", "Seo Manager"],
    },
    {
      title: "All Properties",
      value: property?.length || 0,
      icon: Building2,
      link: "/dashboard/property",
      color: colorsData[8 % colorsData.length],
      role: ["Super Admin", "Editor", "Seo Manager"],
    },
    {
      title:
        authUser?.role === "Property Manager"
          ? "All Properties"
          : "Your Properties",
      value: property?.filter((p) => p.userId === authUser?._id)?.length || 0,
      icon: Home,
      link:
        authUser?.role === "Property Manager" ? "" : "/dashboard/property/your",
      color: colorsData[9 % colorsData.length],
      role: ["Super Admin", "Editor", "Seo Manager", "Property Manager"],
    },
    {
      title: "All Blogs",
      value: blog?.length || 0,
      icon: FileText,
      link: "/dashboard/blog",
      color: colorsData[10 % colorsData.length],
      role: ["Super Admin", "Editor", "Seo Manager"],
    },
    {
      title: "All Events",
      value: event?.length || 0,
      icon: CalendarDays,
      link: "/dashboard/events",
      color: colorsData[11 % colorsData.length],
      role: ["Super Admin", "Editor", "Seo Manager"],
    },
    {
      title: "All Enquiries",
      value: allEnquiriesCount,
      icon: Inbox,
      link: "/dashboard/enquiry",
      color: colorsData[12 % colorsData.length],
      role: ["Super Admin", "Editor"],
    },
    {
      title: "Archived Enquiries",
      value: archiveEnquiry?.length || 0,
      icon: Archive,
      link: "/dashboard/enquiry/archive",
      color: colorsData[13 % colorsData.length],
      role: ["Super Admin", "Editor"],
    },
    {
      title: "Support Enquiries",
      value: support?.length || 0,
      icon: Headset,
      link: "/dashboard/support",
      color: colorsData[14 % colorsData.length],
      role: ["Super Admin", "Editor", "Support"],
    },
    {
      title: "Open Support Enquiries",
      value: openSupportCount,
      icon: Headset,
      link: "/dashboard/support",
      color: colorsData[15 % colorsData.length],
      role: ["Super Admin", "Editor", "Support"],
    },
    {
      title: "Closed Support Enquiries",
      value: closedSupportCount,
      icon: Headset,
      link: "/dashboard/support",
      color: colorsData[16 % colorsData.length],
      role: ["Super Admin", "Editor", "Support"],
    },
  ];

  if (loading) return <DashboardSkeleton limit={cardData?.length} />;

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {cardData
          .filter(
            (card) => !card.role || card.role.includes(authUser?.role || "")
          )
          .map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
              iconColor={colorsData[index % colorsData.length]}
              link={card.link}
              percentage={card?.percentage}
            />
          ))}
      </div>
    </div>
  );
}
