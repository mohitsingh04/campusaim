import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getToken, removeToken } from "../utils/getDataFromToken.js";
import RegularUser from "../profile-model/RegularUser.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET_VALUE;

const Authorize = async (req, res, next) => {
  try {
    const token = await getToken(req);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      await removeToken(res);
      console.error(err?.message);
      return res.status(401).json({ error: "Unauthorized access." });
    }

    const user = await RegularUser.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (user.status === "Suspended") {
      await removeToken(res);
      return res
        .status(403)
        .json({ error: "Your account is suspended. Please contact support." });
    }

    if (user.verified === false) {
      await removeToken(res);
      return res
        .status(403)
        .json({ error: "Your account is not verified yet." });
    }

    next();
  } catch (error) {
    await removeToken(res);
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default Authorize;
