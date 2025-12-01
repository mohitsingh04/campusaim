import axios from "axios";

axios.defaults.withCredentials = true;
export const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    withCredentials: true,
  },
});
