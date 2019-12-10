var express = require('express');
var router = express.Router();
const controllers = require('../controllers');

/* GET home page. */
router.get('/', controllers.home.renderIndexPage);

/* GET users listing. */
router.get('/users', controllers.users.getAllUsers);

module.exports = router;
