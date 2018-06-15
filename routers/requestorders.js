var express = require('express');
var jwt = require('jsonwebtoken');
var passport = require('passport');
require('./../config/passport')(passport);
var config = require('./../config/config');

var { RequestOrder } = require('./../models/requestorder');
var { OrderStatus } = require('./../models/orderstatus');
var Customer=require('./../models/customer');
var Franchise=require('./../models/franchise');

var requestordersRouter = express.Router();

requestordersRouter

    //Create Request Order //Customer will create
    .post('/requestorder', passport.authenticate('jwt', { session: false }), (req, res) => {

        if (!req.body) {
            res.status(400).json({ Message: 'Please Enter Required Data.' });
        } else {

            var token = req.header('Authorization').split(' ');
            var decoded = jwt.verify(token[1], config.secret);
            // Customer.findById({'id':decoded._id}).then((customer)=>{

            // });

            var counter;
            var orderid;
            var areacode;
            Franchise.find({ statee: true , area:'fatemanagar'}).
              populate('area').
              exec(function (err, franchises) {
                console.log('The Franchise  is', franchises);
                console.log('The Franchise  is//////', err);
                if (err) {
                  res.status(500).send(err);
                  return;
                }
                console.log('The Franchise  is', franchises);
                areacode= franchises[0].area.code;
                Order.find({franchise:req.userData.franchise}).exec(function (err, results) {
                  var count = results.length;
                  counter=count +1;
                  var str = "" + counter;
                  var pad = "0000";
                  var ans = pad.substring(0, pad.length - str.length) + str;
                  orderid= areacode + ans;
                  // console.log("orderid",orderid)
                  
                   
                });
              });
            req.body.created_by = decoded._id;
            req.body.updated_by = decoded._id;

            var requestOrder = new RequestOrder(req.body);
    
            requestOrder.save().then((order) => {
                res.status(200).json({Success:true,Message:'Order Placed Successfully'});
            }, (err) => {
                res.status(400).json(err);
            })
        }
    })

    // All Request Order
    .get('/requestorders/:franchise', passport.authenticate('jwt', { session: false }), (req, res) => {

        RequestOrder.find({ 'franchise': req.params.franchise ,'state':true,'status':true}).then((order) => {
            res.status(200).json(order);
        }, (err) => {
            res.status(400).json(err);
        })
    })

    .put('/updaterequestorder/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

        var requestId = req.params.id;

        RequestOrder.findOneAndUpdate({ 'requestId': requestId }, {
            $set: req.body
        }, { new: true }).then((requestorder) => {
            if (!requestorder) {
                res.status(404).json({ Message: 'No Such Order Found' });
            }
            res.status(200).json({Success:true,Message:'Order Updated Successfully'});

        }).catch((err) => {
            res.status(400).json(err);
        })
    })

    // Cancelation of requestorder 
    .put('/cancelorder/:id',(req,res)=>{

        RequestOrder.findOneAndUpdate({ 'requestId': req.params.id }, {
            $set: { state: false }
        }).then((order)=>{
            res.json({Message:"Order Cancelled"});
        }).catch((err)=>{
            res.json(err);
        });

    })
module.exports = { requestordersRouter }