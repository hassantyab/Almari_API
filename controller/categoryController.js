    var mongoose= require('mongoose');
    const category= require('../model/category')
    
    //add new category
    module.exports.addCategory= (req, res)=>{
    }

    module.exports.addSubCategory=(req,res)=>{
    }

    module.exports.getCategoryById=(id,callback)=>{
        category.findById(id,callback);
    }

    module.exports.getCategory=(callback)=>{
        category.find(callback);
    }  

    module.exports.getAttributes= (req,res)=>{
        console.log(req.params.categoryName);
        category.findOne({
            categoryName: req.params.categoryName
        })
        .lean()
        .exec()
        .then(cat=>{
            console.log(cat);
            res.status(200).send(cat.uniqueAttributes)
        })
        .catch(err=>{
            res.status(400).json(err);
        })
    
    }