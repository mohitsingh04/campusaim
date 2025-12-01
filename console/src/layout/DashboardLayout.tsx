import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "../components/sidebar/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/header/Header";
import { RoleProps, UserProps } from "../types/types";
import { API } from "../contexts/API";
import { SidebarProperty } from "../components/sidebar/SidebarPorperty";
import DashboardSkeleton from "../ui/loadings/pages/DashboardSkeleton";
import SidebarSkeleton from "../ui/loadings/pages/SidebarSkeleton";
import { getErrorResponse } from "../contexts/Callbacks";

export default function DashboardLayout({
  authUser,
  authLoading,
  getRoleById,
  roles,
}: {
  authUser: UserProps | null;
  authLoading: boolean;
  getRoleById: (id: string) => string | undefined;
  roles: RoleProps[];
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? saved === "true" : false;
  });

  const [status, setStatus] = useState([]);
  const [categories, setCategories] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const generatePropertyScore = async () => {
      try {
        const response = await API.post(`/property/all/score`);
        console.log(response.data.message);
      } catch (error) {
        getErrorResponse(error, false);
      }
    };
    generatePropertyScore();
  }, []);

  // 🔹 Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const getStatus = useCallback(async () => {
    try {
      const response = await API.get("/status");
      setStatus(response.data || []);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getStatus();
  }, [getStatus]);

  const getCategories = useCallback(async () => {
    try {
      const response = await API.get(`/category`);
      setCategories(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[var(--yp-secondary)] flex">
      {!authLoading ? (
        authUser?.role === "Property Manager" ? (
          <SidebarProperty
            isCollapsed={sidebarCollapsed}
            authUser={authUser}
            categories={categories}
          />
        ) : (
          <Sidebar isCollapsed={sidebarCollapsed} authUser={authUser} />
        )
      ) : (
        <SidebarSkeleton />
      )}

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 z-0 ${
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        <Header
          onToggleCollapse={handleToggleCollapse}
          authUser={authUser}
          isCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-auto bg-[var(--yp-secondary)] p-4 lg:p-6 z-[-1]">
          {!authLoading ? (
            <Outlet
              context={{
                authUser,
                authLoading,
                status,
                categories,
                getRoleById,
                roles,
              }}
            />
          ) : (
            <DashboardSkeleton />
          )}
        </main>
      </div>
    </div>
  );
}
