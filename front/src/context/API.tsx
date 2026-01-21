import axios from "axios";

axios.defaults.withCredentials = true;
const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

export default API;
