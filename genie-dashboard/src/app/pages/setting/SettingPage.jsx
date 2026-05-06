import React, { useEffect, useState } from "react";
import { LucideFileQuestion, Pencil } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs.jsx";
import { API, CampusaimAPI } from "../../services/API.js";
import toast from "react-hot-toast";

export default function SettingPage() {
  const { authUser, setAuthUser } = useAuth(); // ✅ must expose setter in context
  const navigate = useNavigate();
  const [category, setCategory] = useState([]);
  const [selectedNiche, setSelectedNiche] = useState("");
  const [organization, setOrganization] = useState("");
  const [myOrg, setMyOrg] = useState("");

  const isNicheLocked = Boolean(authUser?.nicheId);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CampusaimAPI.get("/category");
        const filteredCat = res.data.filter((a) => a.parent_category === "Academic Type");
        setCategory(filteredCat);
      } catch (error) {
        toast.error("Internal server error.");
        console.error(error)
      }
    };
    fetchCategories();
  }, []);

  // ✅ sync selected niche with user
  useEffect(() => {
    if (authUser?.nicheId) {
      setSelectedNiche(authUser.nicheId);
    }
  }, [authUser]);

  const handleUpdateOrganization = async () => {
    try {
      if (!organization.trim()) {
        return toast.error("Please add organization name.");
      }

      const res = await API.put("/users/update-organization", {
        name: organization
      });

      setAuthUser(prev => ({
        ...prev,
        organizationId: res.data.data.organizationId
      }));

      toast.success("Organization updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update organization");
    }
  };

  useEffect(() => {
    const fetchMyOrg = async () => {
      try {
        const res = await API.get("/my-organization");
        setMyOrg(res?.data.data);
      } catch (error) {
        toast.error("Internal server error.");
        console.error(error)
      }
    };
    fetchMyOrg();
  }, []);

  useEffect(() => {
    if (myOrg?.name) {
      setOrganization(myOrg.name);
    }
  }, [myOrg]);

  // ✅ update niche handler
  const handleUpdateNiche = async () => {
    try {
      if (!selectedNiche) return toast.error("Please select category");

      const res = await API.put("/users/update-niche", { nicheId: selectedNiche });

      setAuthUser(prev => ({ ...prev, nicheId: selectedNiche }));

      toast.success("Category updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update niche");
    }
  };

  if (!authUser) {
    return <div className="p-6 text-center text-gray-500">Loading profile...</div>;
  }

  const {
    name, username, email, mobile_no, roleName, status, verified, address, pincode, city, state, country, nicheId, createdAt, appRole
  } = authUser;

  const avatarUrl = authUser?.avatar?.[0]
    ? `${import.meta.env.VITE_MEDIA_URL}${authUser.avatar[0]}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.name || "User")}&background=0D8ABC&color=fff`;

  return (
    <div className="p-6 space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Profile" }]} />
        <div className="flex items-center justify-end flex-wrap gap-3">
          {appRole === "admin" ?
            <Link to={`/dashboard/questions/all`} target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <LucideFileQuestion size={16} />Manage Questions
            </Link>
            : null
          }

          <Link to={`${import.meta.env.VITE_CAMPUSAIM_URL}/settings/account?tab=profile`} target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Pencil size={16} />Manage Profile
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl p-6 border">

        <div className="flex items-center gap-6 mb-6">
          <img src={avatarUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
            <p className="text-sm text-gray-500">@{username}</p>
            <p className="text-sm text-gray-600 mt-1">{roleName}</p>

            <div className="mt-2 flex gap-2">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {status}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${verified ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                {verified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

          <div><p className="text-gray-500">Email</p><p className="font-medium">{email || "N/A"}</p></div>
          <div><p className="text-gray-500">Mobile</p><p className="font-medium">{mobile_no || "N/A"}</p></div>
          <div><p className="text-gray-500">Address</p><p className="font-medium">{address || "N/A"}</p></div>
          <div><p className="text-gray-500">Pincode</p><p className="font-medium">{pincode || "N/A"}</p></div>
          <div><p className="text-gray-500">City</p><p className="font-medium">{city || "N/A"}</p></div>
          <div><p className="text-gray-500">State</p><p className="font-medium">{state || "N/A"}</p></div>
          <div><p className="text-gray-500">Country</p><p className="font-medium">{country || "N/A"}</p></div>
          <div><p className="text-gray-500">Joined</p><p className="font-medium">{createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}</p></div>

          {appRole === "admin" ? (
            <>
              {/* ✅ Organization Select + Update */}
              <div>
                <p className="text-gray-500">Organization</p>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Enter your organization name"
                    className="border rounded-md px-2 py-1 w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />

                  <button onClick={handleUpdateOrganization} className="px-3 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Save
                  </button>
                </div>
              </div>

              {/* ✅ Niche Select + Update */}
              <div>
                <p className="text-gray-500">Category</p>
                <div className="flex gap-2 mt-1">
                  <select
                    className="border rounded-md px-2 py-1 w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    disabled={isNicheLocked}
                  >
                    <option value="">Select Category</option>
                    {category.map((item) => (
                      <option key={item._id} value={item._id}>{item.category_name}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleUpdateNiche}
                    disabled={isNicheLocked}
                    className={`px-3 py-1 rounded-md text-white ${isNicheLocked
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                      }`}
                  >
                    Save
                  </button>
                </div>

                <p className={`text-xs mt-1 ${isNicheLocked ? "text-gray-500" : "text-red-500"}`}>
                  {isNicheLocked
                    ? "Category is locked and cannot be changed."
                    : "Select your category carefully. This action is permanent."}
                </p>
              </div>
            </>)
            : null
          }

        </div>
      </div>
    </div>
  );
}