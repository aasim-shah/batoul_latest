const mongoose = require("mongoose")
const JWT = require("jsonwebtoken")

const userSchema = mongoose.Schema({
    fullname : String,
    firstName : String,
    lastName : String,
    email : {type : String , required : true , unique : true} ,
    phone : String,
    whatsappOrTelegram: String,
    profilePic : String,
    password : String,
    idProof : String,
    wishList : [{
         type: mongoose.Types.ObjectId , ref : 'property' 
    }],
    wishList_interiorDesigns : [{
         type: mongoose.Types.ObjectId , ref : 'interiorDesign' 
    }],
    tokens : [{
        token : String,
    }],
   
}, {timestamps : true})


userSchema.methods.AuthUser = async function(){
    const token = JWT.sign({_id : this._id} , 'mysuperSecret' , {expiresIn: "7h"})
    this.tokens = this.tokens.concat({token : token})
    await this.save()
    return token;
}

const User = mongoose.model('user' , userSchema)
module.exports = User;