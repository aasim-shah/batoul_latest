const mongoose = require("mongoose")

const propertyScehma = mongoose.Schema({
    type : String,
    email : {type : String , required : true } ,
    username : String,
    district : String,
    mainRoad : String,
    rentOrbuy : String,
    nearbyAmenties : String,
    floors : Number,
    rooms : Number,
    onFloorNumber : Number,
    size : Number,
    price : Number,
    rating : Number,
    latitude: String,
    longitude: String,
    city: String,
    country: String,
    description :String,
    isAvailable : {type : Boolean , default : true},
    isVerified : {type : Boolean , default : false},
    images : [String],
    location : String,
    userId : {type: mongoose.Schema.Types.ObjectId , ref : 'user'},
    overallRatings : {type : Number, default : 0},
    reviews : [
        {type: mongoose.Schema.Types.ObjectId , ref : 'review'},
    ]
    
}, {timestamps : true})




const Property = mongoose.model('property' , propertyScehma)
module.exports = Property;