var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var { Customer } = require('./customer');
var {RequestOrder}= require('./requestorder');
var Franchise=require('./franchise');

var undeliveredorderSchema = new mongoose.Schema({
    orderId:{
        type:Number,
        unique:true,
        default:1
    },
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Franchise'
    },
    messsage:{
        type:String,
        trim:true
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

var UndeliveredOrder = mongoose.model('UndeliveredOrder', undeliveredorderSchema, collection = "undeliveredorder");

module.exports = { UndeliveredOrder };

