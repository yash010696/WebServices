var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var { Customer } = require('./customer');
var {RequestOrder}= require('./requestorder');
var Franchise=require('./franchise');

var orderdeliveredSchema = new mongoose.Schema({
    OrderId:{
        type:Number,
        unique:true,
        default:1
    },
    Franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Franchise'
    },
    
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  status: {
    type: Boolean
  }
}, { timestamps: true });

var OrderDelivered = mongoose.model('OrderDelivered', orderdeliveredSchema, collection = "ordersdelivered");

module.exports = { OrderDelivered };

