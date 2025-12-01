import { ProfileRoles } from "../profile-model/ProfileRoles.js";

export const getAllRoles = async (req, res) => {
  try {
    const roles = await ProfileRoles.find();
    return res.status(200).json(roles);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
