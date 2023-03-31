import express from "express";

import { permissionMiddleware, tokenMiddleware } from "../middleware";
import {
  createTeam,
  getAllTeams,
  getTeam,
  getTeamByLead,
  getTeamByMember,
  updateTeam,
  deleteTeam,
  deleteTeamMember,
} from "../controllers/team";
const router = express.Router();

//get all teams
router.get("/", tokenMiddleware, permissionMiddleware(["read"]), getAllTeams);

//get a particular team by team id
router.get("/:teamId", tokenMiddleware, getTeam);

//get a particular team by lead id
router.get("/lead/:leadId", tokenMiddleware, getTeamByLead);

//get a particular team by member id
router.get("/member/:memberId", tokenMiddleware, getTeamByMember);

//create a new team
router.post("/", tokenMiddleware, permissionMiddleware(["create"]), createTeam);

//update team base on team id
router.put(
  "/:teamId",
  tokenMiddleware,
  permissionMiddleware(["edit"]),
  updateTeam
);

//remove a  memeber from a team by member id
router.delete(
  "/:teamId/member/:memberId",
  tokenMiddleware,
  permissionMiddleware(["delete"]),
  deleteTeamMember
);

//delete team base on team id
router.delete(
  "/:teamId",
  tokenMiddleware,
  permissionMiddleware(["delete"]),
  deleteTeam
);

export default router;
