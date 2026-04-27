import {
  DumbbellIcon,
  SunIcon,
  SproutIcon,
  GraduationCapIcon,
  SaladIcon,
  UsersIcon,
  BusIcon,
  MountainSnowIcon,
  HospitalIcon,
  ShieldUserIcon,
  WifiIcon,
  AirVentIcon,
  PhoneCallIcon,
  ConciergeBell,
  WashingMachine,
  SquareUserRound,
  BrushCleaning,
  LanguagesIcon,
  ZapIcon,
  SunriseIcon,
  FlowerIcon,
  WindIcon,
  BookOpenIcon,
  ComputerIcon,
  BellOffIcon,
  NotebookPen,
  PresentationIcon,
  ProjectorIcon,
  HandshakeIcon,
  UtensilsIcon,
  CookingPot,
  SoupIcon,
  LeafIcon,
  HamIcon,
  HandPlatter,
  Coffee,
  GlassWaterIcon,
  VeganIcon,
  AppleIcon,
  SofaIcon,
  Warehouse,
  BeanIcon,
  LibraryBig,
  Armchair,
  TvIcon,
  WavesLadderIcon,
  CarTaxiFront,
  Motorbike,
  CarFront,
  CaravanIcon,
  SportShoeIcon,
  BikeIcon,
  CalendarRange,
  LandPlot,
  FlameKindling,
  BriefcaseMedical,
  AccessibilityIcon,
  CctvIcon,
  FireExtinguisher,
} from "lucide-react";

export type AmenityOption = { name: string; options: string[] };
export type AmenityItem = string | AmenityOption;

export type AmenitiesType = {
  [category: string]: AmenityItem[];
};

export const CategoryIcons: Record<string, any> = {
  "Basic Facilities": SunIcon,
  "Yoga Facilities": SproutIcon,
  "Academic & Learning Facilities": GraduationCapIcon,
  "Food and Drink": SaladIcon,
  "Common Area": UsersIcon,
  Transportation: BusIcon,
  "Outdoor & Recreational": MountainSnowIcon,
  "Medical Facilities": HospitalIcon,
  Security: ShieldUserIcon,
};

export const SubcategoryIcons: Record<string, any> = {
  // Basic Facilities
  WiFi: WifiIcon,
  "Air Conditioning": AirVentIcon,
  "Mobile Service": PhoneCallIcon,
  "Reception Area": ConciergeBell,
  Laundry: WashingMachine,
  "Elevator / Lift": SquareUserRound,
  Housekeeping: BrushCleaning,
  "Language Support / Translator": LanguagesIcon,
  "Power Backup": ZapIcon,

  // Yoga Facilities
  "Morning Yoga Sessions": SunriseIcon,
  "Meditation Rooms": FlowerIcon,
  "Natural Ventilation": WindIcon,

  //Academic & Learning Facilities
  "Study Room": BookOpenIcon,
  "Computer Lab": ComputerIcon,
  "Quiet Study Zones": BellOffIcon,
  "Lecture Halls": NotebookPen,
  "Online Learning Facilities": PresentationIcon,
  "Workshops & Seminar Rooms": ProjectorIcon,
  "Alumni Interaction": HandshakeIcon,
  "Career Guidance": GraduationCapIcon,

  //Food & Drink
  "Breakfast Included": UtensilsIcon,
  "Lunch Included": CookingPot,
  "Dinner Included": SoupIcon,
  "Vegetarian Options": LeafIcon,
  "Non-Vegetarian Options": HamIcon,
  "Community Dining Area": HandPlatter,
  "Tea/Coffee Machine": Coffee,
  "RO Drinking Water": GlassWaterIcon,
  "In-House Mess": UtensilsIcon,
  "Herbal Tea Station": VeganIcon,
  "Juice & Smoothie Bar": AppleIcon,

  //Common Area
  Lounge: SofaIcon,
  Terrace: Warehouse,
  Garden: BeanIcon,
  Library: LibraryBig,
  "Meditation Hall": MountainSnowIcon,
  "Common Sitting Area": Armchair,
  "Televison Entertainment Lounge": TvIcon,
  "Swimming Pool": WavesLadderIcon,
  Gym: DumbbellIcon,

  //Transportation
  "Pickup & Drop Service": CarTaxiFront,
  "Two Wheeler Parking": Motorbike,
  "Four Wheeler Parking": CarFront,
  "Public Transport Assistance": CaravanIcon,

  //OutDoor and Recreational
  "Walking Tracks": SportShoeIcon,
  "Cycling Tracks": BikeIcon,
  "Event Space": CalendarRange,
  "Sports Activities": LandPlot,
  "Bonfire or Cultural Evenings": FlameKindling,

  //Medical Facilities
  "First Aid Kit": BriefcaseMedical,
  "Doctor on Call": BriefcaseMedical,
  "Medical Room": HospitalIcon,
  "Wheelchair Accessibility": AccessibilityIcon,

  //Security
  "CCTV Surveillance": CctvIcon,
  "Security Guard": ShieldUserIcon,
  "Fire Safety System": FireExtinguisher,
};
