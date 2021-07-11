const mongoose = require('mongoose');

const sliderSchema = new  mongoose.Schema({
    productId:{
        type: String
    },
    category:{
        type: String
    },
    img:{
        type:String
    },
    color:{
        type: String
    }
});

const slider = module.exports = mongoose.model('slider', sliderSchema, 'slider');