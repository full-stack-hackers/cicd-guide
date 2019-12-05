module.exports.renderIndexPage = function(req, res, next) {
  res.render('index', { title: 'Express' });
}