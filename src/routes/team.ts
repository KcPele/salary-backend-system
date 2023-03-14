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

router.get("/", tokenMiddleware, permissionMiddleware(["read"]), getAllTeams);

router.get(
  "/:teamId",
  tokenMiddleware,

  getTeam
);
router.get(
  "/lead/:leadId",
  tokenMiddleware,

  getTeamByLead
);
router.get(
  "/member/:memberId",
  tokenMiddleware,

  getTeamByMember
);
router.post("/", tokenMiddleware, createTeam);
router.put(
  "/:teamId",
  tokenMiddleware,

  updateTeam
);

router.delete(
  "/:teamId/member/:memberUserId",
  tokenMiddleware,

  deleteTeamMember
);
router.delete(
  "/:teamId",
  tokenMiddleware,

  deleteTeam
);

export default router;
