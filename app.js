var express = require('express');
var mongoose = require('mongoose');
var bodyParser= require('body-parser');
const user= require('./model/user');
const userController= require('./controller/userController');
const product = require('./model/product');
const productController = require('./controller/productController');
const reviewController= require('./controller/reviewController');
const category = require('./model/category');
const order= require('./model/order')
const checkAuth = require('./middleware/checkauth')
const orderController= require('./controller/orderController');
const categoryController= require('./controller/categoryController');
const searchController= require('./controller/searchController');
const salesController= require('./controller/salesController')
const sliderController= require('./controller/sliderController')



require('dotenv').config();
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

//For React
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
	res.header('Access-Control-Expose-Headers', 'Content-Length');
	res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	} else {
		return next();
	}
});



mongoose.connect(process.env.DB_STRING, (err)=>{
	if(err){
		throw err;
	}
});
mongoose.connection;

//getCurrent User
app.get('/api/user/:_id', userController.getUserProfile);
//user Login
app.post('/api/login', userController.user_login);

//user Sign up
app.post('/api/users', userController.signup, userController.user_login );

//fbAuth
app.post('/api/users/fbauth', userController.fbLogin);

//updateProfile
app.post('/api/user/update', userController.updateProfile);

//updatePasswod
app.post('/api/user/updatePass', userController.updatePassword );

//forget password
app.post('/api/user/forget', userController.forgetPassword)
app.post('/api/user/verify_code', userController.verifyResetCode)
app.post('/api/user/reset_password', userController.resetPassword)

//userFavoriteProduct
app.post('/api/user/favoriteProduct', userController.addFavoriteProducts);
app.get('/api/user/favoriteProduct/:_id', userController.getFavoriteProducts);
app.put('/api/user/favoriteProduct/:userid/:productid', userController.removeFavoriteProduct);

//recently viewed products 
app.post('/api/user/recent', userController.recentViewed);

//getProducts
app.get('/api/products' ,(req,res)=>{
	product.getProduct((err,products)=>{
		if(err){
			throw err;
		}
		res.json(products);
	})
});
app.post('/api/products/single',productController.viewCounter,userController.userViews, productController.singleProduct);
//getProductByCategory
app.get('/api/products/:cat/:subCat', productController.getProductsByCategory );
app.post('/api/products/filter', productController.filterSearch );
app.post('/api/products/filterCat', productController.filterSearchCat );
app.get('/api/category', (req,res)=>{
	category.getCategory((err, category)=>{
		if(err){
			throw err;
		}
		res.json(category);
	});
});

//Most Viewd Products
app.get('/api/products/most-viewed', productController.mostViewdProducts)

//recommendation
app.get('/api/recommend/:_id' , productController.recommendation);

//category attributes 
app.get('/api/category/:categoryName', categoryController.getAttributes);

//ORDER
//placeOrder
app.post('/api/order',checkAuth,orderController.placeOrder, userController.delCart);
//myOrders
app.get('/api/order/myOrders/:_id',checkAuth,orderController.myOrders);
app.post('/api/order-details',checkAuth,orderController.orderDetails);
//cancel Order
app.post('/api/order/cancel', orderController.cancelOrder);

//Cart
app.post('/api/cart/add', userController.addToCart);
app.post('/api/cart/get', userController.getCart);
app.post('/api/cart/del', userController.removeFromCart);
app.post('/api/cart/quantity', userController.updateQuantity);
app.post('/api/cart/insert', userController.insertProduct);
app.post('/api/cart/items', userController.cartCount);
app.post('/api/cart/delCart', userController.delCart);

//Product Review 
//addreview
app.post('/api/product/review', reviewController.addReview,productController.averageReview);
app.post('/api/product/product-reviews',reviewController.getProductReviews )
app.post('/api/product/user-reviews',reviewController.reviewsByUser )

//Sales
app.get('/api/sales', salesController.getSales)
app.post('/api/sales', salesController.getOneSale)

//Search
app.post('/api/search', searchController.searchProduct );

//Slider
app.get('/api/slider', sliderController.getSlider)



//addAVGtag
//app.get('/api/products/addtag', productController.addTag);

//PrivacyPolicy

app.get('/api/privacy_policy',(req,res)=>{
	res.sendFile(__dirname + '/index.html');
})


PORT = process.env.PORT || 5000;
app.listen(PORT, function(err){
	if(err){
		throw err;
	}
	console.log("running on port "+ PORT);
});