var express = require('express');
const config = require('../config/config');
var passport = require('passport');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var Order = require('../models/order');
var Invoice = require('../models/invoice');
var Ordertransaction = require('../models/ordertransaction');
var Verifytoken = require('./loginadmin');
var Customer = require('../models/customer');
var Franchise = require('../models/franchise');
var Area = require('../models/area');
var Servicetype = require('../models/servicetype');
var Service = require('../models/service');
var Subservice = require('../models/subservice');
var Garment = require('../models/garment');
var Price = require('../models/price');
var Color = require('../models/color');
var Brand = require('../models/brand');
var Pattern = require('../models/pattern');
var Clothdefect = require('../models/clothdefect');
var Coupon = require('../models/coupon');
var Tag = require('../models/tag');
var orderRouter = express.Router();
const checkAuth = require('../middlewear/check-auth');
//Create router for  register the new role.
orderRouter
    .route('/order')
    .post(checkAuth, function(req, res) {
        // console.log("********************************");
        // console.log(JSON.stringify(req.body, undefined, 2));
        // console.log("********************************");
        let orderTransaction_array = [];
        let orderTagGeneration_array = [];
        let autoGeneratedOrderId;

        if (!req.body) {
            res.json({ success: false, msg: 'Please Enter Required Data.' });
        } else {

            var counter;
            var orderid;
            var areacode;
            Franchise.find({ statee: true, area: req.userData.area }).
            populate('area').
            exec(function(err, franchises) {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                // console.log('The Franchise  is', franchises[0].area);
                areacode = franchises[0].area.code;
                Order.find({ franchise: req.userData.franchise }).exec(function(err, results) {
                    var count = results.length;
                    counter = count + 1;
                    var str = "" + counter;
                    var pad = "0000";
                    var ans = pad.substring(0, pad.length - str.length) + str;
                    orderid = areacode + ans;
                    // console.log("orderid",orderid)
                    savedata(counter, orderid);

                });
            });

        }

        function savedata(counter, orderid) {
            var myDateString = Date();
            var cc = counter;

            var order = new Order({
                // id:cc,
                order_id: orderid,
                customer: req.body.orderDetails.userid,
                franchise: req.userData.franchise,
                servicetype: req.body.orderDetails.serviceId,
                order_status: "In Process",
                order_amount: req.body.orderDetails.netAmount,
                created_by: req.userData._id,
                created_at: myDateString,
                updated_by: null,
                updated_at: myDateString,
                status: true,
                state: true
            });

            order.save(function(err) {
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                Order.findOne({ order_id: orderid }, function(err, orderResult) {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }
                    autoGeneratedOrderId = orderResult._id;

                    saveorderdata(counter, orderid, autoGeneratedOrderId);
                });
            });


            function saveorderdata(counter, orderid, autoGeneratedOrderId) {
                var myDateString = Date();
                var cc = counter;

                req.body.orderServicesList.forEach((service, index) => {

                    const subServiceList = [];
                    const subServiceListForTag = [];
                    service.subservices.forEach((subservice, subIndex) => {
                        const garmentListArray = [];
                        const garmentListForTag = [];
                        subservice.garmentsList.forEach((garment, garmentIndex) => {
                            const garmentDetailsArray = [];
                            const garmentTagsArray = [];
                            let garmentQty = 1
                            garment.garmentDetails.forEach((garmentDetail, garmentDetailsIndex) => {
                                const garmentDetailsObj = {
                                    '_id': garmentDetail._id,
                                    'brand': garmentDetail.brand._id,
                                    'color': garmentDetail.color._id,
                                    'pattern': garmentDetail.pattern._id,
                                    'clothdefect': garmentDetail.defect._id,
                                }
                                garmentDetailsArray.push(garmentDetailsObj);

                                let garmentQtyText = garmentQty + "/" + garment.qty;
                                garmentQty++;
                                let firstName = req.body.orderDetails.customerFirstName;
                                //let dt  =  new Date();
                                let price = garment.price;
                                let tag = orderid + '|' + firstName + '|' + service.code + '|' + garmentQtyText + '|' + garmentDetail.brand.brand_name + '|' + garmentDetail.color.color_name + '|' + garmentDetail.defect.defect_name + '|' + garmentDetail.pattern.pattern_name +
                                    "| 18 Jun 18 |" + garment.garment.name + ' ' + garment.qty + "| 21 Jun 18";

                                let tagFormat = orderid + '|' + service.name + '|' + subservice.name + '|' + garment.garment.name + '|Qyt:' + garment.qty + '|' +
                                    garmentDetail.brand.brand_name + '|' + garmentDetail.color.color_name + '|' + garmentDetail.defect.defect_name + '|' + garmentDetail.pattern.pattern_name;

                                const tagObj = {
                                    '_id': garmentDetail._id,
                                    "tag_Format": tagFormat,
                                    "tag_Text": tag,
                                    "price": price,
                                    "subService": subservice.name,
                                    "garmentQty": garment.qty,
                                    "barcode_Number": "12413456513562",
                                    'brand': garmentDetail.brand._id,
                                    'color': garmentDetail.color._id,
                                    'pattern': garmentDetail.pattern._id,
                                    'clothdefect': garmentDetail.defect._id,
                                }
                                garmentTagsArray.push(tagObj);

                            })

                            const garmentObj = {
                                '_id': garment.garment._id,
                                'garmentdetails': garmentDetailsArray
                            }

                            const garmentTagObject = {
                                '_id': garment.garment._id,
                                'garmentTagDetails': garmentTagsArray
                            }

                            garmentListForTag.push(garmentTagObject);
                            garmentListArray.push(garmentObj);
                        })
                        const subServiceObj = {
                            '_id': subservice._id,
                            'garmentlist': garmentListArray
                        }

                        const subServiceObjForTag = {
                            '_id': subservice._id,
                            'garmentlist': garmentListForTag
                        }
                        subServiceListForTag.push(subServiceObjForTag);
                        subServiceList.push(subServiceObj);
                    })

                    const orderServiceTransaction = {
                        '_id': service._id,
                        'subservice': subServiceList
                    };

                    const orderTagGeneration = {
                        '_id': service._id,
                        'subservice': subServiceListForTag
                    };

                    orderTransaction_array.push(orderServiceTransaction);
                    orderTagGeneration_array.push(orderTagGeneration);
                })

                var finalTagGeneration = new Tag({
                    "order": autoGeneratedOrderId,
                    "order_id": orderid,
                    "franchise": req.userData.franchise,
                    "tagDetailsService": orderTagGeneration_array,
                    "customer_Id": req.body.orderDetails.userid,
                    "created_by": req.userData._id,
                    "created_at": myDateString,
                    "updated_by": null,
                    "updated_at": myDateString,
                    "status": true
                });

                var ordertransaction = new Ordertransaction({
                    "order_id": orderid,
                    "service": orderTransaction_array,
                    "customer": req.body.orderDetails.userid,
                    "servicetype": req.body.orderDetails.serviceId,
                    // "coupon": req.body.orderDetails.couponId,
                    "total_qty": req.body.orderDetails.totalQty,
                    "total_beforedis": req.body.orderDetails.totalBeforeDiscount,
                    "total_afetrdis": req.body.orderDetails.totalAfterDiscount,
                    "net_amount": req.body.orderDetails.netAmount,
                    "discount_amount": req.body.orderDetails.discountAmt,
                    "cgst": req.body.orderDetails.selectedCGSTAmt,
                    "sgst": req.body.orderDetails.selectedSGSTAmt,
                    "gst": req.body.orderDetails.selectedCGSTAmt + req.body.orderDetails.selectedSGSTAmt,
                    "created_by": req.userData._id,
                    "created_at": myDateString,
                    "updated_by": null,
                    "updated_at": myDateString,
                    "status": true,
                });

                finalTagGeneration.save(function(err) {
                    console.log(" save tag ============================", err);
                    if (err) {
                        res.status(400).send(err);
                        return;
                    }
                })

                ordertransaction.save(function(err) {
                    if (err) {
                        res.status(400).send(err);
                        return;
                    }
                    console.log("  counter, orderid ============================", counter, orderid);
                    saveinvoice(counter, orderid);
                });

                function saveinvoice(counter, orderid) {
                    Franchise.find({ statee: true, area: req.userData.area }).

                    populate('area').
                    exec(function(err, franchises) {
                        if (err) {
                            res.status(500).send(err);
                            return;
                        }
                        // console.log('The Franchise  is', franchises[0].area);
                        areacode = franchises[0].area.code;
                        Order.find({ franchise: req.userData.franchise }).exec(function(err, results) {
                            var count = results.length;
                            counter = count + 1;
                            var str = "" + counter;
                            var pad = "0000";
                            var ans = pad.substring(0, pad.length - str.length) + str;
                            orderid = areacode + ans;
                            savedata(counter, orderid);
                        });
                    });

                }

                function savedata(counter, orderid) {
                    var myDateString = Date();
                    var cc = counter;

                    var order = new Order({
                        // id:cc,
                        order_id: orderid,
                        customer: req.body.orderDetails.userid,
                        franchise: req.userData.franchise,
                        servicetype: req.body.orderDetails.serviceId,
                        order_status: "In Process",
                        order_amount: req.body.orderDetails.netAmount,
                        created_by: req.userData._id,
                        created_at: myDateString,
                        updated_by: null,
                        updated_at: myDateString,
                        status: true,
                        state: true
                    });

                    order.save(function(err) {
                        if (err) {
                            res.status(400).send(err);
                            return;
                        }
                        Order.findOne({ order_id: orderid }, function(err, orderResult) {
                            if (err) {
                                console.log(err)
                                res.status(500).send(err);
                                return;
                            }
                            autoGeneratedOrderId = orderResult._id;

                            saveorderdata(counter, orderid, autoGeneratedOrderId);
                        });
                    });


                    function saveorderdata(counter, orderid, autoGeneratedOrderId) {
                        var myDateString = Date();
                        var cc = counter;

                        req.body.orderServicesList.forEach((service, index) => {

                            const subServiceList = [];
                            const subServiceListForTag = [];
                            service.subservices.forEach((subservice, subIndex) => {
                                const garmentListArray = [];
                                const garmentListForTag = [];
                                subservice.garmentsList.forEach((garment, garmentIndex) => {
                                    const garmentDetailsArray = [];
                                    const garmentTagsArray = [];
                                    let garmentQty = 1
                                    garment.garmentDetails.forEach((garmentDetail, garmentDetailsIndex) => {
                                        const garmentDetailsObj = {
                                            '_id': garmentDetail._id,
                                            'brand': garmentDetail.brand._id,
                                            'color': garmentDetail.color._id,
                                            'pattern': garmentDetail.pattern._id,
                                            'clothdefect': garmentDetail.defect._id,
                                        }
                                        garmentDetailsArray.push(garmentDetailsObj);

                                        let garmentQtyText = garmentQty + "/" + garment.qty;
                                        garmentQty++;
                                        let firstName = req.body.orderDetails.customerFirstName;
                                        let lastName = req.body.orderDetails.customerLastName;
                                        //let dt  =  new Date();

                                        let tag = orderid + '|' + firstName + ' ' + lastName + '|' + service.code + '|' + garmentQtyText + '|' + garmentDetail.brand.brand_name + '|' + garmentDetail.color.color_name + '|' + garmentDetail.defect.defect_name + '|' + garmentDetail.pattern.pattern_name +
                                            "| 18 Jun 18 |" + garment.garment.name + ' ' + garment.qty + "| 21 Jun 18";

                                        let tagFormat = orderid + '|' + service.name + '|' + subservice.name + '|' + garment.garment.name + '|Qyt:' + garment.qty + '|' +
                                            garmentDetail.brand.brand_name + '|' + garmentDetail.color.color_name + '|' + garmentDetail.defect.defect_name + '|' + garmentDetail.pattern.pattern_name;

                                        const tagObj = {
                                            '_id': garmentDetail._id,
                                            "tag_Format": tagFormat,
                                            "tag_Text": tag,
                                            "barcode_Number": "12413456513562",
                                            'brand': garmentDetail.brand._id,
                                            'color': garmentDetail.color._id,
                                            'pattern': garmentDetail.pattern._id,
                                            'clothdefect': garmentDetail.defect._id,
                                        }
                                        garmentTagsArray.push(tagObj);

                                    })

                                    const garmentObj = {
                                        '_id': garment.garment._id,
                                        'garmentdetails': garmentDetailsArray
                                    }

                                    const garmentTagObject = {
                                        '_id': garment.garment._id,
                                        'garmentTagDetails': garmentTagsArray
                                    }

                                    garmentListForTag.push(garmentTagObject);
                                    garmentListArray.push(garmentObj);
                                })
                                const subServiceObj = {
                                    '_id': subservice._id,
                                    'garmentlist': garmentListArray
                                }

                                const subServiceObjForTag = {
                                    '_id': subservice._id,
                                    'garmentlist': garmentListForTag
                                }
                                subServiceListForTag.push(subServiceObjForTag);
                                subServiceList.push(subServiceObj);
                            })

                            const orderServiceTransaction = {
                                '_id': service._id,
                                'subservice': subServiceList
                            };

                            const orderTagGeneration = {
                                '_id': service._id,
                                'subservice': subServiceListForTag
                            };

                            orderTransaction_array.push(orderServiceTransaction);
                            orderTagGeneration_array.push(orderTagGeneration);
                        })

                        var finalTagGeneration = new Tag({
                            "order": autoGeneratedOrderId,
                            "order_id": orderid,
                            "franchise": req.userData.franchise,
                            "tagDetailsService": orderTagGeneration_array,
                            "customer_Id": req.body.orderDetails.userid,
                            "created_by": req.userData._id,
                            "created_at": myDateString,
                            "updated_by": null,
                            "updated_at": myDateString,
                            "status": true
                        })

                        var ordertransaction = new Ordertransaction({
                            "order_id": orderid,
                            "service": orderTransaction_array,
                            "customer": req.body.orderDetails.userid,
                            "servicetype": req.body.orderDetails.serviceId,
                            // "coupon": req.body.orderDetails.couponId,
                            "total_qty": req.body.orderDetails.totalQty,
                            "total_beforedis": req.body.orderDetails.totalBeforeDiscount,
                            "total_afetrdis": req.body.orderDetails.totalAfterDiscount,
                            "net_amount": req.body.orderDetails.netAmount,
                            "discount_amount": req.body.orderDetails.discountAmt,
                            "cgst": req.body.orderDetails.selectedCGSTAmt,
                            "sgst": req.body.orderDetails.selectedSGSTAmt,
                            "gst": req.body.orderDetails.selectedCGSTAmt + req.body.orderDetails.selectedSGSTAmt,
                            "created_by": req.userData._id,
                            "created_at": myDateString,
                            "updated_by": null,
                            "updated_at": myDateString,
                            "status": true,

                        });

                        finalTagGeneration.save(function(err, tagRes) {
                            if (err) {
                                res.status(400).send(err);
                                return;
                            } else {
                                ordertransaction.save(function(err) {
                                    if (err) {
                                        res.status(400).send(err);
                                        return;
                                    }
                                    console.log("  counter, orderid, tag_id ============================", counter, orderid, tagRes._id);
                                    saveinvoice(counter, orderid, tagRes._id);
                                });
                            }

                        })

                        // ordertransaction.save(function(err) {
                        //     if (err) {
                        //         res.status(400).send(err);
                        //         return;
                        //     }
                        //     console.log("  counter, orderid ============================", counter, orderid);
                        //     saveinvoice(counter, orderid);
                        // });

                        function saveinvoice(counter, orderid, tagId) {
                            Franchise.find({ statee: true, area: req.userData.area }).
                            populate('area').
                            exec(function(err, franchises) {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send(err);
                                    return;
                                }
                                // console.log('The Franchise  is', franchises[0].area);
                                areacode = franchises[0].area.code;
                                Invoice.find({ franchise: req.userData.franchise }).exec(function(err, results) {
                                    var count = results.length;
                                    counter = count + 1;
                                    var str = "" + counter;
                                    var pad = "0000";
                                    var ans = pad.substring(0, pad.length - str.length) + str;
                                    invoiceid = areacode + ans;
                                    // console.log("orderid",orderid)

                                    Order.find({ order_id: orderid }).exec(function(err, results) {
                                        var orderno = results[0]._id;
                                        var ordertransactionno;
                                        Ordertransaction.find({ order_id: orderid }).exec(function(err, results) {
                                            ordertransactionno = results[0]._id;
                                            saveinvoicedata(counter, invoiceid, orderno, ordertransactionno, tagId);
                                            console.log("ordertransactionno", ordertransactionno);
                                        });
                                    });
                                });
                            });

                            function saveinvoicedata(counter, invoiceid, orderno, ordertransactionno) {
                                var myDateString = Date();
                                var cc = counter;

                                const invoice = new Invoice({
                                    // id:cc,
                                    invoice_id: invoiceid,
                                    tag: tagId,
                                    order: orderno,
                                    ordertransaction: ordertransactionno,
                                    customer: req.body.orderDetails.userid,
                                    franchise: req.userData.franchise,
                                    invoice_amount: req.body.orderDetails.netAmount,
                                    created_by: req.userData._id,
                                    created_at: myDateString,
                                    updated_by: null,
                                    updated_at: myDateString,
                                    status: true,
                                    state: true
                                });
                                invoice.save(function(err) {
                                    if (err) {
                                        res.status(400).send(err);
                                        return;
                                    }
                                    res.json({ success: true, msg: 'Successful created new order.' });
                                });
                            }
                        }
                    }
                }
            }
        }
    })

//Create router for fetching All roles.
.get(checkAuth, function(req, res) {
    if (req.userData.role == "admin") {
        Order.
        find().
        sort({ order_id: 'ascending' }).
            // sort('order_id', 'descending').
        populate('customer servicetype franchise').
        exec(function(err, orders) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            console.log('The Price  is %s', orders);
            res.json(orders);
        });
    } else {
        Order.
        find({ franchise: req.userData.franchise }).
        sort({ order_id: 'ascending' }).
        populate('customer servicetype franchise').
        exec(function(err, orders) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            console.log('The Price  is %s', orders);
            res.json(orders);
        });
    }
});


orderRouter
    .route('/orderbystore/:storeId')
    .get(checkAuth, function(req, res) {
        console.log('GET /orderbystore/:storeId');
        var storeId = req.params.storeId;

        Order.
        find({ franchise: storeId }).
        sort({ order_id: 'ascending' }).
        populate('customer servicetype franchise').
        exec(function(err, orders) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            console.log(orders);
            res.json(orders);
        });
    })
    // orderRouter
    //   .route('/ordertransaction/:orderid')
    //   .get(checkAuth, function (req, res) {
    //     console.log('GET /ordertransaction/:orderid');
    //     var orderid = req.params.orderid;
    //     Ordertransaction.
    //     find({order_id:orderid}).
    //     // populate('customer servicetype ').
    //     // populate('customer servicetype service subservice garment price color brand pattern clothdefect').
    //     exec(function (err, orderdata) {
    //       if (err) {
    //         res.status(500).send(err);
    //         return;
    //       }
    //       console.log('The Price  is %s', orderdata);
    //       res.json(orderdata);
    //     });
    //   })
    // Array.prototype.inArray = function(comparer) { 
    //   for(var i=0; i < this.length; i++) { 
    //       if(comparer(this[i])) return true; 
    //   }
    //   return false; 
    // }; 

// adds an element to the array if it does not already exist using a comparer 
// function
// Array.prototype.pushIfNotExist = function(element, comparer) { 
//   if (!this.inArray(comparer)) {
//       this.push(element);
//   }
// }; 


//Create router for fetching Single role.
// orderstateRouter
//   .route('/orderstates/:orderstateId')
//   .get(passport.authenticate('jwt', { session: false}),function (req, res) {

//     console.log('GET /orderstates/:orderstateId');

//     var orderstateId = req.params.orderstateId;

//     Orderstate.findOne({ id: orderstateId }, function (err, orderstate) {

//       if (err) {
//         res.status(500).send(err);
//         return;
//       }

//       console.log(orderstate);

//       res.json(orderstate);

//     });
//   })

//Create router for Updating role.
// .put(passport.authenticate('jwt', { session: false}),function (req, res) {

//   console.log('PUT /orderstates/:orderstateId');

//   var orderstateId = req.params.orderstateId;

//   Orderstate.findOne({ id: orderstateId }, function (err, orderstate) {

//     if (err) {
//       res.status(500).send(err);
//       return;
//     }
//     var myDateString = Date();
//     if (orderstate) {
//       orderstate.state = req.body.state;
//       orderstate.updated_by = req.body.updated_by;
//       orderstate.updated_at =myDateString

//       orderstate.save();

//       res.json(orderstate);
//       return;
//     }

//     res.status(404).json({
//       message: 'Unable to found.'
//     });
//   });
// })
module.exports = orderRouter;