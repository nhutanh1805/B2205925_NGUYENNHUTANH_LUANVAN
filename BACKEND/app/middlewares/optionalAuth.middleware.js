const jwt = require("jsonwebtoken");

// Giống authMiddleware nhưng KHÔNG bắt buộc phải đăng nhập.
// Có token hợp lệ → gắn req.user. Không có/token sai → vẫn cho qua (khách vãng lai).
function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    // Token sai/hết hạn → coi như chưa đăng nhập, KHÔNG chặn request
  }

  next();
}

module.exports = optionalAuthMiddleware;