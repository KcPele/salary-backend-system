"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../middleware");
const activity_1 = require("../controllers/activity");
const router = express_1.default.Router();
router.get("/", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["read"]), activity_1.getAllActivities);
router.get("/:activityId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["read"]), activity_1.getActivity);
router.get("/user/:userId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["read"]), activity_1.getUserActivity);
router.post("/", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["create"]), activity_1.createActivity);
router.delete("/:activityId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["delete"]), activity_1.deleteActivity);
exports.default = router;
//# sourceMappingURL=activity.js.map