import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET_VALUE);
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid Token' });
    }
};
