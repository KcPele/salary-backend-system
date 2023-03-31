"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../middleware");
const team_1 = require("../controllers/team");
const router = express_1.default.Router();
//get all teams
router.get("/", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["read"]), team_1.getAllTeams);
//get a particular team by team id
router.get("/:teamId", middleware_1.tokenMiddleware, team_1.getTeam);
//get a particular team by lead id
router.get("/lead/:leadId", middleware_1.tokenMiddleware, team_1.getTeamByLead);
//get a particular team by member id
router.get("/member/:memberId", middleware_1.tokenMiddleware, team_1.getTeamByMember);
//create a new team
router.post("/", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["create"]), team_1.createTeam);
//update team base on team id
router.put("/:teamId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["edit"]), team_1.updateTeam);
//remove a  memeber from a team by member id
router.delete("/:teamId/member/:memberId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["delete"]), team_1.deleteTeamMember);
//delete team base on team id
router.delete("/:teamId", middleware_1.tokenMiddleware, (0, middleware_1.permissionMiddleware)(["delete"]), team_1.deleteTeam);
exports.default = router;
//# sourceMappingURL=team.js.map