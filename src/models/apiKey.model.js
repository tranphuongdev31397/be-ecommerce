'use strict'

const DOCUMENT_NAME = 'ApiKey'
const COLLECTION_NAME = 'ApiKeys'

const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const apiKeySchema = new mongoose.Schema({
    key:{
        type:String,
        required:true,
        unique:true,
    },
    status:{
        type:Boolean,
        default: true
    },
    permissions:{
        type:[String],
        required:true,
        enum: ['0000', '1111', '2222'],
    }
   
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, apiKeySchema);