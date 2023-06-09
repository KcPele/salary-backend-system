"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../middleware");
const permission_1 = require("../controllers/permission");
const router = express_1.default.Router();
//get all permissions
router.get("/", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["read"]), permission_1.getAllPermission);
//create a new permission
router.post("/", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["create"]), permission_1.createPermission);
//update permission base on permission id
router.put("/:permissionId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["edit"]), permission_1.updatePermission);
//delete permission base on permission id
router.delete("/:permissionId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["delete"]), permission_1.deletePermission);
exports.default = router;
//# sourceMappingURL=permission.js.map