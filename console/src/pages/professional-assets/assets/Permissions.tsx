import { useCallback, useEffect, useState } from "react";
import PermissionList from "./permission-components/PermissionList";
import PermissionCreate from "./permission-components/PermissionCreate";
import { API } from "../../../contexts/API";
import { getErrorResponse } from "../../../contexts/Callbacks";
import { useOutletContext } from "react-router-dom";
import { DashboardOutletContextProps } from "../../../types/types";

export default function Permissions() {
  const { roles } = useOutletContext<DashboardOutletContextProps>();
  const [isAdding, setIsAdding] = useState("");
  const [mainRoles, setMainRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);

  const getAllPermissions = useCallback(async () => {
    try {
      const { data } = await API.get("/profile/permission");
      setAllPermissions(data);
    } catch (error) {
      getErrorResponse(error, false);
    }
  }, []);

  useEffect(() => {
    getAllPermissions();
  }, [getAllPermissions]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const formatted = roles.map((r: any) => ({
          value: r._id,
          label: r.role,
        }));
        setMainRoles(formatted);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRoles();
  }, [roles]);
  return (
    <div>
      {!isAdding ? (
        <PermissionList
          setIsAdding={setIsAdding}
          allPermissions={allPermissions}
        />
      ) : (
        <PermissionCreate
          setIsAdding={setIsAdding}
          roles={mainRoles}
          isAdding={isAdding}
        />
      )}
    </div>
  );
}
