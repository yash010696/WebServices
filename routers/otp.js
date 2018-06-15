var express = require('express');
var localStorage = require('localStorage');
var jwt = require('jsonwebtoken');
var config=require('./../config/config');
var generateSms=require('./../middlewear/sms');

var  Customer  = require('./../models/customer');
var otpRouter = express.Router();

function otpGenerate(){

     var otp = Math.floor((Math.random() * 10000) + 1);
     localStorage.setItem('otp', JSON.stringify(otp));
    setTimeout(() => {
        localStorage.removeItem('otp')
    }, 300000); //1000ms=1 sec // 300000ms=300sec=5min
    return otp;

}

var token;
otpRouter
    .post('/login', (req, res) => {
    
        let phone = req.body.mobile;
        localStorage.setItem('phone', phone);
        Customer.find({ 'mobile': phone }).then((user) => {

            if (!user[0]) {
                res.status(404).json({ Message: 'Authentication Failed.No User Found' });
            }
            else {

                token = jwt.sign(user[0].toJSON(), config.secret, { expiresIn: 604800 });
                otp= otpGenerate();
                generateSms(phone,`Your Otp is ${otp}`).then((data) => {
                    res.status(200).json({ Message: 'Verify The Number!' });
                })
            }
        }).catch((err) => {
            res.status(400).json({ Message:'Invalid Phone Number' });
        })
    })

    .post('/verification', (req, res) => {
        var otp1 = req.body.otp;
        var otp = localStorage.getItem('otp');
        if (otp == otp1) {
            localStorage.removeItem('otp');
            localStorage.removeItem('phone');
            res.status(200).header('x-auth', `JWT ${token}`).json({token: 'JWT ' + token, Success:true,Message: 'Logged In Successfully' });
        } else {
            localStorage.removeItem('otp');
            res.status(400).json({ Message: 'Invalid Otp' });
        }

    })
    .post('/otpGenerate', (req, res) => {
        // console.log(req.body);
        var phone = localStorage.getItem('phone');

        otp= otpGenerate();
        generateSms(phone,`Your Otp is ${otp}`).then((data) => {
            res.status(200).json({data, Message: 'Verify The Number!' });
        }, (err) => {
            res.status(400).json({ Message: `${err}` });
        });

    })

module.exports = { otpRouter };