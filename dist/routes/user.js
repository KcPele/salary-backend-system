"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_1 = __importDefault(require("../models/user"));
const middleware_1 = require("../middleware");
const user_2 = require("../controllers/user");
const router = express_1.default.Router();
//get all users
router.get("/", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["read"]), (0, express_async_handler_1.default)(async (req, res) => {
    const users = await user_1.default.find({}).select("-password").sort("-createdAt");
    res.status(200).json(users);
}));
//get a particular user
router.get("/:userId", (0, express_async_handler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const users = await user_1.default.findById(userId)
        .populate("permission")
        .select("-password");
    res.status(200).json(users);
}));
// login route to generate user token
router.post("/login", user_2.loginUser);
//create a user
router.post("/register", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["create"]), middleware_1.upload.single("file"), user_2.createNewUser);
//creating admin once.
router.post("/register/chainlor-inmda", middleware_1.upload.single("file"), user_2.createNewUser);
// password reset
router.post("/change-password", middleware_1.tokenMiddleware, user_2.changePassword);
router.post("/forgot-password", middleware_1.tokenMiddleware, user_2.forgotPassword);
router.post("/reset-password/:resetToken", user_2.resetPassword);
//update user
router.put("/:userId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["edit"]), middleware_1.upload.single("file"), user_2.updateUser);
//revert a user permission
router.delete("/:userId/:permissionId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["edit"]), user_2.revokePermission);
//delete a user
router.delete("/:userId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["delete"]), user_2.deleteUser);
exports.default = router;
//# sourceMappingURL=user.js.map