const mongoose= require('mongoose');

const categorySchema = mongoose.Schema({
    categoryName:{
        type: String,
        required: true
    },
    iconUri:{
        type:String,
        required: true
    },
    subCategroy:[String],

    attributes:[String]
    });
    
    const category = module.exports= mongoose.model("category", categorySchema, "categories");

    module.exports.getCategory=(callback)=>{
        category.find(callback);

    }