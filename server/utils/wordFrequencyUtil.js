const { createClient} = require('redis')
const { GridFSBucket } = require('mongodb');
const { REDIS_SORTED_SET_NAME, REDIS_PASSWORD, REDIS_HOST, REDIS_PORT, GRIDFS_BUCKET_NAME_UPLOADS } = require('../constants/commonConstants');

// Redis client creation and connection
const redisClient = createClient({
    password: REDIS_PASSWORD,
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
    }
});

// Function to add word frequencies in Redis sorted set, return map of wordCounts for the file
async function addWordFrequencies(data) {
    try{
        const words = data.split(/\s+/);
        const wordCounts = new Map();

        // Count word frequencies
        words.forEach(word => {
            wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
        });

        // Update frequency values in Redis sorted set
        for (const [word, frequency] of wordCounts) {
            await redisClient.zIncrBy(REDIS_SORTED_SET_NAME, frequency, word)
        }
        return wordCounts
    } catch (error) {
        console.log('Error encountered during frequency updation:', error)
        throw error
    }
}

// Function to remove word frequencies from Redis sorted set
async function removeWordFrequencies(data) {
    try {
        const words = data.split(/\s+/);
        const wordCounts = new Map();

        // Count word frequencies
        words.forEach(async word => {
            wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
        });

        // Update frequency values in Redis sorted set
        for (const [word, frequency] of wordCounts) {
            const oldFreq = await redisClient.zScore(REDIS_SORTED_SET_NAME, word)
            const newFreq = oldFreq - frequency
            if (newFreq == 0) {
                // Delete the entry when frequency becomes 0
                try {
                    await redisClient.zRem(REDIS_SORTED_SET_NAME,word);
                } catch (error) {
                    console.error('Error removing word from sorted set:', error);
                    throw error
                }
            } else {
                await redisClient.zAdd(REDIS_SORTED_SET_NAME, { score: newFreq, value: word });
            }
        }
        return 1
    } catch(error){
        console.log('Error encountered during frequency updation:', error)
        throw error
    }

}


// Calculate word count for a file identified by file id
const removeWordFrequenciesByFileId = async (fileId, storage) => {
    return new Promise((resolve, reject) => {
        // Accessing file content using GridFSBucketReadStream
        const bucket = new GridFSBucket(storage.db, {
            bucketName: GRIDFS_BUCKET_NAME_UPLOADS
        });

        const downloadStream = bucket.openDownloadStream(fileId);

        downloadStream.on('data', async (chunk) => {
            chunkData = chunk.toString('utf8')
            await removeWordFrequencies(chunkData)
        });

        downloadStream.on('end', () => {
            resolve(1); 
        });
    });
}

// Return list of n least frequent words
async function getLeastFreqWords(n){
    if (n==0) return []
    const leastFreqWords =  await redisClient.zRange(REDIS_SORTED_SET_NAME, 0, n-1)
    return leastFreqWords
}

// Return list of n least frequent words
async function getMostFreqWords(n){
    if (n==0) return []
    const totalSetEntries = await redisClient.zCard(REDIS_SORTED_SET_NAME)
    let mostFreqWords = []
    if(n > totalSetEntries) {
        mostFreqWords = await redisClient.zRange(REDIS_SORTED_SET_NAME, 0, totalSetEntries)
    } else {
        mostFreqWords = await redisClient.zRange(REDIS_SORTED_SET_NAME, totalSetEntries-n, totalSetEntries)
    }
    // Set return array to descending order of frequency
    return mostFreqWords.reverse()
}

// Delete all frequency entries from Redis sorted set
async function deleteAllFrequencies(){
    await redisClient.del(REDIS_SORTED_SET_NAME)
}

module.exports = {redisClient, addWordFrequencies, getLeastFreqWords, getMostFreqWords, removeWordFrequenciesByFileId}