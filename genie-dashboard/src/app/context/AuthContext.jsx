import { createContext, useContext, useEffect, useState } from "react";
import { CampusaimAPI } from "../services/API";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        const res = await CampusaimAPI.get("/profile/detail");
        setAuthUser(res?.data);
      } catch (err) {
        setAuthUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    fetchAuthUser();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);