const slider = require('../model/slider');

module.exports.getSlider= (req,res)=>{
    slider.find()
    .exec()
    .then(slider=>{
        res.status(200).json(slider);
    })
    .catch()
}
