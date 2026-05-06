import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import { unstable_cache } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getUserById = unstable_cache(async (id: string) => {
  try {
    const response = await API.get(`/profile/user/${id}`, {
      headers: { origin: BASE_URL },
    });
    return response.data;
  } catch (error) {
    getErrorResponse(error, true);
    return null;
  }
});
