const router = require('express').Router();

router.use('/businesses', require('./businesses.js'));
router.use('/photos', require('./photos.js'));
router.use('/reviews', require('./reviews.js'));

module.exports = router;
