const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();


// load idea model
require('../models/User');
const User = mongoose.model('users');

//user login route
router.get('/login',function (req, res) {
    res.render('users/login');
});

//user registrasi route
router.get('/register',function (req, res) {
    res.render('users/register');
});

router.get('/forgot',function (req, res) {
    res.render('users/forgot');
});


// Login form post
router.post('/login', function (req, res, next) {
    passport.authenticate ('local', {
        successRedirect:'/ideas',
        failureRedirect:'/users/login',
        failureFlash: true
    })(req, res,next);
});

// Register Form Post
router.post('/register', function (req, res) {
    let errors = [];

    if (req.body.password != req.body.password2) {
        errors.push({text: 'Password Tidak Sama'});
    }

    if (req.body.password.length < 4) {
        errors.push({text: 'Password Harus Lebih 4 karakter'});
    }

    if(errors.length > 0){
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwod2: req.body.password2
        });
    }else{
        User.findOne({email: req.body.email})
            .then(function (user) {
                if(user){
                    req.flash('error_msg', 'email already Registered');
                    res.redirect('/users/register');
                }else{
                    const newUser = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    });

                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(newUser.password, salt, function (err, hash) {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(function(user){
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('/users/login');
                                })
                                .catch(function (err) {
                                    console.log(err);
                                    return;
                                });
                        });
                    });
                }});
    }});


    router.post('/forgot', function(req, res, next) {
      async.waterfall([
        function(done) {
          crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
          });
        },
        function(token, done) {
          User.findOne({ email: req.body.email }, function(err, user) {
            if (!user) {
              req.flash('error', 'No account with that email address exists.');
              return res.redirect('/users/forgot');
            }

            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save(function(err) {
              done(err, token, user);
            });
          });
        },
        function(token, user, done) {
          var smtpTransport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: 'itapp1.sti@gmail.com',
              pass: 'unico.raya'
            }
          });
          var mailOptions = {
            to: user.email,
            from: 'learntocodeinfo@gmail.com',
            subject: 'Node.js Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
              'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
              'http://' + req.headers.host + '/reset/' + token + '\n\n' +
              'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          };
          smtpTransport.sendMail(mailOptions, function(err) {
            console.log('mail sent');
            req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
            done(err, 'done');
          });
        }
      ], function(err) {
        if (err) return next(err);
        res.redirect('/users/forgot');
      });
    });

// Logout User
router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success_msg', 'Your Are Logged Out');
    res.redirect('/');
});

module.exports = router;
