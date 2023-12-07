const mongoose = require("mongoose")

const InteriorDesignSchema = mongoose.Schema({
    description : String,
    rating : Number,
    yearsOfExperience : Number,
    workImages : [String],
    userId : {type: mongoose.Schema.Types.ObjectId , ref : 'user'},
    reviews : [
        {type: mongoose.Schema.Types.ObjectId , ref : 'review'},
    ]
   
}, {timestamps : true})


const InteriorDesign = mongoose.model('interiorDesign' , InteriorDesignSchema)
module.exports = InteriorDesign;