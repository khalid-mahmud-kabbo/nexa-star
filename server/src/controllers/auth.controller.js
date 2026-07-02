const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, ref } = req.body;
  const result = await authService.registerUser({ name, email, password, ref });
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });
  res.json(result);
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user, { name: req.body.name });
  res.json({ user });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user, req.body);
  res.json({ ok: true });
});

module.exports = { register, login, me, updateMe, changePassword };
