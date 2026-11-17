import "dotenv/config"
import { pool } from "./config/database.js"
import authRoutes from "./routes/auth.js"
import { GitHub } from "./config/auth.js"
import router from "./routes/routes.js"
import session from "express-session"
import passport from "passport"
import express from "express"
import cors from "cors"

const PORT = process.env.PORT || 3001;
const app = express()

app.use(express.json())
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  }),
)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
)

app.use(passport.initialize())
app.use(passport.session())
passport.use(GitHub);
app.use("/auth", authRoutes)

passport.serializeUser((user, done) => {
  done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      `SELECT id, github_id, username, display_name, avatar_url, email
       FROM users WHERE id = $1`,
      [id]
    )
    done(null, result.rows[0] || false)
  } catch (error) {
    done(error)
  }
});

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
