import express from "express";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { isAuth, generateToken } from "../utils.js";
import expressAsyncHandler from "express-async-handler";
//const session = require('express-session');
//const passport = require('passport');
//const LocalStrategy = require('passport-local').Strategy

/* 
passport.use('login', new LocalStrategy(
  (name, password, done) => {
    User.findOne({name}, (err, user) => {
      if(err) return done(err);
      if(!user){
        console.log('User not found with name ' + name);
        return done(null, false);
      }
      if(!isValidPassword(user, password)){
        console.log('Invalid password: ' + password);
        return done(null, false);
      }
      return done(null, false)
    })
  }
));
*/

const userRouter = express.Router();

userRouter.post(
  // this function catches the error at the async function
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: "Invalid name or password" });
  })
);

/*
passport.use('signup', new LocalStrategy({
  passReqToCallback: true
},
  (req, name, password, done) => {
    User.findOne({ 'name': name }, function(err, user) {
      if(err) {
        console.log('Error in Sign up: ' + err);
        return done(err);
      }
      if(user) {
        console.log('User already exists');
        return done(null, false)
      }
      const newUser = {
        name: name,
        email: req.body.email,
        password: createHash(password),
      }
      User.create(newUser, (err, userWithId) => {
        if(err) {
          console.log('Error in saving user: ' + err);
          return done(err);
        }
        console.log(user)
        console.log('Succesfull registration')
        return done(null, userWithId);
      })
    })
  }
))

function createHash(password) {
  return bcrypt.hashSync(
    password,
    bcrypt.genSaltSync(10),
    null
  )
}

passport.serializeUser((user, done) => {
  done(null, user._id);
})

passport.deserializeUser((id, done) => {
  User.findById(id, done);
})

app.get('/', routes.getRoot);
app.get('/login', routes.getLogin);
app.post('/login', passport.authenticate('login', {failureRedirect: '/faillogin'}), routes.postLogin);
app.get('/faillogin', routes.getFaillogin);
app.get('/signup', routes.getSignup);
app.post('/signup', passport.authenticate('signup', {failureRedirect: '/failsignup'}), routes.postSignup);
app.get('/failsignup', routes.getFailsignup);
app.get('/logout', routes.getLogout);
app.get('*', routes.failRoute);
app.get('/ruta-protegida', checkAuthentication, (req, res) => {
  let user = req.user;
  console.log(user);
  res.send('<h1>Bienvenido</h1>')
})

function getRoot(req, res) {
  res.send("Bienvenido")
}

function getLogin(req, res) {
  if (req.isAuthenticated()){
    let user = req.user;
    console.log('user logged in');
    res.render('profileUser', {user});
  } else {
    console.log('user not logged in');
    res.render('login');
  }
}

function getSignup(req, res) {
  res.render('signup')
}

function postLogin(req, res) {
  let user = req.user;
  res.render('profileUser');
}

function getFaillogin(req, res) {
  console.log('error at login');
  res.render('login-error', {});
}

function getFailsignup(req, res) {
  console.log('error at signup');
  res.render('signup-error', {});
}
*/

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    })
  })
);

userRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  })
);

export default userRouter;
