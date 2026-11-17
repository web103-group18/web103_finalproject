import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { pool } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import { GitHub } from "./config/auth.js";
import router from "./routes/routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3001;
const app = express();

// Render sits behind a proxy, so this is needed for secure cookies
if (isProduction) app.set("trust proxy", 1);

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  }),
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(GitHub);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      `SELECT id, github_id, username, display_name, avatar_url, email
       FROM users WHERE id = $1`,
      [id],
    );
    done(null, result.rows[0] || false);
  } catch (error) {
    done(error);
  }
});

app.use("/auth", authRoutes);
app.use("/api", router);

// Serve the built React app (vite builds into server/public)
app.use(express.static(path.join(__dirname, "public")));

// Let React Router handle page URLs like /browse on refresh
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/auth")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
