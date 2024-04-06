const { createClient} = require('redis')
const { GridFSBucket } = require('mongodb');

// Redis client creation and connection
const redisHost = 'redis-18855.c305.ap-south-1-1.ec2.cloud.redislabs.com'
const redisPassword = 'fA8zf3avUWuXPA6hdIyWn7HReO5JSt5S'
const redisPort = 18855
const redisClient = createClient({
    password: redisPassword,
    socket: {
        host: redisHost,
        port: redisPort
    }
});
const key = `word_frequency`

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
            await redisClient.zIncrBy(key, frequency, word)
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
            const oldFreq = await redisClient.zScore(key, word)
            const newFreq = oldFreq - frequency
            if (newFreq == 0) {
                // Delete the entry when frequency becomes 0
                try {
                    await redisClient.zRem(key,word);
                } catch (error) {
                    console.error('Error removing word from sorted set:', error);
                    throw error
                }
            } else {
                await redisClient.zAdd(key, { score: newFreq, value: word });
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
            bucketName: 'uploads'
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
    const leastFreqWords =  await redisClient.zRange(key, 0, n-1)
    return leastFreqWords
}


// Delete all frequency entries from Redis sorted set
async function deleteAllFrequencies(){
    await redisClient.del(key)
}

module.exports = {redisClient, addWordFrequencies, getLeastFreqWords, removeWordFrequenciesByFileId}