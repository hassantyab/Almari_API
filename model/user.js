
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true,
        default: " "
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    gender:{
        type: String,
        required: true
    },
    address: {
        type: String
    },
    phoneNumber:{
        type:String
    },
    favouriteProducts: [
        { type: mongoose.Schema.Types.ObjectId, ref : 'Product'}
    ],
    created:{
        type:Date,
        default:Date.now
    },
    facebookId: String,
    viewdProducts:[
        {type: mongoose.Schema.Types.ObjectId, ref : 'Product'}
    ],
    cart:[ {
        productId:{
            type:mongoose.Schema.Types.ObjectId, 
            ref:'Product'
        },
        quantity:{
            type:Number,
            default :1
        }  
    } ],
    resetCode:{
        type:String
    }
});
const User = module.exports = mongoose.model('user', userSchema, 'user');

