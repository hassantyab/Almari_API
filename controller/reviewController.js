const Review = require('../model/review');
const Pusher = require('pusher');
const mongoose = require('mongoose');
const _= require('lodash');

module.exports.addReview = (req, res,next) => {
    const review = new Review({
        reviewString: req.body.reviewString,
        reviewTitle: req.body.reviewTitle,
        numOfStars: req.body.numOfStars,
        userId: req.body.userId,
        productId: req.body.productId
    });
    review.save()
        .then(reviews => {
            res.status(200).json({
                message: "Review Added."
            });
            var pusher = new Pusher({
                appId: '582117',
                key: 'e2251f2e4da4cc566806',
                secret: '9ed902ab06e8d4043225',
                cluster: 'ap2',
                encrypted: true
            });
            pusher.trigger('almaari', 'notify', {
                "objectReview": reviews
            });
            return reviews;
        })
        .then(product=>{
            const productId = product.productId;
            console.log(productId);
            Review.aggregate().match({
                'productId' : productId
            }).group({
                _id: "$productId",
                averageRatings:{ $avg: "$numOfStars"}
            })
            .exec()
            .then(averageRatings=>{
                req.avgRating= averageRatings;
                next();
            })
        }
        )
        .catch(err => {
            console.log(err);
            res.status(400).json({
                err
            });
        });
}

module.exports.getProductReviews = (req, res) => {
    Review.find({
        productId: req.body.productId,
        status: 'Accepted'
    })
        .populate('userId', 'firstName lastName')
        .exec()
        .then(reviews => {
            const avg = _.meanBy(reviews, function(r) { return r.numOfStars; });
           
            res.status(200).json({
                reviews,
                avg
            });
        })
        .catch(err => {
            res.status(400).json(err);
        })
}

module.exports.reviewsByUser = (req, res) => {
    Review.find({
        userId: req.body.userId,
        status: 'Accepted'
    })
        .exec()
        .then(reviews => {
            res.status(200).json({reviews});
        })
        .catch(err => {
            res.status(400).json(err);
        })
}
/*.then(product=>{
    const productId = product.productId;
    console.log(productId);
    Review.aggregate().match({
        'productId' : productId
    }).group({
        _id: "$productId",
        averageRatings:{ $avg: "$numOfStars"}
    })
    .exec()
    .then(averageRatings=>{
        req.avgRating= averageRatings;
        next();
    })
}
)*/