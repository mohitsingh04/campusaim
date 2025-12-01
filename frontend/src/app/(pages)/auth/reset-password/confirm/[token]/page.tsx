"use client";

import { useEffect, useState } from "react";
import ErrorCard from "./_confirm_components.tsx/ErrorCard";
import LoaderCard from "./_confirm_components.tsx/LoaderCard";
import { AxiosError } from "axios";
import API from "@/contexts/API";
import { useParams } from "next/navigation";
import ResetForm from "./_confirm_components.tsx/ResetForm";

export default function ResetPasswordConfirm() {
  const { token } = useParams();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const response = await API.get(`/profile/reset/${token}`);

        if (response.data.message) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        const err = error as AxiosError<{ error: string }>;
        const errorMessage =
          err?.response?.data?.error || "Something went wrong.";
        console.log(errorMessage);
        setStatus("error");
      }
    };

    verifyToken();
  }, [token]);

  if (status === "loading") return <LoaderCard />;
  if (status === "error") return <ErrorCard />;
  if (status === "success") return <ResetForm />;

  return null;
}
