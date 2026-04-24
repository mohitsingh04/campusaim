import axios from "axios";

axios.defaults.withCredentials = true;
export const API = axios.create({
	baseURL: `${import.meta.env.VITE_API_URL}/api`,
	headers: {
		withCredentials: true,
	},
});

export const GenieAPI = axios.create({
  baseURL: `${import.meta.env.VITE_GENIE_API_URL}/api/`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});