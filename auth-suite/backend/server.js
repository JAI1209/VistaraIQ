const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;

const User = require("./models/user");
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.DB_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

if (!MONGO_URI) {
  throw new Error("DB_URI is required in environment variables");
}

const allowedOrigins = (process.env.CORS_ORIGIN || FRONTEND_URL)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error("Google account email not available"));

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: profile.displayName || email.split("@")[0],
            email,
            password: Math.random().toString(36).repeat(2),
            role: "USER",
            isVerified: true,
            oauthProviders: { googleId: profile.id },
          });
        } else if (!user.oauthProviders?.googleId) {
          user.oauthProviders.googleId = profile.id;
          user.isVerified = true;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/github/callback",
      scope: ["user:email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.find((entry) => !!entry.value)?.value?.toLowerCase();
        if (!email) return done(new Error("GitHub account email not available"));

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username || email.split("@")[0],
            email,
            password: Math.random().toString(36).repeat(2),
            role: "USER",
            isVerified: true,
            oauthProviders: { githubId: profile.id },
          });
        } else if (!user.oauthProviders?.githubId) {
          user.oauthProviders.githubId = profile.id;
          user.isVerified = true;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

app.use(passport.initialize());
app.use("/api/auth", authRoutes(passport));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "vistaraiq-auth" });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ message });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Auth API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
