var express = require('express');
var passport = require('passport');
var router = express.Router();
var moment = require('moment');
/* GET users listing. */
router.get('/', function (req, res) {
    let dateString = moment().format('YYYY-MM-DD HH:m:ss');
    res.json({
    	msg: 'API is running as on '+dateString
    });
});

module.exports = router;
