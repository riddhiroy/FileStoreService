const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { removeWordCount} = require('./wordCountUtil');
const { removeWordFrequenciesByFileId} = require('./wordFrequencyUtil');
const { GRIDFS_BUCKET_NAME_UPLOADS } = require('../constants/commonConstants');


// Get a file by filename
const getFileByFilename = async (filename, gfs) => {
    try {
        return await gfs.files.findOne({ filename });
    } catch (error) {
        throw error;
    }
};

// Delete a file by filename: returns 1 : successful, 0 : failure
const deleteFileByFilename = async (filename, gfs, conn, storage) => {
    try {
        const file = await getFileByFilename(filename, gfs)
        // check if file exists in file store
        if(!file){
            return 0
        }

        // make fileId format Bson compatible
        const fileId = JSON.stringify(file._id);
        const formattedFileId = new ObjectId( JSON.parse(fileId.replace(/'/g, '"')))

        // Remove frequency entries 
        await removeWordFrequenciesByFileId(formattedFileId, storage)
        
        //Remove word count entries
        await removeWordCount(file._id)
        
        const gsfBucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: GRIDFS_BUCKET_NAME_UPLOADS });
        await gsfBucket.delete(file._id);
        return 1
    } catch (error) {
        console.log(error.message)
        throw error
    }
}

const getArrayOfExistingfiles = async(gfs)=>{
    return  await gfs.files.find().toArray()
}

// Check if string is numeric(with a positive integer) or not
function isNumeric(str) {
    const a =  /^\d+$/.test(str)
    return a; // Matches only digits
  }

module.exports = { getFileByFilename, deleteFileByFilename, isNumeric, getArrayOfExistingfiles }
