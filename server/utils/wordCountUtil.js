const { GridFSBucket } = require('mongodb');
const WordCount = require('../Models/wordCountModel');
const { addWordFrequencies, removeWordFrequencies } = require('./wordFrequencyUtil')

// Calculates word count for a file identified by file id
const wordCountByFileId = async (fileId, storage) => {
    return new Promise((resolve, reject) => {
        // Accessing file content using GridFSBucketReadStream
        const bucket = new GridFSBucket(storage.db, {
            bucketName: 'uploads'
        });

        const downloadStream = bucket.openDownloadStream(fileId);
        let data = '';

        downloadStream.on('data', async (chunk) => {
            chunkData = chunk.toString('utf8')
            data += chunkData;
            //add entries to word frequency here.
            await addWordFrequencies(chunkData)
        });
        

        downloadStream.on('end', () => {
            // Perform word counting
            const wordCount = data.split(/\s+/).length;
            resolve(wordCount); // Resolve the promise with the word count
        });
    });
}

//Counts and saves the word count in db
const countWordsAndSave = async (fileId, storage)=>{
    // Count words
    const wordCount = await wordCountByFileId(fileId, storage);
    console.log(`Calculated word count: ${wordCount}`);

    // Save word count to the wordcounts collection
    try {
        const wordCountEntry = new WordCount({
            fileId: fileId,
            count: wordCount
        });
        const wc = wordCountEntry.save();
        console.log("Word count saved successfully.");
    } catch (error) {
        console.error("Error saving word count:", error);
        throw error
    }
}

const removeWordCount = async (fileId)=>{
    // remove word count from the wordcounts collection
    try {
        // Find the word count entry based on the file ID and remove it
        const wordCountEntry = await WordCount.findOne({ fileId: fileId });
        if (wordCountEntry) {
            // Retrieve the count value
            const count = wordCountEntry.count;
            console.log(wordCountEntry)

            // Delete the word count entry, by Id is faster
            const deletedEntry = await WordCount.findByIdAndDelete(wordCountEntry._id);

            console.log(`Word count entry for file ID ${fileId} with count ${count} removed successfully.`);
            return { fileId: fileId, count: count };
        } else {
            console.log(`No word count entry found for file ID ${fileId}.`);
            return null;
        }
    } catch (error) {
        console.error("Error removing word count entry:", error)
        throw error
    }
}

module.exports = { countWordsAndSave, removeWordCount }