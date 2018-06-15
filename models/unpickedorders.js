var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var { Customer } = require('./customer');
var { RequestOrder } = require('./requestorder');
var Franchise=require('./franchise');

var unpickedorderSchema = new mongoose.Schema({
    requestId: {
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
    franchise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Franchise'
      },
    pickupDate:{
        type:Date
    },
    timeSlot:{
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
    message: {
        type: String,
        required: true
    },
    status: {
        type: Boolean
    }
}, { timestamps: true });

var UnpickedOrder = mongoose.model('UnpickedOrder', unpickedorderSchema, collection = "unpickedorder");

module.exports = { UnpickedOrder };

