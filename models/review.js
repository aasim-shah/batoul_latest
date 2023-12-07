const mongoose = require("mongoose")

const reviewSchema = mongoose.Schema({
    propertyId : {type: mongoose.Schema.Types.ObjectId , ref : 'property'},
    designId : {type: mongoose.Schema.Types.ObjectId , ref : 'interiorDesign'},
    reviewFor : {
        type : String,
        enum : ['PROPERTY' , "DESIGN"]
    },
    userId : {type: mongoose.Schema.Types.ObjectId , ref : 'user'},
    ratings : Number,
    comment : String
    
}, {timestamps : true})




const Review = mongoose.model('review' , reviewSchema)
module.exports = Review;