import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET_VALUE = process.env.JWT_SECRET_VALUE;

export const getDataFromToken = async (req) => {
    try {
        const token = req.cookies?.accessToken || req.body?.accessToken || req.query?.accessToken;
        if (!token) {
            throw new Error("Token not found");
        }

        const decodedToken = jwt.verify(token, JWT_SECRET_VALUE);
        return decodedToken.id;
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
}