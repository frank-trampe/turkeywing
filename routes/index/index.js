'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function(request, response) {
	response.render('index.html');
});


router.get('/profile', function(req, res) {

	res.render('profile.html');
})

module.exports = router;