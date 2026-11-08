
import express from "express";

import { getSubjects } from "../controllers/subjects.js";
import {
  getSessions,
  createSession
} from "../controllers/sessions.js";

const router = express.Router();

router.get("/subjects", getSubjects);
router.get("/sessions", getSessions);
router.post("/sessions", createSession);

export default router;
