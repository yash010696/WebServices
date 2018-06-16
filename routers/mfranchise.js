var express = require('express');
var Franchise = require('../models/franchise');
var Area = require('../models/area');

var mfranchiseRouter = express.Router();

///Create router for  register the new user.
mfranchiseRouter
        //Create router for fetching All subservice.
    .get('/getarea1',function(req, res) {
        Franchise.
        find({ statee: true }).
        populate('area').
        exec(function(err, franchises) {
            if (err) {
                res.status(500).send(err);
            }   
            res.status(200).json({franchises});
        });
    });

module.exports = {mfranchiseRouter};