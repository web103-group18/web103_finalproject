
import express from "express";

import { getSubjects } from "../controllers/subjects.js";

import {
  getSessions,
  createSession,
  updateSession,
  joinSession,
  cancelSession,
  getMySessions
} from "../controllers/sessions.js";

const router = express.Router();


router.get("/subjects", getSubjects);

router.get("/sessions", getSessions);

router.post("/sessions", createSession);

router.put("/sessions/:id", updateSession);

router.post("/sessions/:id/join", joinSession);
router.patch("/sessions/:id/cancel", cancelSession);
router.get("/my-sessions", getMySessions);

export default router;
