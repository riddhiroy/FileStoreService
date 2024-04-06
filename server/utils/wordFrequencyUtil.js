const { createClient} = require('redis')
const { GridFSBucket } = require('mongodb');

//Redis Client creation and Connection
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

// Function to add word frequencies in Redis sorted set
async function addWordFrequencies(data) {
    try{
        const words = data.split(/\s+/);
        const wordCounts = new Map();

        // Count word frequencies
        words.forEach(word => {
            wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
        });

        // Update Redis sorted set with word frequencies
        for (const [word, frequency] of wordCounts) {
            await redisClient.zIncrBy(key, frequency, word)
        }
        console.log('Updated word frequency for the new/modified file')
        return 1
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
            await redisClient.zAdd(`word_frequency`, { score: newFreq, value: word });
        }
        console.log('Removed word frequency for the deleted file')
        return 1
    } catch(error){
        console.log('Error encountered during frequency updation:', error)
        throw error
    }

}

const removeWordFrequenciesByFileId = async (fileId, storage) => {
    return new Promise((resolve, reject) => {
        console.log("check 1.5")
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
            await removeWordFrequencies(chunkData)
        });
        

        downloadStream.on('end', () => {
            // Perform word counting
            const wordCount = data.split(/\s+/).length;
            resolve(wordCount); // Resolve the promise with the word count
        });
    });
}

async function getLeastFreqWords(n){
    if (n==0) return []
    const leastFreqWords =  (await redisClient.zRange(key, 0, n-1))
    //await deleteAllFrequencies()
    return leastFreqWords
}

async function deleteAllFrequencies(){
    await redisClient.del(key)
}

module.exports = {redisClient, addWordFrequencies, removeWordFrequencies, getLeastFreqWords, removeWordFrequenciesByFileId}