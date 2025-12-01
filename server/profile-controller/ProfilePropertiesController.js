import ProfileProperties from "../profile-model/ProfileProperties.js";

export const GetProfileProperties = async (req, res) => {
  try {
    const Properties = await ProfileProperties.find();
    return res.status(200).json(Properties);
  } catch (error) {
 console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });  }
};
