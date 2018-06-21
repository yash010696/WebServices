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
var generateSms = require('./../middlewear/sms');
var order_type = require('./../models/ordertype');

mobilecustomerRouter
    .get('/getarea', (req, res) => {
        Franchise.find().then((data) => {
            res.json(data)
        })
    })

    .post('/registration', (req, res) => {

        if (req.body.mobile.length != 10)
            res.status(200).json({ Message: "Enter Valid Mobile Number." });
        else {
            Customer.findOne({ 'mobile': req.body.mobile }, function (err, user) {
                if (err)
                    res.status(400).json({ Success: false, Message: "Enter Valid Values!" });
                if (user)
                    res.status(200).json({ Success: false, Message: "Mobile Number is taken." });

                else {
                    Customer.findOne({ 'email': req.body.email }, function (err, user) {
                        if (err)
                            res.status(400).json({ Success: false, Message: "Enter Valid Values!" });
                        if (user)
                            res.status(200).json({ Success: false, Message: "Email Id is taken." });
                        else {
                            // Customer.find().then((results) => {
                            //     var count = results.length;
                            //     counter = count + 1;
                                var randomstring = "";
                                var chars = "123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ";
                                var string_length = 6;
                                for (var i = 0; i < string_length; i++) {
                                    var rnum = Math.floor(Math.random() * chars.length);
                                    randomstring += chars.substring(rnum, rnum + 1);
                                }
                                var ReferralCode = randomstring.toUpperCase();
                                req.body.referral_Code = ReferralCode;
                                // req.body.id = counter;
                                req.body.statee = true;
                                req.body.status = true;

                                var date = new Date(req.body.dob);
                                var newDate = new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000))
                                req.body.dob = newDate;

                                order_type.find({ 'order_type': "on-line" }).then((type) => {
                                    req.body.order_type = type[0]._id;
                                    var customer = new Customer(req.body);
                                    customer.save().then((user) => {
                                        var id = user._id;
                                        generateSms(user.mobile,
                                            `Dear ${user.first_Name}, Thank you for being part of 24Klen Laundry Science. Your username is ${user.mobile}. Happy Cleaning!`
                                        );
                                        sendmail(user.email,
                                            `Dear ${user.first_Name}, Thank you for being part of 24Klen Laundry Science. Your username is ${user.mobile}. Happy Cleaning!`,
                                            'New User Registered'
                                        );
                                        res.status(200).json({ id, Success: true, Message: "Registration Successfull" });
                                    }, (err) => {
                                        res.status(400).json({ Success: false, Message: "Enter Valid Values!!" });
                                    })
                                })
                            // })
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
        if (locationType === "Home") {
            var home = {
                pincode: req.body.pincode,
                flat_no: req.body.flat_no,
                society: req.body.society,
                landmark: req.body.landmark,
            }
            Customer.findOneAndUpdate({ '_id': decoded._id }, { "$push": { 'address.0.home': home } }, function (err, user) {
                if (err) {
                    res.status(200).json({ Success: false, Message: 'Unable to Add address.' });
                } if (user) {
                    res.status(200).json({ Success: true, Message: 'Address Added Successfully' });
                }
            })
        } else if (locationType === "Other") {
            var other = {
                pincode: req.body.pincode,
                flat_no: req.body.flat_no,
                society: req.body.society,
                landmark: req.body.landmark,
            }
            Customer.update({ '_id': decoded._id }, { "$push": { 'address.0.other': other } }, function (err, user) {
                if (err) {
                    res.status(200).json({ Success: false, Message: 'Unable to Add address.' });
                } if (user) {
                    res.status(200).json({ Success: true, Message: 'Address Added Successfully!' });
                }
            })
        }

    })

    .put('/updateaddress', (req, res) => {
        var token = req.header('Authorization').split(' ');
        var decoded = jwt.verify(token[1], config.secret);
        var locationType = req.body.locationType;

        // Franchise.find({ statee: true, area: req.body.area }).
        //     populate('area').
        //     exec(function (err, franchises) {
        //         if (err) {
        //             res.status(500).send({ Success: flase, err });
        //             return;
        //         }
        //         if (franchises[0] == null) {
        //             res.status(200).json({ Success: false, Message: 'Area Not Found.' });
        //         } else {}
        //     })

                    if (locationType === "Home") {
                        var home = {
                            pincode: req.body.pincode,
                            flat_no: req.body.flat_no,
                            society: req.body.society,
                            landmark: req.body.landmark,
                        }
                        Customer.findOneAndUpdate({ '_id': decoded._id }, { $set: { 'address.0.home': home } }, function (err, user) {
                            if (err) {
                                res.status(200).json({ Success: false, Message: 'Unable to update address.' });
                            } if (user) {
                                res.status(200).json({ Success: true, Message: 'Address Updated Successfully' });
                            }
                        })

                    } else if (locationType === "Other") {
                        var other = {
                            pincode: req.body.pincode,
                            flat_no: req.body.flat_no,
                            society: req.body.society,
                            landmark: req.body.landmark,
                        }
                        Customer.update({ '_id': decoded._id }, { $set: { 'address.0.other': other } }, function (err, user) {
                            if (err) {
                                res.status(200).json({ Success: false, Message: 'Unable to update address.' });
                            } if (user) {
                                res.status(200).json({ Success: true, Message: 'Address Updated Successfully!' });
                            }
                        })
                    }
                
    })

    .post('/logout', (req, res) => {
        localStorage.clear();
        res.json({ Message: "Logged Out" });
    })

module.exports = { mobilecustomerRouter };