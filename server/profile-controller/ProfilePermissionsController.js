import { ProfilePermissions } from "../profile-model/ProfilePermissions.js";
import { ProfileRoles } from "../profile-model/ProfileRoles.js";
import RegularUser from "../profile-model/RegularUser.js";
// PUT /profile/user/:id/permissions
export const updateUserPermissions = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { permissions } = req.body;

    await RegularUser.findByIdAndUpdate(objectId, { permissions });
    res.json({ success: true, message: "Permissions updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPermissions = async (req, res) => {
  try {
    const { title, roles, permissions } = req.body;

    // Basic validation
    if (
      !title ||
      !Array.isArray(roles) ||
      roles.length === 0 ||
      !Array.isArray(permissions)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid fields." });
    }

    // Remove duplicate permissions by title
    const uniquePermissions = [
      ...new Map(permissions.map((p) => [p.title, p])).values(),
    ];

    // Check all roles exist
    const existingRoles = await ProfileRoles.find({ _id: { $in: roles } });
    if (existingRoles.length !== roles.length) {
      return res.status(404).json({
        success: false,
        message: "One or more roles do not exist.",
      });
    }

    // Check if permission group already exists for same title + roles
    const existingGroup = await ProfilePermissions.findOne({
      title,
      roles: { $in: roles },
    });

    if (existingGroup) {
      // Combine — remove duplicates, apply additions/removals
      const mergedPermissions = uniquePermissions.filter(
        (p) => p.title && p.title.trim() !== ""
      );

      // Update the existing group
      existingGroup.permissions = mergedPermissions;
      existingGroup.roles = roles;
      await existingGroup.save();

      return res.status(200).json({
        success: true,
        message: "Permissions updated successfully.",
        data: existingGroup,
      });
    }

    // Otherwise, create a new permission group
    const newPermissions = await ProfilePermissions.create({
      title,
      roles,
      permissions: uniquePermissions,
    });

    res.status(201).json({
      success: true,
      message: "Permissions created successfully.",
      data: newPermissions,
    });
  } catch (error) {
    console.error("Error creating/updating permissions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await ProfilePermissions.find();
    return res.status(200).json(permissions);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
