import bodyParser from "body-parser";
import express from "express";
import {
  generatePropertyScores,
  getAllPropertyScore,
  getPropertyScoreById,
} from "../analytic-controller/PropertyScoreController.js";
import { getSeoScoreById } from "../analytic-controller/SeoScoreController.js";
import {
  createOrUpdateTraffic,
  getTrafficByPropertyId,
} from "../analytic-controller/TrafficController.js";
import { getEnquiryCountByPropertyId } from "../analytic-controller/EnquiryCountController.js";
import {
  AssignRankToAllProperties,
  getAllRanks,
  getRankByPropertyId,
} from "../analytic-controller/RankController.js";
import {
  addSearch,
  getAllSearchAppearence,
  getAllSearches,
  getSearchesById,
} from "../analytic-controller/SearchController.js";
import {
  AddCompare,
  getAllCompare,
  getCompareAnalytics,
} from "../analytic-controller/CompareModal.js";
import {
  deleteFeedbackById,
  getAllFeedbacks,
  getFeedbackById,
  getFeedbackByUserId,
  giveFeedback,
  UpdateStatusByObjectId,
} from "../analytic-controller/FeedbackController.js";
import {
  CloseSupportChat,
  DeleteSupportQuery,
  getSupportWithMessages,
  getUnreadMessages,
  getUserSupportByObjectId,
  getUserSupportQueries,
  getUserSupportQueriesById,
  sendSupportMessage,
  startSupportQuery,
  updateMessageIsViewed,
  updateSupportStatus,
} from "../analytic-controller/SupportController.js";
import { SupportFilesUploadMulter } from "../multer/index.js";
import {
  getSupportFeedbackBySupportId,
  giveSupportFeedback,
} from "../analytic-controller/SupportFeedbackController.js";
import Authorize from "../utils/Authorization.js";

const analyticRouter = express.Router();
analyticRouter.use(bodyParser.json());
analyticRouter.use(bodyParser.urlencoded({ extended: true }));

analyticRouter.get("/analytics/rank/all", AssignRankToAllProperties);
//? Property Score
analyticRouter.get("/property/all/score", Authorize, getAllPropertyScore);
analyticRouter.post("/property/all/score", generatePropertyScores);
analyticRouter.get(
  "/property/score/:property_id",
  Authorize,
  getPropertyScoreById
);

//? SEO Score
analyticRouter.get(
  "/property/seo/score/:property_id",
  Authorize,
  getSeoScoreById
);

//?Traffic Score
analyticRouter.post(`/property/traffic`, createOrUpdateTraffic);
analyticRouter.get(
  `/property/traffic/:property_id`,
  Authorize,
  getTrafficByPropertyId
);

//?Enquire Score
analyticRouter.get(
  `/property/enquiry/count/:property_id`,
  Authorize,
  getEnquiryCountByPropertyId
);

//? Ranks
analyticRouter.get(`/property/rank/:property_id`, getRankByPropertyId);
analyticRouter.get(`/ranks`, getAllRanks);

//? Search
analyticRouter.post(`/search`, addSearch);
analyticRouter.get(`/search`, Authorize, getAllSearches);
analyticRouter.get(`/search/:objectId`, Authorize, getSearchesById);
analyticRouter.get(
  `/search/appearences/all`,
  Authorize,
  getAllSearchAppearence
);

//? Compare
analyticRouter.post(`/compare`, AddCompare);
analyticRouter.get(`/compare/analytic/:property_id`, getCompareAnalytics);
analyticRouter.get(`/compare`, getAllCompare);

//? feedback
analyticRouter.post(`/give-feedback`, Authorize, giveFeedback);
analyticRouter.get(`/feedback`, Authorize, getAllFeedbacks);
analyticRouter.delete(`/feedback/:objectId`, Authorize, deleteFeedbackById);
analyticRouter.get(`/feedback/:objectId`, Authorize, getFeedbackById);
analyticRouter.get(`/feedback/user/:userId`, Authorize, getFeedbackByUserId);
analyticRouter.patch(
  `/feedback/:objectId/status`,
  Authorize,
  UpdateStatusByObjectId
);

//? support
const supportMulter = SupportFilesUploadMulter.fields([{ name: "files" }]);
analyticRouter.post("/support", Authorize, supportMulter, startSupportQuery);
analyticRouter.patch(
  "/support/update/view/:userId/:supportId",
  Authorize,
  updateMessageIsViewed
);
analyticRouter.get("/support/get/unread", Authorize, getUnreadMessages);
analyticRouter.get("/support", Authorize, getUserSupportQueries);
analyticRouter.get(
  "/support/user/:userId",
  Authorize,
  getUserSupportQueriesById
);
analyticRouter.get("/support/:objectId", Authorize, getUserSupportByObjectId);
analyticRouter.get(
  "/support/chats/:objectId",
  Authorize,
  getSupportWithMessages
);
analyticRouter.patch(
  "/support/close/chat/:objectId",
  Authorize,
  CloseSupportChat
);
analyticRouter.delete(
  "/support/delete/chat/:supportId",
  Authorize,
  DeleteSupportQuery
);
analyticRouter.post(
  "/support/chats/:objectId/message",
  Authorize,
  supportMulter,
  sendSupportMessage
);
analyticRouter.patch(
  "/support/:objectId/status",
  Authorize,
  updateSupportStatus
);

//? Support Feedback
analyticRouter.post(`/feedback/support/give`, Authorize, giveSupportFeedback);
analyticRouter.get(
  `/feedback/support/:supportId`,
  Authorize,
  getSupportFeedbackBySupportId
);

export default analyticRouter;
