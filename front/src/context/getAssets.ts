import API from "./API";
import { getErrorResponse } from "./Callbacks";

export async function getToken() {
  try {
    const response = await API.get("/profile/token");
    return response.data.token || "";
  } catch (error) {
    getErrorResponse(error, true);
  }
}

export async function getProfile() {
  try {
    const response = await API.get(`/profile/detail`);
    return response.data;
  } catch (error) {
    getErrorResponse(error, true);
  }
}
export const handleLogout = async () => {
  try {
    await API.get(`/profile/logout`);
    window.location.reload();
  } catch (error) {
    getErrorResponse(error, true);
  }
};
