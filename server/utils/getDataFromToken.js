import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import RegularUser from "../profile-model/RegularUser.js";

dotenv.config();
const JWT_SECRET_VALUE = process.env.JWT_SECRET_VALUE;

export const getToken = async (req) => {
  try {
    const token = req.cookies?.accessToken;
    return token;
  } catch (error) {
    console.log("Error on getDataFromToken", error.message);
    return null;
  }
};

export const getDataFromToken = async (req) => {
  try {
    const token = await getToken(req);
    if (!token) throw new Error("Token not found");

    const decodedToken = jwt.verify(token, JWT_SECRET_VALUE);
    return decodedToken.id;
  } catch (error) {
    console.log("Error on getDataFromToken", error.message);
    return null;
  }
};

export const getUserDataFromToken = async (req) => {
  try {
    const token = await getToken(req);
    if (!token) throw new Error("Token not found");

    const decodedToken = jwt.verify(token, JWT_SECRET_VALUE);
    const user = await RegularUser.findById(decodedToken.id);
    return user;
  } catch (error) {
    console.log("Error on getDataFromToken", error.message);
    return null;
  }
};

export const removeToken = (res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });
};
