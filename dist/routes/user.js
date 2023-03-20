"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const middleware_1 = require("../middleware");
const user_2 = require("../controllers/user");
const privateKey = process.env.PRIVATE_KEY;
const router = express_1.default.Router();
router.get("/", (0, express_async_handler_1.default)(async (req, res) => {
    const users = await user_1.default.find({}).select("-password");
    res.status(200).json(users);
}));
router.get("/:userId", (0, express_async_handler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const users = await user_1.default.findById(userId)
        .populate("permission")
        .select("-password");
    res.status(200).json(users);
}));
router.post("/login", (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const user = await user_1.default.findOne({ email });
    if (!user) {
        res.status(400).json({ error: "Wrong credentials please try again" });
    }
    else {
        const comparedPass = await bcrypt_1.default.compare(password, user.password);
        if (!comparedPass) {
            res.status(400).json({ error: "Wrong credentials please try again" });
        }
        else {
            const token = jsonwebtoken_1.default.sign({ _id: user._id }, privateKey, {
                expiresIn: 60 * 60 * 48,
            });
            res.status(200).json({ _id: user._id, email: user.email, token });
        }
    }
}));
router.post("/register", middleware_1.upload.single("file"), user_2.createNewUser);
router.post("/forgot-password", middleware_1.tokenMiddleware, user_2.forgotPassword);
router.post("/reset-password/:resetToken", user_2.resetPassword);
router.put("/:userId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["edit"]), middleware_1.upload.single("file"), user_2.updateUser);
router.delete("/:userId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["edit"]), user_2.deleteUser);
exports.default = router;
//# sourceMappingURL=user.js.map