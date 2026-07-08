/**
 * AdminUser Model — used by the /content/admin CMS
 *
 * Stores admin credentials with bcrypt-hashed passwords.
 * The very first admin user must be created via a seed script or
 * directly in MongoDB Atlas.
 */

const mongoose = require('mongoose')

const AdminUserSchema = new mongoose.Schema(
  {
    // Username or email — the identifier used to sign in
    username: {
      type: String,
      required: [true, 'Username/email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Username cannot exceed 100 characters'],
    },

    // bcrypt hash of the password — never store plain text!
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
)

module.exports =
  mongoose.models.CMSAdminUser ||
  mongoose.model('CMSAdminUser', AdminUserSchema)
