const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/jwt');

async function registerUser({ name, email, password, ref }) {
  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required.');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  let referredBy = null;
  if (ref) {
    const referrer = await User.findOne({ referralCode: ref.toUpperCase().trim() });
    if (referrer) referredBy = referrer._id;
  }

  const user = new User({ name: name.trim(), email: normalizedEmail, referredBy });
  await user.setPassword(password);
  await user.save();

  return { token: signToken(user._id), user: user.toSafeJSON() };
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new ApiError(400, 'email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !(await user.checkPassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  return { token: signToken(user._id), user: user.toSafeJSON() };
}

async function updateProfile(user, { name }) {
  if (!name || !name.trim()) {
    throw new ApiError(400, 'name is required.');
  }
  user.name = name.trim();
  await user.save();
  return user.toSafeJSON();
}

async function changePassword(user, { currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'currentPassword and newPassword are required.');
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters.');
  }

  const valid = await user.checkPassword(currentPassword);
  if (!valid) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  await user.setPassword(newPassword);
  await user.save();
}

module.exports = { registerUser, loginUser, updateProfile, changePassword };
