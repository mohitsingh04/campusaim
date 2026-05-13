import Search from "../analytic-model/Search.js";
import SearchAppearance from "../analytic-model/SearchAppearence.js";

export const addSearch = async (req, res) => {
  try {
    const { search } = req.body;
    const ip =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    if (!search) {
      return res.status(400).json({ error: "Search term is required" });
    }

    const normalizedSearch = search.trim().toLowerCase();

    let searchEntry = await Search.findOne({ search: normalizedSearch });

    let searchobjectId;

    if (!searchEntry) {
      searchEntry = await Search.create({
        search: normalizedSearch,
      });
    } else {
      searchobjectId = searchEntry._id;
    }

    // Check for existing SearchAppearance by searchId
    let appearance = await SearchAppearance.findOne({
      searchId: searchobjectId,
    });

    const newSearchedRecord = { ip, date: new Date() };

    if (appearance) {
      appearance.searched.push(newSearchedRecord);
      await appearance.save();
    } else {
      await SearchAppearance.create({
        searchId: searchobjectId,
        searched: [newSearchedRecord],
      });
    }

    return res.status(200).json({ message: "Search recorded successfully" });
  } catch (error) {
    console.error("Error recording search:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllSearches = async (req, res) => {
  try {
    const searches = await Search.find();
    return res.status(200).json(searches);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllSearchAppearence = async (req, res) => {
  try {
    const searchAppearces = await SearchAppearance.find();
    return res.status(200).json(searchAppearces);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSearchesById = async (req, res) => {
  try {
    const { objectId } = req.params;

    const searches = await Search.findById(objectId).lean();
    if (!searches) {
      return res.status(404).json({ error: "Search not found" });
    }

    const searchAppear = await SearchAppearance.findOne({
      searchId: searches._id,
    });

    const finalData = {
      ...searches,
      searched: searchAppear?.searched || 0,
    };

    return res.status(200).json(finalData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
