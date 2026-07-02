const asyncHandler = require('../utils/asyncHandler');

const ping = asyncHandler(async (req, res) => {
  res.json({ ok: true, message: 'pong', usage: req.usage });
});

module.exports = { ping };
