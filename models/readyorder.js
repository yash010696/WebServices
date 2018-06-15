var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var { Customer } = require('./customer');
var {RequestOrder}= require('./requestorder');
var Franchise=require('./franchise');

var readyorderSchema = new mongoose.Schema({
    
    orderId:{
        type:Number,
        unique:true,
        default:1
    },
    locationType:{
        type:String,
        trim:true
    },
    quantity:{
        type:Number,
    },
    serviceName:{
        type:String,
        trim:true
    }, 
    serviceType:{
        type:String,
        trim:true,
        required:true
    },
    pickupDate:{
        type:Date
    },
    timeSlot:{
        type:String,
        trim:true
    },
    franchise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Franchise'
      },
    created_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required:true
      },
      updated_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required:true
      },
      status:{
        type: Boolean
      }

}, { timestamps: true });

var ReadyOrder = mongoose.model('ReadyOrder', readyorderSchema, collection = "readyorders");

module.exports = { ReadyOrder };

