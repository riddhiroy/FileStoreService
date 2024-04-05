const Redis = require('redis');
const { createClient} = require('redis')
const { promisify } = require('util');

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

// Promisify Redis commands for easier async/await usage
const zaddAsync = promisify(redisClient.zAdd).bind(redisClient);
const zscoreAsync = promisify(redisClient.zScore).bind(redisClient);
const zremAsync = promisify(redisClient.zRem).bind(redisClient);

// Function to add word frequencies in Redis sorted set
async function addWordFrequencies(data) {
    try{
        const words = data.split(/\s+/);
        const wordCounts = new Map();

        // Count word frequencies
        words.forEach(word => {
            wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
        });

        console.log(wordCounts)
        // Update Redis sorted set with word frequencies
        for (const [word, frequency] of wordCounts) {
            await redisClient.zAdd(`word_frequency`, {
                score: frequency,
                value: word
            });
        }
        const a = await redisClient.zRange(`word_frequency`,0,5,'withscores',function(err,result){
            //result is array
            // here even index will hold member
            // odd index will hold its score
         })
        console.log('Updated word frequency for the new/modified files')
        return 1
    } catch {
        console.log('Error encountered during frequency updation')
    }
}

// Function to remove word frequencies from Redis sorted set
async function removeWordFrequencies(data) {
    const words = data.split(/\s+/);

    // Decrement frequency values in Redis sorted set
    for (const word of words) {
        await zscoreAsync('word_frequencies', word)
            .then(async score => {
                if (score !== null) {
                    await zremAsync('word_frequencies', word);
                }
            });
    }
}

async function getLeastFreqWords(n){
    const a = await redisClient.zRange(`word_frequency`,0,n,'withscores',function(err,result){
        //result is array
        // here even index will hold member
        // odd index will hold its score
     })

}

module.exports = {redisClient, addWordFrequencies, removeWordFrequencies, getLeastFreqWords}