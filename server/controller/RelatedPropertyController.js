import Property from "../models/Property.js";
import PropertyCourse from "../models/PropertyCourse.js";
import Location from "../models/Location.js";

export const getPropertyRelatedToPropertyCourse = async (req, res) => {
  try {
    const { property_course_id } = req.params;
    const { limit = 10 } = req.query;

    const propertyCourses = await PropertyCourse.find({
      course_id: property_course_id,
    });

    const propertyIds = [
      ...new Set(propertyCourses.map((item) => item.property_id.toString())),
    ];

    if (propertyIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        properties: [],
      });
    }

    const relatedProperties = await Property.find({
      _id: { $in: propertyIds },
    })
      .limit(Number(limit))
      .lean();

    const locationIds = [
      ...new Set(relatedProperties.map((item) => item._id)),
    ].filter(Boolean);

    const relatedLocations = await Location.find({
      property_id: { $in: locationIds },
    }).lean();

    const finalData = relatedProperties.map((prop) => {
      const mainLoc = relatedLocations.find(
        (loc) => loc.property_id?.toString() === prop._id.toString()
      );

      return {
        ...prop,
        property_city: mainLoc?.property_city || null,
        property_state: mainLoc?.property_state || null,
        property_country: mainLoc?.property_country || null,
      };
    });
    return res.status(200).json({
      count: finalData.length,
      properties: finalData,
    });
  } catch (error) {
    console.error("Error fetching related properties:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

