import EnquiryCount from "../analytic-model/EnquiryCount.js";

export const addEnquiryCount = async (property_id) => {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();

    const monthNames = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const month = monthNames[currentDate.getMonth()]; // getMonth() returns 0-11

    const day = String(currentDate.getDate()).padStart(2, "0");

    // Find existing enquiry count document for this property/month/year
    let enquiryCount = await EnquiryCount.findOne({
      property_id,
      year,
      month,
    });

    if (!enquiryCount) {
      // Create new document
      enquiryCount = new EnquiryCount({
        property_id,
        year,
        month,
        daily: [
          {
            day,
            enquiries: 1,
          },
        ],
      });

      await enquiryCount.save();
      return enquiryCount;
    }

    // Increment enquiries for today
    const dayRecord = enquiryCount.daily.find((record) => record.day === day);

    if (dayRecord) {
      dayRecord.enquiries += 1;
    } else {
      enquiryCount.daily.push({ day, enquiries: 1 });
    }

    const updatedEnquiryCount = await enquiryCount.save();
    return updatedEnquiryCount;
  } catch (error) {
    console.error("Error adding enquiry count:", error);
    throw new Error("Unable to add or update enquiry count.");
  }
};

export const getEnquiryCountByPropertyId = async (req, res) => {
  try {
    const { property_id } = req.params;

    if (!property_id) {
      return res.status(400).json({ error: "property_id is required" });
    }

    const enquiriesData = await EnquiryCount.find({
      property_id: property_id,
    });

    if (!enquiriesData || enquiriesData.length === 0) {
      return res
        .status(404)
        .json({ message: "No traffic data found for this property_id" });
    }

    res.status(200).json(enquiriesData);
  } catch (error) {
    console.error("Error fetching traffic:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
