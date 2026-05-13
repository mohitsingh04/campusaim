import bodyParser from "body-parser";
import express from "express";
import {
  changeProfilePassword,
  DeleteAccountConfirm,
  getProfileEmailVerification,
  getProfileResetToken,
  getProfileToken,
  ProfileAccountDeletionOtp,
  profileDetails,
  profileForgotPassword,
  profileLogin,
  profileLogout,
  profilePostResetToken,
  profileRegister,
  verifyProfileEmail,
} from "../profile-controller/ProfileController.js";
import {
  confirmSwitchProfessional,
  DeleteProfileAvatar,
  DeleteProfileBanner,
  GetAllProfileByUsername,
  GetAllProfileUser,
  GetProfileByEmail,
  GetProfileUserByObjectId,
  ProfileAvatarChange,
  ProfileBannerChange,
  SwitchProfessionalMail,
  UpdateProfileUser,
  UpdateUserDetails,
} from "../profile-controller/ProfileUserController.js";
import {
  addProfileLocation,
  getLocationByUserId,
} from "../profile-controller/ProfileLocationController.js";
import { processImage, upload } from "../multer/index.js";
import { rateLimit } from "express-rate-limit";
import { ProfileGoogleLoginAuth } from "../profile-controller/ProfileGoogleAuth.js";
import Authorize from "../utils/Authorization.js";
import {
  createPermissions,
  getAllPermissions,
  updateUserPermissions,
} from "../profile-controller/ProfilePermissionsController.js";
import { getAllRoles } from "../profile-controller/ProfileRoles.js";
import {
  getUserConsent,
  setUserConsent,
} from "../profile-controller/ProfileConsentController.js";

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 3,
});

const profileRoutes = express.Router();
profileRoutes.use(bodyParser.json());
profileRoutes.use(bodyParser.urlencoded({ extended: true }));

profileRoutes.post(`/profile/register`, profileRegister);
profileRoutes.post(`/profile/login`, profileLogin);
profileRoutes.post(`/profile/verify-email/email/:email`, verifyProfileEmail);
profileRoutes.get(`/profile/verify-email/:token`, getProfileEmailVerification);
profileRoutes.get(`/profile/detail`, Authorize, profileDetails);
profileRoutes.get(`/profile/logout`, Authorize, profileLogout);
profileRoutes.get(`/profile/token`, Authorize, getProfileToken);
profileRoutes.post(`/profile/forgot-password`, limiter, profileForgotPassword);
profileRoutes.get("/profile/reset/:token", getProfileResetToken);
profileRoutes.post("/profile/reset", profilePostResetToken);
profileRoutes.post("/profile/change-password", changeProfilePassword);
profileRoutes.post(
  "/profile/delete/account/:uniqueId",
  Authorize,
  ProfileAccountDeletionOtp,
);
profileRoutes.get(
  `/profile/delete/account/:uniqueId/:token`,
  Authorize,
  DeleteAccountConfirm,
);
profileRoutes.post("/profile/google/login", ProfileGoogleLoginAuth);

const avatarUpload = upload.fields([{ name: "avatar", maxCount: 1 }]);
profileRoutes.get(`/profile/users`, GetAllProfileUser);
profileRoutes.get(`/profile/user/email/:email`, GetProfileByEmail);
profileRoutes.get(`/profile/user/:objectId`, GetProfileUserByObjectId);
profileRoutes.patch(`/profile/user/:objectId`, Authorize, UpdateProfileUser);
profileRoutes.patch(
  `/profile/user/:objectId/update`,
  Authorize,
  UpdateUserDetails,
);
profileRoutes.patch(
  `/profile/user/avatar/:userId`,
  Authorize,
  avatarUpload,
  processImage,
  ProfileAvatarChange,
);
profileRoutes.delete(
  `/profile/user/avatar/:userId`,
  Authorize,
  DeleteProfileAvatar,
);
profileRoutes.post(
  `/profile/user/switch/:objectId`,
  Authorize,
  SwitchProfessionalMail,
);
profileRoutes.get(
  `/profile/user/switch/professional/:token`,
  Authorize,
  confirmSwitchProfessional,
);

profileRoutes.get(`/profile/username/:username`, GetAllProfileByUsername);

profileRoutes.patch(`/profile/location`, Authorize, addProfileLocation);
profileRoutes.get(`/profile/location/:userId`, getLocationByUserId);

const bannerUpload = upload.fields([{ name: "banner", maxCount: 1 }]);
profileRoutes.patch(
  "/profile/professional/banner/:userId",
  Authorize,
  bannerUpload,
  processImage,
  ProfileBannerChange,
);
profileRoutes.delete(
  `/profile/professional/banner/:userId`,
  Authorize,
  DeleteProfileBanner,
);

profileRoutes.post(`/profile/permission`, createPermissions);
profileRoutes.get(`/profile/permission`, getAllPermissions);
profileRoutes.patch(
  `/profile/user/:objectId/permissions`,
  updateUserPermissions,
);

profileRoutes.get(`/profile/role`, getAllRoles);

profileRoutes.post(`/profile/consent`, setUserConsent);
profileRoutes.get(`/profile/consent/user/:userId`, getUserConsent);

export default profileRoutes;
