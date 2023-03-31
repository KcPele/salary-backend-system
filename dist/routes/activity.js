"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../middleware");
const activity_1 = require("../controllers/activity");
const router = express_1.default.Router();
//get all activities with token and permission
router.get("/", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["read"]), activity_1.getAllActivities);
//get a particular activity
router.get("/:activityId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["read"]), activity_1.getActivity);
//get a user activities
router.get("/user/:userId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["read"]), activity_1.getUserActivity);
//create a new activity
// router.post(
//   "/",
//   tokenMiddleware,
//   permissionMiddleware(["create"]),
//   createActivity
// );
//delete activity base on activity id
router.delete("/:activityId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["delete"]), activity_1.deleteActivity);
exports.default = router;
//# sourceMappingURL=activity.js.map