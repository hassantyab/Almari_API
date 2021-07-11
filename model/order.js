const mongoose= require('mongoose');

const orderSchema = new mongoose.Schema({
    orderDate:{
        type: Date, 
        default: Date.now,
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    products:[
      {
         
        productId:{
            type:mongoose.Schema.Types.ObjectId, 
            ref:'Product'
        },
        quantity:{
            type:Number,
            default :1
        }
    }],
    totalPrice:{
        type: Number
    },
    shippingAddress:{
        type:String,
        required:true
        },
    paymentType:{
        type : String,
        enum:['CashOnDelivery', 'Paypal'],
        required : true
    },
    status:{
        type : String,
        enum:['Processing', 'Shipped', 'Placed'],
        default : "Placed"
    },
    paypalPaymentId:{
        type : String
    },
    paypalStatus:{
        type : String,
        enum:['created', 'approved', 'failed']
    },
    cancelRequest:{
        type:Boolean,
        default:false
    }
    });
    module.exports= mongoose.model('order',orderSchema, 'orders');