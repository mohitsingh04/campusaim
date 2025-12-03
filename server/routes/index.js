import express from "express";
import bodyParser from "body-parser";
import {
  blogUploadMulter,
  categoryUploadMulter,
  courseUploadMulter,
  examUploadMulter,
  filesUpload,
  newsUploadMulter,
  processImage,
  ResuemUploadMulter,
  upload,
} from "../multer/index.js";
import {
  addStatus,
  deleteStatus,
  getStatus,
  getStatusById,
  updateStatus,
} from "../controller/StatusController.js";
import {
  addCategory,
  deleteCategory,
  followCategory,
  getCategory,
  getCategoryById,
  getCategoryBySlug,
  getCategoryFollowers,
  getFollowedCategories,
  unfollowCategory,
  updateCategory,
} from "../controller/CategoryController.js";
import {
  addProperty,
  deleteProperty,
  getPropertiesMultipleObjectId,
  getProperty,
  getPropertyById,
  getPropertyBySlug,
  getPropertyByUniqueId,
  getPropertyByUserId,
  PropertySlugGenerator,
  updateProperty,
  updatePropertyImages,
} from "../controller/PropertyController.js";
import {
  addTeacher,
  deleteTeacher,
  getTeacher,
  getTeacherById,
  getTeacherByPropertyId,
  updateTeacher,
} from "../controller/TeachersController.js";
import {
  addReview,
  deleteReview,
  getReview,
  getReviewById,
  getReviewByPropertyId,
  updateReview,
} from "../controller/ReviewsController.js";
import {
  addFaq,
  deleteFaq,
  getFaq,
  getFaqById,
  getFaqByPropertyId,
  updateFaq,
} from "../controller/FaqsController.js";
import {
  addCourse,
  deleteCourse,
  getCourse,
  getCourseById,
  getCourseByUniqueId,
  getCourseWithSeoBySlug,
  restoreCourse,
  softDeleteCourse,
  updateCourse,
} from "../controller/CourseController.js";
import {
  addGallery,
  addNewGalleryImages,
  deleteGallery,
  EditGalleryTitle,
  getGallery,
  getGalleryById,
  getGalleryByPropertyId,
  removeGalleryImages,
  updateGallery,
} from "../controller/GalleryController.js";
import {
  addPropertySeo,
  deletePropertySeo,
  getPropertySeo,
  getPropertySeoById,
  getPropertySeoByPropertyId,
  updatePropertySeo,
} from "../controller/PropertySeoController.js";
import {
  addPropertyCourse,
  deletePropertyCourse,
  getPropertyCourse,
  getPropertyCourseById,
  getPropertyCourseByPropertyId,
  getPropertyCourseByUniqueId,
  updatePropertyCourse,
} from "../controller/PropertyCourseController.js";
import {
  getCity,
  getCountry,
  getState,
} from "../controller/ExtraControllers.js";
import {
  addAmenities,
  getAmenities,
  getAmenitiesByPropertyId,
  updateAmenities,
} from "../controller/AmenitesController.js";
import {
  addEnquiry,
  archiveStatus,
  deleteArchiveEnquiry,
  enquiryStatus,
  getAllArchiveEnquiry,
  getAllEnquiry,
  getArchiveEnquiryByObjectId,
  getArchiveEnquiryByPropertyId,
  getEnquiryByObjectId,
  getEnquiryByPropertyId,
  softDeleteEnquiry,
} from "../controller/EnqiryControllers.js";
import {
  addLocation,
  getAllLocations,
  getLocation,
  UpdateLocation,
} from "../controller/LocationController.js";
import {
  AddAccomodation,
  AddAccomodationImages,
  EditAccomodation,
  getAccomodationByPropertyId,
  getAllAccomodation,
  removeAccomodationImages,
} from "../controller/AccomodationController.js";
import {
  AddScholarship,
  EditScholarship,
  getAllScholarship,
  getScholarshipByPropertyId,
} from "../controller/ScholarshipController.js";
import { addOrUpdateLegal, getLegal } from "../controller/LegalController.js";
import {
  CreateBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  getBlogByUniqueId,
  getBlogWithSeoBySlug,
  UpdateBlog,
} from "../controller/BlogsController.js";
import {
  createBlogCategory,
  deleteBlogCategory,
  getAllBlogCategories,
  getBlogCategoryById,
  updateBlogCategory,
} from "../controller/BlogCategoryController.js";
import {
  CreateTagController,
  updateBlogTag,
  getAllBlogTags,
  getBlogTagById,
} from "../controller/BlogTagController.js";
import {
  CreateKeyOutComeController,
  updateKeyOutCome,
  getAllKeyOutComes,
  getKeyOutComeById,
} from "../controller/KeyOutComesController.js";
import {
  CreateRequirmentController,
  updateRequirment,
  getAllRequirments,
  getRequirmentById,
} from "../controller/RequirmentsController.js";
import {
  CreateAllSeo,
  getAllSeo,
  getSeoByTypeId,
} from "../controller/AllSeoController.js";
import { createBlogEnquiry } from "../controller/BlogEnquiryController.js";
import {
  createNewsAndUpdates,
  deleteNewsAndUpdates,
  getAllNewsAndUpdates,
  getNewsAndUpdatesByObjectId,
  getNewsAndUpdatesWithSeoBySlug,
  updateNewsAndUpdates,
} from "../controller/NewsAndUpdatesController.js";
import Authorize from "../utils/Authorization.js";
import {
  getPropertyVerifcationDoc,
  uploadPropertyVerificationDocs,
} from "../controller/PropertyVerificationDocController.js";
import { createCourseEnquiry } from "../controller/CourseEnquiryController.js";
import { getPropertyRelatedToPropertyCourse } from "../controller/RelatedPropertyController.js";
import {
  PropertyConsentAndUserRoleUpdation,
  PropertyVerifyEmailOtpMatch,
  sendPropertyVerifyEmailOTP,
} from "../controller/PropertyVerificationController.js";
import { addExam, deleteExam, getExam, getExamById, getExamWithSeoBySlug, restoreExam, softDeleteExam, updateExam } from "../controller/ExamController.js";
import { AddAdmissionProcess, EditAdmissionProcess, getAdmissionProcessByPropertyId, getAllAdmissionProcess } from "../controller/AdmissionProcessController.js";

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//?Extra Routes
router.get("/cities", getCity);
router.get("/states", getState);
router.get("/countries", getCountry);

// ?Status Route
router.get("/status", getStatus);
router.get("/status/:objectId", getStatusById);
router.post("/status", Authorize, addStatus);
router.patch("/status/:objectId", Authorize, updateStatus);
router.delete("/status/:objectId", Authorize, deleteStatus);

// ?Course Route
const courseUpload = courseUploadMulter.fields([
  { name: "image", maxCount: 1 },
]);
router.get("/course", getCourse);
router.post("/course", Authorize, courseUpload, processImage, addCourse);
router.patch(
  "/course/:objectId",
  Authorize,
  courseUpload,
  processImage,
  updateCourse
);
router.delete("/course/:objectId", Authorize, deleteCourse);
router.get("/course/:objectId", getCourseById);
router.get("/course-detail/:uniqueId", getCourseByUniqueId);
router.get("/course/soft/:objectId", Authorize, softDeleteCourse);
router.get("/course/restore/:objectId", Authorize, restoreCourse);
router.post("/course/create/enquiry", createCourseEnquiry);
router.get("/course/seo/:slug", getCourseWithSeoBySlug);

// ?Exam Route
const examUpload = examUploadMulter.fields([
  { name: "image", maxCount: 1 },
]);
router.get("/exam", getExam);
router.post("/exam", Authorize, examUpload, processImage, addExam);
router.patch(
  "/exam/:objectId",
  Authorize,
  examUpload,
  processImage,
  updateExam
);
router.get("/exam/:objectId", getExamById);
router.get("/exam/restore/:objectId", Authorize, restoreExam);
router.delete("/exam/:objectId", Authorize, deleteExam);
router.get("/exam/soft/:objectId", Authorize, softDeleteExam);
// router.post("/exam/create/enquiry", createCourseEnquiry);
router.get("/exam/seo/:slug", getExamWithSeoBySlug);

// ?Category Route
const categoryUpload = categoryUploadMulter.fields([
  { name: "category_icon", maxCount: 1 },
  { name: "featured_image", maxCount: 1 },
]);
router.get("/category", getCategory);
router.post("/category", Authorize, categoryUpload, processImage, addCategory);
router.patch(
  "/category/:objectId",
  Authorize,
  categoryUpload,
  processImage,
  updateCategory
);
router.delete("/category/:objectId", Authorize, deleteCategory);
router.get("/category/:objectId", getCategoryById);

//! /* ---------------- CHANGES BY MOHIT ---------------- */
router.get("/category/:slug/details", getCategoryBySlug);
router.post("/category/:id/follow", Authorize, followCategory);
router.post("/category/:id/unfollow", Authorize, unfollowCategory);
router.get("/category/:id/followers", getCategoryFollowers);
router.get("/category/:id/categories", getFollowedCategories);

//?Enquiry Route
router.get("/enquiry", getAllEnquiry);
router.delete("/enquiry/soft/:objectId", softDeleteEnquiry);
router.get("/enquiry/:objectId", getEnquiryByObjectId);
router.patch("/enquiry/status/:objectId", enquiryStatus);
router.get("/enquiry/archive/all", getAllArchiveEnquiry);
router.delete("/enquiry/archive/:objectId", deleteArchiveEnquiry);
router.patch("/enquiry/archive/status/:objectId", archiveStatus);
router.post("/add/enquiry", addEnquiry);
router.get("/enquiry/archive/:objectId", getArchiveEnquiryByObjectId);
router.get("/property/enquiry/:property_id", getEnquiryByPropertyId);
router.get(
  "/property/archive/enquiry/:property_id",
  getArchiveEnquiryByPropertyId
);

//? Property Route
const propertyUpload = upload.fields([
  { name: "property_logo", maxCount: 1 },
  { name: "featured_image", maxCount: 1 },
]);
router.get("/property", getProperty);
router.post("/property", Authorize, propertyUpload, processImage, addProperty);
router.patch(
  "/property/:objectId",
  Authorize,
  propertyUpload,
  processImage,
  updateProperty
);
router.patch(
  "/property/images/:objectId",
  Authorize,
  propertyUpload,
  processImage,
  updatePropertyImages
);
router.delete("/property/:objectId", Authorize, deleteProperty);
router.get("/property/uniqueId/:uniqueId", getPropertyByUniqueId);
router.get("/property/userId/:userId", getPropertyByUserId);
router.get("/property/:objectId", getPropertyById);
router.get("/property/slug/:property_slug", getPropertyBySlug);
router.post("/property/multi/objectId", getPropertiesMultipleObjectId);

//? Property Verification
router.post("/property/verify/email", sendPropertyVerifyEmailOTP);
router.post("/property/verify/email/otp", PropertyVerifyEmailOtpMatch);
router.post(
  "/property/verify/consent/:userId",
  PropertyConsentAndUserRoleUpdation
);

//? Location Route
router.patch("/property/location/:property_id", Authorize, UpdateLocation);
router.get("/property/location/:property_id", getLocation);
router.get("/locations", getAllLocations);
router.post("/location", Authorize, addLocation);

//? Teacher Route
const teacherProfile = upload.fields([{ name: "profile", maxCount: 1 }]);
router.get("/teacher", getTeacher);
router.post("/teacher", Authorize, teacherProfile, processImage, addTeacher);
router.patch(
  "/teacher/:objectId",
  Authorize,
  teacherProfile,
  processImage,
  updateTeacher
);
router.delete("/teacher/:objectId", Authorize, deleteTeacher);
router.get("/teacher/:objectId", getTeacherById);
router.get("/teacher/property/:propertyId", getTeacherByPropertyId);

//? Accomodation Route
const accomodationUpload = upload.fields([{ name: "images", maxCount: 8 }]);
router.post("/accomodation", Authorize, AddAccomodation);
router.get("/accomodation", getAllAccomodation);
router.get("/accomodation/:property_id", getAccomodationByPropertyId);
router.patch("/accomodation/:uniqueId", Authorize, EditAccomodation);
router.patch(
  "/accomodation/images/:uniqueId",
  Authorize,
  accomodationUpload,
  processImage,
  AddAccomodationImages
);
router.post(
  `/accomodation/images/remove/:uniqueId`,
  Authorize,
  removeAccomodationImages
);

//? Scholarship Route
router.get("/scholarship", getAllScholarship);
router.get("/scholarship/:property_id", getScholarshipByPropertyId);
router.post("/scholarship", Authorize, AddScholarship);
router.patch("/scholarship/:objectId", Authorize, EditScholarship);

//? Admission Process Route
router.get("/admission_process", getAllAdmissionProcess);
router.get("/admission_process/:property_id", getAdmissionProcessByPropertyId);
router.post("/admission_process", Authorize, AddAdmissionProcess);
router.patch("/admission_process/:objectId", Authorize, EditAdmissionProcess);

//? Review Route
router.get("/review", getReview);
router.post("/review", Authorize, addReview);
router.patch("/review/:uniqueId", Authorize, updateReview);
router.delete("/review/:uniqueId", Authorize, deleteReview);
router.get("/review/:uniqueId", getReviewById);
router.get("/review/property/:property_id", getReviewByPropertyId);

//? Gallery Route
const gallery = upload.fields([{ name: "gallery", maxCount: 8 }]);
const galleryUpdate = upload.fields([{ name: "newImages", maxCount: 8 }]);
router.get("/gallery", getGallery);
router.post("/gallery", Authorize, gallery, processImage, addGallery);
router.patch(
  "/gallery/:uniqueId",
  Authorize,
  galleryUpdate,
  processImage,
  updateGallery
);
router.delete("/gallery/:uniqueId", Authorize, deleteGallery);
router.get("/gallery/:uniqueId", getGalleryById);
router.get("/property/gallery/:propertyId", getGalleryByPropertyId);
router.post(
  "/gallery/add/:uniqueId",
  Authorize,
  gallery,
  processImage,
  addNewGalleryImages
);
router.post("/gallery/remove/:uniqueId", Authorize, removeGalleryImages);
router.patch("/gallery/update/title", Authorize, EditGalleryTitle);

//? Faqs Route
router.get("/faqs", getFaq);
router.post("/faqs", Authorize, addFaq);
router.patch("/faqs/:uniqueId", Authorize, updateFaq);
router.delete("/faqs/:uniqueId", Authorize, deleteFaq);
router.get("/faqs/:uniqueId", getFaqById);
router.get("/property/faq/:propertyId", getFaqByPropertyId);

//? Seo Route
router.get("/property/seo", getPropertySeo);
router.post("/property/seo", Authorize, addPropertySeo);
router.patch("/property/seo/:objectId", Authorize, updatePropertySeo);
router.delete("/property/seo/:objectId", Authorize, deletePropertySeo);
router.get("/property/seo/:objectId", getPropertySeoById);
router.get("/property/seo/property/:property_id", getPropertySeoByPropertyId);

//? Property Course
router.get("/property-course", getPropertyCourse);
router.post("/property-course", Authorize, addPropertyCourse);
router.patch(
  "/property-course/:objectId",
  Authorize,
  courseUpload,
  updatePropertyCourse
);
router.get("/property-course/:objectId", getPropertyCourseById);
router.get("/property-course/uniqueId/:uniqueId", getPropertyCourseByUniqueId);
router.get(
  "/property/property-course/:propertyId",
  getPropertyCourseByPropertyId
);
router.delete("/property-course/:objectId", Authorize, deletePropertyCourse);

//? amenties
router.post("/amenities", Authorize, addAmenities);
router.get("/amenities", getAmenities);
router.get("/property/amenities/:propertyId", getAmenitiesByPropertyId);
router.put("/amenities/:uniqueId", Authorize, updateAmenities);

//? Legal Routes
router.get("/legal", getLegal);
router.patch("/legal", Authorize, addOrUpdateLegal);

//? Blog Routes
const blogUpload = blogUploadMulter.fields([
  { name: "featured_image", maxCount: 1 },
]);
router.get("/blog", getAllBlogs);
router.get("/blog/seo/:slug", getBlogWithSeoBySlug);
router.post("/blog", Authorize, blogUpload, processImage, CreateBlog);
router.delete("/blog/:objectId", Authorize, deleteBlog);
router.get("/blog/:objectId", getBlogById);
router.get("/blog/id/:uniqueId", getBlogByUniqueId);
router.patch(
  "/blog/:objectId",
  Authorize,
  blogUpload,
  processImage,
  UpdateBlog
);

//? Blog Enquiry
router.post("/blog/create/enquiry", Authorize, createBlogEnquiry);

//? All Seo Routes
router.post(`/all/seo`, Authorize, CreateAllSeo);
router.get(`/all/seo`, getAllSeo);
router.get(`/seo/:type/:type_id`, getSeoByTypeId);

//? Blog Category Routes
router.get("/blog/category/all", getAllBlogCategories);
router.get("/blog/category/id/:objectId", getBlogCategoryById);
router.post("/blog/category", Authorize, createBlogCategory);
router.patch("/blog/category/:objectId", Authorize, updateBlogCategory);
router.delete("/blog/category/:objectId", Authorize, deleteBlogCategory);

router.get("/blog/tag/all", getAllBlogTags);
router.get("/blog/tag/id/:objectId", getBlogTagById);
router.post("/blog/tag", Authorize, CreateTagController);
router.patch("/blog/tag/:objectId", Authorize, updateBlogTag);

router.post(`/key-outcome`, Authorize, CreateKeyOutComeController);
router.get(`/key-outcome/all`, getAllKeyOutComes);
router.get(`/key-outcome/id/:objectId`, getKeyOutComeById);
router.patch(`/key-outcome/:objectId`, Authorize, updateKeyOutCome);

router.post(`/requirment`, Authorize, CreateRequirmentController);
router.get(`/requirment/all`, getAllRequirments);
router.get(`/requirment/id/:objectId`, getRequirmentById);
router.patch(`/requirment/:objectId`, Authorize, updateRequirment);

//? Property SLug
router.patch(`/property/slug/generate`, PropertySlugGenerator);

//? News and Updates Routes
const newsUpload = newsUploadMulter.fields([
  { name: "featured_image", maxCount: 10 },
  { name: "host_image", maxCount: 1 },
  { name: "partner_logos", maxCount: 10 },
]);

router.post(
  "/news-and-updates",
  Authorize,
  newsUpload,
  processImage,
  createNewsAndUpdates
);
router.patch(
  "/news-and-updates/:objectId",
  Authorize,
  newsUpload,
  processImage,
  updateNewsAndUpdates
);
router.get("/news-and-updates", getAllNewsAndUpdates);
router.get("/news-and-updates/seo/:slug", getNewsAndUpdatesWithSeoBySlug);
router.get("/news-and-updates/:objectId", getNewsAndUpdatesByObjectId);
router.delete("/news-and-updates/:objectId", Authorize, deleteNewsAndUpdates);

const verificationDoc = filesUpload.fields([
  { name: "business_identity_proof" },
  { name: "location_proof" },
]);
router.post(
  "/property/verification/upload/doc",
  Authorize,
  verificationDoc,
  uploadPropertyVerificationDocs
);
router.get(
  "/property/verification/doc/:property_id",
  Authorize,
  getPropertyVerifcationDoc
);

//? Related Properties
router.get(
  `/related/property/course/:property_course_id`,
  getPropertyRelatedToPropertyCourse
);

export default router;
