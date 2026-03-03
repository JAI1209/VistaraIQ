const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const User = require("../models/user");
const { authMiddleware } = require("../middleware/authMiddleware");
const { sendVerificationEmail, sendResetPasswordEmail } = require("../utils/emailService");

const ACCESS_SECRET = process.env.JWT_SECRET || "";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "USER", "HOSTER"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const verifyEmailSchema = z.object({ token: z.string().min(20) });
const forgotPasswordSchema = z.object({ email: z.string().email() });
const resetPasswordSchema = z.object({ token: z.string().min(20), password: z.string().min(8) });

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, ACCESS_SECRET, { expiresIn: "15m" });
}

function createRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString() }, REFRESH_SECRET, { expiresIn: "7d" });
}

function getCookieOptions(maxAgeMs) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: maxAgeMs,
  };
}

function parseBody(req) {
  return Promise.resolve(req.body ?? {});
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken", { ...getCookieOptions(0), maxAge: undefined });
  res.clearCookie("refreshToken", { ...getCookieOptions(0), maxAge: undefined });
}

module.exports = function buildAuthRouter(passport) {
  const router = express.Router();

  router.post("/register", async (req, res) => {
    try {
      const body = await parseBody(req);
      const parsed = registerSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      }

      const email = parsed.data.email.toLowerCase();
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: "User already exists" });
      }

      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenHash = hashToken(verificationToken);

      const user = await User.create({
        name: parsed.data.name,
        email,
        password: parsed.data.password,
        role: parsed.data.role || "USER",
        isVerified: false,
        verificationTokenHash,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await sendVerificationEmail(user.email, verificationToken);

      const dbUser = await User.findById(user._id).select("+refreshTokenHash +refreshTokenExpires");
      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);

      dbUser.refreshTokenHash = hashToken(refreshToken);
      dbUser.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await dbUser.save();

      setAuthCookies(res, accessToken, refreshToken);

      return res.status(201).json({
        message: "Registration successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const body = await parseBody(req);
      const parsed = loginSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      }

      const email = parsed.data.email.toLowerCase();
      const user = await User.findOne({ email }).select("+password +refreshTokenHash +refreshTokenExpires");
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const match = await user.comparePassword(parsed.data.password);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);

      user.refreshTokenHash = hashToken(refreshToken);
      user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await user.save();

      setAuthCookies(res, accessToken, refreshToken);

      return res.json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

  router.post("/refresh-token", async (req, res) => {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) {
        return res.status(401).json({ message: "Refresh token missing" });
      }

      const decoded = jwt.verify(token, REFRESH_SECRET);
      const user = await User.findById(decoded.sub).select("+refreshTokenHash +refreshTokenExpires");

      if (!user || !user.refreshTokenHash || !user.refreshTokenExpires) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const incomingHash = hashToken(token);
      if (incomingHash !== user.refreshTokenHash || user.refreshTokenExpires.getTime() < Date.now()) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const nextAccess = createAccessToken(user);
      const nextRefresh = createRefreshToken(user);

      user.refreshTokenHash = hashToken(nextRefresh);
      user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await user.save();

      setAuthCookies(res, nextAccess, nextRefresh);
      return res.json({ message: "Token refreshed" });
    } catch (_error) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
  });

  router.post("/logout", authMiddleware, async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.user._id, {
        $set: { refreshTokenHash: null, refreshTokenExpires: null },
      });
      clearAuthCookies(res);
      return res.json({ message: "Logged out" });
    } catch (_error) {
      clearAuthCookies(res);
      return res.json({ message: "Logged out" });
    }
  });

  router.post("/verify-email", async (req, res) => {
    try {
      const parsed = verifyEmailSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid token payload" });
      }

      const tokenHash = hashToken(parsed.data.token);
      const user = await User.findOne({
        verificationTokenHash: tokenHash,
        verificationTokenExpires: { $gt: new Date() },
      }).select("+verificationTokenHash +verificationTokenExpires");

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      user.isVerified = true;
      user.verificationTokenHash = null;
      user.verificationTokenExpires = null;
      await user.save();

      return res.json({ message: "Email verified successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

  router.post("/resend-verification", async (req, res) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid email" });
      }

      const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select("+verificationTokenHash +verificationTokenExpires");
      if (!user) {
        return res.json({ message: "If your email exists, a verification link has been sent" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      user.verificationTokenHash = hashToken(token);
      user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      await sendVerificationEmail(user.email, token);
      return res.json({ message: "Verification email sent" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

  router.post("/forgot-password", async (req, res) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid email" });
      }

      const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select("+resetPasswordTokenHash +resetPasswordTokenExpires");
      if (!user) {
        return res.json({ message: "If your email exists, reset instructions have been sent" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordTokenHash = hashToken(token);
      user.resetPasswordTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      await sendResetPasswordEmail(user.email, token);
      return res.json({ message: "If your email exists, reset instructions have been sent" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

  router.post("/reset-password", async (req, res) => {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      }

      const tokenHash = hashToken(parsed.data.token);
      const user = await User.findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordTokenExpires: { $gt: new Date() },
      }).select("+resetPasswordTokenHash +resetPasswordTokenExpires +password");

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      user.password = parsed.data.password;
      user.resetPasswordTokenHash = null;
      user.resetPasswordTokenExpires = null;
      await user.save();

      return res.json({ message: "Password reset successful" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

  router.get("/me", authMiddleware, async (req, res) => {
    return res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified,
      },
    });
  });

  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

  router.get("/google/callback", (req, res, next) => {
    passport.authenticate("google", { session: false }, async (err, user) => {
      if (err || !user) {
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_google_failed`);
      }

      const dbUser = await User.findById(user._id).select("+refreshTokenHash +refreshTokenExpires");
      const accessToken = createAccessToken(dbUser);
      const refreshToken = createRefreshToken(dbUser);

      dbUser.refreshTokenHash = hashToken(refreshToken);
      dbUser.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await dbUser.save();

      setAuthCookies(res, accessToken, refreshToken);
      return res.redirect(`${FRONTEND_URL}/auth/success`);
    })(req, res, next);
  });

  router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));

  router.get("/github/callback", (req, res, next) => {
    passport.authenticate("github", { session: false }, async (err, user) => {
      if (err || !user) {
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_github_failed`);
      }

      const dbUser = await User.findById(user._id).select("+refreshTokenHash +refreshTokenExpires");
      const accessToken = createAccessToken(dbUser);
      const refreshToken = createRefreshToken(dbUser);

      dbUser.refreshTokenHash = hashToken(refreshToken);
      dbUser.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await dbUser.save();

      setAuthCookies(res, accessToken, refreshToken);
      return res.redirect(`${FRONTEND_URL}/auth/success`);
    })(req, res, next);
  });

  return router;
};
