"use client";
import { useCallback, useEffect, useState } from "react";
import VerificationForm from "./_components/VerificationForm";
import TutorialSection from "./_components/TutorialSection";
import { PropertyProps, UserProps } from "@/types/types";
import { redirect, useParams } from "next/navigation";
import API from "@/contexts/API";
import { getProfile } from "@/contexts/getAssets";
import Loader from "@/components/Loader/Loader";

export default function VerifyProperty() {
  const [step, setStep] = useState(1);
  const [property, setProperty] = useState<PropertyProps | null>(null);
  const { property_id } = useParams();
  const [authuser, setAuthUser] = useState<UserProps | null>();
  // const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserDetails = async () => {
      // setAuthLoading(true);
      const token = await getProfile();
      setAuthUser(token);
      // setAuthLoading(false);
    };
    getUserDetails();
  }, []);

  const getProperty = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/property/${property_id}`);
      const data = response.data;
      setProperty(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [property_id]);

  useEffect(() => {
    getProperty();
  }, [getProperty]);

  useEffect(() => {
    if (!loading) {
      if (!property || property?.claimed) {
        redirect("/not-found");
      }
    }
  }, [property, loading]);

  if (!authuser) return <Loader />;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-purple-50">
      <TutorialSection currentStep={step} />
      <VerificationForm
        step={step}
        setStep={setStep}
        property={property}
        authuser={authuser}
      />
    </div>
  );
}
