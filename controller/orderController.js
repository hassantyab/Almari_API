const Order= require('../model/order');
const Product = require('../model/product')
const User = require('../model/user')
const Pusher = require('pusher')



module.exports.placeOrder=(req, res, next )=>{        
    const orders= new Order({
        orderDate: req.body.orderDate,
        userId: req.body.userId,
        products: req.body.products,
        paymentType: req.body.paymentType,
        status: req.body.status,
        totalPrice: req.body.totalPrice,
        shippingAddress: req.body.shippingAddress,
        paypalPaymentId : req.body.paypalPaymentId,
        paypalStatus : req.body.paypalStatus
    });

    orders.save()
    .then(result=>{
        console.log(result);
        var pusher = new Pusher({
            appId: '582117',
            key: 'e2251f2e4da4cc566806',
            secret: '9ed902ab06e8d4043225',
            cluster: 'ap2',
            encrypted: true
          });
    
          pusher.trigger('almaari', 'orders', {
            "objectOrder":result 
          });
        next();
    })    
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });

}

module.exports.myOrders=(req,res)=>{
    const userId = req.params._id;
    console.log(userId);
    Order.find({userId: userId}).sort({orderDate:-1})
    .populate({ path: 'products.productId' })
    .exec()
    .then(orders=>{
        res.status(200).json(orders);
    })
    .catch(err=>{
        res.status(404).json(
            {
                error:err
            }
        );
    });
}

module.exports.orderDetails= (req,res)=>{
    Order.findOne(
        {_id: req.body.orderId}
    )
    .populate({ path: 'products.productId' })
    .exec()
    .then(order=>{
        console.log(order);
        res.status(200).json({
            Date: order.orderDate,
            totalPrice: order.totalPrice,
            orderId:order._id,
            status :order.status,
            shippingAddress:order.shippingAddress,
            payment: order.paymentType,
            products : order.products

        })
    })
    .catch()
}

module.exports.cancelOrder = async(req, res)=>{
    try {
        var order = await Order.findOne({_id:req.body.orderId });

    var  orderStatus= order.status;
        if(orderStatus=='Placed'){
            order.cancelRequest= true;
            var updatedOrder= await order.save()
            res.status(200).json(updatedOrder)
        }else{
           
            res.status(200).json({
                msg: "Order can't be cancelled"
            })
        }
    }
    catch(err){
        res.status(400).json(err)
    }
}