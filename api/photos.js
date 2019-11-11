const router = require('express').Router();

const validation = require('../lib/validation.js');
const { PhotoSchema } = require('../models/photo.js');

var photos = require('../data/photos.json');

module.exports = router;

router.get('/', (req, res, next) => {
    var page = req.query.page || 1;
    var numPerPage = 10;
    var lastPage = Math.ceil(photos.length / numPerPage);

    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;

    var start = (page - 1) * numPerPage;
    var end = start + numPerPage;
    var pagedPhotos = photos.slice(start, end);

    var links = {}
    if (page > 1) {
        links.firstPage = '/photos/?page=1';
        links.prevPage = '/photos/?page=' + (page - 1);
    }
    if (page < lastPage) {
        links.nextPage = '/photos/?page=' + (page + 1);
        links.lastPage = '/photos/?page=' + lastPage;
    }

    res.status(200).json({
        photos: pagedPhotos,
        pageNumber: page,
        totalPages: lastPage,
        pageSize: numPerPage,
        totalCount: photos.length,
        links: links
    });
});

router.get('/:photoID', (req, res, next) => {
    const photoID = parseInt(req.params.photoID);

    if (photos[photoID]) {
        res.status(200).json(photos[photoID]);
    } else {
        next();
    }
});

router.put('/:photoID', (req, res, next) => {
    const photoID = parseInt(req.params.photoID);

    if (photos[photoID]) {
        if (validation.validateAgainstSchema(req.body, PhotoSchema)) {
            const updatedPhoto = validation.extractValidFields(req.body, PhotoSchema);
            updatedPhoto.businessID = photos[photoID].businessID;
            photos[photoID] = updatedPhoto;
            res.status(200).json(photos[photoID]);
        } else {
            res.status(400).json({
                err: "Request does not contain a body with a valid Photo Schema"
            });
        }
    } else {
        next();
    }
});

router.patch('/:photoID', (req, res, next) => {
    const photoID = parseInt(req.params.photoID);

    if (photos[photoID]) {
        if (req.body && Object.keys(PhotoSchema).some(field => req.body[field])) {
            const updatedPhoto = validation.extractValidFields(req.body, PhotoSchema);
            Object.keys(updatedPhoto).every(
                field => photos[photoID][field] = updatedPhoto[field]
            );
            res.status(200).json(photos[photoID]);
        } else {
            res.status(400).json({
                err: "Request does not contain a body with at least one attribute that match the business schema"
            });
        }
    } else {
        next();
    }
});

router.delete('/:photoID', (req, res, next) => {
    const photoID = parseInt(req.params.photoID);

    if (photos[photoID]) {
        photos[photoID] = null;
        res.status(204).end();
    } else {
        next();
    }
});
