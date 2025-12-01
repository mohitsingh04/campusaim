import API from "./API";

export async function getToken() {
  try {
    const response = await API.get("/profile/token");
    return response.data.token || "";
  } catch (error) {
    console.error(error);
  }
}

export async function getProfile() {
  try {
    const response = await API.get(`/profile/detail`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
export const handleLogout = async () => {
  try {
    await API.get(`/profile/logout`);
    window.location.reload();
  } catch (error) {
    console.error(error);
  }
};
