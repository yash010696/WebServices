var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var Admininfo = require('./admininfo');
var clothdefectSchema = new Schema({
  // id: {
  //   type:Number,
  //   unique:true,
  //   default:1
  // },
  defect_name: {
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
}, { collection: 'clothdefects' });

module.exports = mongoose.model('Clothdefect', clothdefectSchema);
