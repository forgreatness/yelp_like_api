const router = require('express').Router();

const validation = require('../lib/validation.js');
const { ReviewSchema } = require('../models/review.js');

var reviews = require('../data/reviews.json');

module.exports = router;

router.get('/', (req, res, next) => {
    var page = parseInt(req.query.page) || 1;
    var numPerPage = 10;
    var lastPage = Math.ceil(reviews.length / numPerPage);

    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;

    var start = (page - 1) * numPerPage;
    var end = start + numPerPage;
    var pagedReviews = reviews.slice(start, end);

    var links = {};
    if (page > 1) {
        links.firstPage = '/reviews/?page=1';
        links.prevPage = '/reviews/?page=' + (page - 1);
    } 
    if (page < lastPage) {
        links.nextPage = '/reviews/?page=' + (page + 1);
        links.lastPage = '/reviews/?page=' + lastPage;
    }

    res.status(200).json({
        reviews: pagedReviews,
        pageNumber: page,
        totalPages: lastPage,
        pageSize: numPerPage,
        totalCount: reviews.length,
        links: links
    });
});

router.get('/:reviewID', (req, res, next) => {
    const reviewID = parseInt(req.params.reviewID);

    if (reviews[reviewID]) {
        res.status(200).json(reviews[reviewID]);
    } else {
        next();
    }
});

router.put('/:reviewID', (req, res, next) => {
    const reviewID = parseInt(req.params.reviewID);

    if (reviews[reviewID]) {
        if (validation.validateAgainstSchema(req.body, ReviewSchema)) {
            const updatedReview = validation.extractValidFields(req.body, ReviewSchema);
            updatedReview.businessID = reviews[reviewID].businessID;
            reviews[reviewID] = updatedReview;
            res.status(200).json(reviews[reviewID]);
        } else {
            res.status(400).json({
                err: "Request does not contain a body with an appropriate Review Schema"
            });
        }
    } else {
        next();
    }
});

router.patch('/:reviewID', (req, res, next) => {
    const reviewID = parseInt(req.params.reviewID);

    if (reviews[reviewID]) {
        if (req.body && Object.keys(ReviewSchema).some(field => req.body[field])) {
            const updatedReview = validation.extractValidFields(req.body, ReviewSchema);
            Object.keys(updatedReview).every(
                field => reviews[reviewID][field] = updatedReview[field]
            );
            res.status(200).json(reviews[reviewID]);
        } else {
            res.status(400).json({
                err: "Request does not contain a body with at least one attribute that match the business schema"
            });
        }
    } else {
        next();
    }
});

router.delete('/:reviewID', (req, res, next) => {
    const reviewID = parseInt(req.params.reviewID);

    if (reviews[reviewID]) {
        reviews[reviewID] = null;
        res.status(204).end();
    } else {
        next();
    }
});