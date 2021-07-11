// var watson_nlu = require('watson-developer-cloud/natural-language-understanding/v1.js');
// var nlu = new watson_nlu({
//   'username': '4c1b6d47-7658-4d54-b824-6e8a124bc330',
//   'password': 'yasJTogpU2zb',
//   'version': '2018-07-19'
// });
// var parameters = {
//     'text': 'I need to buy a check shirt in blue color',
//     'features': {
//       'entities': {
//         'emotion': true,
//         'sentiment': true,
//         'limit': 2
//       },
//       'keywords': {
//         'emotion': true,
//         'sentiment': true,
//         'limit': 2
//       }
//     }
//   }
// module.exports.test =(req,res)=>{
//   nlu.analyze(parameters, function(err, response) {
//     if (err)
//       console.log('error:', err);
//     else
//       console.log(JSON.stringify(response, null, 2));
//   });
// }

const Product = require('../model/product');
const dym = require('did-you-mean');
const kwe = require('keyword-extractor');


module.exports.searchProduct = async (req, res) => {
    // Product.createIndexes({Title : 'text' }).then(index=>{
    //     res.json(index);
    // }) ;
    var searchString = kwe.extract(req.body.text, {
        language: "english",
        remove_digits: false,
        return_changed_case: true,
        remove_duplicates: false
        
    });
    searchString= searchString.map(x=>{
        return `.*${x}.*`;
    })
    
    var search = await searchString.join(" ");
    search = await search.replace(/\s/g, '|');
    console.log(search);
    
    Product.find(
        {
            Title: {
                $regex: new RegExp(search, "i")
                // $regex: ".*"+to+".*", "i"
            }
        })
        .exec()
        .then(result => {
            const Category = result[0].CategoryName;
            const Title = result[0].Title;
            const Image = result[0].Images;
            const Price = result[0].Price;
            const Brand = result[0].BrandName;
            const _id = result[0]._id;
            
            res.status(200).json(                
                {
                TopProduct: {
                    _id,
                    Category,
                    Title,
                    Image,
                    Price,
                    Brand
                },
                allResults: result
            });
        })
        
        .catch(err => {
            res.status(404).json(
                err
            )
        });
    }