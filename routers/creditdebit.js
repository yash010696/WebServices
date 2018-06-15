var express = require('express');
var localStorage = require('localStorage');
var jwt = require('jsonwebtoken');
var passport = require('passport');
require('./../config/passport')(passport);
var config = require('./../config/config');

var creditdebitRouter = express.Router();
var  Customer  = require('./../models/customer');
var { CreditDebit } = require('./../models/creditdebit');

creditdebitRouter

    .post('/creditdebit', passport.authenticate('jwt', { session: false }), (req, res) => {

        var token = req.header('Authorization').split(' ');
        var decoded = jwt.verify(token[1], config.secret);

        if (req.body.BillAmount == req.body.PaidAmount) {
            CreditDebit.find({ 'created_by': decoded._id }).then((customer) => {
                if (!customer[0]) {
                    var creditDebit = new CreditDebit();
                    creditDebit.created_by = decoded._id;
                    creditDebit.updated_by = decoded._id;

                    creditDebit.save().then((data) => {
                        res.json(data);
                    })
                }
                else {
                    res.json(customer);
                }
            }).catch((err) => {
                res.json(err);
            })
        }
        else if (req.body.BillAmount > req.body.PaidAmount) {
            var PendingAmount = req.body.BillAmount - req.body.PaidAmount;

            CreditDebit.find({ 'created_by': decoded._id }).then((customer) => {

                if (!customer[0]) {
                    var creditDebit = new CreditDebit();
                    creditDebit.PendingAmount = PendingAmount;
                    creditDebit.created_by = decoded._id;
                    creditDebit.updated_by = decoded._id;
                    creditDebit.save().then((data) => {
                        res.json(data);
                    })
                }
                else {
                    CreditDebit.findOne({ 'created_by': decoded._id }).then((customer) => {

                        NewPendingAmount = customer.PendingAmount + PendingAmount;
                        if (NewPendingAmount > customer.BalanceAmount) {

                            PendingAmount1 = NewPendingAmount - customer.BalanceAmount;

                            CreditDebit.findOneAndUpdate({ 'created_by': decoded._id }, {
                                $set: {
                                    BalanceAmount: 0,
                                    PendingAmount: PendingAmount1
                                }
                            }, { new: true }).then((customer) => {
                                res.json(customer);
                            })
                        } else { //(NewPendingAmount < customer.BalanceAmount)

                            NewBalanceAmount = customer.BalanceAmount - NewPendingAmount;

                            CreditDebit.findOneAndUpdate({ 'created_by': decoded._id }, {
                                $set: {
                                    PendingAmount: 0,
                                    BalanceAmount: NewBalanceAmount
                                }
                            }, { new: true }).then((customer) => {
                                res.json(customer);
                            })
                        }
                    })
                }
            }).catch((err) => {
                res.json(err);
            })
        }
        else if (req.body.BillAmount < req.body.PaidAmount) {

            var BalanceAmount = req.body.PaidAmount - req.body.BillAmount;
            CreditDebit.find({ 'created_by': decoded._id }).then((customer) => {

                if (!customer[0]) {
                    var creditDebit = new CreditDebit();
                    creditDebit.BalanceAmount = BalanceAmount;
                    creditDebit.created_by = decoded._id;
                    creditDebit.updated_by = decoded._id;

                    creditDebit.save().then((data) => {
                        res.json(data);
                    })
                }
                else {

                    CreditDebit.findOne({ 'created_by': decoded._id }).then((customer) => {

                        NewBalanceAmount = customer.BalanceAmount + BalanceAmount;
                        if (NewBalanceAmount > customer.PendingAmount) {
                            BalanceAmount1 = NewBalanceAmount - customer.PendingAmount;
                            CreditDebit.findOneAndUpdate({ 'created_by': decoded._id }, {
                                $set: {
                                    BalanceAmount: BalanceAmount1,
                                    PendingAmount: 0
                                }
                            }, { new: true }).then((customer) => {
                                res.json(customer);
                            })

                        } else {  // (BalanceAmount < customer.PendingAmount)
                            NewPendingAmount = customer.PendingAmount - NewBalanceAmount;
                            CreditDebit.findOneAndUpdate({ 'created_by': decoded._id }, {
                                $set: {
                                    PendingAmount: NewPendingAmount,
                                    BalanceAmount: 0
                                }
                            }, { new: true }).then((customer) => {
                                res.json(customer);
                            })
                        }
                    })
                }
            }).catch((err) => {
                res.json(err);
            })
        }
    })

    .get('/creditdebitamount', passport.authenticate('jwt', { session: false }), (req, res) => {

        var token = req.header('Authorization').split(' ');
        var decoded = jwt.verify(token[1], config.secret);

        CreditDebit.find({ 'created_by': decoded._id }).then((customer) => {

            res.status(200).json(customer);
        },(err)=>{
            res.status(400).json(err);
        })
    })
module.exports = { creditdebitRouter };