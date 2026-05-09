import ProfileLocation from "../profile-model/ProfileLocation.js";

export const addProfileLocation = async (req, res) => {
  try {
    const { userId, address, pincode, city, state, country } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    const updatedLocation = await ProfileLocation.findOneAndUpdate(
      { userId },
      {
        $set: {
          address,
          pincode,
          city,
          state,
          country,
        },
      },
      {
        new: true,
        upsert: true,
      },
    );

    return res.status(200).json({
      message: "Profile location saved successfully.",
      data: updatedLocation,
    });
  } catch (error) {
    console.error("Error saving profile location:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getLocationByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const location = await ProfileLocation.findOne({ userId });
    if (!location) {
      return res.status(404).json({ error: "Location Not Found" });
    }

    return res.status(200).json(location);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
