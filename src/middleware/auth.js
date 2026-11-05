function checkAuth(req, res, next) {
  if (req.session && req.session.adminUser) {
    res.locals.adminUser = req.session.adminUser;
    return next();
  }
  return res.redirect('/admin/login');
}

module.exports = { checkAuth };

