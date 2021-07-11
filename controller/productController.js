const product = require('../model/product');
const _ = require('lodash');
const axios = require('axios');

// module.exports.getProductsByCategory=(catObj, products)=>{
//     console.log(catObj.cat);

//     product.find().where("CategoryName").equals(catObj.cat).exec(products);
// }


module.exports.getProductsByCategory = (req, res) => {
    var cat = req.params.cat;
    var subcat = req.params.subCat;
    product.find({ CategoryName: cat, SubCategoryName: subcat })
        .exec()
        .then(product => {
            res.status(200).json(product);
        })
        .catch(err => {
            res.status(404).json(err);
        });
}

module.exports.recommendation = (req,res)=>{
    axios.post('https://smart-recommender.herokuapp.com/predict', {
        "id" : req.params._id
    }).then(pred=>{
        var a= pred.data;
        var b = a.products.map((x,i)=>{
            return[x, a.ratings[i][0]]
        });
        b.sort((a,b)=>{ 
                return a[1]-b[1]
            }
        );
        return b.reverse();
    }).then(ar=>{
        l = ar.slice(0,10)
        cc= l.map((x,i)=>{
            return x[0].substr(9,24)
        });
        product.find({
            '_id':{
                $in:cc,
            }
        }).then(prods=>{
            res.status(200).json(prods)
        })
    })
    .catch(err=>{
        res.status(400).json(err);
    })
}

module.exports.averageReview = (req, res) => {
    const productId = req.avgRating[0]._id;
    const averageRating = req.avgRating[0].averageRatings;
    product.findByIdAndUpdate(productId, {
        $set: { AverageRating: averageRating }
    })
        .exec()
        .then(product => {
            console.log(product);
        })
        .catch(err => {
           console.log(err);
           
        })
}

module.exports.viewCounter = (req, res, next) => {
    product.updateOne(
        { _id: req.body.productId },
        {
            $inc: {
                viewCount: 1
            }
        }
    ).exec();
    next();
}

module.exports.filterSearch = (req, res) => {
    var maxPrice = req.body.maxPrice;
    var minPrice = req.body.minPrice;
    if (maxPrice == null || minPrice == null) {
        minPrice = 0;
        maxPrice = 99999999;
    }
    const filterAttributes =req.body.attributes;   //attributes:[{ 'RAM': '8GB' }, { 'ScreenSize': '15.6' }]
    const subCat = req.body.subCat;
    product.find(
        {
            SubCategoryName: subCat,
            Price: {
                $gt: minPrice,
                $lt: maxPrice
            }
        }
    )
        .exec()
        .then(p => {
            if(_.isEmpty(filterAttributes)){
                let prod = p;
                res.status(200).json({prod});
            }
            else{

            var prod = [];
            p.forEach((x, y, z) => {
                x.Attributes.forEach((l, m, n) => {
                    filterAttributes.forEach((e, f, g) => {
                        if (JSON.stringify(e) === JSON.stringify(l)) {
                            prod.push(p[y]);
                        }
                    })
                })
            });
            prod = prod.filter((obj, pos, arr) => {
                return arr.map(mapObj => mapObj._id).indexOf(obj._id) === pos;
            });
            res.status(200).json({
                prod
            });
        }

        })
        .catch(err => {
            res.status(400).json(err);
        })
}

module.exports.filterSearchCat = (req, res) => {
    var maxPrice = req.body.maxPrice;
    var minPrice = req.body.minPrice;
    if (maxPrice == null || minPrice == null) {
        minPrice = 0;
        maxPrice = 99999999;
    }
    const filterAttributes =req.body.attributes;   //attributes:[{ 'RAM': '8GB' }, { 'ScreenSize': '15.6' }]
    const cat = req.body.cat;
    product.find(
        {
            CategoryName: cat,
            Price: {
                $gt: minPrice,
                $lt: maxPrice
            }
        }
    )
        .exec()
        .then(p => {
            if(_.isEmpty(filterAttributes)){
                let prod = p;
                res.status(200).json({prod});
            }
            else{

            var prod = [];
            p.forEach((x, y, z) => {
                x.Attributes.forEach((l, m, n) => {
                    filterAttributes.forEach((e, f, g) => {
                        if (JSON.stringify(e) === JSON.stringify(l)) {
                            prod.push(p[y]);
                        }
                    })
                })
            });
            prod = prod.filter((obj, pos, arr) => {
                return arr.map(mapObj => mapObj._id).indexOf(obj._id) === pos;
            });
            res.status(200).json({
                prod
            });
        }

        })
        .catch(err => {
            res.status(400).json(err);
        })
}

module.exports.mostViewdProducts = (req,res)=>{
    product.find()
    .sort( { viewCount: -1 } )
    .limit( 15 )
    .exec()
    .then(products=>{
        res.status(200).json(products)
    })
    .catch(err=>{
        res.status(400).json(err)
    })

}

module.exports.addTag = (req,res)=>{
    product.updateMany({ "BrandName": "Samsung" }, {$set: { Attributes:[ {
        "RAM": "4GB"
    },
    {
        "PROCESSOR": "1.5GHZ"
    },
    {
        "Camera": "13MP"
    },
    {
        "BATTERY": "2500MAmp"
    },
    {
        "Brand" : "Samsung"
    },
    {
        "ScreenSize": "5.5INCH"
    }]  }}, { upsert: true })
    .exec()
    .then(prod=>{
        console.log("abjkm");
        res.status(200).json(prod);

    })
    .catch(err=>{
        console.log("adada");
        res.status(400).json(err);
    })
}

module.exports.singleProduct= async (req,res)=>{
    var Product= await product.findById(req.body.productId)
    console.log(Product);
    axios.post('https://smart-recommender.herokuapp.com/similar', {
        "title" : Product.Title
    })
    .then(ids=>{
        cc= ids.data.map((x,i)=>{
            return x.substr(9,24)
        });
        console.log(cc)
        product.find({
            '_id':{
                $in:cc,
            }
        }).then(prods=>{
            res.status(200).json(
                {
                    prods:prods, 
                    Product
            })
        })
    })
    .catch(err=>{
        res.status(400).json(err);
    })

    

}