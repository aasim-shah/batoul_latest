const express = require('express');
const propertyRouter = express.Router();
const jwt = require("jsonwebtoken")

const multer = require('multer');
const User = require('../models/users');
const propertyControler = require('../controllers/propertyControler');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    },
});



const upload = multer({ storage: storage });



const isAuthenticated = async (req, res, next) => {
    try {
        const reqToken = req.cookies.jwt_token
        const verify_user = jwt.verify(reqToken, 'mysuperSecret')
        const userFound = await User.findOne({ _id: verify_user._id, "tokens.token": reqToken })
        if (!userFound) {
            return res.redirect("/login")
        }
        req.user = userFound
        next()


    } catch (error) {
        console.log(error)
        res.redirect("/login")

    }
}


propertyRouter.use(async (req, res, next) => {

    try {
        const reqToken = req.cookies.jwt_token
        const verify_user = jwt.verify(reqToken, 'mysuperSecret')

        const userFound = await User.findOne({ _id: verify_user._id, "tokens.token": reqToken })
        if (userFound) {
            res.locals.user = userFound;
            res.locals.form = null;
        } else {
            res.locals.user = null;
            res.locals.form = null;
        }
    } catch (error) {
        res.locals.user = null;
        res.locals.form = null;
    }
    next();
});





propertyRouter.get('/all', propertyControler.getAll);

propertyRouter.get('/EditProperty/:id', propertyControler.get_editProperty);
propertyRouter.get('/delete/:id', propertyControler.deleteById);
propertyRouter.get('/removeFromWishlist/:id',isAuthenticated,  propertyControler.removeFromWishlist);


propertyRouter.post('/filteredProperties', propertyControler.post_filterProperty);


propertyRouter.get('/propertyDetails/:id',propertyControler.get_property_by_id);




propertyRouter.post('/AddProperty', isAuthenticated, upload.array('images', 5), propertyControler.post_add_property);

propertyRouter.get('/AddProperty', isAuthenticated, propertyControler.get_addProperty);


propertyRouter.post('/editProperty', upload.array('images', 5), propertyControler.post_editProperty);



propertyRouter.get('/add_to_wishlist/:id', isAuthenticated, propertyControler.get_addToWishlist)


propertyRouter.post('/addReview/:id', isAuthenticated,  propertyControler.post_addReview)


module.exports = propertyRouter