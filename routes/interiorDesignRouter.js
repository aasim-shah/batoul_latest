const interiorDesignRouter = require("express").Router()
const multer = require('multer');
const InteriorDesign = require("../models/interiorDesign");
const jwt = require("jsonwebtoken")
const User = require("../models/users");
const workControler = require('../controllers/workControler')



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
  



  interiorDesignRouter.get('/',workControler.getAll);
  
  
  
  interiorDesignRouter.post('/filterDesignWorks' , workControler.post_filterWork);
  
  

  interiorDesignRouter.post('/addDesignWork', isAuthenticated, upload.array('images', 5), workControler.post_addWork);
  
  interiorDesignRouter.get('/designDetails/:id', workControler.getDetails_by_id);
  interiorDesignRouter.get('/edit/:id', workControler.editwork);
  interiorDesignRouter.get('/delete/:id', workControler.deleteById);

  interiorDesignRouter.get('/removeFromWishlist/:id', isAuthenticated , workControler.removeFromWishlist);
  
  interiorDesignRouter.get('/AddWork', (req, res) => {
    res.render('AddWork' ,  { error : {yearsOfExperience : null , description : null , files : null }});
  });
  


  interiorDesignRouter.get('/add_to_wishlist/:id', isAuthenticated, workControler.get_add_to_wishlist)
  interiorDesignRouter.post('/addReview/:id', isAuthenticated,  workControler.post_addReview)


module.exports = interiorDesignRouter