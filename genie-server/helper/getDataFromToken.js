import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET_TOKEN = process.env.SECRET_TOKEN;

export const getDataFromToken = async (req) => {
    try {
        const token = req.cookies?.token || req.body?.token || req.query?.token;
        if (!token) {
            throw new Error("Token not found");
        }

        const decodedToken = jwt.verify(token, SECRET_TOKEN);
        return decodedToken.id;
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
}