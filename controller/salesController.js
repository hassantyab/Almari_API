const Sales = require('../model/sales');

module.exports.getSales = (req, res) => {
    Sales.find().select('_id Title saleImage salePercentage')
        .exec()
        .then(sales => {
            res.status(200).json(sales)
        })
        .catch(err => {
            res.status(400).json(err)
        });
}

module.exports.getOneSale = (req,res)=>{
    Sales.findById(req.body.id)
    .populate({ path: 'products.productId' })
    .select('products')
    .exec()
    .then(products=>{
        res.status(200).json(products);
    })
    .catch()
}