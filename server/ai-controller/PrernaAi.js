import { PrernaAiModal } from "../ai-model/PrernaModal.js";
import Rank from "../analytic-model/Rank.js";
import { generateSlug, getAverageRating } from "../utils/Callback.js";
import Accomodation from "../models/Accomodation.js";
import Category from "../models/Category.js";
import Gallery from "../models/Gallery.js";
import Location from "../models/Location.js";
import Property from "../models/Property.js";
import Review from "../models/Reviews.js";
import { getUserDataFromToken } from "../utils/getDataFromToken.js";
import GeminiResponse from "./GeminiAI.js";
import dotenv from "dotenv";

dotenv.config();

const propertyFindTextResponse = async (prompt, user) => {
  const contextPrompt = `
You are Prerna, a warm and knowledgeable Yoga & Wellness assistant. The user's name is ${
    user?.name?.split(" ")?.[0]
  }.

Based on the user's query: "${prompt}", generate an original HTML snippet containing a single, concise paragraph (6-7 lines) that introduces the suggested yoga and wellness results. The content must:
- Always include the user's first name (${
    user?.name?.split(" ")?.[0]
  }) somewhere in the text.
- Use Tailwind utility classes only for styling. The outer element should include a gray text class such as "text-gray-700" and may include spacing/typography helpers like "leading-relaxed" or "max-w-prose".
- Do NOT include any background, shadow, or border classes (no bg-*, no shadow-*, no border-*).
- Produce valid HTML (<p> or <div>) but do not include external scripts or styles.
- Be natural, friendly, and aligned with yoga/wellness tone — informative, encouraging, and warm.
- Include subtle HTML formatting to emphasize important points:
  - <strong> for key highlights
  - <em> for gentle emphasis
  - <u> for important terms
  - Inline spans with Tailwind classes like "text-gray-800" or "italic" if needed
- Keep formatting minimal — highlight only meaningful points.
- Ensure **variety and freshness** in the response each time:
  - Use different sentence structures and word choices
  - Add mild conversational cues or gentle encouragement
  - Avoid repeating the same phrasing across responses
- Only output the HTML snippet itself, starting with <p> or <div>. Do not include any JavaScript, variable assignments, comments, or extra text.

Produce the HTML snippet now.
`;

  let contextMsg = await GeminiResponse(prompt, contextPrompt, "");
  return (
    contextMsg?.replace("```html", "")?.replace("```", "") ||
    "Here are some yoga institutes you might like."
  ).trim();
};

export const PrernaAI = async (req, res) => {
  try {
    const { prompt, userTime, objectId } = req.body;
    const user = await getUserDataFromToken(req);

    // Fetch all data
    const [properties, locations, reviews, categories, accomodations, ranks] =
      await Promise.all([
        Property.find(),
        Location.find(),
        Review.find(),
        Category.find(),
        Accomodation.find(),
        Rank.find(),
      ]);

    // Category types
    const currentAcademicTypes = categories
      .filter((cat) => cat?.parent_category?.toLowerCase() === "academic type")
      .map((cat) => cat.category_name.toLowerCase());

    const currentPropertyTypes = categories
      .filter((cat) => cat?.parent_category?.toLowerCase() === "property type")
      .map((cat) => cat.category_name.toLowerCase());

    // Merge DB data into unified dataset
    const mergedData = properties
      .map((property) => {
        const loc = locations.find(
          (l) => Number(l.property_id) === Number(property.uniqueId)
        );
        const acc = accomodations.find(
          (a) => Number(a.property_id) === Number(property.uniqueId)
        );
        const matchCategory = (id) => {
          const cat = categories.find((c) => Number(c.uniqueId) === Number(id));
          return cat?.category_name?.toLowerCase() || null;
        };
        const propReviews = reviews.filter(
          (r) => Number(r.property_id) === Number(property.uniqueId)
        );
        const propRank = ranks.find(
          (r) => String(r.property_id) === String(property._id)
        );

        return {
          objectId: property._id,
          property_name: property.property_name,
          property_slug: property.property_slug,
          property_logo: property.property_logo,
          featured_image: property.featured_image,
          academic_type: matchCategory(property.category),
          property_type: matchCategory(property.property_type),
          est_year: property.est_year || null,
          property_city: loc?.property_city?.toLowerCase() || null,
          property_state: loc?.property_state?.toLowerCase() || null,
          property_country: loc?.property_country?.toLowerCase() || null,
          average_rating: getAverageRating(propReviews),
          total_reviews: propReviews.length,
          isAccomodation: Boolean(acc),
          property_description: property.property_description || "",
          rank: Number(propRank?.rank) || Infinity,
        };
      })
      .sort((a, b) => a.rank - b.rank);

    // Step 1: Ask Gemini if this is data-oriented or general
    const classifyPrompt = `
You are Prerna, a Yoga & Wellness assistant.
Classify the user's input into one of two types:
1. "data" → if the user wants properties, institutes, or filtered listings.
2. "general" → if the user asks a general question (like facts, theory, yoga tips).

Respond with a single word ONLY: "data" or "general".
User input: "${prompt}"
`;

    let classificationRaw = await GeminiResponse(prompt, classifyPrompt, "");
    const classification = (classificationRaw || "").trim().toLowerCase();
    const isDataQuery = classification === "data";

    let finalData = [];
    let assistantMessage = "";

    if (isDataQuery) {
      // Step 2: Generate filter query with LIMIT included
      const filterSchemaPrompt = `
You are Prerna, a smart Yoga & Wellness filter assistant.
Generate a JSON filter query based on the user's request to find the best matching institutes.

Valid values:
- Academic types: ${JSON.stringify(currentAcademicTypes)}
- Property types: ${JSON.stringify(currentPropertyTypes)}

Schema:
{
  "academic_type": "string",
  "property_type": "string",
  "est_year": "number",
  "property_city": "string",
  "property_state": "string",
  "property_country": "string",
  "average_rating": "number (0–5)",
  "isAccomodation": "boolean",
  "property_name": "string (search by substring, case-insensitive)",
  "limit": "number (max 20, based on user request like 'top 10' or 'show 5')"
}

Rules:
1. Output only valid JSON. No extra text.
2. Use "equals" for strings and booleans.
3. Only use academic_type and property_type from the lists above.
4. For average_rating:
   - 5 stars → exact equals: 5
   - less than 5 → min: e.g., 4 means >=4
5. If user query mentions or implies institute NAME, include:
   { "property_name": { "search": "aym" } }
6. Include only fields requested by the user. If not specified, leave it out.
7. If user says things like "top 10", "best 5", "show 3" etc., include a field:
   { "limit": 10 }
8. Default limit = 6 if not mentioned.
9. Examples:
   { "property_city": { "equals": "Delhi" }, "average_rating": { "min": 4 }, "limit": 10 }
   { "property_name": { "search": "aym" }, "limit": 5 }
10. sepcelly focus on property_type and academic_type
`;

      let filterRaw = await GeminiResponse(prompt, filterSchemaPrompt, "");
      let filterQuery = {};
      try {
        const cleaned = filterRaw
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        filterQuery = cleaned ? JSON.parse(cleaned) : {};
      } catch {
        filterQuery = {};
      }

      // Get user-requested limit from AI or default
      const resultLimit =
        Number(filterQuery.limit) > 0 && Number(filterQuery.limit) <= 20
          ? Number(filterQuery.limit)
          : 6;

      let topResults = [];

      // Step 3: Filter DB data
      if (mergedData?.length > 0) {
        if (Object.keys(filterQuery).length > 0) {
          const filtered = mergedData.filter((item) => {
            let isValid = true;

            if (filterQuery.academic_type)
              isValid =
                isValid && item.academic_type === filterQuery.academic_type;

            if (filterQuery.property_type)
              isValid =
                isValid && item.property_type === filterQuery.property_type;

            if (filterQuery.est_year?.equals)
              isValid =
                isValid &&
                Number(item.est_year) === Number(filterQuery.est_year.equals);

            if (filterQuery.property_city?.equals)
              isValid =
                isValid &&
                item.property_city?.toLowerCase() ===
                  filterQuery.property_city.equals.toLowerCase();

            if (filterQuery.property_state?.equals)
              isValid =
                isValid &&
                item.property_state?.toLowerCase() ===
                  filterQuery.property_state.equals.toLowerCase();

            if (filterQuery.property_country?.equals)
              isValid =
                isValid &&
                item.property_country?.toLowerCase() ===
                  filterQuery.property_country.equals.toLowerCase();

            if (filterQuery.average_rating != null) {
              const userRating =
                filterQuery.average_rating.equals ??
                filterQuery.average_rating.min;
              if (userRating === 5) {
                isValid = isValid && item.average_rating === 5;
              } else {
                isValid = isValid && item.average_rating >= userRating;
              }
            }

            if (filterQuery.isAccomodation)
              isValid =
                isValid && item.isAccomodation === filterQuery.isAccomodation;

            if (filterQuery.property_name?.search) {
              const search = filterQuery.property_name.search.toLowerCase();
              isValid =
                isValid && item.property_name?.toLowerCase().includes(search);
            }

            return isValid;
          });

          topResults = filtered.sort((a, b) => {
            const rankA = Number(a.rank) || Infinity;
            const rankB = Number(b.rank) || Infinity;

            if (rankA !== rankB) {
              return rankA - rankB;
            }

            return b.average_rating - a.average_rating;
          });
        }
      }

      // Step 4: Check if data found
      if (topResults.length > 0) {
        finalData = topResults.slice(0, resultLimit);
        assistantMessage = await propertyFindTextResponse(prompt, user);
      } else {
        // Step 5: No data → ask Gemini to generate property data
        const genPropsPrompt = `
You are Prerna, a Yoga & Wellness assistant that can produce JSON data.

The user asked: "${prompt}"

Produce UP TO ${resultLimit} JSON objects (array) with this exact schema:
[
  {
    "property_name": "string",
    "property_city": "string",
    "property_state": "string",
    "property_country": "string",
    "property_description": "string"
  }
]

IMPORTANT:
- Each object MUST include ALL 5 fields exactly as shown.
- "property_description" MUST be meaningful, descriptive, and realistic.
- Use realistic-sounding property names, locations, and descriptions.
- Prefer values relevant to the user's query if possible.
- Output ONLY valid JSON array, no extra text, no markdown, no explanation.
`;

        let genRaw = await GeminiResponse(prompt, genPropsPrompt, "");
        let genArray = [];
        try {
          genArray = JSON.parse(genRaw.replace(/```json|```/g, "").trim());
        } catch {
          genArray = [];
        }

        genArray = Array.isArray(genArray)
          ? genArray.map((g) => ({
              property_name: g.property_name || "",
              property_city: (g.property_city || "").toLowerCase(),
              property_state: (g.property_state || "").toLowerCase(),
              property_country: (g.property_country || "").toLowerCase(),
              property_description: g.property_description || "",
            }))
          : [];

        finalData = genArray.slice(0, resultLimit);
        assistantMessage = await propertyFindTextResponse(prompt, user);
      }

      var savedFilterQuery = filterQuery;
    } else {
      // GENERAL question (styled HTML)
      const generalPrompt = `
You are Prerna, a Yoga & Wellness assistant. The user's name is ${
        user?.name?.split(" ")?.[0]
      }.

Produce the answer as a single HTML fragment (one root element, e.g. a <div>).
Use Tailwind CSS utility classes for all styling (assume Tailwind is available where the HTML will be used).
Do NOT return markdown or plain text — return only valid HTML.

User question: "${prompt}"
[... rest of your generalPrompt stays unchanged ...]
`;

      let genAnswer = await GeminiResponse(prompt, generalPrompt, "");
      assistantMessage = genAnswer?.replace("```html", "")?.replace("```", "");
      finalData = [];
    }

    // Save chat
    let chatId;
    const newChatData = {
      user: { text: prompt, time: userTime },
      assistant: {
        text: assistantMessage,
        property_ids: finalData.map((i) => i.objectId).filter(Boolean),
        time: Date.now(),
      },
    };

    if (objectId) {
      const updated = await PrernaAiModal.findOneAndUpdate(
        { _id: objectId },
        { $push: { chats: newChatData } },
        { new: true }
      );
      chatId = updated?._id;
    } else {
      const lastChat = await PrernaAiModal.findOne().sort({ uniqueId: -1 });
      const uniqueId = lastChat ? lastChat.uniqueId + 1 : 1;

      const newChat = new PrernaAiModal({
        uniqueId,
        user: user?._id,
        title: prompt,
        chats: [newChatData],
      });
      const saved = await newChat.save();
      chatId = saved?._id;
    }

    return res.status(200).json({
      message: assistantMessage,
      data: finalData,
      filterQuery: savedFilterQuery,
      chatId,
    });
  } catch (error) {
    console.error("PrernaAI Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const PrernaAIPropertySearch = async (req, res) => {
  try {
    const { objectId, userTime, chat_id } = req.body;
    // Fetch all categories
    const categories = await Category.find();

    const matchCategory = (id) => {
      if (!id) return null;
      const mainCat = categories.find(
        (cat) => Number(cat.uniqueId) === Number(id)
      );
      return mainCat?.category_name?.toLowerCase() || null;
    };

    // Fetch property by slug
    const property = await Property.findOne({ _id: objectId });
    if (!property) return res.status(404).json({ error: "Property not found" });

    // Fetch related data
    const [location, certification, gallery, rank, reviews] = await Promise.all(
      [
        Location.findOne({ property_id: property.uniqueId }),
        Gallery.findOne({ propertyId: property.uniqueId }),
        Rank.findOne({ property_id: property._id }),
        Review.find({ property_id: property.uniqueId }),
      ]
    );

    const mergedData = {
      property_name: property.property_name || null,
      academic_type: matchCategory(property?.category) || null,
      property_type: matchCategory(property?.property_type) || null,
      property_city: location?.property_city || null,
      property_state: location?.property_state || null,
      property_country: location?.property_country || null,
      property_url: `${process.env.FRONTEND_URL}/${generateSlug(
        matchCategory(property?.category) || "property"
      )}/${generateSlug(property?.property_slug)}/overview`,
      property_description: property?.property_description || null,
      gallery:
        gallery?.gallery
          ?.filter((img) => img?.endsWith(".webp"))
          .map((img) => `${process.env.MEDIA_URL}/${img}`) || [],
      rank: rank?.rank,
      lastrank: rank?.lastrank,
      average_rating: getAverageRating(reviews),
      total_reviews: reviews?.length,
      property_slug: property?.property_slug,
    };

    let chatId;
    const newChatData = {
      user: { text: property?.property_name, time: userTime },
      assistant: {
        property_summary_id: property?._id,
        time: Date.now(),
      },
    };

    const updated = await PrernaAiModal.findOneAndUpdate(
      { _id: chat_id },
      { $push: { chats: newChatData } },
      { new: true }
    );
    chatId = updated?._id;

    return res.status(200).json({ summary_data: mergedData, chatId });
  } catch (error) {
    console.error("PrernaAI error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const PrernaAIChatByObjectId = async (req, res) => {
  try {
    const { objectId } = req.params;
    const chats = await PrernaAiModal.findOne({ _id: objectId });
    return res.status(200).json(chats);
  } catch (error) {
    console.error("PrernaAI error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const PrernaAIChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await PrernaAiModal.find({ user: userId });
    return res.status(200).json(chats);
  } catch (error) {
    console.error("PrernaAI error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const PrernaAIPropertySearchSummaryData = async (req, res) => {
  try {
    const { objectId } = req.body;

    // Fetch all categories
    const categories = await Category.find();

    const matchCategory = (id) => {
      if (!id) return null;
      const mainCat = categories.find(
        (cat) => Number(cat.uniqueId) === Number(id)
      );
      return mainCat?.category_name?.toLowerCase() || null;
    };

    // Fetch property by slug
    const property = await Property.findOne({ _id: objectId });
    if (!property) return res.status(404).json({ error: "Property not found" });

    // Fetch related data
    const [location, certification, gallery, rank, reviews] = await Promise.all(
      [
        Location.findOne({ property_id: property.uniqueId }),
        Gallery.findOne({ propertyId: property.uniqueId }),
        Rank.findOne({ property_id: property._id }),
        Review.find({ property_id: property.uniqueId }),
      ]
    );

    const mergedData = {
      property_name: property.property_name || null,
      academic_type: matchCategory(property?.category) || null,
      property_type: matchCategory(property?.property_type) || null,
      property_city: location?.property_city || null,
      property_state: location?.property_state || null,
      property_country: location?.property_country || null,
      property_url: `${process.env.FRONTEND_URL}/${generateSlug(
        matchCategory(property?.category) || "property"
      )}/${generateSlug(property?.property_slug)}/overview`,
      property_description: property?.property_description || null,
      gallery:
        gallery?.gallery
          ?.filter((img) => img?.endsWith(".webp"))
          .map((img) => `${process.env.MEDIA_URL}/${img}`) || [],
      rank: rank?.rank,
      lastrank: rank?.lastrank,
      average_rating: getAverageRating(reviews),
      total_reviews: reviews?.length,
      property_slug: property?.property_slug,
    };

    return res.status(200).json({ summary_data: mergedData });
  } catch (error) {
    console.error("PrernaAI error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
