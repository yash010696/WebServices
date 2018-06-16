var express = require('express');
var localStorage = require('localStorage');
var jwt = require('jsonwebtoken');
var passport = require('passport');
require('./../config/passport')(passport);
var config = require('./../config/config');

var mobilecustomerRouter = express.Router();
var Customer = require('./../models/customer');
var Franchise = require('./../models/franchise');
var Area = require('../models/area');
var sendmail = require('./../middlewear/mail');

mobilecustomerRouter
    .get('/getarea', (req, res) => {
        Franchise.find().then((data) => {
            res.json(data)
        })
    })

    .post('/registration', (req, res) => {

        if (req.body.mobile.length != 10)
            res.status(400).json({ Message: "Enter Valid Mobile Number." });
        else {
            Customer.findOne({ 'mobile': req.body.mobile }, function (err, user) {
                if (err)
                    res.status(400).json({ Message: "Enter Valid Values!" });
                if (user)
                    res.status(400).json({ Message: "Mobile No. is taken." });

                else {
                    Customer.findOne({ 'email': req.body.email }, function (err, user) {
                        if (err)
                            res.status(400).json({ Message: "Enter Valid Values!" });
                        if (user)
                            res.status(400).json({ Message: "Email Id is taken." });
                        else {
                            Customer.find().then((results) => {
                                var count = results.length;
                                counter = count + 1;
                                var randomstring = "";
                                var chars = "123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ";
                                var string_length = 6;
                                for (var i = 0; i < string_length; i++) {
                                    var rnum = Math.floor(Math.random() * chars.length);
                                    randomstring += chars.substring(rnum, rnum + 1);
                                }
                                var ReferralCode = randomstring.toUpperCase();

                                req.body.referral_Code = ReferralCode;
                                req.body.id = counter;

                                var customer = new Customer(req.body);
                                customer.save().then((user) => {
                                    var id = user._id;
                                    sendmail(user.email, 'Registrstion Successfull');
                                    res.status(200).json({ id, Success: true, Message: "Registration Successfull" });
                                }, (err) => {
                                    res.status(400).json({ Message: "Enter Valid Values!!" });
                                })
                            })
                        }

                    })
                }
            })
        }
    })
    .post('/address', (req, res) => {


        var token = req.header('Authorization').split(' ');
        var decoded = jwt.verify(token[1], config.secret);

        var locationType = req.body.locationType;

        Customer.find({ '_id': decoded._id }).then((user) => {
            console.log(user[0].address[0].home[0]);
        })
        if (locationType === "Home") {

            var home = {
                pincode: req.body.pincode,
                flat_No: req.body.flat_No,
                society: req.body.society,
                landmark: req.body.landmark,
            }

            Customer.findOneAndUpdate({ '_id': decoded._id }, { "$push": { "address[0]": { "home[0]": home } } }, function (err, user) {
                if (err) {
                    res.json(err)
                } if (user) {
                    res.status(200).json({ Success: true, Message: 'Address Added Successfully' });
                }
            })

        } else if (locationType === "Other") {
            var other = {
                pincode: req.body.pincode,
                flat_No: req.body.flat_No,
                society: req.body.society,
                landmark: req.body.landmark,
            }
            Customer.update({ '_id': decoded._id }, { "$push": { "address.$.other.$": other } }, function (err, user) {
                if (err) {
                    res.json(err)
                } if (user) {
                    res.status(200).json({ Success: true, Message: 'Address Added Successfully!' });
                }
            })
        }

    })

    .post('/logout', (req, res) => {
        localStorage.clear();
        res.json({ Message: "Logged Out" });
    })

module.exports = { mobilecustomerRouter };