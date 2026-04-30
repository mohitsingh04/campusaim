import { unstable_cache } from "next/cache";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getPropertyBySlug = (property_id: string) =>
  unstable_cache(
    async () => {
      try {
        const response = await API.get(`/property/slug/${property_id}`, {
          headers: { origin: BASE_URL },
        });

        return response.data;
      } catch (error) {
        getErrorResponse(error, true);
        return null;
      }
    },
    ["property-rank", property_id],
    {
      revalidate: 60,
    },
  )();

export const getPropertyLocation = unstable_cache(
  async (property_id: string) => {
    try {
      const response = await API.get(`/property/location/${property_id}`, {
        headers: { origin: BASE_URL },
      });
      return response.data;
    } catch (error) {
      getErrorResponse(error, true);
      return null;
    }
  },
);
export const getPropertyRank = (property_id: string) =>
  unstable_cache(
    async () => {
      try {
        const response = await API.get(`/property/rank/${property_id}`, {
          headers: { origin: BASE_URL },
        });

        return response.data;
      } catch (error) {
        getErrorResponse(error, true);
        return null;
      }
    },
    ["property-rank", property_id],
    {
      revalidate: 60,
    },
  )();
export const getPropertySeo = unstable_cache(async (property_id: string) => {
  try {
    const response = await API.get(`/property/seo/property/${property_id}`, {
      headers: { origin: BASE_URL },
    });
    return response.data;
  } catch (error) {
    getErrorResponse(error, true);
    return null;
  }
});
export const getPropertyRatingStats = unstable_cache(
  async (property_id: string) => {
    try {
      const response = await API.get(`/review/property/stats/${property_id}`, {
        headers: { origin: BASE_URL },
      });
      return response.data;
    } catch (error) {
      getErrorResponse(error, true);
      return null;
    }
  },
);
export const getPropertyCourseCount = unstable_cache(
  async (property_id: string) => {
    try {
      const response = await API.get(`/property-course/count/${property_id}`, {
        headers: { origin: BASE_URL },
      });
      return response.data;
    } catch (error) {
      getErrorResponse(error, true);
      return null;
    }
  },
);
