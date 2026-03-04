export const isAdmin = (req, res, next) => {
  if (!req.session.user_id || req.session.role !== "admin") {
    return res.status(403).send("Access Denied");
  }
  next();
};

