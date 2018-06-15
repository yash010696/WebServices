var express = require('express');
var Franchise = require('../models/franchise');
var Area = require('../models/area');

var mfranchiseRouter = express.Router();

///Create router for  register the new user.
mfranchiseRouter
        //Create router for fetching All subservice.
    .get('/getfranchise',function(req, res) {
        Franchise.
        find({ statee: true }).
        populate('area').
        exec(function(err, franchises) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            console.log('The Franchise  is %s', franchises);
            res.status(200).json(franchises);
        });
    });

module.exports = {mfranchiseRouter};