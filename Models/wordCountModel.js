// Define schema for word count storage
const mongoose = require('mongoose')
const WordCountSchema = new mongoose.Schema({
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'uploads' // Reference to the 'uploads' collection where files are stored
    },
    count: {
      type: Number,
      required: true
    }
  });
  
  // Create a Mongoose model for word count
  const WordCount = mongoose.model("WordCount", WordCountSchema)
  module.exports = WordCount