const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewTitle:{
        type:String
    },
    reviewString:{
        type:String
    },
    numOfStars:{
        type:Number,
        required:true
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'Product'
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'user'
    },
    status:{
        type:String,
        enum:['NotSeen','Pending', 'Accepted', 'Rejected'],
        default:'NotSeen'
    },
    date:{
        type : Date,
        default: Date.now()
    }
    

});

Review = mongoose.model('review', reviewSchema, 'review');
module.exports= Review;

