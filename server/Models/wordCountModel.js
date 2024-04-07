// Define schema for word count storage
const mongoose = require('mongoose');
const { GRIDFS_BUCKET_NAME_UPLOADS, MONGODB_COLLECTION_WORDCOUNT } = require('../constants/commonConstants');
const WordCountSchema = new mongoose.Schema({
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: GRIDFS_BUCKET_NAME_UPLOADS // Reference to the 'uploads' collection where files are stored
    },
    count: {
      type: Number,
      required: true
    }
  });
  
  // Create a Mongoose model for word count
  const WordCount = mongoose.model(MONGODB_COLLECTION_WORDCOUNT, WordCountSchema)
  module.exports = WordCount