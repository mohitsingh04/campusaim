import {
  Book,
  Building,
  Clipboard,
  Computer,
  Cpu,
  Database,
  GitGraph,
  Headset,
  Home,
  Key,
  MessageCirclePlus,
  MessageCircleX,
  Search,
  Shield,
  Stars,
  Tag,
  Users2,
} from "lucide-react";
import { GiMaterialsScience } from "react-icons/gi";

import { Login } from "../pages/auth/Login";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { Register } from "../pages/auth/Register";
import { StatusCreate } from "../pages/status/StatusCreate";
import { StatusList } from "../pages/status/StatusList";
import { StatusEdit } from "../pages/status/StatusEdit";
import { UserList } from "../pages/users/UsersList";
import { CategoryList } from "../pages/category/CategoryList";
import { BlogList } from "../pages/blog/BlogList";
import { SearchList } from "../pages/search/SearchList";
import { CourseList } from "../pages/course/CourseList";
import { PropertyList } from "../pages/property/PropertyList";
import StatusView from "../pages/status/StatusView";
import { CategroyCreate } from "../pages/category/CategroyCreate";
import { CategoryEdit } from "../pages/category/CategoryEdit";
import CategoryView from "../pages/category/CategoryView";
import SearchView from "../pages/search/SearchView";
import { BlogCreate } from "../pages/blog/BlogCreate";
import BlogView from "../pages/blog/BlogView";
import { BlogEdit } from "../pages/blog/BlogEdit";
import { BlogCategoryList } from "../pages/blog/category/BlogCategoryList";
import BlogCategoryEdit from "../pages/blog/category/BlogCategoryEdit";
import BlogCategoryCreate from "../pages/blog/category/BlogCategoryCreate";
import BlogTags from "../pages/blog/tag/BlogTags";
import KeyOutComes from "../pages/key_outcomes/KeyOutComeslist";
import Requirements from "../pages/Requirements/Requirements";
import LegalPage from "../pages/legals/Legals";
import { CourseCreate } from "../pages/course/CourseCreate";
import { CourseEdit } from "../pages/course/CourseEdit";
import CourseView from "../pages/course/CourseView";
import { FeedbackList } from "../pages/feedback/FeedbackList";
import { CourseDeleted } from "../pages/course/CourseDeleted";
import FeedbackGive from "../pages/feedback/FeedbackGive";
import { PropertyCreate } from "../pages/property/PropertyCreate";
import { PropertyView } from "../pages/property/PropertyView";
import PropertyAnalytics from "../pages/property/PropertyAnalytics";
import Profile from "../pages/profile/Profile";
import { ForgotPassword } from "../pages/auth/ForgotPassword";
import ForgotpasswordSwal from "../pages/auth/ForgotPasswordSwal";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyEmailSwal from "../pages/auth/VerifyEmail";
import VerifyEmailConfirm from "../pages/auth/VerifyEmailConfirm";
import { EnquiryList } from "../pages/enquiry/EnquriyList";
import { ArchiveEnquiryList } from "../pages/enquiry/archive/ArchiveEnquiryList";
import EnquiryView from "../pages/enquiry/EnquiryView";
import ArchiveEnquiryView from "../pages/enquiry/archive/ArchiveEnquiryView";
import FeedbackView from "../pages/feedback/FeedbackView";
import { PropertyYour } from "../pages/property/YourProperty";
import BlogSeo from "../pages/blog/BlogSeo";
import { UserView } from "../pages/users/UserView";
import { UserEdit } from "../pages/users/UserEdit";
import { SettingsPage } from "../pages/settings/Settings";
import DeleteAccountSwal from "../pages/auth/AccountDeleteResend";
import DeleteAccountConfrim from "../pages/auth/DeleteAccountConfimr";
import NewSupportQuery from "../pages/support/NewSupportQuery";
import SupportChat from "../pages/support/SupportChat";
import { SupportList } from "../pages/support/SupportList";
import NewsList from "../pages/news/NewsList";
import { MdNewspaper } from "react-icons/md";
import { NewsCreate } from "../pages/news/NewsCreate";
import { NewsEdit } from "../pages/news/NewsEdit";
import NewsView from "../pages/news/NewsView";
import CourseSeo from "../pages/course/CourseSeo";
import NewsSeo from "../pages/news/NewsSeo";
import ProfessionalAssets from "../pages/professional-assets/ProfessionalAssets";
import PropertyVerification from "../pages/property/PropertyVerification";
import PropertyCompares from "../pages/property-compares/PropertyCompares";
import ExamList from "../pages/exams/ExamList";
import { ExamCreate } from "../pages/exams/ExamCreate";
import ExamDeleted from "../pages/exams/ExamDeleted";
import ExamView from "../pages/exams/ExamView";
import ExamsEdit from "../pages/exams/ExamsEdit";
import ExamSeo from "../pages/exams/ExamSeo";

export const SidbarNavigations = [
  {
    name: "Dashboard",
    id: "dashboard",
    icon: Home,
    href: "/dashboard",
    component: Dashboard,
    roles: [
      "User",
      "Property Manager",
      "Support",
      "Seo Manager",
      "Editor",
      "Super Admin",
    ],
  },
  {
    name: "Users",
    id: "users",
    icon: Users2,
    href: "/dashboard/users",
    component: UserList,
    roles: ["Super Admin"],
    Permission: "Read User",
  },
  {
    name: "Searches",
    id: "search",
    icon: Search,
    href: "/dashboard/search",
    component: SearchList,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Search",
  },
  {
    name: "Status",
    id: "status",
    icon: GitGraph,
    href: "/dashboard/status",
    component: StatusList,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Status",
  },
  {
    name: "Course",
    id: "course",
    icon: Cpu,
    href: "/dashboard/course",
    component: CourseList,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Course",
  },
  {
    name: "Category",
    id: "category",
    icon: Database,
    href: "/dashboard/category",
    component: CategoryList,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Category",
  },
  {
    name: "Exam",
    id: "exam",
    icon: Database,
    href: "/dashboard/exam",
    component: ExamList,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Exam",
  },
  {
    name: "Property",
    id: "property",
    icon: Building,
    href: "/dashboard/property",
    component: PropertyList,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Property",
  },
  {
    name: "Compares",
    id: "compare",
    icon: Building,
    href: "/dashboard/property/compare",
    component: PropertyCompares,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Compare Property",
  },
  {
    name: "Blog",
    id: "blog",
    icon: Book,
    href: "/dashboard/blog",
    component: BlogList,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Blog",
  },
  {
    name: "Blog Category",
    id: "blog-category",
    icon: Computer,
    href: "/dashboard/blog/category",
    component: BlogCategoryList,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Blog Category",
  },
  {
    name: "Blog Tags",
    id: "blog-tags",
    icon: Tag,
    href: "/dashboard/blog/tags",
    component: BlogTags,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Blog Tag",
  },
  {
    name: "Key Outcomes",
    id: "key-outcomes",
    icon: Key,
    href: "/dashboard/key-outcomes",
    component: KeyOutComes,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Key Outcome",
  },
  {
    name: "Requirments",
    id: "requirments",
    icon: Clipboard,
    href: "/dashboard/requirments",
    component: Requirements,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Requirment",
  },
  {
    name: "News & Updates",
    id: "news",
    icon: MdNewspaper,
    href: "/dashboard/news-and-updates",
    component: NewsList,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read News & Updates",
  },
  {
    name: "Legals",
    id: "legals",
    icon: Shield,
    href: "/dashboard/legals",
    component: LegalPage,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Legal",
  },
  {
    name: "Feedbacks",
    id: "feedbacks",
    icon: Stars,
    href: "/dashboard/feedbacks",
    component: FeedbackList,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Feedback",
  },
  {
    name: "Enquiry",
    id: "enquiry",
    icon: MessageCirclePlus,
    href: "/dashboard/enquiry",
    component: EnquiryList,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Enquiry",
  },
  {
    name: "Archive Enquiry",
    id: "archive-enquiry",
    icon: MessageCircleX,
    href: "/dashboard/enquiry/archive",
    component: ArchiveEnquiryList,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Archive Enquiry",
  },
  {
    name: "Professional Assets",
    id: "professional-assets",
    icon: GiMaterialsScience,
    href: "/dashboard/professional-assets",
    component: ProfessionalAssets,
    roles: ["Super Admin"],
    Permission: "Read Professional Assets",
  },
  {
    name: "Help & Support",
    id: "help-and-support",
    icon: Headset,
    href: "/dashboard/support",
    component: SupportList,
    roles: [
      "User",
      "Property Manager",
      "Support",
      "Seo Manager",
      "Editor",
      "Super Admin",
    ],
  },
];

export const NonSidebarNavigations = [
  {
    name: "Profile",
    id: "profile",
    href: "/dashboard/profile",
    component: Profile,
    roles: ["User", "Property Manager", "Seo Manager", "Editor", "Super Admin"],
  },
  {
    name: "User View",
    id: "user-view",
    href: "/dashboard/user/:objectId",
    component: UserView,
    roles: ["Super Admin"],
    Permission: "Read User",
  },
  {
    name: "User Edit",
    id: "user-edit",
    href: "/dashboard/user/:objectId/edit",
    component: UserEdit,
    roles: ["Super Admin"],
    Permission: "Update User",
  },
  {
    name: "Search View",
    id: "search-view",
    href: "/dashboard/search/:objectId",
    component: SearchView,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Search",
  },
  {
    name: "Status Create",
    id: "status-create",
    href: "/dashboard/status/create",
    component: StatusCreate,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Create Status",
  },
  {
    name: "Status Edit",
    id: "status-edit",
    href: "/dashboard/status/:objectId/edit",
    component: StatusEdit,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Update Status",
  },
  {
    name: "Status View",
    id: "status-view",
    href: "/dashboard/status/:objectId",
    component: StatusView,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Status",
  },
  {
    name: "Category Create",
    id: "category-create",
    href: "/dashboard/category/create",
    component: CategroyCreate,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Create Category",
  },
  {
    name: "Category View",
    id: "category-view",
    href: "/dashboard/category/:objectId",
    component: CategoryView,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Category",
  },
  {
    name: "Category Edit",
    id: "category-edit",
    href: "/dashboard/category/:objectId/edit",
    component: CategoryEdit,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Update Category",
  },
  {
    name: "Course Create",
    id: "course-create",
    href: "/dashboard/course/create",
    component: CourseCreate,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Create Course",
  },
  {
    name: "Course Archives",
    id: "course-deleted",
    href: "/dashboard/course/archives",
    component: CourseDeleted,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Archive Course",
  },
  {
    name: "Course View",
    id: "course-view",
    href: "/dashboard/course/:objectId",
    component: CourseView,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Course",
  },
  {
    name: "Course Edit",
    id: "course-edit",
    href: "/dashboard/course/:objectId/edit",
    component: CourseEdit,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Update Course",
  },
  {
    name: "Course Seo",
    id: "course-seo",
    href: "/dashboard/course/:objectId/seo",
    component: CourseSeo,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Course Seo",
  },
  {
    name: "Property Create",
    id: "property-create",
    href: "/dashboard/property/create",
    component: PropertyCreate,
    roles: ["User", "Property Manager", "Seo Manager", "Editor", "Super Admin"],
    Permission: "Create Property",
  },
  {
    name: "Property View",
    id: "property-view",
    href: "/dashboard/property/:objectId",
    component: PropertyView,
    roles: ["Property Manager", "Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Property",
  },
  {
    name: "Property Your",
    id: "property-your",
    href: "/dashboard/property/your",
    component: PropertyYour,
    roles: ["Property Manager", "Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Property",
  },
  {
    name: "Property Analytics",
    id: "property-analytics",
    href: "/dashboard/property/:objectId/analytics",
    component: PropertyAnalytics,
    roles: ["Property Manager", "Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Property Analytics",
  },
  {
    name: "Property Verification",
    id: "property-analytics",
    href: "/dashboard/property/:objectId/verification",
    component: PropertyVerification,
    roles: ["Property Manager", "Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Property Verification",
  },
  {
    name: "Exam Create",
    id: "exam-create",
    href: "/dashboard/exam/create",
    component: ExamCreate,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Create Exam",
  },
  {
    name: "Exam Archives",
    id: "exam-deleted",
    href: "/dashboard/exam/archives",
    component: ExamDeleted,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Archive Exam",
  },
  {
    name: "Exam View",
    id: "exam-view",
    href: "/dashboard/exam/:objectId",
    component: ExamView,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Exam",
  },
  {
    name: "Exam Edit",
    id: "exam-edit",
    href: "/dashboard/exam/:objectId/edit",
    component: ExamsEdit,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Update Exam",
  },
  {
    name: "Exam Seo",
    id: "exam-seo",
    href: "/dashboard/exam/:objectId/seo",
    component: ExamSeo,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Exam Seo",
  },
  {
    name: "Blog Create",
    id: "blog-create",
    href: "/dashboard/blog/create",
    component: BlogCreate,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Create Blog",
  },
  {
    name: "Blog View",
    id: "blog-view",
    href: "/dashboard/blog/:objectId",
    component: BlogView,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Blog",
  },
  {
    name: "Blog Edit",
    id: "blog-edit",
    href: "/dashboard/blog/:objectId/edit",
    component: BlogEdit,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Update Blog",
  },
  {
    name: "Blog SEO",
    id: "blog-edit",
    href: "/dashboard/blog/:objectId/seo",
    component: BlogSeo,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Blog Seo",
  },
  {
    name: "Blog Category Create",
    id: "blog-category-create",
    href: "/dashboard/blog/category/create",
    component: BlogCategoryCreate,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Create Blog Category",
  },
  {
    name: "Blog Category Edit",
    id: "blog-category-edit",
    href: "/dashboard/blog/category/:objectId/edit",
    component: BlogCategoryEdit,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Update Blog Category",
  },
  {
    name: "Give Feedback",
    id: "give-feedback",
    href: "/dashboard/give/feedback",
    component: FeedbackGive,
    roles: ["User", "Property Manager", "Seo Manager", "Editor", "Super Admin"],
  },
  {
    name: "Feedback View",
    id: "feedback-view",
    href: "/dashboard/feedback/:objectId",
    component: FeedbackView,
    roles: ["User", "Property Manager", "Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Feedback",
  },
  {
    name: "News And Updates Create",
    id: "news-and-updates-create",
    href: "/dashboard/news-and-updates/create",
    component: NewsCreate,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Create News & Updates",
  },
  {
    name: "News And Updates View",
    id: "news-and-updates-view",
    href: "/dashboard/news-and-updates/:objectId",
    component: NewsView,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read News & Updates",
  },
  {
    name: "News And Updates Edit",
    id: "news-and-updates-edit",
    href: "/dashboard/news-and-updates/:objectId/edit",
    component: NewsEdit,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Update News & Updates",
  },
  {
    name: "News And Updates Seo",
    id: "news-and-updates-seo",
    href: "/dashboard/news-and-updates/:objectId/seo",
    component: NewsSeo,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read News & Updates Seo",
  },
  {
    name: "Enquiry View",
    id: "enquiry-view",
    href: "/dashboard/enquiry/:objectId",
    component: EnquiryView,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Enquiry",
  },
  {
    name: "Archive Enquiry View",
    id: "archive-enquiry-view",
    href: "/dashboard/enquiry/archive/:objectId",
    component: ArchiveEnquiryView,
    roles: ["Seo Manager", "Editor", "Super Admin"],
    Permission: "Read Archive Enquiry",
  },
  {
    name: "Settings",
    id: "settings",
    href: "/dashboard/settings",
    component: SettingsPage,
    roles: ["User", "Property Manager", "Seo Manager", "Editor", "Super Admin"],
  },
  {
    name: "Support Query",
    id: "support-query",
    href: "/dashboard/support/new",
    component: NewSupportQuery,
    roles: [
      "User",
      "Property Manager",
      "Support",
      "Seo Manager",
      "Editor",
      "Super Admin",
    ],
  },
  {
    name: "Support Chat",
    id: "support-chat",
    href: "/dashboard/support/:objectId",
    component: SupportChat,
    roles: [
      "User",
      "Property Manager",
      "Support",
      "Seo Manager",
      "Editor",
      "Super Admin",
    ],
  },
];

export const AuthNavigations = [
  {
    name: "Login",
    id: "login",
    href: "/",
    component: Login,
    guestOnly: true,
  },
  {
    name: "Register",
    id: "register",
    href: "/register",
    component: Register,
    guestOnly: true,
  },
];

export const PublicNavigations = [
  {
    name: "Forgot Password",
    href: "/forgot-password",
    component: ForgotPassword,
    public: true,
  },
  {
    name: "Reset Password",
    href: "/auth/reset-password/confirm/:token",
    component: ResetPassword,
    public: true,
  },
];

export const NonLayoutNavigations = [
  {
    name: "Delete Account Mail",
    href: "/auth/delete/account/:email",
    component: DeleteAccountSwal,
    public: true,
  },
  {
    name: "Delete Account Confirm",
    href: "/profile/delete-account/confirm/:token",
    component: DeleteAccountConfrim,
    public: true,
  },
  {
    name: "Forgot Password Swal",
    href: "/forgot-password/:email",
    component: ForgotpasswordSwal,
    public: true,
  },
  {
    name: "Verify Swal",
    href: "/verify-email/:email",
    component: VerifyEmailSwal,
    public: true,
  },
  {
    name: "Verify Email",
    href: "/auth/verify-email/confirm/:token",
    component: VerifyEmailConfirm,
    public: true,
  },
];
