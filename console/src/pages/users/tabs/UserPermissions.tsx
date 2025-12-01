import { useCallback, useEffect, useState } from "react";
import { API } from "../../../contexts/API";
import { getErrorResponse } from "../../../contexts/Callbacks";
import ToggleButton from "../../../ui/button/ToggleButton";
import { UserProps } from "../../../types/types";
import toast from "react-hot-toast";

export default function UserPermissions({
  professional,
}: {
  professional: UserProps | null;
}) {
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, string[]>
  >({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const getPermissions = useCallback(async () => {
    try {
      const response = await API.get("/profile/permission");
      const data = response.data || [];
      setAllPermissions(data);
      if (data.length) setSelectedCategory(data[0]._id);

      if (professional?.permissions?.length > 0) {
        const selected: Record<string, string[]> = {};
        data.forEach((group) => {
          const matchedPerms = group.permissions
            .filter((p) => professional.permissions.includes(p._id))
            .map((p) => p._id);
          if (matchedPerms.length) selected[group._id] = matchedPerms;
        });
        setSelectedPermissions(selected);
      }
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [professional]);

  useEffect(() => {
    getPermissions();
  }, [getPermissions]);

  const handleSelectAllByTitle = (titleId: string, value: boolean) => {
    setSelectedPermissions((prev) => {
      const updated = { ...prev };
      if (value) {
        const target = allPermissions.find((p) => p._id === titleId);
        updated[titleId] = target ? target.permissions.map((p) => p._id) : [];
      } else {
        updated[titleId] = [];
      }
      return updated;
    });
  };

  const handleTogglePermission = (titleId: string, permissionId: string) => {
    setSelectedPermissions((prev) => {
      const prevList = prev[titleId] || [];
      const updated = prevList.includes(permissionId)
        ? prevList.filter((id) => id !== permissionId)
        : [...prevList, permissionId];
      return { ...prev, [titleId]: updated };
    });
  };

  const handleUpdatePermissions = async () => {
    try {
      setLoading(true);
      const allSelectedPerms = Object.values(selectedPermissions).flat();
      const response = await API.patch(
        `/profile/user/${professional?._id}/permissions`,
        { permissions: allSelectedPerms }
      );
      toast.success(
        response.data.message || "Permissions updated successfully ✅"
      );
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row bg-[var(--yp-secondary)] rounded-xl overflow-hidden">
        {/* Mobile Tabs */}
        <div className="lg:hidden border-b border-[var(--yp-border-primary)] bg-[var(--yp-tertiary)] overflow-x-auto">
          <div className="flex space-x-3 px-3 py-2 min-w-max">
            {allPermissions.map((group) => (
              <button
                key={group._id}
                onClick={() => setSelectedCategory(group._id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === group._id
                    ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] shadow-sm"
                    : "bg-[var(--yp-secondary)] text-[var(--yp-muted)] hover:opacity-80"
                }`}
              >
                {group.title}{" "}
                <span className="ml-1 text-xs">
                  ({group.permissions.length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 bg-[var(--yp-tertiary)]">
          <h2 className="px-5 py-4 text-lg font-semibold text-[var(--yp-text-primary)] sticky top-0 bg-[var(--yp-tertiary)] z-10 border-b border-[var(--yp-border-primary)]">
            Manage User Permissions
          </h2>
          <ul className="overflow-y-auto max-h-[calc(100vh-14rem)] custom-scroll">
            {allPermissions.map((group) => (
              <li
                key={group._id}
                onClick={() => setSelectedCategory(group._id)}
                className={`flex justify-between items-center px-5 py-3 cursor-pointer transition-all duration-200 ${
                  selectedCategory === group._id
                    ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
                    : "text-[var(--yp-muted)] hover:bg-[var(--yp-secondary)]"
                }`}
              >
                <span>{group.title}</span>
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    selectedCategory === group._id
                      ? "bg-[var(--yp-orange-text)] text-[var(--yp-orange-bg)]"
                      : "bg-[var(--yp-green-bg)] text-[var(--yp-green-text)]"
                  }`}
                >
                  {group.permissions.length}
                </span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          {allPermissions
            .filter((group) => group._id === selectedCategory)
            .map((group) => {
              const allSelected =
                selectedPermissions[group._id]?.length ===
                group.permissions.length;

              return (
                <div key={group._id}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[var(--yp-text-primary)]">
                      {group.title}
                    </h3>
                    <ToggleButton
                      label="Select All"
                      enabled={allSelected}
                      onToggle={(val) => handleSelectAllByTitle(group._id, val)}
                    />
                  </div>

                  <ul className="space-y-4">
                    {group.permissions.map((perm, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center border-b border-[var(--yp-border-primary)] pb-2"
                      >
                        <span className="text-sm text-[var(--yp-text-secondary)]">
                          {perm.title}
                        </span>
                        <ToggleButton
                          enabled={selectedPermissions[group._id]?.includes(
                            perm._id
                          )}
                          onToggle={() =>
                            handleTogglePermission(group._id, perm._id)
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </main>
      </div>

      {/* Update Button */}
      <div className="text-center lg:text-end mt-4">
        <button
          disabled={loading}
          onClick={handleUpdatePermissions}
          className="px-6 py-2 rounded-lg text-sm sm:text-base font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] mt-2 w-full sm:w-auto"
        >
          {loading ? "Updating..." : "Update Permissions"}
        </button>
      </div>
    </div>
  );
}
