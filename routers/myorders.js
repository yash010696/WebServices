var express = require('express');
var jwt = require('jsonwebtoken');
var passport = require('passport');
require('./../config/passport')(passport);
var config = require('./../config/config');

var { RequestOrder } = require('./../models/requestorder');
var {ReadyOrder}=require('./../models/readyorder');
var MyOrdersRouter = express.Router();

MyOrdersRouter
    .get('/orderstatus', passport.authenticate('jwt', { session: false }), (req, res) => {
        res.json("order status pending");
    })

    .get('/myorders', passport.authenticate('jwt', { session: false }), (req, res) => {

        var token = req.header('Authorization').split(' ');
        var decoded = jwt.verify(token[1], config.secret)
        console.log(decoded._id);
        ReadyOrder.find({ 'created_by': decoded._id }).then((orders) => {
            res.status(200).json(orders);
        }, (err) => {
            res.status(400).json(err);
        })
    })
module.exports = { MyOrdersRouter }
