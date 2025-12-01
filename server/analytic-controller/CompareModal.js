import Compare from "../analytic-model/Compare.js";

export const AddCompare = async (req, res) => {
  try {
    const { userId, properties } = req.body;

    if (!properties || !Array.isArray(properties) || properties.length === 0) {
      return res.status(400).json({ error: "Properties array is required." });
    }

    if (properties.length <= 1) {
      return res
        .status(400)
        .json({ error: "Properties array must contain more than 1 item." });
    }

    const lastDoc = await Compare.findOne().sort({ uniqueId: -1 }).lean();
    const nextUniqueId = lastDoc ? lastDoc.uniqueId + 1 : 1;

    const filter = {
      properties: { $size: properties.length, $all: properties },
    };

    if (userId !== undefined && userId !== null) {
      filter.userId = userId;
    } else {
      filter.userId = { $exists: false };
    }

    let compareDoc = await Compare.findOne(filter);

    if (compareDoc) {
      compareDoc.count = (compareDoc.count || 0) + 1;
      await compareDoc.save();

      return res
        .status(200)
        .json({ message: "Compare document updated with incremented count." });
    } else {
      const newCompare = new Compare({
        uniqueId: nextUniqueId,
        userId: userId || undefined,
        properties,
        count: 1,
      });

      await newCompare.save();

      return res
        .status(201)
        .json({ message: "Compare document created with count = 1." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCompareAnalytics = async (req, res) => {
  try {
    const { property_id } = req.params;
    const { limit } = req.query;

    if (!property_id) {
      return res.status(400).json({ error: "property_id is required" });
    }

    const compareDocs = await Compare.find({
      properties: Number(property_id),
    });

    if (!compareDocs.length) {
      return res
        .status(404)
        .json({ message: "No compare data found for this property" });
    }

    const allRelated = compareDocs.flatMap((doc) =>
      doc.properties.filter((p) => p !== Number(property_id))
    );

    const propertyFrequency = allRelated.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    const sortedRelated = Object.entries(propertyFrequency)
      .map(([id, count]) => ({ id: Number(id), count }))
      .sort((a, b) => b.count - a.count);

    const limitedRelated = limit
      ? sortedRelated.slice(0, Number(limit))
      : sortedRelated;

    return res.status(200).json(limitedRelated);
  } catch (error) {
    console.error("Error in getCompareAnalytics:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllCompare = async (req, res) => {
  try {
    const compares = await Compare.find().sort({ createdAt: -1 });
    return res.status(200).json(compares);
  } catch (error) {
    console.error("Error in getCompareAnalytics:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
