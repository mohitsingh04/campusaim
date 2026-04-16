import {
    Home, Users, LayoutDashboard,
    Settings, Headset, Dot,
    ClipboardList,
    HelpCircle,
    FileQuestion,
    AlertTriangle,
    Target,
    Building2,
    Goal,
    CalendarCheck,
    IndianRupee
} from "lucide-react";

export const NAVIGATION = {
    superadmin: [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Users, label: "Admins", path: "/dashboard/admins", activePrefix: "/dashboard/admins" },
        { icon: FileQuestion, label: "Niche", path: "/dashboard/niche/all", activePrefix: "/dashboard/niche" },
        { icon: Building2, label: "Organizations", path: "/dashboard/organizations", activePrefix: "/dashboard/organizations" },
        {
            icon: HelpCircle,
            label: "Question Set",
            activePrefix: "/dashboard/question-set",
            subItems: [
                { icon: Dot, label: "All Questions", path: "/dashboard/question-set/all" },
                { icon: Dot, label: "Add Questions", path: "/dashboard/question-set/add" }
            ]
        },
        {
            icon: AlertTriangle,
            label: "System",
            activePrefix: "/dashboard/error-logs",
            subItems: [
                { icon: Dot, label: "Error Logs", path: "/dashboard/error-logs" },
            ]
        },
        { icon: Headset, label: "Help & Support", path: "/dashboard/support" },
        { icon: Settings, label: "Settings", path: "/dashboard/settings" }
    ],

    admin: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        // { icon: HelpCircle, label: "Questions", path: "/dashboard/questions/all", activePrefix: "/dashboard/questions" },
        {
            icon: Users,
            label: "Users",
            activePrefix: "/dashboard/users",
            subItems: [
                { icon: Dot, label: "Partners", path: "/dashboard/users/partners" },
                { icon: Dot, label: "Counselors", path: "/dashboard/users/counselors" },
                { icon: Dot, label: "Team Leaders", path: "/dashboard/users/team-leaders" },
            ]
        },
        {
            icon: ClipboardList,
            label: "Leads",
            activePrefix: "/dashboard/leads",
            subItems: [
                { icon: Dot, label: "All Leads", path: "/dashboard/leads/all" },
                { icon: Dot, label: "Add Lead", path: "/dashboard/leads/add" },
                { icon: Dot, label: "Add Bulk Lead", path: "/dashboard/leads/add/bulk" }
            ]
        },
        // { icon: Goal, label: "Assigned Goals", path: "/dashboard/assigned-goals" },
        { icon: IndianRupee, label: "Withdraw Request", path: "/dashboard/withdraw-request" },
        { icon: Headset, label: "Help & Support", path: "/dashboard/my-support" },
        { icon: Settings, label: "Settings", path: "/dashboard/settings" }
    ],

    counselor: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: IndianRupee, label: "Incentive", path: "/dashboard/my-incentive" },
        { icon: CalendarCheck, label: "Follow Ups", path: "/dashboard/follow-ups" },
        { icon: Target, label: "My Goals", path: "/dashboard/my-goals" },
        {
            icon: ClipboardList,
            label: "Leads",
            activePrefix: "/dashboard/leads",
            subItems: [
                { icon: Dot, label: "All Leads", path: "/dashboard/leads/all" },
                { icon: Dot, label: "Add Lead", path: "/dashboard/leads/add" },
            ]
        },
        { icon: Headset, label: "Help & Support", path: "/dashboard/my-support" },
        { icon: Settings, label: "Settings", path: "/dashboard/settings" }
    ],

    teamleader: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: IndianRupee, label: "Incentive", path: "/dashboard/my-incentive" },
        { icon: Users, label: "Teams", path: "/dashboard/users/counselors/assigned", activePrefix: "/dashboard/users" },
        {
            icon: ClipboardList,
            label: "Leads",
            activePrefix: "/dashboard/leads",
            subItems: [
                { icon: Dot, label: "All Leads", path: "/dashboard/leads/all" },
                { icon: Dot, label: "Add Lead", path: "/dashboard/leads/add" },
            ]
        },
        { icon: Headset, label: "Help & Support", path: "/dashboard/my-support" },
        { icon: Settings, label: "Settings", path: "/dashboard/settings" }
    ],

    partner: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: IndianRupee, label: "My Comission", path: "/dashboard/my-comission", activePrefix: "/dashboard/my-comission" },
        { icon: ClipboardList, label: "All Leads", path: "/dashboard/leads/all", activePrefix: "/dashboard/leads" },
        { icon: Headset, label: "Help & Support", path: "/dashboard/my-support" },
        { icon: Settings, label: "Settings", path: "/dashboard/settings" }
    ]
};