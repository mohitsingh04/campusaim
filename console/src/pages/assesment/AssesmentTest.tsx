import React, { useEffect, useMemo, useState } from "react";
import { API } from "../../contexts/API";
import toast from "react-hot-toast";
import { getCategoryAccodingToField } from "../../contexts/Callbacks";

/* --------------------------
   Helper utilities & pure functions
   -------------------------- */

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

/* Utility: make a small list of keywords from selected categories */
function deriveKeywordsFromCategories(answers, categories = []) {
	const keywords = (answers.interests || [])
		.flatMap((cid) => {
			const cat = categories.find((c) => idEq(c._id || c.id, cid));
			if (!cat) return [];
			return [
				String(cat.category_name || cat.name || "").toLowerCase(),
				String(cat.slug || "").toLowerCase(),
			].filter(Boolean);
		})
		.filter(Boolean);
	// unique
	return Array.from(new Set(keywords));
}

/* Check whether a property's courses contain keywords */
function propertyCourseMatches(property = {}, keywords = []) {
	if (
		!Array.isArray(property.courses) ||
		!property.courses.length ||
		!keywords.length
	)
		return { matches: false, count: 0 };

	const lowKeywords = keywords
		.map((k) => k.toLowerCase().trim())
		.filter(Boolean);
	let count = 0;
	for (const course of property.courses) {
		const name = String(course.course_name || course.name || "").toLowerCase();
		if (!name) continue;
		if (lowKeywords.some((kw) => kw && name.includes(kw))) count++;
	}
	return { matches: count > 0, count };
}

/* Match colleges: expand matching to include properties with courses matching interests */
function matchColleges(
	answers,
	properties = [],
	propertyLocation = [],
	categories = []
) {
	if (!properties?.length || !answers?.interests?.length) return [];

	const keywords = deriveKeywordsFromCategories(answers, categories);

	let propertyIdsInCity = null;
	if (answers.location) {
		const matchedLocs = propertyLocation.filter(
			(loc) =>
				String(loc.property_city || "")
					.trim()
					.toLowerCase() ===
				String(answers.location || "")
					.trim()
					.toLowerCase()
		);
		propertyIdsInCity = matchedLocs.map((l) => String(l.property_id));
	}

	return properties.filter((p) => {
		// location constraint
		if (propertyIdsInCity) {
			if (!propertyIdsInCity.includes(String(p._id))) return false;
		}

		// academic_type match OR courses match (keyword)
		const at = p.academic_type;
		let academicMatch = false;
		if (at) {
			if (Array.isArray(at)) {
				academicMatch = answers.interests.some((cid) =>
					at.some((x) => idEq(x, cid))
				);
			} else {
				academicMatch = answers.interests.some((cid) => idEq(at, cid));
			}
		}

		const courseMatchResult = propertyCourseMatches(p, keywords);
		if (academicMatch || courseMatchResult.matches) return true;

		// If property has tags or other fields which could match category slug/name, check those too:
		const tags = Array.isArray(p.tags) ? p.tags : [];
		if (
			tags.some((t) =>
				keywords.some((kw) =>
					String(t || "")
						.toLowerCase()
						.includes(kw)
				)
			)
		)
			return true;

		return false;
	});
}

/* Calculate chance: includes course-match bonus */
function calculateChance({
	college,
	answers,
	propertyLocation,
	categories = [],
}) {
	let chance = 0;

	// 1) Interest match base → up to 50
	try {
		if (Array.isArray(answers.interests)) {
			const at = college.academic_type;
			if (at) {
				if (Array.isArray(at)) {
					if (at.some((a) => answers.interests.includes(a))) chance += 50;
				} else {
					if (answers.interests.includes(at)) chance += 50;
				}
			}
		}
	} catch (e) {}

	// 2) Location match → 25
	if (answers.location) {
		const loc = (propertyLocation || []).find(
			(l) =>
				String(l.property_id) === String(college._id) &&
				String(l.property_city || "")
					.trim()
					.toLowerCase() ===
					String(answers.location || "")
						.trim()
						.toLowerCase()
		);
		if (loc) chance += 25;
	} else {
		chance += 10; // partial credit for no preference
	}

	// 3) Level bonus → 25
	if (answers.level === "12th") chance += 15;
	if (answers.level === "Graduation") chance += 25;

	// 4) Course-match bonus: if college has courses matching keywords, add small bonus per matching course (capped)
	const keywords = deriveKeywordsFromCategories(answers, categories);
	const courseRes = propertyCourseMatches(college, keywords);
	if (courseRes.count > 0) {
		// add up to 15% extra (5% per matching course capped to 3 courses => 15)
		chance += Math.min(15, courseRes.count * 5);
	}

	return Math.round(Math.min(chance, 100));
}

/* Exams matching unchanged but defensive */
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
			const c = categories.find((x) => idEq(x._id || x.id, cid));
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

/* Scholarships: increase chance when scholarship is tied to property or location */
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

		// Direct exam match
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

		// eligibility categories
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

		// location-specific scholarship
		if (
			answers.location &&
			Array.isArray(s.location) &&
			s.location.some((loc) => idEq(loc, answers.location))
		)
			return true;

		// property-specific scholarship
		if (
			s.property_id &&
			properties.some((p) => String(p._id) === String(s.property_id))
		)
			return true;
		if (
			s.property_slug &&
			properties.some(
				(p) => String(p.property_slug) === String(s.property_slug)
			)
		)
			return true;

		// sports quota
		if (
			s.sports_quotas &&
			answers.interests.some((cid) => cid === "cat_sports")
		)
			return true;

		// fallback: global scholarships accepted for all
		return false;
	});
}

/* Careers unchanged */
function recommendCareersFromCategories(answers, categories = []) {
	const careers = (answers.interests || []).flatMap((cid) => {
		const c = categories.find((x) => idEq(x._id || x.id, cid));
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
   encode/decode answers to query string
   -------------------------- */
function encodeAnswersToQuery(a) {
	try {
		return encodeURIComponent(btoa(JSON.stringify(a)));
	} catch (e) {
		try {
			return encodeURIComponent(
				btoa(unescape(encodeURIComponent(JSON.stringify(a))))
			);
		} catch (err) {
			return "";
		}
	}
}
function decodeAnswersFromQuery(q) {
	try {
		if (!q) return null;
		const decoded = decodeURIComponent(q);
		const json = atob(decoded);
		return JSON.parse(json);
	} catch (e) {
		try {
			const json = atob(decodeURIComponent(q));
			return JSON.parse(json);
		} catch (err) {
			return null;
		}
	}
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
	const [propertyCourses, setPropertyCourses] = useState([]);

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
	const [selectedCollege, setSelectedCollege] = useState(null);
	const [topN, setTopN] = useState(10);

	// Load data from API on mount
	useEffect(() => {
		fetchAllData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Hydrate answers from query param first, then from localStorage
	useEffect(() => {
		try {
			const params = new URLSearchParams(window.location.search);
			const q = params.get("a");
			if (q) {
				const decoded = decodeAnswersFromQuery(q);
				if (decoded) {
					setAnswers((prev) => ({ ...prev, ...decoded }));
					return;
				}
			}
		} catch (e) {}
		try {
			const saved = localStorage.getItem("assessment_answers_v1");
			if (saved) setAnswers(JSON.parse(saved));
		} catch (e) {}
	}, []);

	// Persist answers to localStorage
	useEffect(() => {
		try {
			localStorage.setItem("assessment_answers_v1", JSON.stringify(answers));
		} catch (e) {
			// ignore
		}
	}, [answers]);

	async function fetchAllData() {
		try {
			const [cats, propsRes, examsRes, schRes, locRes, courseRes] =
				await Promise.allSettled([
					API.get("/category"),
					API.get("/property"),
					API.get("/exam"),
					API.get("/scholarship"),
					API.get("/locations"),
					API.get("/property-course"),
				]);

				console.log(courseRes.value.data)

			if (cats.status === "fulfilled") setCategories(cats.value.data || []);
			else {
				setCategories([]);
				toast.error("Failed to load categories");
			}

			if (propsRes.status === "fulfilled") {
				// Expect properties to include `courses` array for each property
				setProperties(propsRes.value.data || []);
			} else {
				setProperties([]);
				toast.error("Failed to load properties");
			}

			if (examsRes.status === "fulfilled") setExams(examsRes.value.data || []);
			else {
				setExams([]);
				toast.error("Failed to load exams");
			}

			if (schRes.status === "fulfilled")
				setScholarships(schRes.value.data || []);
			else {
				setScholarships([]);
				toast.error("Failed to load scholarships");
			}

			if (locRes.status === "fulfilled")
				setPropertyLocation(locRes.value.data || []);
			else {
				setPropertyLocation([]);
				toast.error("Failed to load locations");
			}
		} catch (err) {
			toast.error("Failed to load data from API");
			setCategories([]);
			setProperties([]);
			setExams([]);
			setScholarships([]);
			setPropertyLocation([]);
		}
	}

	const assessmentInterestStreamOptions = useMemo(() => {
		const byField = getCategoryAccodingToField(
			categories,
			"Assessment Interest Options"
		);
		return (
			byField ||
			categories.filter(
				(c) => c.parent_category === "Assessment Interest Options"
			)
		);
	}, [categories]);

	const streamOptions = useMemo(() => {
		const byField = getCategoryAccodingToField(categories, "stream");
		return byField || categories.filter((c) => c.parent_category === "Stream");
	}, [categories]);

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

		// match colleges with courses and categories considered
		const rawColleges = matchColleges(
			answers,
			properties,
			propertyLocation,
			categories
		);

		const matchedColleges = rawColleges
			.map((college) => ({
				...college,
				chance: calculateChance({
					college,
					answers,
					propertyLocation,
					categories,
				}),
			}))
			.sort((a, b) => b.chance - a.chance);

		const matchedExams = matchExams(answers, exams, categories);
		const matchedScholarships = matchScholarships({
			answers,
			scholarships,
			matchedExams,
			properties,
		});

		const scholarshipWithChance = matchedScholarships.map((sch) => {
			// base chance from exam match
			let base = matchedExams.some((e) =>
				(sch.entrance_exam || []).some((id) => String(id) === String(e._id))
			)
				? 75
				: 50;

			// increase if scholarship is specific to a property we matched
			const linkedToMatchedProperty =
				(sch.property_id &&
					matchedColleges.some(
						(c) => String(c._id) === String(sch.property_id)
					)) ||
				(sch.property_slug &&
					matchedColleges.some(
						(c) => String(c.property_slug) === String(sch.property_slug)
					));

			// increase if scholarship location matches user's chosen location
			const locMatches =
				answers.location &&
				Array.isArray(sch.location) &&
				sch.location.some((loc) => idEq(loc, answers.location));

			if (linkedToMatchedProperty) base = Math.min(100, base + 15);
			if (locMatches) base = Math.min(100, base + 10);

			return { ...sch, chance: base };
		});

		const careers = recommendCareersFromCategories(answers, categories);

		setResult({
			colleges: matchedColleges,
			exams: matchedExams,
			scholarships: scholarshipWithChance,
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
		try {
			localStorage.removeItem("assessment_answers_v1");
			const url = new URL(window.location.href);
			url.searchParams.delete("a");
			window.history.replaceState({}, "", url.toString());
		} catch (e) {}
	}

	const progressPercent = useMemo(() => {
		const denom = Math.max(1, TOTAL_STEPS - 1);
		return Math.round(((Math.min(step, TOTAL_STEPS) - 1) / denom) * 100);
	}, [step]);

	function copyShareLink() {
		try {
			const encoded = encodeAnswersToQuery(answers);
			if (!encoded) return toast.error("Could not create share link");
			const url = `${window.location.origin}${window.location.pathname}?a=${encoded}`;
			navigator.clipboard
				.writeText(url)
				.then(() => toast.success("Share link copied"))
				.catch(() => toast.error("Failed to copy link"));
		} catch (e) {
			toast.error("Failed to create share link");
		}
	}

	function downloadResultsJSON() {
		try {
			const blob = new Blob(
				[JSON.stringify({ answers, result, scoreData }, null, 2)],
				{ type: "application/json" }
			);
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "assessment-results.json";
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (e) {
			toast.error("Failed to download");
		}
	}

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
							{(assessmentInterestStreamOptions || []).map((cat) => {
								const checked = answers.interests.some((i) => idEq(i, cat._id));
								return (
									<label
										key={cat._id}
										role="checkbox"
										aria-checked={checked}
										tabIndex={0}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												handleInterestToggle(cat._id);
											}
										}}
										className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between ${
											checked
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
											checked={checked}
											onChange={() => handleInterestToggle(cat._id)}
											className="w-4 h-4 ml-4"
											aria-hidden
										/>
									</label>
								);
							})}
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

						<div className="mb-4 flex items-center gap-3">
							<button
								onClick={copyShareLink}
								className="px-3 py-2 rounded border"
							>
								Copy share link
							</button>
							<button
								onClick={downloadResultsJSON}
								className="px-3 py-2 rounded border"
							>
								Download JSON
							</button>

							<div className="ml-auto flex items-center gap-2">
								<label className="text-sm text-gray-600">Show:</label>
								<select
									value={topN}
									onChange={(e) => setTopN(Number(e.target.value))}
									className="border rounded px-2 py-1"
								>
									<option value={5}>Top 5</option>
									<option value={10}>Top 10</option>
									<option value={50}>All</option>
								</select>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="p-4 border rounded">
								<h4 className="font-semibold mb-2">Colleges</h4>
								{result.colleges.length ? (
									result.colleges
										.slice(0, topN === 50 ? result.colleges.length : topN)
										.map((c) => (
											<div
												key={c._id || c.id}
												className="text-sm mb-3 border p-2 rounded"
											>
												<div className="flex justify-between items-center">
													<div className="font-medium">{c.property_name}</div>
													<div className="text-green-600 font-semibold">
														{c.chance}% Chance
													</div>
												</div>

												<div className="text-xs text-gray-500">
													{c.property_city || c.property_slug}
												</div>

												<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
													<div
														className="h-2 bg-indigo-600 rounded-full"
														style={{ width: `${c.chance}%` }}
													/>
												</div>

												<div className="mt-2 flex gap-2">
													<button
														onClick={() => setSelectedCollege(c)}
														className="px-2 py-1 rounded border text-xs"
													>
														View details
													</button>
													<button
														onClick={() =>
															navigator.clipboard &&
															navigator.clipboard.writeText(c.property_slug)
														}
														className="px-2 py-1 rounded border text-xs"
													>
														Copy slug
													</button>
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
										<div
											key={s._id || s.id}
											className="text-sm mb-2 flex justify-between"
										>
											<span>
												🎓 {s.scholarship_title || s.scholarship_name || s.name}
											</span>
											<span className="text-green-600 font-semibold">
												{s.chance}% Chance
											</span>
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

			{/* Modal for selected college */}
			{selectedCollege && (
				<div
					role="dialog"
					aria-modal
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
				>
					<div
						className="absolute inset-0 bg-black/30"
						onClick={() => setSelectedCollege(null)}
					/>
					<div className="relative bg-white p-6 rounded shadow max-w-lg w-full z-10">
						<h3 className="text-xl font-semibold mb-2">
							{selectedCollege.property_name}
						</h3>
						<p className="text-sm text-gray-600 mb-2">
							{selectedCollege.property_city}, {selectedCollege.property_state}
						</p>
						{selectedCollege.courses && selectedCollege.courses.length > 0 && (
							<div className="mb-2">
								<div className="text-sm font-medium">Courses:</div>
								<ul className="text-sm list-disc list-inside">
									{selectedCollege.courses.slice(0, 8).map((crs, i) => (
										<li key={i}>{crs.course_name || crs.name}</li>
									))}
								</ul>
							</div>
						)}
						{selectedCollege.property_email && (
							<p className="text-sm">
								Email:{" "}
								<a
									className="text-indigo-600"
									href={`mailto:${selectedCollege.property_email}`}
								>
									{selectedCollege.property_email}
								</a>
							</p>
						)}
						{selectedCollege.property_mobile_no && (
							<p className="text-sm">
								Phone:{" "}
								<a
									className="text-indigo-600"
									href={`tel:${selectedCollege.property_mobile_no}`}
								>
									{selectedCollege.property_mobile_no}
								</a>
							</p>
						)}
						<div className="mt-4 flex gap-2">
							<button
								onClick={() => setSelectedCollege(null)}
								className="px-3 py-2 rounded border"
							>
								Close
							</button>
							<button
								onClick={() =>
									navigator.clipboard &&
									navigator.clipboard.writeText(selectedCollege.property_slug)
								}
								className="px-3 py-2 rounded border"
							>
								Copy slug
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
