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
router.post("/", tokenMiddleware, permissionMiddleware(["create"]), createTeam);
router.put(
  "/:teamId",
  tokenMiddleware,
  permissionMiddleware(["edit"]),
  updateTeam
);

router.delete(
  "/:teamId/member/:memberUserId",
  tokenMiddleware,
  permissionMiddleware(["delete"]),
  deleteTeamMember
);
router.delete(
  "/:teamId",
  tokenMiddleware,
  permissionMiddleware(["delete"]),
  deleteTeam
);

export default router;
