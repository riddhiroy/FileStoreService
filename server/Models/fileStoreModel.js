const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FileStoreSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    }
})

const FileStore = mongoose.model('Files', FileStoreSchema)
module.exports = FileStore