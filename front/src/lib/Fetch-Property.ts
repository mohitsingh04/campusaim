import { unstable_cache } from "next/cache";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/* -------------------------------------------------------------------------- */
/*                               PROPERTY BY SLUG                             */
/* -------------------------------------------------------------------------- */

export async function getPropertyBySlug(property_slug: string) {
  return unstable_cache(
    async () => {
      try {
        const response = await API.get(
          `/property/slug/${property_slug}`,
          {
            headers: {
              origin: BASE_URL,
            },
          },
        );

        return response.data;
      } catch (error) {
        getErrorResponse(error, true);
        return null;
      }
    },
    [`property-by-slug-${property_slug}`],
    {
      revalidate: 60,
      tags: [`property-${property_slug}`],
    },
  )();
}

/* -------------------------------------------------------------------------- */
/*                              PROPERTY LOCATION                             */
/* -------------------------------------------------------------------------- */

export async function getPropertyLocation(property_id: string) {
  return unstable_cache(
    async () => {
      try {
        const response = await API.get(
          `/property/location/${property_id}`,
          {
            headers: {
              origin: BASE_URL,
            },
          },
        );

        return response.data;
      } catch (error) {
        getErrorResponse(error, true);
        return null;
      }
    },
    [`property-location-${property_id}`],
    {
      revalidate: 300,
      tags: [`property-location-${property_id}`],
    },
  )();
}

/* -------------------------------------------------------------------------- */
/*                               PROPERTY RANK                                */
/* -------------------------------------------------------------------------- */

export async function getPropertyRank(property_id: string) {
  return unstable_cache(
    async () => {
      try {
        const response = await API.get(
          `/property/rank/${property_id}`,
          {
            headers: {
              origin: BASE_URL,
            },
          },
        );

        return response.data;
      } catch (error) {
        getErrorResponse(error, true);
        return null;
      }
    },
    [`property-rank-${property_id}`],
    {
      revalidate: 300,
      tags: [`property-rank-${property_id}`],
    },
  )();
}

/* -------------------------------------------------------------------------- */
/*                                PROPERTY SEO                                */
/* -------------------------------------------------------------------------- */

export async function getPropertySeo(property_id: string) {
  return unstable_cache(
    async () => {
      try {
        const response = await API.get(
          `/property/seo/property/${property_id}`,
          {
            headers: {
              origin: BASE_URL,
            },
          },
        );

        return response.data;
      } catch (error) {
        getErrorResponse(error, true);
        return null;
      }
    },
    [`property-seo-${property_id}`],
    {
      revalidate: 600,
      tags: [`property-seo-${property_id}`],
    },
  )();
}

/* -------------------------------------------------------------------------- */
/*                          PROPERTY TAB EXISTENCE                            */
/* -------------------------------------------------------------------------- */

export async function getPropertyTabExistence(property_id: string) {
  return unstable_cache(
    async () => {
      try {
        const response = await API.get(
          `/property/tab/existence/${property_id}`,
          {
            headers: {
              origin: BASE_URL,
            },
          },
        );

        return response.data;
      } catch (error) {
        getErrorResponse(error, true);
        return null;
      }
    },
    [`property-tab-existence-${property_id}`],
    {
      revalidate: 300,
      tags: [`property-tab-existence-${property_id}`],
    },
  )();
}

/* -------------------------------------------------------------------------- */
/*                           PROPERTY RATING STATS                            */
/* -------------------------------------------------------------------------- */

export async function getPropertyRatingStats(property_id: string) {
  return unstable_cache(
    async () => {
      try {
        const response = await API.get(
          `/review/property/stats/${property_id}`,
          {
            headers: {
              origin: BASE_URL,
            },
          },
        );

        return response.data;
      } catch (error) {
        getErrorResponse(error, true);
        return null;
      }
    },
    [`property-rating-stats-${property_id}`],
    {
      revalidate: 120,
      tags: [`property-rating-stats-${property_id}`],
    },
  )();
}

/* -------------------------------------------------------------------------- */
/*                           PROPERTY COURSE COUNT                            */
/* -------------------------------------------------------------------------- */

export async function getPropertyCourseCount(property_id: string) {
  return unstable_cache(
    async () => {
      try {
        const response = await API.get(
          `/property-course/count/${property_id}`,
          {
            headers: {
              origin: BASE_URL,
            },
          },
        );

        return response.data;
      } catch (error) {
        getErrorResponse(error, true);
        return null;
      }
    },
    [`property-course-count-${property_id}`],
    {
      revalidate: 300,
      tags: [`property-course-count-${property_id}`],
    },
  )();
}