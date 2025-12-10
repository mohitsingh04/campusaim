// import React, { useEffect, useState } from "react";
// import { API } from "../../contexts/API";
// import toast from "react-hot-toast";
// import { getCategoryAccodingToField } from "../../contexts/Callbacks";

// const CAREER_FALLBACK = {
// 	engineering: ["Software Engineer", "Civil Engineer", "Data Scientist"],
// 	medicine: ["Doctor", "Clinical Researcher", "Physiotherapist"],
// 	management: ["Business Analyst", "Product Manager", "Entrepreneur"],
// 	design: ["Graphic Designer", "Fashion Designer", "UX/UI Designer"],
// 	sports: ["Coach", "Athlete", "Sports Physiotherapist"],
// 	law: ["Lawyer", "Legal Advisor"],
// };

// const idEq = (a, b) => String(a) === String(b);

// // SCORE: simple scoring - 10 points per category + level bonus
// function calculateScore(answers) {
// 	let score = 0;
// 	const breakdown = { interests: 0, levelBonus: 0 };

// 	// 10 points per selected category
// 	breakdown.interests = (answers.interests || []).length * 10;
// 	score += breakdown.interests;

// 	if (answers.level === "12th") {
// 		breakdown.levelBonus = 5;
// 		score += 5;
// 	} else if (answers.level === "Graduation") {
// 		breakdown.levelBonus = 10;
// 		score += 10;
// 	}

// 	return { score, breakdown };
// }

// // --- UPDATED: matchColleges uses Location collection to filter by city if user selected a location ----
// function matchColleges(answers, properties = [], propertyLocation = []) {
// 	if (!properties?.length || !answers?.interests?.length) return [];

// 	// If user selected a city (answers.location), get property_ids in that city from propertyLocation
// 	let propertyIdsInCity = null;
// 	if (answers.location) {
// 		const matchedLocs = propertyLocation.filter(
// 			(loc) => String(loc.property_city) === String(answers.location)
// 		);
// 		propertyIdsInCity = matchedLocs.map((l) => String(l.property_id));
// 	}

// 	return properties.filter((p) => {
// 		// academic_type match (supports array or single id)
// 		const at = p.academic_type;
// 		let academicMatch = false;
// 		if (!at) academicMatch = false;
// 		else if (Array.isArray(at))
// 			academicMatch = answers.interests.some((cid) =>
// 				at.some((x) => idEq(x, cid))
// 			);
// 		else academicMatch = answers.interests.some((cid) => idEq(at, cid));

// 		if (!academicMatch) return false;

// 		// if location is selected, ensure property's id appears in propertyIdsInCity
// 		if (propertyIdsInCity) {
// 			// property._id might be object; compare as strings
// 			return propertyIdsInCity.includes(String(p._id));
// 		}

// 		return true;
// 	});
// }

// // Match exams: prefer exams linked to categories (field names tried: academic_type, category, academicType)
// // fallback: return Active/Pending exams
// function matchExams(answers, exams = [], categories = []) {
// 	if (!exams?.length) return [];

// 	// 1) exams with direct category relation
// 	const examsByCategory = exams.filter((e) => {
// 		const examCat =
// 			e.academic_type || e.category || e.academicType || e.category_id;
// 		if (!examCat) return false;
// 		if (Array.isArray(examCat)) {
// 			return answers.interests.some((cid) => examCat.some((x) => idEq(x, cid)));
// 		}
// 		return answers.interests.some((cid) => idEq(examCat, cid));
// 	});

// 	if (examsByCategory.length) return examsByCategory;

// 	// 2) fallback: keyword match by category name/slug against exam name
// 	const keywords = (answers.interests || [])
// 		.flatMap((cid) => {
// 			const c = categories.find((x) => idEq(x._id || x._id, cid));
// 			return c
// 				? [
// 						String(c.category_name || c.name || "").toLowerCase(),
// 						String(c.slug || "").toLowerCase(),
// 				  ]
// 				: [];
// 		})
// 		.filter(Boolean);

// 	if (keywords.length) {
// 		const byName = exams.filter((e) => {
// 			const name = (
// 				e.exam_name ||
// 				e.name ||
// 				e.exam_short_name ||
// 				""
// 			).toLowerCase();
// 			return keywords.some((kw) => kw && name.includes(kw));
// 		});
// 		if (byName.length) return byName;
// 	}

// 	// 3) final fallback: Active/Pending exams
// 	return exams.filter(
// 		(e) =>
// 			!e.status || ["Active", "active", "Pending", "pending"].includes(e.status)
// 	);
// }

// // Match scholarships by entrance_exam relation OR by category eligibility if provided
// function matchScholarships({
// 	answers,
// 	scholarships = [],
// 	matchedExams = [],
// 	properties = [],
// }) {
// 	if (!scholarships?.length) return [];

// 	const examIds = (matchedExams || []).map((e) => String(e._id));

// 	return scholarships.filter((s) => {
// 		// ignore inactive
// 		if (s.status && !["Active", "active"].includes(s.status)) return false;

// 		// entrance_exam can be array of ids or single id
// 		if (
// 			Array.isArray(s.entrance_exam) &&
// 			s.entrance_exam.some((id) => examIds.includes(String(id)))
// 		)
// 			return true;
// 		if (
// 			s.entrance_exam &&
// 			!Array.isArray(s.entrance_exam) &&
// 			examIds.includes(String(s.entrance_exam))
// 		)
// 			return true;

// 		// some scholarships might have category / academic_type eligibility fields
// 		const eligCats =
// 			s.category || s.academic_type || s.eligibility_category || s.eligibility;
// 		if (
// 			Array.isArray(eligCats) &&
// 			answers.interests.some((cid) => eligCats.some((ec) => idEq(ec, cid)))
// 		)
// 			return true;
// 		if (
// 			eligCats &&
// 			!Array.isArray(eligCats) &&
// 			answers.interests.some((cid) => idEq(eligCats, cid))
// 		)
// 			return true;

// 		// location-based (if answers.location holds a city string AND scholarship location holds category ids representing that city)
// 		if (
// 			answers.location &&
// 			Array.isArray(s.location) &&
// 			s.location.some((loc) => idEq(loc, answers.location))
// 		)
// 			return true;

// 		return false;
// 	});
// }

// // Recommend careers from category name/slug using fallback map
// function recommendCareersFromCategories(answers, categories = []) {
// 	const careers = (answers.interests || []).flatMap((cid) => {
// 		const c = categories.find((x) => idEq(x._id || x._id, cid));
// 		if (!c) return [];
// 		const keyCandidates = [
// 			(c.category_name || c.name || "").toLowerCase(),
// 			(c.slug || "").toLowerCase(),
// 		];
// 		for (const candidate of keyCandidates) {
// 			for (const k of Object.keys(CAREER_FALLBACK)) {
// 				if (candidate.includes(k)) return CAREER_FALLBACK[k];
// 			}
// 		}
// 		return [`${c.category_name || c.name} (specialist)`];
// 	});

// 	return Array.from(new Set(careers));
// }

// // Main component
// export default function AssessmentTest() {
// 	const [categories, setCategories] = useState([]);
// 	const [properties, setProperties] = useState([]);
// 	const [exams, setExams] = useState([]);
// 	const [scholarships, setScholarships] = useState([]);
// 	const [propertyLocation, setPropertyLocation] = useState([]);

// 	useEffect(() => {
// 		fetchCategories();
// 		fetchPropertyData();
// 		fetchExamData();
// 		fetchScholarshipData();
// 		fetchPropertyLocation();
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, []);

// 	async function fetchCategories() {
// 		try {
// 			const res = await API.get("/category");
// 			setCategories(res.data || []);
// 		} catch (err) {
// 			toast.error("Failed to load categories");
// 		}
// 	}
// 	async function fetchPropertyData() {
// 		try {
// 			const res = await API.get("/property");
// 			setProperties(res.data || []);
// 		} catch (err) {
// 			toast.error("Property Fetch Error.");
// 		}
// 	}
// 	async function fetchExamData() {
// 		try {
// 			const res = await API.get("/exam");
// 			setExams(res.data || []);
// 		} catch (err) {
// 			toast.error("Exam Fetch Error.");
// 		}
// 	}
// 	async function fetchScholarshipData() {
// 		try {
// 			const res = await API.get("/scholarship");
// 			setScholarships(res.data || []);
// 		} catch (err) {
// 			toast.error("Scholarship Fetch Error.");
// 		}
// 	}
// 	async function fetchPropertyLocation() {
// 		try {
// 			const res = await API.get("/locations");
// 			setPropertyLocation(res.data || []);
// 		} catch (err) {
// 			toast.error("Property Location Fetch Error.");
// 		}
// 	}

// 	// make sure callbacks return arrays (defensive)
// 	const assessmentInterestStreamOptions =
// 		getCategoryAccodingToField(categories, "Assessment Interest Options") || [];
// 	const streamOptions = getCategoryAccodingToField(categories, "stream") || [];

// 	// UI / assessment state
// 	const TOTAL_STEPS = 6; // 1..5 inputs + result as 6
// 	const [step, setStep] = useState(1);
// 	const [answers, setAnswers] = useState({
// 		interests: [], // will store category._id (strings)
// 		stream: "",
// 		level: "",
// 		location: "", // city string
// 		budget: "",
// 	});
// 	const [result, setResult] = useState(null);
// 	const [scoreData, setScoreData] = useState({ score: 0, breakdown: {} });

// 	function handleInterestToggle(id) {
// 		setAnswers((prev) => {
// 			const exists = prev.interests.some((x) => idEq(x, id));
// 			return {
// 				...prev,
// 				interests: exists
// 					? prev.interests.filter((x) => !idEq(x, id))
// 					: [...prev.interests, id],
// 			};
// 		});
// 	}

// 	function stepValid(s) {
// 		if (s === 1) return answers.interests.length > 0;
// 		if (s === 2) return !!answers.stream;
// 		if (s === 3) return !!answers.level;
// 		if (s === 4) return true; // optional
// 		if (s === 5) return !!answers.budget;
// 		return true;
// 	}

// 	function computeAndShowResults() {
// 		// score
// 		const s = calculateScore(answers);
// 		setScoreData(s);

// 		// match colleges (updated to use propertyLocation)
// 		const matchedColleges = matchColleges(
// 			answers,
// 			properties,
// 			propertyLocation
// 		);

// 		// match exams
// 		const matchedExams = matchExams(answers, exams, categories);

// 		// match scholarships via exams and categories
// 		const matchedScholarships = matchScholarships({
// 			answers,
// 			scholarships,
// 			matchedExams,
// 			properties,
// 		});

// 		// career suggestions
// 		const careers = recommendCareersFromCategories(answers, categories);

// 		setResult({
// 			colleges: matchedColleges,
// 			exams: matchedExams,
// 			scholarships: matchedScholarships,
// 			careers,
// 		});

// 		setStep(6);
// 	}

// 	function goNext() {
// 		if (!stepValid(step)) return;
// 		if (step === 5) {
// 			computeAndShowResults();
// 			return;
// 		}
// 		setStep((p) => Math.min(TOTAL_STEPS, p + 1));
// 	}
// 	function goPrev() {
// 		if (step === 6) {
// 			setStep(5);
// 			return;
// 		}
// 		setStep((p) => Math.max(1, p - 1));
// 	}

// 	function restart() {
// 		setAnswers({
// 			interests: [],
// 			stream: "",
// 			level: "",
// 			location: "",
// 			budget: "",
// 		});
// 		setResult(null);
// 		setScoreData({ score: 0, breakdown: {} });
// 		setStep(1);
// 	}

// 	const progressPercent = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);

// 	return (
// 		<div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
// 			<h2 className="text-2xl font-bold mb-4">Student Assessment Test</h2>

// 			{/* Progress */}
// 			<div className="mb-6">
// 				<div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
// 					<div
// 						className="h-3 rounded-full transition-all duration-300"
// 						style={{
// 							width: `${progressPercent}%`,
// 							background: "linear-gradient(90deg,#4f46e5,#06b6d4)",
// 						}}
// 					/>
// 				</div>
// 				<div className="mt-2 text-sm text-gray-600">
// 					Progress: {progressPercent}%
// 				</div>
// 			</div>

// 			{/* Steps */}
// 			<div className="min-h-[220px]">
// 				{/* STEP 1: Categories as interests */}
// 				{step === 1 && (
// 					<div>
// 						<h3 className="font-semibold mb-3">
// 							1) Select your interests (categories)
// 						</h3>
// 						<p className="text-sm text-gray-500 mb-4">
// 							These are pulled from your categories endpoint and saved as
// 							category IDs.
// 						</p>

// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// 							{assessmentInterestStreamOptions.length ? (
// 								assessmentInterestStreamOptions
// 									.filter(
// 										(c) => !c.status || c.status.toLowerCase() === "active"
// 									)
// 									.map((cat) => (
// 										<label
// 											key={cat._id}
// 											className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between ${
// 												answers.interests.some((i) => idEq(i, cat._id))
// 													? "border-indigo-500 bg-indigo-50"
// 													: "border-gray-200"
// 											}`}
// 										>
// 											<div>
// 												<div className="font-medium">
// 													{cat.category_name || cat.name}
// 												</div>
// 												<div className="text-xs text-gray-500">
// 													{cat.parent_category || cat.description || cat.slug}
// 												</div>
// 											</div>

// 											<input
// 												type="checkbox"
// 												checked={answers.interests.some((i) =>
// 													idEq(i, cat._id)
// 												)}
// 												onChange={() => handleInterestToggle(cat._id)}
// 												className="w-4 h-4 ml-4"
// 											/>
// 										</label>
// 									))
// 							) : (
// 								<div className="text-sm text-gray-500">
// 									Loading categories...
// 								</div>
// 							)}
// 						</div>

// 						{!stepValid(1) && (
// 							<p className="text-sm text-red-500 mt-3">
// 								Please pick at least one interest to continue.
// 							</p>
// 						)}
// 					</div>
// 				)}

// 				{/* STEP 2: Stream */}
// 				{step === 2 && (
// 					<div>
// 						<h3 className="font-semibold mb-3">
// 							2) Select your preferred academic stream
// 						</h3>

// 						<div className="flex gap-3 flex-wrap">
// 							{streamOptions.length ? (
// 								streamOptions.map((cat) => (
// 									<button
// 										key={cat._id}
// 										onClick={() =>
// 											setAnswers((p) => ({ ...p, stream: cat._id }))
// 										}
// 										className={`px-4 py-2 rounded-md border ${
// 											answers.stream === cat._id
// 												? "bg-indigo-600 text-white"
// 												: "bg-white"
// 										}`}
// 									>
// 										{cat.category_name}
// 									</button>
// 								))
// 							) : (
// 								<div className="text-sm text-gray-500">
// 									Loading stream options...
// 								</div>
// 							)}
// 						</div>

// 						{!stepValid(2) && (
// 							<p className="text-sm text-red-500 mt-3">
// 								Please select a stream.
// 							</p>
// 						)}
// 					</div>
// 				)}

// 				{/* STEP 3: Level */}
// 				{step === 3 && (
// 					<div>
// 						<h3 className="font-semibold mb-3">
// 							3) What is your current education level?
// 						</h3>
// 						<div className="flex gap-3">
// 							{["10th", "12th", "Graduation"].map((lvl) => (
// 								<button
// 									key={lvl}
// 									onClick={() => setAnswers((p) => ({ ...p, level: lvl }))}
// 									className={`px-4 py-2 rounded-md border ${
// 										answers.level === lvl
// 											? "bg-indigo-600 text-white"
// 											: "bg-white"
// 									}`}
// 								>
// 									{lvl}
// 								</button>
// 							))}
// 						</div>
// 						{!stepValid(3) && (
// 							<p className="text-sm text-red-500 mt-3">
// 								Please select your level.
// 							</p>
// 						)}
// 					</div>
// 				)}

// 				{/* STEP 4: Location (optional) */}
// 				{step === 4 && (
// 					<div>
// 						<h3 className="font-semibold mb-3">
// 							4) Location preference (optional)
// 						</h3>
// 						<p className="text-sm text-gray-500 mb-3">
// 							Select your preferred city/state or choose "No preference".
// 						</p>

// 						<div className="flex gap-3 flex-wrap">
// 							{propertyLocation.length ? (
// 								Array.from(
// 									new Map(
// 										propertyLocation.map((loc) => [
// 											`${loc.property_city}-${loc.property_state}`,
// 											loc,
// 										])
// 									).values()
// 								).map((loc) => (
// 									<button
// 										key={`${loc.property_city}-${loc.property_state}`}
// 										onClick={() =>
// 											setAnswers((p) => ({ ...p, location: loc.property_city }))
// 										}
// 										className={`px-3 py-2 rounded-md border ${
// 											answers.location === loc.property_city
// 												? "bg-indigo-600 text-white"
// 												: "bg-white"
// 										}`}
// 									>
// 										{loc.property_city}, {loc.property_state}
// 									</button>
// 								))
// 							) : (
// 								<div className="text-sm text-gray-500">
// 									Loading location data...
// 								</div>
// 							)}

// 							{/* NO PREFERENCE BUTTON */}
// 							<button
// 								onClick={() => setAnswers((p) => ({ ...p, location: "" }))}
// 								className={`px-3 py-2 rounded-md border ${
// 									answers.location === ""
// 										? "bg-indigo-600 text-white"
// 										: "bg-white"
// 								}`}
// 							>
// 								No preference
// 							</button>
// 						</div>
// 					</div>
// 				)}

// 				{/* STEP 5: Budget */}
// 				{step === 5 && (
// 					<div>
// 						<h3 className="font-semibold mb-3">5) Budget range</h3>
// 						<div className="flex gap-3">
// 							{["low", "medium", "high"].map((b) => (
// 								<button
// 									key={b}
// 									onClick={() => setAnswers((p) => ({ ...p, budget: b }))}
// 									className={`px-4 py-2 rounded-md border ${
// 										answers.budget === b
// 											? "bg-indigo-600 text-white"
// 											: "bg-white"
// 									}`}
// 								>
// 									{b}
// 								</button>
// 							))}
// 						</div>
// 						{!stepValid(5) && (
// 							<p className="text-sm text-red-500 mt-3">
// 								Please choose a budget to get the best matches.
// 							</p>
// 						)}
// 					</div>
// 				)}

// 				{/* STEP 6: Result */}
// 				{step === 6 && result && (
// 					<div>
// 						<h3 className="text-xl font-bold mb-2">
// 							Your personalised recommendations
// 						</h3>
// 						<div className="mb-4">
// 							<div className="text-sm text-gray-600">
// 								Score: <span className="font-semibold">{scoreData.score}</span>
// 							</div>
// 							<div className="text-xs text-gray-500 mt-1">
// 								(Breakdown: interests {scoreData.breakdown?.interests || 0},
// 								level bonus {scoreData.breakdown?.levelBonus || 0})
// 							</div>
// 						</div>

// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 							<div className="p-4 border rounded">
// 								<h4 className="font-semibold mb-2">Colleges</h4>
// 								{result.colleges.length ? (
// 									result.colleges.map((c) => (
// 										<div key={c._id || c.id} className="text-sm mb-2">
// 											<div className="font-medium">
// 												{c.property_name || c.name || "Unnamed"}
// 											</div>
// 											<div className="text-xs text-gray-500">
// 												{c.property_slug || c.location || String(c._id)}
// 											</div>
// 										</div>
// 									))
// 								) : (
// 									<div className="text-sm text-gray-500">
// 										No direct matches found. Consider widening location or
// 										budget.
// 									</div>
// 								)}
// 							</div>

// 							<div className="p-4 border rounded">
// 								<h4 className="font-semibold mb-2">
// 									Recommended entrance exams
// 								</h4>
// 								{result.exams.length ? (
// 									result.exams.map((e) => (
// 										<div key={e._id || e.id} className="text-sm">
// 											📝 {e.exam_name || e.name || e.exam_short_name}
// 										</div>
// 									))
// 								) : (
// 									<div className="text-sm text-gray-500">No exams matched.</div>
// 								)}

// 								<h4 className="font-semibold mt-4 mb-2">Scholarships</h4>
// 								{result.scholarships.length ? (
// 									result.scholarships.map((s) => (
// 										<div key={s._id || s.id} className="text-sm">
// 											🎓 {s.scholarship_name || s.name}
// 										</div>
// 									))
// 								) : (
// 									<div className="text-sm text-gray-500">
// 										No scholarships matched.
// 									</div>
// 								)}
// 							</div>

// 							<div className="p-4 border rounded md:col-span-2">
// 								<h4 className="font-semibold mb-2">Career suggestions</h4>
// 								{result.careers.length ? (
// 									<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
// 										{result.careers.map((c, i) => (
// 											<div key={i} className="p-2 border rounded text-sm">
// 												{c}
// 											</div>
// 										))}
// 									</div>
// 								) : (
// 									<div className="text-sm text-gray-500">
// 										No career suggestions available.
// 									</div>
// 								)}
// 							</div>
// 						</div>

// 						<div className="mt-4 flex gap-3">
// 							<button
// 								onClick={restart}
// 								className="px-4 py-2 rounded bg-green-600 text-white"
// 							>
// 								Retake assessment
// 							</button>
// 							<button
// 								onClick={() => window.print()}
// 								className="px-4 py-2 rounded border"
// 							>
// 								Print / Save PDF
// 							</button>
// 						</div>
// 					</div>
// 				)}
// 			</div>

// 			{/* Navigation */}
// 			<div className="mt-6 flex justify-between">
// 				<div>
// 					<button
// 						onClick={goPrev}
// 						disabled={step === 1}
// 						className={`px-4 py-2 rounded border ${
// 							step === 1 ? "opacity-40 cursor-not-allowed" : ""
// 						}`}
// 					>
// 						← Previous
// 					</button>
// 				</div>

// 				<div className="flex items-center gap-3">
// 					<div className="text-sm text-gray-600">
// 						Step {Math.min(step, TOTAL_STEPS)} of {TOTAL_STEPS}
// 					</div>

// 					{step < 6 ? (
// 						<button
// 							onClick={goNext}
// 							className={`px-4 py-2 rounded bg-indigo-600 text-white ${
// 								!stepValid(step) ? "opacity-40 cursor-not-allowed" : ""
// 							}`}
// 						>
// 							Next →
// 						</button>
// 					) : (
// 						<button
// 							onClick={restart}
// 							className="px-4 py-2 rounded bg-indigo-600 text-white"
// 						>
// 							Start Over
// 						</button>
// 					)}
// 				</div>
// 			</div>
// 		</div>
// 	);
// }
import React, { useEffect, useState } from "react";
import { API } from "../../contexts/API";
import toast from "react-hot-toast";
import { getCategoryAccodingToField } from "../../contexts/Callbacks";

/* --------------------------
   Development switch:
   Set to false to use real API endpoints.
   -------------------------- */
const USE_STATIC = true;

/* --------------------------
   LARGE STATIC DATASETS
   (IDs are simple strings — they mimic Mongo ObjectId)
   -------------------------- */

/* ---------- Categories (interests, streams, budgets, etc.) ---------- */
const STATIC_CATEGORIES = [
	// Streams (parent_category: "Stream")
	{
		_id: "cat_stream_science",
		category_name: "Science",
		parent_category: "Stream",
		slug: "science",
		status: "Active",
	},
	{
		_id: "cat_stream_commerce",
		category_name: "Commerce",
		parent_category: "Stream",
		slug: "commerce",
		status: "Active",
	},
	{
		_id: "cat_stream_arts",
		category_name: "Arts",
		parent_category: "Stream",
		slug: "arts",
		status: "Active",
	},

	// Assessment interest options (parent_category: "Assessment Interest Options")
	{
		_id: "cat_engg",
		category_name: "Engineering & Technology",
		parent_category: "Assessment Interest Options",
		slug: "engineering",
		status: "Active",
	},
	{
		_id: "cat_cs",
		category_name: "Computer Science & IT",
		parent_category: "Assessment Interest Options",
		slug: "computer-science-it",
		status: "Active",
	},
	{
		_id: "cat_ai",
		category_name: "AI & Data Science",
		parent_category: "Assessment Interest Options",
		slug: "ai-data-science",
		status: "Active",
	},
	{
		_id: "cat_med",
		category_name: "Medicine & Healthcare",
		parent_category: "Assessment Interest Options",
		slug: "medicine",
		status: "Active",
	},
	{
		_id: "cat_mgmt",
		category_name: "Management & Commerce",
		parent_category: "Assessment Interest Options",
		slug: "management",
		status: "Active",
	},
	{
		_id: "cat_design",
		category_name: "Design & Creative Arts",
		parent_category: "Assessment Interest Options",
		slug: "design",
		status: "Active",
	},
	{
		_id: "cat_law",
		category_name: "Law & Legal Studies",
		parent_category: "Assessment Interest Options",
		slug: "law",
		status: "Active",
	},
	{
		_id: "cat_sports",
		category_name: "Sports & Physical Education",
		parent_category: "Assessment Interest Options",
		slug: "sports",
		status: "Active",
	},

	// Budget (optional use)
	{
		_id: "cat_budget_low",
		category_name: "low",
		parent_category: "Budget",
		slug: "low",
		status: "Active",
	},
	{
		_id: "cat_budget_medium",
		category_name: "medium",
		parent_category: "Budget",
		slug: "medium",
		status: "Active",
	},
	{
		_id: "cat_budget_high",
		category_name: "high",
		parent_category: "Budget",
		slug: "high",
		status: "Active",
	},
];

/* ---------- Properties (colleges/universities) ----------
   Note: academic_type points to one of the categories above (example: cat_engg)
--------------------------------------------------------------------- */
const STATIC_PROPERTIES = [
	{
		_id: "prop_iitb",
		uniqueId: 1001,
		property_name: "IIT Bombay",
		property_short_name: "IITB",
		property_email: "contact@iitb.ac.in",
		property_mobile_no: "+911122334455",
		property_slug: "iit-bombay",
		academic_type: "cat_engg",
		property_state: "Maharashtra",
		property_city: "Mumbai",
		status: "Active",
	},
	{
		_id: "prop_aiims",
		uniqueId: 1002,
		property_name: "AIIMS Delhi",
		property_short_name: "AIIMS",
		property_email: "info@aiims.edu",
		property_mobile_no: "+911100112233",
		property_slug: "aiims-delhi",
		academic_type: "cat_med",
		property_state: "Delhi",
		property_city: "New Delhi",
		status: "Active",
	},
	{
		_id: "prop_iimahd",
		uniqueId: 1003,
		property_name: "IIM Ahmedabad",
		property_short_name: "IIM-A",
		property_email: "admissions@iima.ac.in",
		property_mobile_no: "+919988776655",
		property_slug: "iim-ahmedabad",
		academic_type: "cat_mgmt",
		property_state: "Gujarat",
		property_city: "Ahmedabad",
		status: "Active",
	},
	{
		_id: "prop_nift",
		uniqueId: 1004,
		property_name: "NIFT Delhi",
		property_short_name: "NIFT",
		property_email: "admissions@nift.ac.in",
		property_mobile_no: "+911234567890",
		property_slug: "nift-delhi",
		academic_type: "cat_design",
		property_state: "Delhi",
		property_city: "New Delhi",
		status: "Active",
	},
	{
		_id: "prop_sportsu",
		uniqueId: 1005,
		property_name: "Sports University of India",
		property_short_name: "SUI",
		property_email: "info@sportsu.in",
		property_mobile_no: "+919999888777",
		property_slug: "sports-university-india",
		academic_type: "cat_sports",
		property_state: "Uttarakhand",
		property_city: "Dehradun",
		status: "Active",
	},
	{
		_id: "prop_nls",
		uniqueId: 1006,
		property_name: "National Law School",
		property_short_name: "NLS",
		property_email: "office@nls.ac.in",
		property_mobile_no: "+919797979797",
		property_slug: "national-law-school",
		academic_type: "cat_law",
		property_state: "Karnataka",
		property_city: "Bengaluru",
		status: "Active",
	},
	{
		_id: "prop_du",
		uniqueId: 1007,
		property_name: "University of Delhi (North Campus)",
		property_short_name: "DU North",
		property_email: "admissions@du.ac.in",
		property_mobile_no: "+911234009988",
		property_slug: "university-of-delhi",
		academic_type: "cat_mgmt", // DU covers many streams — keep as management for demo
		property_state: "Delhi",
		property_city: "New Delhi",
		status: "Active",
	},
	{
		_id: "prop_iitd",
		uniqueId: 1008,
		property_name: "IIT Delhi",
		property_short_name: "IITD",
		property_email: "contact@iitd.ac.in",
		property_mobile_no: "+911112223333",
		property_slug: "iit-delhi",
		academic_type: "cat_engg",
		property_state: "Delhi",
		property_city: "New Delhi",
		status: "Active",
	},
];

/* ---------- Property Location records (one per campus site) ---------- */
const STATIC_PROPERTY_LOCATIONS = [
	{
		_id: "loc1",
		property_id: "prop_iitb",
		property_address: "Powai, Mumbai",
		property_city: "Mumbai",
		property_state: "Maharashtra",
		property_country: "India",
		property_pincode: "400076",
	},
	{
		_id: "loc2",
		property_id: "prop_aiims",
		property_address: "Ansari Nagar, New Delhi",
		property_city: "New Delhi",
		property_state: "Delhi",
		property_country: "India",
		property_pincode: "110029",
	},
	{
		_id: "loc3",
		property_id: "prop_iimahd",
		property_address: "Vastrapur, Ahmedabad",
		property_city: "Ahmedabad",
		property_state: "Gujarat",
		property_country: "India",
		property_pincode: "380015",
	},
	{
		_id: "loc4",
		property_id: "prop_nift",
		property_address: "NSIC, Okhla, New Delhi",
		property_city: "New Delhi",
		property_state: "Delhi",
		property_country: "India",
		property_pincode: "110020",
	},
	{
		_id: "loc5",
		property_id: "prop_sportsu",
		property_address: "Phase 1, Dehradun",
		property_city: "Dehradun",
		property_state: "Uttarakhand",
		property_country: "India",
		property_pincode: "248001",
	},
	{
		_id: "loc6",
		property_id: "prop_nls",
		property_address: "Jnana Bharathi, Bengaluru",
		property_city: "Bengaluru",
		property_state: "Karnataka",
		property_country: "India",
		property_pincode: "560056",
	},
	{
		_id: "loc7",
		property_id: "prop_du",
		property_address: "North Campus, Delhi",
		property_city: "New Delhi",
		property_state: "Delhi",
		property_country: "India",
		property_pincode: "110007",
	},
	{
		_id: "loc8",
		property_id: "prop_iitd",
		property_address: "Hauz Khas, New Delhi",
		property_city: "New Delhi",
		property_state: "Delhi",
		property_country: "India",
		property_pincode: "110016",
	},
];

/* ---------- Exams ---------- */
const STATIC_EXAMS = [
	{
		_id: "exam_jee",
		exam_name: "Joint Entrance Examination (JEE Advanced)",
		exam_short_name: "JEE Advanced",
		status: "Active",
		exam_mode: null,
	},
	{
		_id: "exam_neet",
		exam_name: "National Eligibility cum Entrance Test (NEET)",
		exam_short_name: "NEET",
		status: "Active",
		exam_mode: null,
	},
	{
		_id: "exam_cat",
		exam_name: "Common Admission Test (CAT)",
		exam_short_name: "CAT",
		status: "Active",
		exam_mode: null,
	},
	{
		_id: "exam_clat",
		exam_name: "Common Law Admission Test (CLAT)",
		exam_short_name: "CLAT",
		status: "Active",
		exam_mode: null,
	},
	{
		_id: "exam_nift",
		exam_name: "NIFT Entrance Exam",
		exam_short_name: "NIFT",
		status: "Active",
		exam_mode: null,
	},
	{
		_id: "exam_nda",
		exam_name: "NDA Entrance Exam",
		exam_short_name: "NDA",
		status: "Active",
		exam_mode: null,
	},
	{
		_id: "exam_gate",
		exam_name: "Graduate Aptitude Test in Engineering (GATE)",
		exam_short_name: "GATE",
		status: "Pending",
		exam_mode: null,
	},
	{
		_id: "exam_cuet",
		exam_name: "CUET",
		exam_short_name: "CUET",
		status: "Active",
		exam_mode: null,
	},
];

/* ---------- Scholarships ----------
   entrance_exam may refer to exam _id or category _id depending on your schema usage.
----------------------------------------------------------------- */
const STATIC_SCHOLARSHIPS = [
	{
		_id: "sch1",
		scholarship_title: "National Talent Scholarship",
		scholarship_description:
			"Merit based scholarship for engineering aspirants",
		entrance_exam: ["exam_jee"], // points to exam _id (string)
		scholarship_amount: { INR: 50000 },
		status: "Active",
	},
	{
		_id: "sch2",
		scholarship_title: "Medical Merit Scholarship",
		scholarship_description: "Support for meritorious medical students",
		entrance_exam: ["exam_neet"],
		scholarship_amount: { INR: 40000 },
		status: "Active",
	},
	{
		_id: "sch3",
		scholarship_title: "Management Excellence Scholarship",
		scholarship_description: "For top scorers of management entrance exams",
		entrance_exam: ["exam_cat"],
		scholarship_amount: { INR: 30000 },
		status: "Active",
	},
	{
		_id: "sch4",
		scholarship_title: "Design Fellowship",
		scholarship_description: "Financial aid for creative design students",
		entrance_exam: ["exam_nift"],
		scholarship_amount: { INR: 20000 },
		status: "Active",
	},
	{
		_id: "sch5",
		scholarship_title: "Sports Grant",
		scholarship_description: "Sports quota grant for athletes",
		entrance_exam: [],
		scholarship_amount: { INR: 25000 },
		status: "Active",
		sports_quotas: true,
	},
	{
		_id: "sch6",
		scholarship_title: "GATE Research Assistant Scholarship",
		scholarship_description: "For post-grad engineering students using GATE",
		entrance_exam: ["exam_gate"],
		scholarship_amount: { INR: 60000 },
		status: "Active",
	},
];

/* -----------------------------------------------------------------
   End of static datasets
   ----------------------------------------------------------------- */

/* --------------------------
   Your helper functions (unchanged, slight defensive tweaks)
   -------------------------- */

/* CAREER_FALLBACK and idEq kept as before */
const CAREER_FALLBACK = {
	engineering: ["Software Engineer", "Civil Engineer", "Data Scientist"],
	medicine: ["Doctor", "Clinical Researcher", "Physiotherapist"],
	management: ["Business Analyst", "Product Manager", "Entrepreneur"],
	design: ["Graphic Designer", "Fashion Designer", "UX/UI Designer"],
	sports: ["Coach", "Athlete", "Sports Physiotherapist"],
	law: ["Lawyer", "Legal Advisor"],
};

const idEq = (a, b) => String(a) === String(b);

function calculateScore(answers) {
	let score = 0;
	const breakdown = { interests: 0, levelBonus: 0 };
	breakdown.interests = (answers.interests || []).length * 10;
	score += breakdown.interests;
	if (answers.level === "12th") {
		breakdown.levelBonus = 5;
		score += 5;
	} else if (answers.level === "Graduation") {
		breakdown.levelBonus = 10;
		score += 10;
	}
	return { score, breakdown };
}

function matchColleges(answers, properties = [], propertyLocation = []) {
	if (!properties?.length || !answers?.interests?.length) return [];

	let propertyIdsInCity = null;
	if (answers.location) {
		const matchedLocs = propertyLocation.filter(
			(loc) =>
				String(loc.property_city).toLowerCase() ===
				String(answers.location).toLowerCase()
		);
		propertyIdsInCity = matchedLocs.map((l) => String(l.property_id));
	}

	return properties.filter((p) => {
		const at = p.academic_type;
		let academicMatch = false;
		if (!at) academicMatch = false;
		else if (Array.isArray(at))
			academicMatch = answers.interests.some((cid) =>
				at.some((x) => idEq(x, cid))
			);
		else academicMatch = answers.interests.some((cid) => idEq(at, cid));
		if (!academicMatch) return false;
		if (propertyIdsInCity) {
			return propertyIdsInCity.includes(String(p._id));
		}
		return true;
	});
}

function matchExams(answers, exams = [], categories = []) {
	if (!exams?.length) return [];
	const examsByCategory = exams.filter((e) => {
		const examCat =
			e.academic_type || e.category || e.academicType || e.category_id;
		if (!examCat) return false;
		if (Array.isArray(examCat)) {
			return answers.interests.some((cid) => examCat.some((x) => idEq(x, cid)));
		}
		return answers.interests.some((cid) => idEq(examCat, cid));
	});
	if (examsByCategory.length) return examsByCategory;

	const keywords = (answers.interests || [])
		.flatMap((cid) => {
			const c = categories.find((x) => idEq(x._id || x._id, cid));
			return c
				? [
						String(c.category_name || c.name || "").toLowerCase(),
						String(c.slug || "").toLowerCase(),
				  ]
				: [];
		})
		.filter(Boolean);

	if (keywords.length) {
		const byName = exams.filter((e) => {
			const name = (
				e.exam_name ||
				e.name ||
				e.exam_short_name ||
				""
			).toLowerCase();
			return keywords.some((kw) => kw && name.includes(kw));
		});
		if (byName.length) return byName;
	}

	return exams.filter(
		(e) =>
			!e.status || ["Active", "active", "Pending", "pending"].includes(e.status)
	);
}

function matchScholarships({
	answers,
	scholarships = [],
	matchedExams = [],
	properties = [],
}) {
	if (!scholarships?.length) return [];
	const examIds = (matchedExams || []).map((e) => String(e._id));
	return scholarships.filter((s) => {
		if (s.status && !["Active", "active"].includes(s.status)) return false;
		if (
			Array.isArray(s.entrance_exam) &&
			s.entrance_exam.some((id) => examIds.includes(String(id)))
		)
			return true;
		if (
			s.entrance_exam &&
			!Array.isArray(s.entrance_exam) &&
			examIds.includes(String(s.entrance_exam))
		)
			return true;
		const eligCats =
			s.category || s.academic_type || s.eligibility_category || s.eligibility;
		if (
			Array.isArray(eligCats) &&
			answers.interests.some((cid) => eligCats.some((ec) => idEq(ec, cid)))
		)
			return true;
		if (
			eligCats &&
			!Array.isArray(eligCats) &&
			answers.interests.some((cid) => idEq(eligCats, cid))
		)
			return true;
		if (
			answers.location &&
			Array.isArray(s.location) &&
			s.location.some((loc) => idEq(loc, answers.location))
		)
			return true;
		if (
			s.sports_quotas &&
			answers.interests.some((cid) => cid === "cat_sports")
		)
			return true;
		return false;
	});
}

function recommendCareersFromCategories(answers, categories = []) {
	const careers = (answers.interests || []).flatMap((cid) => {
		const c = categories.find((x) => idEq(x._id || x._id, cid));
		if (!c) return [];
		const keyCandidates = [
			(c.category_name || c.name || "").toLowerCase(),
			(c.slug || "").toLowerCase(),
		];
		for (const candidate of keyCandidates) {
			for (const k of Object.keys(CAREER_FALLBACK)) {
				if (candidate.includes(k)) return CAREER_FALLBACK[k];
			}
		}
		return [`${c.category_name || c.name} (specialist)`];
	});
	return Array.from(new Set(careers));
}

/* --------------------------
   Main Component
   -------------------------- */
export default function AssessmentTest() {
	const [categories, setCategories] = useState([]);
	const [properties, setProperties] = useState([]);
	const [exams, setExams] = useState([]);
	const [scholarships, setScholarships] = useState([]);
	const [propertyLocation, setPropertyLocation] = useState([]);

	useEffect(() => {
		if (USE_STATIC) {
			// use static fallbacks
			setCategories(STATIC_CATEGORIES);
			setProperties(STATIC_PROPERTIES);
			setExams(STATIC_EXAMS);
			setScholarships(STATIC_SCHOLARSHIPS);
			setPropertyLocation(STATIC_PROPERTY_LOCATIONS);
		} else {
			fetchCategories();
			fetchPropertyData();
			fetchExamData();
			fetchScholarshipData();
			fetchPropertyLocation();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function fetchCategories() {
		try {
			const res = await API.get("/category");
			setCategories(res.data || []);
		} catch (err) {
			toast.error("Failed to load categories");
			// fallback to static if available
			setCategories(STATIC_CATEGORIES);
		}
	}
	async function fetchPropertyData() {
		try {
			const res = await API.get("/property");
			setProperties(res.data || []);
		} catch (err) {
			toast.error("Property Fetch Error.");
			setProperties(STATIC_PROPERTIES);
		}
	}
	async function fetchExamData() {
		try {
			const res = await API.get("/exam");
			setExams(res.data || []);
		} catch (err) {
			toast.error("Exam Fetch Error.");
			setExams(STATIC_EXAMS);
		}
	}
	async function fetchScholarshipData() {
		try {
			const res = await API.get("/scholarship");
			setScholarships(res.data || []);
		} catch (err) {
			toast.error("Scholarship Fetch Error.");
			setScholarships(STATIC_SCHOLARSHIPS);
		}
	}
	async function fetchPropertyLocation() {
		try {
			const res = await API.get("/locations");
			setPropertyLocation(res.data || []);
		} catch (err) {
			toast.error("Property Location Fetch Error.");
			setPropertyLocation(STATIC_PROPERTY_LOCATIONS);
		}
	}

	const assessmentInterestStreamOptions =
		getCategoryAccodingToField(categories, "Assessment Interest Options") ||
		categories.filter(
			(c) => c.parent_category === "Assessment Interest Options"
		);
	const streamOptions =
		getCategoryAccodingToField(categories, "stream") ||
		categories.filter((c) => c.parent_category === "Stream");

	const TOTAL_STEPS = 6;
	const [step, setStep] = useState(1);
	const [answers, setAnswers] = useState({
		interests: [],
		stream: "",
		level: "",
		location: "",
		budget: "",
	});
	const [result, setResult] = useState(null);
	const [scoreData, setScoreData] = useState({ score: 0, breakdown: {} });

	function handleInterestToggle(id) {
		setAnswers((prev) => {
			const exists = prev.interests.some((x) => idEq(x, id));
			return {
				...prev,
				interests: exists
					? prev.interests.filter((x) => !idEq(x, id))
					: [...prev.interests, id],
			};
		});
	}

	function stepValid(s) {
		if (s === 1) return answers.interests.length > 0;
		if (s === 2) return !!answers.stream;
		if (s === 3) return !!answers.level;
		if (s === 4) return true;
		if (s === 5) return !!answers.budget;
		return true;
	}

	function computeAndShowResults() {
		const s = calculateScore(answers);
		setScoreData(s);

		const matchedColleges = matchColleges(
			answers,
			properties,
			propertyLocation
		);
		const matchedExams = matchExams(answers, exams, categories);
		const matchedScholarships = matchScholarships({
			answers,
			scholarships,
			matchedExams,
			properties,
		});
		const careers = recommendCareersFromCategories(answers, categories);

		setResult({
			colleges: matchedColleges,
			exams: matchedExams,
			scholarships: matchedScholarships,
			careers,
		});
		setStep(6);
	}

	function goNext() {
		if (!stepValid(step)) return;
		if (step === 5) {
			computeAndShowResults();
			return;
		}
		setStep((p) => Math.min(TOTAL_STEPS, p + 1));
	}
	function goPrev() {
		if (step === 6) {
			setStep(5);
			return;
		}
		setStep((p) => Math.max(1, p - 1));
	}
	function restart() {
		setAnswers({
			interests: [],
			stream: "",
			level: "",
			location: "",
			budget: "",
		});
		setResult(null);
		setScoreData({ score: 0, breakdown: {} });
		setStep(1);
	}

	const progressPercent = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);

	return (
		<div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
			<h2 className="text-2xl font-bold mb-4">Student Assessment Test</h2>

			{/* Progress */}
			<div className="mb-6">
				<div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
					<div
						className="h-3 rounded-full transition-all duration-300"
						style={{
							width: `${progressPercent}%`,
							background: "linear-gradient(90deg,#4f46e5,#06b6d4)",
						}}
					/>
				</div>
				<div className="mt-2 text-sm text-gray-600">
					Progress: {progressPercent}%
				</div>
			</div>

			{/* Steps */}
			<div className="min-h-[220px]">
				{step === 1 && (
					<div>
						<h3 className="font-semibold mb-3">
							1) Select your interests (categories)
						</h3>
						<p className="text-sm text-gray-500 mb-4">
							These are pulled from your categories endpoint and saved as
							category IDs.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{(assessmentInterestStreamOptions || []).map((cat) => (
								<label
									key={cat._id}
									className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between ${
										answers.interests.some((i) => idEq(i, cat._id))
											? "border-indigo-500 bg-indigo-50"
											: "border-gray-200"
									}`}
								>
									<div>
										<div className="font-medium">{cat.category_name}</div>
										<div className="text-xs text-gray-500">
											{cat.parent_category}
										</div>
									</div>
									<input
										type="checkbox"
										checked={answers.interests.some((i) => idEq(i, cat._id))}
										onChange={() => handleInterestToggle(cat._id)}
										className="w-4 h-4 ml-4"
									/>
								</label>
							))}
						</div>
						{!stepValid(1) && (
							<p className="text-sm text-red-500 mt-3">
								Please pick at least one interest to continue.
							</p>
						)}
					</div>
				)}

				{step === 2 && (
					<div>
						<h3 className="font-semibold mb-3">
							2) Select your preferred academic stream
						</h3>
						<div className="flex gap-3 flex-wrap">
							{(streamOptions || []).map((cat) => (
								<button
									key={cat._id}
									onClick={() => setAnswers((p) => ({ ...p, stream: cat._id }))}
									className={`px-4 py-2 rounded-md border ${
										answers.stream === cat._id
											? "bg-indigo-600 text-white"
											: "bg-white"
									}`}
								>
									{cat.category_name}
								</button>
							))}
						</div>
						{!stepValid(2) && (
							<p className="text-sm text-red-500 mt-3">
								Please select a stream.
							</p>
						)}
					</div>
				)}

				{step === 3 && (
					<div>
						<h3 className="font-semibold mb-3">
							3) What is your current education level?
						</h3>
						<div className="flex gap-3">
							{["10th", "12th", "Graduation"].map((lvl) => (
								<button
									key={lvl}
									onClick={() => setAnswers((p) => ({ ...p, level: lvl }))}
									className={`px-4 py-2 rounded-md border ${
										answers.level === lvl
											? "bg-indigo-600 text-white"
											: "bg-white"
									}`}
								>
									{lvl}
								</button>
							))}
						</div>
						{!stepValid(3) && (
							<p className="text-sm text-red-500 mt-3">
								Please select your level.
							</p>
						)}
					</div>
				)}

				{step === 4 && (
					<div>
						<h3 className="font-semibold mb-3">
							4) Location preference (optional)
						</h3>
						<p className="text-sm text-gray-500 mb-3">
							Select your preferred city/state or choose "No preference".
						</p>
						<div className="flex gap-3 flex-wrap">
							{Array.from(
								new Map(
									(propertyLocation || []).map((loc) => [
										`${loc.property_city}-${loc.property_state}`,
										loc,
									])
								).values()
							).map((loc) => (
								<button
									key={`${loc.property_city}-${loc.property_state}`}
									onClick={() =>
										setAnswers((p) => ({ ...p, location: loc.property_city }))
									}
									className={`px-3 py-2 rounded-md border ${
										answers.location === loc.property_city
											? "bg-indigo-600 text-white"
											: "bg-white"
									}`}
								>
									{loc.property_city}, {loc.property_state}
								</button>
							))}
							<button
								onClick={() => setAnswers((p) => ({ ...p, location: "" }))}
								className={`px-3 py-2 rounded-md border ${
									answers.location === ""
										? "bg-indigo-600 text-white"
										: "bg-white"
								}`}
							>
								No preference
							</button>
						</div>
					</div>
				)}

				{step === 5 && (
					<div>
						<h3 className="font-semibold mb-3">5) Budget range</h3>
						<div className="flex gap-3">
							{["low", "medium", "high"].map((b) => (
								<button
									key={b}
									onClick={() => setAnswers((p) => ({ ...p, budget: b }))}
									className={`px-4 py-2 rounded-md border ${
										answers.budget === b
											? "bg-indigo-600 text-white"
											: "bg-white"
									}`}
								>
									{b}
								</button>
							))}
						</div>
						{!stepValid(5) && (
							<p className="text-sm text-red-500 mt-3">
								Please choose a budget to get the best matches.
							</p>
						)}
					</div>
				)}

				{step === 6 && result && (
					<div>
						<h3 className="text-xl font-bold mb-2">
							Your personalised recommendations
						</h3>
						<div className="mb-4">
							<div className="text-sm text-gray-600">
								Score: <span className="font-semibold">{scoreData.score}</span>
							</div>
							<div className="text-xs text-gray-500 mt-1">
								(Breakdown: interests {scoreData.breakdown?.interests || 0},
								level bonus {scoreData.breakdown?.levelBonus || 0})
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="p-4 border rounded">
								<h4 className="font-semibold mb-2">Colleges</h4>
								{result.colleges.length ? (
									result.colleges.map((c) => (
										<div key={c._id || c.id} className="text-sm mb-2">
											<div className="font-medium">{c.property_name}</div>
											<div className="text-xs text-gray-500">
												{c.property_city || c.property_slug || String(c._id)}
											</div>
										</div>
									))
								) : (
									<div className="text-sm text-gray-500">
										No direct matches found. Consider widening location or
										budget.
									</div>
								)}
							</div>

							<div className="p-4 border rounded">
								<h4 className="font-semibold mb-2">
									Recommended entrance exams
								</h4>
								{result.exams.length ? (
									result.exams.map((e) => (
										<div key={e._id || e.id} className="text-sm">
											📝 {e.exam_name || e.name || e.exam_short_name}
										</div>
									))
								) : (
									<div className="text-sm text-gray-500">No exams matched.</div>
								)}

								<h4 className="font-semibold mt-4 mb-2">Scholarships</h4>
								{result.scholarships.length ? (
									result.scholarships.map((s) => (
										<div key={s._id || s.id} className="text-sm">
											🎓 {s.scholarship_title || s.scholarship_name || s.name}
										</div>
									))
								) : (
									<div className="text-sm text-gray-500">
										No scholarships matched.
									</div>
								)}
							</div>

							<div className="p-4 border rounded md:col-span-2">
								<h4 className="font-semibold mb-2">Career suggestions</h4>
								{result.careers.length ? (
									<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
										{result.careers.map((c, i) => (
											<div key={i} className="p-2 border rounded text-sm">
												{c}
											</div>
										))}
									</div>
								) : (
									<div className="text-sm text-gray-500">
										No career suggestions available.
									</div>
								)}
							</div>
						</div>

						<div className="mt-4 flex gap-3">
							<button
								onClick={restart}
								className="px-4 py-2 rounded bg-green-600 text-white"
							>
								Retake assessment
							</button>
							<button
								onClick={() => window.print()}
								className="px-4 py-2 rounded border"
							>
								Print / Save PDF
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Navigation */}
			<div className="mt-6 flex justify-between">
				<div>
					<button
						onClick={goPrev}
						disabled={step === 1}
						className={`px-4 py-2 rounded border ${
							step === 1 ? "opacity-40 cursor-not-allowed" : ""
						}`}
					>
						← Previous
					</button>
				</div>
				<div className="flex items-center gap-3">
					<div className="text-sm text-gray-600">
						Step {Math.min(step, TOTAL_STEPS)} of {TOTAL_STEPS}
					</div>
					{step < 6 ? (
						<button
							onClick={goNext}
							className={`px-4 py-2 rounded bg-indigo-600 text-white ${
								!stepValid(step) ? "opacity-40 cursor-not-allowed" : ""
							}`}
						>
							Next →
						</button>
					) : (
						<button
							onClick={restart}
							className="px-4 py-2 rounded bg-indigo-600 text-white"
						>
							Start Over
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
