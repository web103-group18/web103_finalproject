
import express from "express";

import { getSubjects } from "../controllers/subjects.js";

import {
  getSessions,
  createSession,
  updateSession
} from "../controllers/sessions.js";

const router = express.Router();

router.get("/subjects", getSubjects);

router.get("/sessions", getSessions);

router.post("/sessions", createSession);

router.put("/sessions/:id", updateSession);

export default router;
