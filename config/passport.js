var mongoose = require("mongoose");
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');
var configAuth = require('./auth');

mongoose.Promise = global.Promise;
mongoose.Promise = require('bluebird');
mongoose.Promise = require('q').Promise;

const assert = require('assert');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
    passReqToCallback: true,
  },
  function(req, password, email, done) {
    process.nextTick(function() {
      var query1 = User.findOne({ 'local.email': req.body.email });
      var query2 = User.findOne({ 'local.username': req.body.username });
      
      // Make sure both email and username are unique in the database
      query1.then(function(err, user) {
        if (err){return done(err);}
        if (user) {return done(null, false, {message: 'That email is already taken.'})}
        else{
          query2.then(function(err, user) {
          if (err){return done(err);}
          if (user) {return done(null, false, {message: 'That username is already taken.'})}
          else{
            
            // If we get here we can create the database document
            var newUser = new User();
            newUser.local.username = req.body.username;
            newUser.local.first_name = req.body.first_name;
            newUser.local.last_name = req.body.last_name;
            newUser.local.email = req.body.email;
            newUser.local.password = newUser.generateHash(req.body.password);

            // This flag gets set to true after verification link is received
            newUser.local.verified = false;
          
            newUser.save(function(err) {
            if (err){throw err;}
              return done(null, newUser);
              });
            };
          });
        };
      });
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passReqToCallback: true,
  },
  function(req, username, password, done) {
    User.findOne({ 'local.username':  username }, function(err, user) {
      if (err)
        {console.log("Passport login error!"); return done(err);}
      if (!user)
        return done(null, false, req.flash('error', 'User name not found.'));
      if (!user.validPassword(password))
        return done(null, false, req.flash('error', 'Wrong password.'));
      if (!user.local.verified)
        return done(null, false, req.flash('error', 'User not verified'));
      return done(null, user);
    });
  }));

  passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'email', 'first_name', 'last_name'],
  },
  function(token, refreshToken, profile, done) {
    process.nextTick(function() {
      User.findOne({ 'facebook.id': profile.id }, function(err, user) {
        if (err)
          return done(err);
        if (user) {
          return done(null, user);
        } else {
          var newUser = new User();
          newUser.facebook.id = profile.id;
          newUser.facebook.token = token;
          newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
          newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

          newUser.save(function(err) {
            if (err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));

  passport.use(new TwitterStrategy({
    consumerKey: configAuth.twitterAuth.consumerKey,
    consumerSecret: configAuth.twitterAuth.consumerSecret,
    callbackURL: configAuth.twitterAuth.callbackURL,
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick(function() {
      User.findOne({ 'twitter.id': profile.id }, function(err, user) {
        if (err)
          return done(err);
        if (user) {
          return done(null, user);
        } else {
          var newUser = new User();
          newUser.twitter.id          = profile.id;
          newUser.twitter.token       = token;
          newUser.twitter.username    = profile.username;
          newUser.twitter.displayName = profile.displayName;
          newUser.save(function(err) {
            if (err)
             throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));

  passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
  },
    function(token, refreshToken, profile, done) {
      process.nextTick(function() {
        User.findOne({ 'google.id': profile.id }, function(err, user) {
          if (err)
            return done(err);
          if (user) {
            return done(null, user);
          } else {
            var newUser = new User();
            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.google.name = profile.displayName;
            newUser.google.email = profile.emails[0].value;
            newUser.save(function(err) {
              if (err)
                throw err;
              return done(null, newUser);
            });
          }
        });
      });
    }));

};
