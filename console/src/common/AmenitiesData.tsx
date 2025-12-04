type AmenityOption = { name: string; options: string[] };
type AmenityItem = string | AmenityOption;
type AmenitiesType = {
	[category: string]: AmenityItem[];
};

export const AmenitiesData: AmenitiesType = {
	Mandatory: [
		"Ragging-Free Campus",
		"24x7 Security",
		"CCTV Surveillance",
		"First Aid & Medical Support",
		"Fire Safety Measures",
		"24x7 Power Supply",
		{ name: "WiFi", options: ["Free", "Paid"] },
		"Drinking Water (RO)",
	],

	"Basic Facilities": [
		"Classrooms",
		"Smart Classrooms",
		"Library",
		"Canteen",
		"Reading Room",
		"Common Room",
		"Waiting Lounge",
		"Wheelchair Accessibility",
		"Elevator / Lift",
	],

	"Academic Facilities": [
		"Computer Lab",
		"Science Labs",
		"Language Lab",
		"Seminar Hall",
		"Auditorium",
		"Research Center",
		"Workshops & Training Rooms",
		"Project Rooms",
		"Exam Hall",
	],

	"Hostel Facilities": [
		"Hostel Accommodation",
		"Mess Facility",
		"Study Room",
		"Common TV Room",
		"Laundry Service",
		{ name: "Laundry", options: ["Free", "Paid"] },
		"24x7 Warden Availability",
		{ name: "Room Type", options: ["Single", "Double", "Triple", "Dormitory"] },
		"Gym (Hostel)",
		"Furniture (Bed / Table / Chair)",
		"Recreation Area",
	],

	"Sports & Recreation": [
		"Gym",
		"Indoor Games",
		"Outdoor Sports Ground",
		"Cricket Ground",
		"Football Ground",
		"Basketball Court",
		"Volleyball Court",
		"Badminton Court",
		"Table Tennis",
		"Swimming Pool",
		"Athletics Track",
		"Yoga Center",
	],

	"Health & Wellness": [
		"On-Campus Clinic",
		"Doctor on Call",
		"Ambulance Service",
		"Counseling / Mental Health Support",
		"Health Check-up Camps",
		"Meditation Hall",
		"Yoga Studio",
	],

	"Food & Dining": [
		"Cafeteria",
		"Food Court",
		"Mess Facility",
		"Juice & Snack Bar",
		"Tuck Shop",
		{ name: "Meal Options", options: ["Veg", "Non-Veg", "Sattvic", "Jain"] },
	],

	"Technology & Digital": [
		"Computer Center",
		"High-Speed Internet",
		"Digital Library",
		"Online Learning Support",
		"Projector Rooms",
		"Smart Boards",
	],

	"Campus Infrastructure": [
		"Parking Area",
		{ name: "Parking", options: ["Two-Wheeler", "Four-Wheeler"] },
		"Gardens & Green Areas",
		"Open Auditorium",
		"Amphitheatre",
		"Student Activity Center",
		"Incubation Center",
		"Innovation Lab",
	],

	Transportation: [
		"College Bus Service",
		"Pickup & Drop Facility",
		"Transport Assistance Desk",
		{ name: "Bicycle Stand", options: ["Covered", "Open"] },
		"EV Charging Point",
	],

	"Administrative & Support": [
		"Reception",
		"Help Desk",
		"Lost & Found",
		"Maintenance Support",
		"Student Service Center",
		"ATM / Banking Facility",
		"Post Office / Courier Desk",
	],

	"Student Life & Community": [
		"Clubs & Societies",
		"Cultural Club",
		"Sports Club",
		"Photography Club",
		"Technical Club",
		"Drama Club",
		"NSS / NCC",
		"Student Union",
		"Workshops & Events",
		"Internship Cell",
		"Career Counseling",
	],

	"Safety & Emergency": [
		"Emergency Alarms",
		"Fire Extinguishers",
		"24x7 Security Guard",
		"Disaster Management System",
	],
};
