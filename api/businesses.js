const router = require('express').Router();

const validation = require('../lib/validation.js');
const { BusinessSchema } = require('../models/business.js');
const { ReviewSchema } = require('../models/review.js');
const { PhotoSchema } = require('../models/photo.js');


var businesses = require('../data/businesses.json');
var reviews = require('../data/reviews.json');
var photos = require('../data/photos.json');

module.exports = router;

router.get('/', (req, res, next) => {
    var page = parseInt(req.query.page) || 1;
    var numPerPage = 10;
    var lastPage = Math.ceil(businesses.length / numPerPage);

    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;

    var start = (page - 1) * numPerPage;
    var end = start + numPerPage;
    var pagedBusinesses = businesses.slice(start, end);

    var links = {};
    if (page > 1) {
        links.firstPage = '/businesses/?page=1';
        links.prevPage = '/businesses/?page=' + (page - 1);
    }
    if (page < lastPage) {
        links.nextPage = '/businesses/?page=' + (page + 1);
        links.lastPage = '/businesses/?page=' + lastPage;
    }

    res.status(200).json({
        businesses: pagedBusinesses,
        pageNumber: page,
        totalPages: lastPage,
        pageSize: numPerPage,
        totalCount: businesses.length,
        links: links
    });
});

router.post('/', (req, res, next) => {
    if (validation.validateAgainstSchema(req.body, BusinessSchema)) {
        const business = validation.extractValidFields(req.body, BusinessSchema);
        businesses.push(business);
        const id = businesses.length - 1;
        res.status(201).json({
            businessID: id,
            links: {
                business: '/business/' + id
            }
        });
    } else {
        res.status(400).json({
            err: "Request does not contain a body with an appropriate business schema"
        });
    }
});

router.get('/:businessID', (req, res, next) => {
    const businessID = parseInt(req.params.businessID);

    if (businesses[businessID]) {
        res.status(200).json(businesses[businessID]);
    } else {
        next();
    }
});

router.put('/:businessID', (req, res, next) => {
    const businessID = parseInt(req.params.businessID);

    if (businesses[businessID]) {
        if (validation.validateAgainstSchema(req.body, BusinessSchema)) {
            const updatedBusiness = validation.extractValidFields(req.body, BusinessSchema);
            businesses[businessID] = updatedBusiness;
            res.status(200).json(businesses[businessID]);
        } else {
            res.status(400).json({
                err: "Request does not contain a body with an appropriate business schema"
            });
        }
    } else {
        next();
    }
});

router.patch('/:businessID', (req, res, next) => {
    const businessID = parseInt(req.params.businessID);
    const business = businesses[businessID];

    if (business) {
        if (req.body && Object.keys(BusinessSchema).some(field => req.body[field])) {
            const updatedBusiness = validation.extractValidFields(req.body, BusinessSchema);
            Object.keys(updatedBusiness).every(
                field => business[field] = updatedBusiness[field]
            );
            businesses[businessID] = business;
            res.status(200).json(businesses[businessID]);
        } else {
            res.status(400).json({
                err: "Request does not contain a body with at least one attribute that match the business schema"
            });
        }
    } else {
        next();
    }
});

router.delete('/:businessID', (req, res, next) => {
    const businessID = parseInt(req.params.businessID);

    if (businesses[businessID]) {
        businesses[businessID] = null;
        res.status(204).end();
    } else {
        next();
    }
});

router.post('/:businessID/reviews/', (req, res, next) => {
    const businessID = parseInt(req.params.businessID);
    if (businesses[businessID]) {
        if (validation.validateAgainstSchema(req.body, ReviewSchema)) {
            const review = validation.extractValidFields(req.body, ReviewSchema);

            if (!Number.isInteger(review.star)) {
                res.status(400).json({
                    err: "star: " + review.star + " is either not a number or an integer"
                });
                return;
            } else {
                if (parseInt(review.star) < 0 || parseInt(review.star) > 5) {
                    res.status(400).json({
                        err: "star: " + review.star + " is not within the range allow e.g. 0-5"
                    });
                    return;
                }
            }

            if (!Number.isInteger(review.dollar)) {
                res.status(400).json({
                    err: "dollar: " + review.dollar + " is either not a number or an integer"
                });
                return;
            } else {
                if (parseInt(review.dollar) < 1 || parseInt(review.dollar) > 4) {
                    res.status(400).json({
                        err: "dollar: " + review.dollar + " is not within the range allow e.g. 1-4"
                    });
                    return;
                } 
            }                       
        
            // check if the business already have a review
            var existed;
            reviews.forEach(function (review) {
                if (review.businessID == businessID) {
                    res.status(400).json({
                        err: "Resource already have an existing review"
                    });
                    existed = true;
                }                   
            });

            if (!existed) {
                review.businessID = businessID;
                reviews.push(review);
                const id = reviews.length - 1;
                res.status(201).json({
                    reviewID: id,
                    links: {
                        review: '/reviews/' + id
                    }
                }); 
            }                       
        } else {
            res.status(400).json({
                err: "Request does not contain a body with an appropriate Review Schema"
            });
        }
    } else {
        next();
    }
});

router.post('/:businessID/photos/', (req, res, next) => {
    const businessID = parseInt(req.params.businessID);

    if (businesses[businessID]) {
        if (validation.validateAgainstSchema(req.body, PhotoSchema)) {
            var photo = validation.extractValidFields(req.body, PhotoSchema);
            photo.businessID = businessID;
            photos.push(photo);
            const id = photos.length - 1;
            res.status(201).json({
                photoID: id,
                links: {
                    photo: '/photos/' + id
                }
            });
        } else {
            res.status(404).json({
                err: "Request does not contain a body with an appropriate Photo Schema"
            });
        }
    } else {
        next();
    }
});

