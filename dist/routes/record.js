"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const record_1 = require("../controllers/record");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
router.get("/", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["read"]), record_1.getAllRecords);
router.get("/:recordId", middleware_1.tokenMiddleware, record_1.getRecord);
router.get("/user/:userId", middleware_1.tokenMiddleware, record_1.getUserRecords);
router.post("/", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["create"]), record_1.createRecord);
router.put("/:recordId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["edit"]), record_1.updateRecord);
router.delete("/:recordId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["delete"]), record_1.deleteRecord);
exports.default = router;
//# sourceMappingURL=record.js.map