const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["ADMIN", "USER", "HOSTER"], default: "USER" },
    isVerified: { type: Boolean, default: false },
    refreshTokenHash: { type: String, default: null, select: false },
    refreshTokenExpires: { type: Date, default: null, select: false },
    verificationTokenHash: { type: String, default: null, select: false },
    verificationTokenExpires: { type: Date, default: null, select: false },
    resetPasswordTokenHash: { type: String, default: null, select: false },
    resetPasswordTokenExpires: { type: Date, default: null, select: false },
    oauthProviders: {
      googleId: { type: String, default: null },
      githubId: { type: String, default: null },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function onSave(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
