const User = require('../model/user');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require("underscore")
const randomstring= require('randomstring');
const nodemailer = require('nodemailer');

//SignUp 
module.exports.signup = (req, res, next) => {
  User.find({ email: (req.body.email).toLowerCase() })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail exists"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              address: req.body.address,
              gender: req.body.gender,
              phoneNumber: req.body.phoneNumber,
              created: Date.now()
            });
            user
              .save()
              .then(result=>{
                next();
              }     
              )
              .catch(err => {
                res.status(500).json({
                error: err
                });
              });
          }
        });
      }
    });
};
// LogIn            
module.exports.user_login = (req, res) => {
  User.find({ email: (req.body.email).toLowerCase() })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Email does not exist."
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            process.env.SECRET_KEY
          );
          return res.status(200).json({
            message: "Auth successful",
            userId: user[0]._id,
            token: token
          });
        }
        res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

//fbLogin
// module.exports.fb_login = (req,res,next)=>{
//   User.find({ 'facebook.id' : req.body.id})
//   .exec()
//   .then(user=>{
//     if(user<1){
//       const users= new User(
//         {
//           _id: new mongoose.Types.ObjectId(),
//           email: req.body.facebook.email,
//           firstName: req.body.facebook.firstName,
//           lastName: req.body.facebook.lastName,
//           created: Date.now(),
//           facebook: req.
//         }
//       );
//     }
//     }
//   })
//   .catch();
// }

//getUserProfile
module.exports.getUserProfile = (req, res) => {
  const userId = req.params._id;
  User.findById(userId)
    .exec()
    .then(user => {
      res.status(200).json(user);
    })
    .catch(err => {
      console.log(err);
      res.status(404).json(
        {
          error: err
        }
      );
    }
    );
}
//updateProfile
module.exports.updateProfile = (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const address = req.body.address;
  const phoneNumber = req.body.phoneNumber;
  const gender = req.body.gender;
  const userId = req.body._id;

  User.findByIdAndUpdate(userId, {
    $set: {
      firstName: firstName,
      lastName: lastName,
      address: address,
      phoneNumber: phoneNumber,
      gender: gender
    }

  }, { new: true })
    .exec()
    .then(user => {
      console.log(user);
      res.status(200).json({
        user,
        message: "Updated Sucessfully"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(200).json({
        err,
        message: "Problem In Update!"
      });

    });
}
//updatePassword
module.exports.updatePassword = (req, res) => {
  User.find({ _id: req.body._id })
    .exec()
    .then(user => {
      bcrypt.compare(req.body.oldPassword, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: err
          });
        }
        if (result) {
          bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
            if (err) {
              return res.status(401).json(err);
            } else {
              User.findByIdAndUpdate(req.body._id, {
                $set: {
                  password: hash
                }
              },
                { new: true })
                .then(user => {
                  res.status(200).json({
                    message: "Password Updated"
                  });
                })
            }
          });
        } else {
          return res.status(401).json({
            message: "incorrect password"
          });
        }

      });
    })
    .catch(err => {
      res.status(401).json({
        message: err
      });
    });
};
//fbLogin
module.exports.fbLogin = (req, res) => {
  const facebookId = req.body.id;
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const email = req.body.email;
  const gender = req.body.gender;

  User.findOne({ 'facebookId': facebookId })
    .exec()
    .then(user => {
      if (user < 1) {
        const users = new User(
          {
            facebookId: facebookId,
            email: email,
            firstName: firstName,
            lastName: lastName,
            gender: gender,
            created: Date.now()
          }
        );
        users.save()
          .then(result => {
            const token = jwt.sign(
              {
                email: result.email,
                userId: result._id
              },
              process.env.SECRET_KEY
            );
            return res.status(201).json({
              token,
              userId: result._id,
              message: "Social Login Successfull"
            });
          })
      }
      else {
        console.log(user);
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id
          },
          process.env.SECRET_KEY
        );

        return res.status(200).json({
          token,
          userId: user._id,
          message: "Social Login Successfull"
        });

      }
    }
    )
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
}
//addFavoritesProduct
module.exports.addFavoriteProducts = async (req, res) => {
  const userId = req.body.userId;
  const productId = req.body.productId;
  User.findById(userId)
  .exec()
  .then(user=>{
    let favProd= user.favouriteProducts;
    if (favProd.indexOf(productId) != -1 ){
      res.status(200).json({
        message: "Saved.",
        user
      })
    }
    else{
       favProd=  user.favouriteProducts.push(productId);
       user.save();
       res.status(200).json({
        message: "Saved.",
        user
      })
    }
  })
  .catch(err => {
          res.json({
            error: err
          })
        }
  )
}
//getFavoritesProducts
module.exports.getFavoriteProducts = (req, res) => {
  const userId = req.params._id;

  User.findById(userId).populate('favouriteProducts')
    .exec()
    .then(user => {
      res.status(200).json(user.favouriteProducts);
    })
    .catch(err => {
      res.status(400).json(err);
    });
}
////removeFavoriteProduct
module.exports.removeFavoriteProduct = (req, res) => {
  const userId = req.params.userid;
  const productId = req.params.productid;
  console.log(userId);
  User.findByIdAndUpdate(userId, { $pull: { favouriteProducts: productId } })
    .exec()
    .then(user => {
      console.log(user);
      res.status(200).json({ message: "Product removed From Favorite" });
    })
    .catch(err => {
      res.status(404).json({ err });
    });
}

module.exports.addToCart = async (req, res) => {
  try {
    var cart = req.body.cart;
    const userToUpdate = await User.findOne({ _id: req.body.userId }).exec();
    if (!userToUpdate) {
      return res.status(404).json({ msg: 'User not found' });
    } else {
      var products = userToUpdate.cart;
      cart = await cart.filter(function (cv) {
        return !products.find(function (e) {
          return e.productId == cv.productId && e.quantity == cv.quantity;
        });
      });
      products = await products.filter((p) => {
        return !cart.find(function (e) {
          return e.productId == p.productId;
        });
      });
      
      var newarray = await products.concat(cart);
      if (_.isEmpty(newarray)) {
        return res.status(200).json({
          msg: 'updated'
        }
        );
      } else {
        userToUpdate.cart =  newarray;
        const cartUpdated = await userToUpdate.save();

        // All good response
        res.status(200).json({ msg: 'Cart updated', cart: _.size(cartUpdated.cart) });

      }
    }
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
}
module.exports.updateQuantity = async (req, res) => {
  try {
    // Get the cart
    const cartToUpdate = await User.findOne({ _id: req.body.userId }).exec();

    // Validation
    if (!cartToUpdate) {
      return res.status(404).json({ msg: 'Cart not found' });
    } else {

      // The cart exist

      // New array of product ids
      const productIds = await cartToUpdate.cart.map(cart => cart.productId.toString());

      console.log(productIds);
      // Validate that the productId is in the Cart
      const index = productIds.indexOf(req.body.productId);
      if (index === -1) {
        return res.status(404).json({ msg: 'Product not found' });
      } else {
        // Set new quantity
        cartToUpdate.cart[index].quantity = await req.body.quantity;

        // Update
        const cartUpdated = await cartToUpdate.save();

        // All good response
        res.status(200).json({ msg: 'Cart updated', cart: cartUpdated });
      }
    }
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err });
  }
}
module.exports.insertProduct = async (req, res) => {
  const userId = req.body.userId;
  const productId = req.body.productId;

  const cartToUpdate = await User.findOne({ _id: req.body.userId }).exec();

  if (!cartToUpdate) {
    return res.status(400).json({ msg: 'Cart Not Found' });
  } else {
    const productIds = await cartToUpdate.cart.map(cart => cart.productId.toString());
    console.log(productIds);
    // Validate that the productId is in the Cart
    const index = productIds.indexOf(productId);
    if (index === -1) {
      await User.findByIdAndUpdate(
        req.body.userId,
        {
          $addToSet: {
            cart: [
              {
                productId: productId,
                quantity: req.body.quantity
              }
            ]
          }
        },
        {
          upsert: true
        }
      )
        .exec()
        .then(cart => {
          return res.status(200).json({
            msg: 'updated'
          });
        })


    } else {
      // Set new quantity
      cartToUpdate.cart[index].quantity = await (cartToUpdate.cart[index].quantity + 1); //= await (req.body.quantity + 1 ;
      // Update
      const cartUpdated = await cartToUpdate.save();
      // All good response
      return res.status(200).json({ msg: 'Cart updated', cart: cartUpdated });
    }
  }
}
module.exports.getCart = (req, res) => {
  const userId = req.body.userId;
  User.findOne({ _id: userId })
    .populate({ path: 'cart.productId' })
    .exec()
    .then(user => {
      res.status(200).json({
        user
      })
    })
    .catch(err => {
      res.status(404).json({
        err
      });
    });

}
module.exports.removeFromCart = (req, res) => {
  User.update(
    { _id: req.body.userId },
    {
      $pull: {
        cart: {
          productId: req.body.productId
        }
      }
    }
  )
    .exec()
    .then(cart => {
      res.status(200).json({
        cart
      })
    })
    .catch(err => {
      res.error(err);

    })
}
module.exports.cartCount = async (req, res) => {
  const user = await User.find({ _id: req.body.userId }).exec();
  const length = _.size(user[0].cart);
  res.status(200).json({
    items: length,
    cart: user[0].cart
  });
}

module.exports.delCart= (req,res)=>{
  User.findByIdAndUpdate(
    req.body.userId,
  {
    $unset:{
      cart: ""
    }
  }
)
.then(cart=>{
  res.status(200).json({msg: "Order Placed"});
})
.catch(err=>{
  res.status(400).json(err);
});
}

//recently Viewed products
module.exports.userViews = async (req, res, next) => {
  if (req.body.userId != null) {
    const user = await User.findById(req.body.userId).exec();
    const recentProd= user.viewdProducts;
    const favouriteProducts= user.favouriteProducts;
    const id= recentProd.indexOf(req.body.productId);
    if(id==-1){
      user.viewdProducts.unshift(req.body.productId);
      user.save();
      req.favouriteProducts = favouriteProducts;
      next();
    }else{
      user.viewdProducts.splice(id, 1);
      user.viewdProducts.unshift(req.body.productId);
      user.save();
      req.favouriteProducts = favouriteProducts;
      next();
    }
  } else {
    next();
  }
}

module.exports.recentViewed =(req,res)=>{
  User.findById(req.body.userId).populate('viewdProducts')
  .exec()
  .then(user => {
    res.status(200).json({products: user.viewdProducts });
  })
  .catch(err => {
    res.status(400).json(err);
  });
}

module.exports.forgetPassword = async (req,res) =>{
try{
  if(req.body.email!=''){
    const userToUpdate = await User.find({ email: (req.body.email).toLowerCase() }).exec();
    if (userToUpdate==0) {
      return res.status(404).json({ msg: 'User not found' });
    }
    else{
      const code= randomstring.generate({
        capitalization:'uppercase',
        charset:'alphanumeric',
        readable:true,
        length:7
      });
     const updatedUser= await User.update(
        {email : req.body.email},
        {resetCode : code },
        {multi:true}
        ).exec()

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
               user: 'noraiz.mohd@gmail.com',
               pass: '125asbike'
           }
       });
       const mailOptions = {
        from: 'noraiz.mohd@gmail.com', // sender address
        to: req.body.email, // list of receivers
        subject: 'Subject of your email', // Subject line
        html: '<p>Your password reset code is  '+code+' </p>'// plain text body
      };
    
      transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          console.log(err)
        else{
          res.status(200).json({
            msg:'Code Sent'
          })
        } 
     });

    }
  }
  else{
    res.status(400).json({
      msg: 'Incorrect Email Format'
    })
  }

}
  catch (err) {
    res.status(400).json({
      msg: err
    })
  }
}

module.exports.verifyResetCode = async (req,res) =>{
  const user= await User.find({email : req.body.email}).exec()
  if(user.length==0){
    return res.status(400).json({
      msg: 'User not existed'
    })
  }else{
    if(user[0].resetCode == req.body.resetCode){
      return res.status(200).json({
        msg : 'Code Verified'
      })
    }else{
      return res.status(400).json({
        msg : 'Incorrect Code'
      })
    }
  }

}

module.exports.resetPassword = (req,res) =>{
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(401).json(err);
    }
    else{  
        User.findOneAndUpdate({email : req.body.email},{
        $set: {
          password: hash
        }
      })
  .exec()
  .then(user=>{
    res.status(200).json({
      msg: 'Password Updated',
      user: user
    })
  });
    }
})

}