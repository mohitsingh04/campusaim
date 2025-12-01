import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { useCallback, useEffect, useState } from "react";
import { DashboardOutletContextProps, PropertyProps } from "../../types/types";
import { getErrorResponse } from "../../contexts/Callbacks";
import { API } from "../../contexts/API";
import { PageTab } from "../../ui/tabs/PageTab";
import BussinessIdentityTab from "./property_verification_components/tabs/BussinessIdentityTab";
import LocationVerificationTab from "./property_verification_components/tabs/LocationVerificationTab";

export default function PropertyVerification() {
  const { objectId } = useParams();
  const [property, setProperty] = useState<PropertyProps | null>(null);
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verifyDoc, setVerifyDoc] = useState();

  useEffect(() => {
    if (!loading && (property === null || !property)) navigate("/not-found");
  }, [loading, property, navigate]);

  useEffect(() => {
    if (!authLoading && !loading && property) {
      if (authUser?.role === "Property Manager" || authUser?.role === "User") {
        if (property.userId !== authUser?._id) {
          navigate("/dashboard");
        }
      }
    }
  }, [authUser, authLoading, loading, property, navigate]);

  const getProperty = useCallback(async () => {
    try {
      const response = await API.get(`/property/${objectId}`);
      setProperty(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [objectId]);

  useEffect(() => {
    getProperty();
  }, [getProperty]);

  const getVerificationDocs = useCallback(async () => {
    setLoading(true);
    if (!objectId) return;
    try {
      const response = await API.get(`/property/verification/doc/${objectId}`);
      setVerifyDoc(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [objectId]);

  useEffect(() => {
    getVerificationDocs();
  }, [getVerificationDocs]);

  const tabs = [
    {
      id: "skills",
      label: "Bussiness Identity",
      content: (
        <BussinessIdentityTab
          property={property}
          verifyDoc={verifyDoc}
          getVerificationDocs={getVerificationDocs}
        />
      ),
    },
    {
      id: "languages",
      label: "Location Verifaction",
      content: (
        <LocationVerificationTab
          property={property}
          verifyDoc={verifyDoc}
          getVerificationDocs={getVerificationDocs}
        />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs
        title="Property Verification"
        breadcrumbs={[
          { label: "Dashboard", path: "/" },
          { label: "Property", path: "/dashboard/property" },
          {
            label: property?.property_name || "",
            path: `/dashboard/property/${property?._id}`,
          },
          { label: "Verification" },
        ]}
      />
      <PageTab items={tabs} />
    </div>
  );
}
