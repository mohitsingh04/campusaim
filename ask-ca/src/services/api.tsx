import axios from "axios";

axios.defaults.withCredentials = true;

export const API = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api`,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});
