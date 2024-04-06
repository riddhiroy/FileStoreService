const { GridFSBucket } = require('mongodb');
const WordCount = require('../Models/wordCountModel');
const { addWordFrequencies, removeWordFrequencies } = require('./wordFrequencyUtil');

// Calculate word count for a file identified by file id
const wordCountByFileId = async (fileId, storage) => {
    return new Promise((resolve, reject) => {
        let wordCount = 0
        // Access file content using GridFSBucketReadStream
        const gfsBucket = new GridFSBucket(storage.db, {
            bucketName: 'uploads'
        });

        const downloadStream = gfsBucket.openDownloadStream(fileId);

        downloadStream.on('data', async (chunk) => {
            // Perform word counting in file data chunks
            chunkData = chunk.toString('utf8')
            wordCount += chunkData.split(/\s+/).length;

            // Add entries to word frequency counter
            await addWordFrequencies(chunkData)
        });
        

        downloadStream.on('end', () => {
            // Return file word count
            resolve(wordCount); 
        });
    });
}

// Count and save the word count in MongoDB
const countWordsAndSave = async (fileId, storage)=>{
    const wordCount = await wordCountByFileId(fileId, storage);

    // Save word count to the wordcounts collection
    try {
        const wordCountEntry = new WordCount({
            fileId: fileId,
            count: wordCount
        });
        await wordCountEntry.save();
    } catch (error) {
        console.error("Error saving word count:", error);
        throw error
    }
}

const removeWordCount = async (fileId)=>{
    // Remove word count from the wordcounts collection
    try {
        // Find the word count entry based on the file ID and remove it
        const wordCountEntry = await WordCount.findOne({ fileId: fileId })
        if (wordCountEntry) {
            const count = wordCountEntry.count

            // Delete the word count entry, by Id is faster
            await WordCount.findByIdAndDelete(wordCountEntry._id)
            return
        } else {
            console.log(`No word count entry found for file ID ${fileId}.`)
            return new Error(`No word count entry found for file ID ${fileId}.`)
        }
    } catch (error) {
        console.error("Error removing word count entry:", error)
        throw error
    }
}

const getTotalWordCount = async() => {
    // Aggregate the total word count across all files
    let total = 0
    const totalWordCount = await WordCount.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: '$count' }
            }
        }
    ]);
    if ( totalWordCount.length != 0 ) 
        total = totalWordCount[0].total
    return total
}

module.exports = { countWordsAndSave, removeWordCount, getTotalWordCount }