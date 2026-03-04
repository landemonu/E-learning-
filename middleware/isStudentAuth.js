export const isStudentAuth = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};


export default isStudentAuth;
 