// Required imports for the file
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { getFileIdFromfileName , removeWordCount} = require('./wordCountUtil')

// Get a file by filename
const getFileByFilename = async (filename, gfs) => {
    try {
        return await gfs.files.findOne({ filename });
    } catch (err) {
        throw err;
    }
};

// Delete a file by filename: returns 1 : successful, 0 : failure
const deleteFileByFilename = async (filename, gfs, conn) => {
    try {
        const file = await getFileByFilename(filename, gfs)
        // check if file exists in file store
        if(!file){
            return 0
        }
        await removeWordCount(file._id)
        const gsfb = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
        gsfb.delete(file._id);
        return 1
    } catch (error) {
        console.log(error.message)
        throw error
    }
}

module.exports = { getFileByFilename, deleteFileByFilename }
