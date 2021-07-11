const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true,
        index :true,
        text:true
    },
    Description: {
        type: String,
        required: true
    },
    Quantity: {
        type: Number,
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
    Images: [String],
    CategoryName: {
        type: String,
        required: true
    },
    SubCategoryName: {
        type: String,
        required: true
    },
    BrandName: {
        required: true,
        type: String
    },
    Attributes: {
        type: Object,
        required: true
    },
    AverageRating: {
        type: Number
    },
    viewCount:{
        type:Number,
        default:0
    }

});

const Product = module.exports = mongoose.model('Product', productSchema, 'products');
productSchema.index({Title : 'text'});
module.exports.getProduct = (callback) => {
    Product.find(callback);
}
module.exports.getProductById = (id, callback) => {
    Product.findById(id, callback);
}
