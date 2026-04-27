import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import { UserProps } from "@/types/UserTypes";
import { useCallback, useEffect, useState } from "react";

export default function useGetAuthUser() {
  const [authUser, setAuthUser] = useState<UserProps | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const getAuthUser = useCallback(async () => {
    setAuthLoading(true);
    try {
      const response = await API.get(`/profile/detail`);
      setAuthUser(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    getAuthUser();
  }, [getAuthUser]);
  return { authLoading, authUser, getAuthUser };
}
