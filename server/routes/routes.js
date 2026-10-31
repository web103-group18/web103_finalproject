import express from "express"

// controllers
import { getSubjects } from "../controllers/subjects.js"

const router = express.Router()

router.get("/subjects", getSubjects)





export default router