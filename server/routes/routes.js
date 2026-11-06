import express from "express"

// controllers
import { getSubjects } from "../controllers/subjects.js"
import { getSessions } from "../controllers/sessions.js"

const router = express.Router()

router.get("/subjects", getSubjects)
router.get("/sessions", getSessions)




export default router