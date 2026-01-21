import { BiBrain, BiHome, BiPhone } from "react-icons/bi";
import { BsLamp, BsTools } from "react-icons/bs";
import { FaParking } from "react-icons/fa";
import {
  LuNewspaper,
  LuWifi,
  LuShield,
  LuFlower2,
  LuBuilding2,
  LuUtensils,
  LuCar,
  LuBookOpen,
  LuHeart,
  LuUsers,
  LuAirplay,
  LuBrush,
  LuBook,
  LuMonitor,
  LuSunrise,
  LuSun,
  LuDroplet,
  LuClipboardCheck,
  LuAnchor,
  LuKey,
  LuMap,
  LuCoffee,
  LuBedDouble,
  LuBaggageClaim,
  LuCamera,
  LuBike,
  LuLanguages,
  LuHotel,
  LuWand,
  LuBath,
  LuDumbbell,
  LuTrees as LuForest,
  LuSparkles,
  LuStethoscope,
  LuLibrary,
  LuLightbulb,
  LuMusic,
  LuNotebook,
  LuSchool,
  LuMic,
  LuLeaf,
  LuHandshake,
  LuChefHat,
  LuShieldCheck,
  LuBus,
  LuBuilding,
} from "react-icons/lu";

// --------------------------------------------------------
// TYPES
// --------------------------------------------------------
export type AmenityOption = { name: string; options: string[] };
export type AmenityItem = string | AmenityOption;

export type AmenitiesType = {
  [category: string]: AmenityItem[];
};


// --------------------------------------------------------
// CATEGORY ICONS
// --------------------------------------------------------
export const CategoryIcons: Record<string, any> = {
  Mandatory: LuShieldCheck,
  "Basic Facilities": BiHome,
  "General Services": LuClipboardCheck,
  "Yoga Facilities": LuFlower2,
  "Common Area": LuBuilding2,
  "Outdoor & Recreational": LuForest,
  "Food and Drink": LuUtensils,
  Transportation: LuBus,
  "Academic & Learning Facilities": LuBookOpen,
  "Health & Wellness": LuHeart,
  "Student Life & Community": LuUsers,
};


// --------------------------------------------------------
// SUB-CATEGORY ICONS
// Every string + every object.name gets an appropriate icon
// --------------------------------------------------------

export const SubcategoryIcons: Record<string, any> = {
  // Mandatory
  "Air Conditioning": LuAirplay,
  Laundry: LuHotel,
  Newspaper: LuNewspaper,
  Televison: LuMonitor,
  "Mobile Service": BiPhone,
  "Fire Safety Measures": LuShield,
  "CCTV Surveillance": LuCamera,
  "First Aid Kit": LuShieldCheck,
  "24x7 Power Supply": LuLightbulb,

  // Basic Facilities
  WiFi: LuWifi,
  "Power Backup": LuLightbulb,
  "Wheelchair Accessibility": LuUsers,
  "Daily Housekeeping": LuBrush,
  "Elevator / Lift": LuAnchor,

  // General Services
  "Room Service": LuChefHat,
  Security: LuShield,
  Reception: BiHome,
  "Sitting Area": LuBedDouble,
  "Luggage Storage": LuBaggageClaim,
  "Language Support / Translator": LuLanguages,
  "Maintenance Support": BsTools,
  "Lost and Found Desk": LuKey,

  // Yoga Facilities
  "Meditation Hall": LuSunrise,
  "Open-Air Yoga Space": LuSun,
  "Indoor Yoga Studio": LuSunrise,
  "Sound Healing Room": LuMusic,
  "Props (Blocks, Straps, Bolsters)": LuDumbbell,
  "Silent Meditation Rooms": BsLamp,
  Library: LuLibrary,
  "Instructor-Led Sessions": LuUsers,
  "Sunrise Yoga": LuSunrise,
  "Pranayama Sessions": LuLeaf,
  "Ayurvedic Therapy Room": LuStethoscope,
  "Detox & Cleansing Programs": LuDroplet,
  "Wellness Consultation Desk": LuHeart,
  "Mindfulness Workshops": BiBrain,
  "Chanting & Mantra Sessions": LuMic,
  "Yoga Philosophy Lectures": LuBook,
  "Nature Meditation Retreats": LuForest,

  // Common Area
  Lounge: BiHome,
  Terrace: LuBuilding,
  Garden: LuForest,
  Courtyard: LuBuilding2,
  Amphitheatre: LuUsers,
  "Community Hall": LuBuilding,
  "Study & Discussion Zone": LuBookOpen,

  // Outdoor & Recreational
  "Walking Trails": LuMap,
  "Nearby Nature Spots": LuForest,
  "Cultural Activities": LuMusic,
  "Swimming Pool": LuBath,
  Gym: LuDumbbell,
  "Nature Walks": LuForest,
  "Outdoor Meditation Platforms": LuSunrise,
  "Bonfire or Cultural Evenings": LuSparkles,
  "Sports Grounds": LuDumbbell,
  "Cycling Tracks": LuBike,
  "Outdoor Class Area": LuSchool,
  "Organic Farming Zone": LuLeaf,
  "Eco-Garden": LuForest,

  // Food & Drink
  Restaurant: LuUtensils,
  Cafe: LuCoffee,
  "Community Dining Area": LuUsers,
  "Meals Provided": LuUtensils,
  "Herbal Tea Station": LuLeaf,
  "Organic / Sattvic Food Options": LuLeaf,
  "Juice & Smoothie Bar": LuWand,

  // Transportation
  Parking: FaParking,
  "Pickup & Drop Service": LuCar,
  "Shuttle to Nearby Attractions": LuBus,
  "Bicycle Rental": LuBike,
  "Local Sightseeing Tours": LuMap,
  "Public Transport Assistance": LuBus,
  "Campus Shuttle": LuBus,

  // Academic & Learning Facilities
  Classrooms: LuSchool,
  "Lecture Halls": LuBook,
  "Workshops & Seminar Rooms": LuNotebook,
  "Computer Lab": LuMonitor,
  "Library with Research Section": LuLibrary,
  "Study Lounges": LuBookOpen,
  "Academic Counseling Desk": LuUsers,
  "Online Learning Facilities": LuMonitor,

  // Health & Wellness
  "Ayurvedic Center": LuStethoscope,
  "Herbal Garden": LuLeaf,
  "On-Campus Clinic": LuStethoscope,
  "Doctor on Call": LuStethoscope,
  "Therapy Rooms": LuHeart,
  "Massage & Spa Facilities": LuDroplet,
  "Health Check-up Camps": LuClipboardCheck,

  // Student Life
  "Hostel Accommodation": BiHome,
  "Common Kitchen": LuChefHat,
  "Cultural Club": LuUsers,
  "Yoga Student Union": LuUsers,
  "Meditation Groups": LuUsers,
  "Workshops & Retreat Programs": LuNotebook,
  "Volunteering Opportunities": LuHandshake,
};


// --------------------------------------------------------
// AMENITIES DATA (unchanged)
// --------------------------------------------------------

export const AmenitiesData: AmenitiesType = {
  Mandatory: [
    "Air Conditioning",
    { name: "Laundry", options: ["Free", "Paid"] },
    "Newspaper",
    "Televison",
    "Mobile Service",
    "Fire Safety Measures",
    "CCTV Surveillance",
    "First Aid Kit",
    "24x7 Power Supply",
  ],
  "Basic Facilities": [
    { name: "WiFi", options: ["Free", "Paid"] },
    "Power Backup",
    "Wheelchair Accessibility",
    "Daily Housekeeping",
    "Elevator / Lift",
  ],
  "General Services": [
    { name: "Room Service", options: ["Free", "Paid"] },
    "Security",
    "Reception",
    "Sitting Area",
    "Luggage Storage",
    { name: "Language Support / Translator", options: ["Free", "Paid"] },
    "Maintenance Support",
    "Lost and Found Desk",
  ],

  "Yoga Facilities": [
    "Meditation Hall",
    "Open-Air Yoga Space",
    "Indoor Yoga Studio",
    "Sound Healing Room",
    "Props (Blocks, Straps, Bolsters)",
    "Silent Meditation Rooms",
    "Library",
    "Instructor-Led Sessions",
    "Sunrise Yoga",
    "Pranayama Sessions",
    "Ayurvedic Therapy Room",
    "Detox & Cleansing Programs",
    "Wellness Consultation Desk",
    "Mindfulness Workshops",
    "Chanting & Mantra Sessions",
    "Yoga Philosophy Lectures",
    "Nature Meditation Retreats",
  ],

  "Common Area": [
    "Lounge",
    "Terrace",
    "Garden",
    "Courtyard",
    "Amphitheatre",
    "Community Hall",
    "Study & Discussion Zone",
  ],

  "Outdoor & Recreational": [
    "Walking Trails",
    "Nearby Nature Spots",
    "Cultural Activities",
    "Swimming Pool",
    "Gym",
    "Nature Walks",
    "Outdoor Meditation Platforms",
    "Bonfire or Cultural Evenings",
    "Sports Grounds",
    "Cycling Tracks",
    "Outdoor Class Area",
    "Organic Farming Zone",
    "Eco-Garden",
  ],

  "Food and Drink": [
    "Restaurant",
    "Cafe",
    "Community Dining Area",
    "Meals Provided",
    "Herbal Tea Station",
    "Organic / Sattvic Food Options",
    "Juice & Smoothie Bar",
  ],

  Transportation: [
    { name: "Parking", options: ["Indoor", "Outdoor"] },
    "Pickup & Drop Service",
    "Shuttle to Nearby Attractions",
    { name: "Bicycle Rental", options: ["Free", "Paid"] },
    "Local Sightseeing Tours",
    "Public Transport Assistance",
    "Campus Shuttle",
  ],

  "Academic & Learning Facilities": [
    "Classrooms",
    "Lecture Halls",
    "Workshops & Seminar Rooms",
    "Computer Lab",
    "Library with Research Section",
    "Study Lounges",
    "Academic Counseling Desk",
    "Online Learning Facilities",
  ],

  "Health & Wellness": [
    "Ayurvedic Center",
    "Herbal Garden",
    "On-Campus Clinic",
    "Doctor on Call",
    "Therapy Rooms",
    "Massage & Spa Facilities",
    "Health Check-up Camps",
  ],

  "Student Life & Community": [
    "Hostel Accommodation",
    "Common Kitchen",
    "Cultural Club",
    "Yoga Student Union",
    "Meditation Groups",
    "Workshops & Retreat Programs",
    "Volunteering Opportunities",
  ],
};
