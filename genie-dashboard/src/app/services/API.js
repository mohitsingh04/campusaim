import axios from "axios";

axios.defaults.withCredentials = true;
export const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const CampusaimAPI = axios.create({
  baseURL: `${import.meta.env.VITE_CAMPUSAIM_API_URL}/api/`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
