import {
  DumbbellIcon,
  SunIcon,
  GraduationCapIcon,
  UsersIcon,
  BusIcon,
  WifiIcon,
  LanguagesIcon,
  BookOpenIcon,
  PresentationIcon,
  UtensilsIcon,
  LeafIcon,
  SofaIcon,
  BeanIcon,
  LibraryBig,
  AccessibilityIcon,
  Building2Icon,
  HeartPulseIcon,
  LaptopIcon,
  SchoolIcon,
  ShieldCheckIcon,
  ShieldIcon,
  DropletIcon,
  ArrowUpDownIcon,
  MonitorIcon,
  FlaskConicalIcon,
  MicIcon,
  WrenchIcon,
  FolderKanbanIcon,
  FileTextIcon,
  LandmarkIcon,
  BriefcaseIcon,
  ConciergeBellIcon,
  BookAIcon,
  LandPlotIcon,
  TreesIcon,
  LockIcon,
  ClipboardListIcon,
  TrophyIcon,
  PackageCheckIcon,
  DicesIcon,
  FlowerIcon,
  AwardIcon,
  UserCircleIcon,
  AmbulanceIcon,
  PhoneCallIcon,
  StethoscopeIcon,
  DrumstickIcon,
  ChefHatIcon,
  StoreIcon,
  MonitorSmartphoneIcon,
  ParkingCircleIcon,
  CarIcon,
  MapPinIcon,
  BikeIcon,
  ZapIcon,
  TruckIcon,
  CalendarDaysIcon,
  UserRoundIcon,
  FlagIcon,
  DramaIcon,
  CameraIcon,
  FlameIcon,
  DoorOpenIcon,
  SirenIcon,
} from "lucide-react";
import { FaBriefcaseMedical } from "react-icons/fa";
import { MdPool } from "react-icons/md";

export type AmenityOption = { name: string; options: string[] };
export type AmenityItem = string | AmenityOption;
export type AmenitiesType = {
  [category: string]: AmenityItem[];
};

export const AmenitiesData: AmenitiesType = {
  Mandatory: [
    "Ragging-Free Campus",
    "24x7 Power Supply",
    { name: "WiFi", options: ["Free", "Paid"] },
    "Drinking Water (RO)",
    "Wheelchair Accessibility",
    "Elevator / Lift",
  ],

  "Basic Facilities": [
    { name: "Classrooms", options: ["Traditional", "Smart"] },
    "ATM / Banking Facility",
  ],

  "Academic Facilities": [
    "Computer Lab",
    { name: "Science Labs", options: ["Physics", "Chemistry", "Biology"] },
    "Workshops & Training Rooms",
    "Project Rooms",
    "Exam Hall",
    "Doubt Solving Sessions",
    "Soft Skills & Communication Training",
    "Placement Training",
    "Auditorium",
  ],

  "Common Area": [
    "Reception",
    "Waiting Lounge",
    "Conference Rooms",
    "Garden",
    "Library",
    "Study Rooms",
    "Playground / Assembly Ground",
    "Terrace Sitting Area",
    "Locker Areas",
    "Notice Board / Result Display Area",
  ],

  "Sports & Recreation": [
    "Annual Sports Day",
    "Sports Ground",
    "Indoor Sports Area",
    "Sports Equipment Availability",
    "Gym / Fitness Center",
    "Yoga / Meditation Room",
    "Swimming Pool",
    "Professional Coaches / Trainers",
    "Inter-school / Inter-college Competitions",
  ],

  "Health & Medical": [
    "Medical Room",
    "First Aid Kit",
    "Doctor on Call",
    "Ambulance Service",
    "Health Check-up Camps",
  ],

  "Food & Dining": [
    "Canteen / Cafeteria",
    "Food Court",
    "Mess Facility",
    "Vegetarian Options",
    "Non-Vegetarian Options",
  ],

  "Technology & Digital": [
    "Online Learning Support",
    "Projector Rooms",
    "Smart Boards",
  ],

  Transportation: [
    { name: "Parking", options: ["Two-Wheeler", "Four-Wheeler"] },
    "College Bus Service",
    "Pickup & Drop Facility",
    "Transport Assistance Desk",
    { name: "Bicycle Stand", options: ["Covered", "Open"] },
    "EV Charging Point",
    "E-Rickshaw / Golf Cart Transpor",
  ],

  "Student Life & Community": [
    "Clubs & Societies",
    "Drama Club",
    "NSS / NCC",
    "Student Union",
    "Workshops & Events",
    "Internship Cell",
  ],

  security: [
    "Security Gurad",
    "CCTV Surveillance",
    "Fire Safety Measures",
    "Emergency Exit Plan",
    "Panic Button / Emergency Alert System",
  ],
};

export const CategoryIcons: Record<string, any> = {
  Mandatory: SunIcon,
  "Basic Facilities": Building2Icon,
  "Academic Facilities": BookOpenIcon,
  "Common Area": GraduationCapIcon,
  "Sports & Recreation": DumbbellIcon,
  "Health & Medical": HeartPulseIcon,
  "Food & Dining": UtensilsIcon,
  "Technology & Digital": LaptopIcon,
  "Campus Infrastructure": SchoolIcon,
  Transportation: BusIcon,
  "Student Life & Community": UsersIcon,
  security: ShieldCheckIcon,
};
export const SubcategoryIcons: Record<string, any> = {
  // Mandatory
  "Ragging-Free Campus": ShieldCheckIcon,
  "24x7 Security": ShieldIcon,
  WiFi: WifiIcon,
  "Drinking Water (RO)": DropletIcon,
  "Wheelchair Accessibility": AccessibilityIcon,
  "Elevator / Lift": ArrowUpDownIcon,

  // Basic Facilities
  Classrooms: SchoolIcon,
  "ATM / Banking Facility": LandmarkIcon,

  //Academic Facilities
  "Computer Lab": MonitorIcon,
  "Science Labs": FlaskConicalIcon,
  "Workshops & Training Rooms": WrenchIcon,
  "Project Rooms": FolderKanbanIcon,
  "Exam Hall": FileTextIcon,
  "Doubt Solving Sessions": BookOpenIcon,
  "Soft Skills & Communication Training": LanguagesIcon,
  "Placement Training": BriefcaseIcon,
  Auditorium: MicIcon,

  //Common Area
  Reception: ConciergeBellIcon,
  "Waiting Lounge": SofaIcon,
  "Conference Rooms": PresentationIcon,
  Garden: BeanIcon,
  Library: LibraryBig,
  "Study Rooms": BookAIcon,
  "Playground / Assembly Ground": LandPlotIcon,
  "Terrace Sitting Area": TreesIcon,
  "Locker Areas": LockIcon,
  "Notice Board / Result Display Area": ClipboardListIcon,

  //Sports & Recreation
  "Annual Sports Day": TrophyIcon,
  "Sports Ground": LandPlotIcon,
  "Indoor Sports Area": DicesIcon,
  "Sports Equipment Availability": PackageCheckIcon,
  "Gym / Fitness Center": DumbbellIcon,
  "Yoga / Meditation Room": FlowerIcon,
  "Swimming Pool": MdPool,
  "Professional Coaches / Trainers": UserCircleIcon,
  "Inter-school / Inter-college Competitions": AwardIcon,

  //Health & Medical
  "Medical Room": StethoscopeIcon,
  "First Aid Kit": FaBriefcaseMedical,
  "Doctor on Call": PhoneCallIcon,
  "Ambulance Service": AmbulanceIcon,
  "Health Check-up Camps": HeartPulseIcon,

  //food and dining
  "Canteen / Cafeteria": UtensilsIcon,
  "Food Court": StoreIcon,
  "Mess Facility": ChefHatIcon,
  "Vegetarian Options": LeafIcon,
  "Non-Vegetarian Options": DrumstickIcon,

  //Technology & Digital
  "Online Learning Support": LaptopIcon,
  "Projector Rooms": PresentationIcon,
  "Smart Boards": MonitorSmartphoneIcon,

  //Transportations
  Parking: ParkingCircleIcon,
  "College Bus Service": BusIcon,
  "Pickup & Drop Facility": CarIcon,
  "Transport Assistance Desk": MapPinIcon,
  "Bicycle Stand": BikeIcon,
  "EV Charging Point": ZapIcon,
  "E-Rickshaw / Golf Cart Transport": TruckIcon,

  //Student Life and Community
  "Clubs & Societies": UsersIcon,
  "Drama Club": DramaIcon,
  "NSS / NCC": FlagIcon,
  "Student Union": UserRoundIcon,
  "Workshops & Events": CalendarDaysIcon,
  "Internship Cell": BriefcaseIcon,

  //security
  "Security Guard": ShieldIcon,
  "CCTV Surveillance": CameraIcon,
  "Fire Safety Measures": FlameIcon,
  "Emergency Exit Plan": DoorOpenIcon,
  "Panic Button / Emergency Alert System": SirenIcon,
};
