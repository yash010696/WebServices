var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var Admininfo = require('./admininfo');
var subserviceSchema = new Schema({
  // id: {
  //   type:Number,
  //   unique:true,
  //   default:1
  // },
  name: {
    type:String,
    required:true,
    unique:true
  },
  code: {
    type:String,
    required:true,
    unique:true
  },
  created_by:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admininfo'
  },
  created_at:{
    type: Date,
  },
  updated_by:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admininfo'
  },
  updated_at:{
    type: Date
  },
  status:{
    type: Boolean
  },
  state:{
    type: Boolean
  }
}, { collection: 'subservices' });

module.exports = mongoose.model('Subservice', subserviceSchema);
