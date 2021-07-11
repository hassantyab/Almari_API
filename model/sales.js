const mongoose= require("mongoose");

const saleSchema = new mongoose.Schema({
    saleImage:{
        type:String
    },
    products:[
        {
            productId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            cutOff:{
                type:Number,
                default: 0
            } } 
    ],
    Title:{
        type :String
    },
    salePercentage:{
        type : String
    }
});

module.exports= mongoose.model('sale', saleSchema, 'sales');