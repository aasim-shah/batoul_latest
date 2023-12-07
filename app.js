const express = require('express');

const app = express();
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy;
const User = require("./models/users")
const Property = require("./models/property")
const mongoose = require("mongoose")
const bcrypt = require('bcrypt')
const propertyRouter = require("./routes/propertyRouter")
const interiorDesignRouter = require("./routes/interiorDesignRouter");
const InteriorDesign = require('./models/interiorDesign');
const Review = require('./models/review');


// sets the view engine to EJS
app.set('view engine', 'ejs');

// directs Express to the public folder for stylesheets
app.use(express.static('public'));


// some important middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.use(session({
  secret: "mysuperSecret",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }

}))




// mongodb connection
// mongoose.connect('mongodb://0.0.0.0:27017/Homekey', {
  mongoose.connect('mongodb+srv://Haifa:Homekey@web.g9ukbvh.mongodb.net/Homekey?retryWrites=true&w=majority', {

  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => { console.log("DB Connected !") }).catch((e) => { console.log(e) })




// initializing passportjs

app.use(passport.initialize());
app.use(passport.session());




passport.use(
  new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await User.findOne({ email: username });

        if (!user) {
          return done(null, false);
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);



passport.serializeUser(function (user, done) {
  return done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
});



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

app.use(async (req, res, next) => {

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

app.use('/property', propertyRouter);
app.use('/interiorDesign', interiorDesignRouter);



app.get('/', (req, res) => {
  res.render('Homepage');
});

app.get('/login', (req, res) => {
  const data = { email: null }
  res.render('Homepage', { form: "login", msg: { email: null, error: null, password: null }, data: data });
});
app.get('/loginErr', (req, res) => {
  const data = { email: null }

  res.render('Homepage', { form: "login", msg: { email: null, error: "Wrong Username or password  !", password: null }, data: data });

});
app.get('/signup', (req, res) => {
  const data = { full_name: null, email: null, password: null, phone: null }
  res.render('Homepage', { form: "signup", msg: { email: null, password: null }, data: data });

});


app.post('/login',
  passport.authenticate('local', { failureRedirect: '/loginErr' }),
  async function (req, res) {
    const token = await req.user.AuthUser()
    res.cookie("jwt_token", token)
    res.redirect("/")

  });

app.get('/inpsectionTeam', (req, res) => {
  res.render('inspectionTeam', { error: { first_name: null, last_name: null, email: null, user_inquiry: null } });
});


app.post('/inpsectionTeam', (req, res) => {
  console.log(req.body)
  const {first_name, last_name , email, user_inquiry } = req.body
  if (!first_name || first_name == "") {
  return   res.render('inspectionTeam', { error: { first_name: "First Name is required !", last_name: null, email: null, user_inquiry: null } });
  }
  if (!last_name || last_name == "") {
    return res.render('inspectionTeam', { error: { first_name: null,  last_name: "Last Name is required !", email: null, user_inquiry: null } });
  }


  if (!email || email == "") {
    return res.render('inspectionTeam', { error: { first_name: null,  last_name: null, email: "Email is required !", user_inquiry: null } });
  }
  if (!user_inquiry || user_inquiry == "") {
    return res.render('inspectionTeam', { error: { first_name: null,  last_name: null, email: null, user_inquiry: "User Inquiry is required !" } });
  }


  res.redirect('/inpsectionTeam');
});




app.post("/signup", async (req, res) => {
  const { first_name, last_name, email, password, phone } = req.body;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d).{8,}$/;

  console.log(req.body)
  const userExists = await User.findOne({ email })
  if (userExists) {
    return res.render('Homepage', { form: "signup", msg: { phone : null , email: "Email Already Registered !", password: null, last_name: null, first_name: null }, data: req.body });

  }
  const phonexists = await User.findOne({ phone })
  if (phonexists) {
    return res.render('Homepage', { form: "signup", msg: {  phone : "Phone Number Already exists !", password: null, last_name: null, first_name: null }, data: req.body });

  }

  if (!email) {
    return res.render('Homepage', { form: "signup", msg: { phone : null, email: "Email field is Required !",  password: null, last_name: null, first_name: null }, data: req.body });

  }
  if (phone.length !== 9) {
    return res.render('Homepage', { form: "signup", msg: {  email: null, phone: "Number Should Must be 9 digits !", password: null, last_name: null, first_name: null }, data: req.body });

  }
  if (!first_name) {
    return res.render('Homepage', { form: "signup", msg: { phone : null,  email: null, password: null, last_name: null, first_name: "First Name is Requied !" }, data: req.body });

  }
  if (!last_name) {
    return res.render('Homepage', { form: "signup", msg: { phone : null , email: null, password: null, last_name: "Last Name is required !", first_name: null }, data: req.body });

  }
  if (password.length < 8) {
    return res.render('Homepage', { form: "signup", msg: {  phone: null , email: null, password: "Password must be of 8 letters !", last_name: null, first_name: null }, data: req.body });

  }

  if (!passwordRegex.test(password)) {
    return res.render('Homepage', { form: "signup", msg: {  phone: null , email: null, password: "Password must be validated  !", last_name: null, first_name: null }, data: req.body });

  }


  const passHash = await bcrypt.hash(password, 10)
  const reqBody = new User({
    fullname: first_name ? first_name : "" + last_name ? last_name : "",
    firstName: first_name,
    lastName: last_name,
    email,
    phone,
    password: passHash,
  })
  const user = await reqBody.save()
  const token = await reqBody.AuthUser()
  res.cookie("jwt_token", token)
  res.redirect("/")
})


app.get('/profile', isAuthenticated, async (req, res) => {
  const allProperties = await Property.find({ userId: req.user._id })
  const user = await User.findById(req.user._id).populate("wishList").populate("wishList_interiorDesigns")
  const works = await InteriorDesign.find({ userId: req.user._id })
  res.render('profile', { user, allProperties, works });
});

app.get('/InspectionTeam', (req, res) => {
  res.render('InspectionTeam');
});


app.post("/updat_user", async (req, res) => {
  console.log(req.body)
  const { name, email, first_name, last_name, phone, old_password, new_password } = req.body
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d).{8,}$/;

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ success: false, error: "User Not Found! " })
    }
    if (phone.length !== 9) {
      return res.json({ success: false, error: "Phone must be 9 digits ! " })
    }

    if (!first_name || first_name == "" || !last_name || last_name == "") {
      return res.json({ success: false, error: "First and Last name fields are required  ! " })
    }


    const passwordMatch = await bcrypt.compare(old_password, user.password);
    if (!passwordMatch) {
      return res.json({ success: false, error: "Old Password doesn't matched   ! " })
    }
    if (new_password.length < 8) {
      return res.json({ success: false, error: "New Password should be at least 8 digits  ! " })
    }

    if (!passwordRegex.test(new_password)) {
      return res.json({ success: false, error: "New Password should follow the Regix Rules  ! " })
    }

    const newHash = await bcrypt.hashSync(new_password, 10)
    user.fullname = name
    user.firstName = first_name
    user.lastName = last_name
    user.phone = phone
    user.password = newHash
    await user.save()
    return res.status(200).send({ success: true, message: 'Updated Successfully' })

  } catch (error) {
    res.json({ success: false, error: "Something went wrong !" })
  }
  console.log(req.body)
})






app.get('/logout', (req, res) => {
  res.clearCookie('jwt_token');
  req.session.destroy(() => {
    res.redirect('/login');
  });
});



app.get("/*", (req, res) => {
  res.render("pageNotFound.ejs")
})

app.listen(process.env.PORT, () => {
  console.log(`http://localhost:${process.env.PORT}`);
});