const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const { FavoritesModel } = require('../models/favorite');

const favoritesRouter = express.Router();

favoritesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    FavoritesModel.find({})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    FavoritesModel.findOne({user: req.user._id})
    .populate('dishes')
    .then((favourite) => {
        if (favourite === null) {
            FavoritesModel.create({ dishes: req.body, user: req.user._id })
            .then((favourites) => {
                console.log('Favourite Created ', favourites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourites);
            }, (err) => next(err))
            .catch((err) => next(err));;
        } else {        
            req.body
            .filter((item) => {
                const found = favourite.dishes.find((d) => d._id.toString() === item._id);

                return !found;
            })
            .forEach((item) => {
                favourite.dishes.push(item);
            });

            favourite.save()

            console.log('Favourite Created ', favourite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favourite);
        }
    });
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    FavoritesModel.findOneAndDelete({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favoritesRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/:dishId');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    FavoritesModel.findOne({user: req.user._id})
    .populate('dishes')
    .then((favourite) => {
        if (favourite === null) {
            FavoritesModel.create({ dishes: [{_id: req.params.dishId }], user: req.user._id })
            .then((favourites) => {
                console.log('Favourite Created ', favourites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourites);
            }, (err) => next(err))
            .catch((err) => next(err));;
        } else {
            favourite.dishes.push({_id: req.params.dishId });
            favourite.save()

            console.log('Favourite Created ', favourite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favourite);
        }
    });
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:dishId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    FavoritesModel.findOne({user: req.user._id})
    .then((favourite) => {
        let resp = null;

        if (favourite) {
            favourite.dishes = favourite.dishes.filter((dish) => {
                if (dish._id.toString() !== req.params.dishId) {
                    return true;
                }

                resp = dish;

                return false;
            });
            favourite.save();
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

module.exports = favoritesRouter;
