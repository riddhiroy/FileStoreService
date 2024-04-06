const Joi = require('joi');
const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
const Grid = require('gridfs-stream');
const fs = require('fs');
const methodOverride = require('method-override');
const { name } = require('ejs');

const WordCount = require('./Models/wordCountModel');
const { countWordsAndSave } = require('./utils/wordCountUtil');
const { getFileByFilename, deleteFileByFilename } = require('./utils/crudUtil');
const { redisClient, getLeastFreqWords } = require('./utils/wordFrequencyUtil')
const { getTotalWordCount } = require('./utils/wordCountUtil')

const app = express();

// Middleware 
app.use(bodyParser.json())
app.use(express.json());
app.use(methodOverride('_method'))


app.set('view engine' , 'ejs');

//Redis Client creation and Connection
redisClient.connect()
redisClient.on('connect', () => {
    console.log('Connected to Redis database WordFrequencyStore...');
});
// Listen for 'error' event to handle errors
redisClient.on('error', (error) => {
    console.error('Error connecting to Redis:', error);
});


// MongoDB URI
const mongoURI = 'mongodb+srv://riddhiroy2000:riddhiroypassword@mongoclusterriddhi.ljucxap.mongodb.net/FileStore?retryWrites=true&w=majority'

// MongoDB Connection
const conn = mongoose.createConnection(mongoURI)
mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

db.once('open', () => {
    console.log('Connected to MongoDB database FileStore... ');
});

let gfs
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo)
    gfs.collection('uploads')
})

// Create mongodb file storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = file.originalname
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads'
            }
            resolve(fileInfo)
        })
    }
});

// Set GridFsStorage as destination for storing uploaded files

const upload = multer({
    storage: storage,
    // Filter file uplaod based on request method
    fileFilter: async function (req, file, callback) {
        const filename = file.originalname
        const existingFile = await getFileByFilename(filename, gfs)
        if(existingFile) {
            if (req.method === 'POST') // add request, does not allow adding when file exists
                return callback(`Error: File upload attempted for an already existing file ${filename}`)
            else if (req.method === 'PUT') { // update request, updates the file when file exists
                console.log(`Existing file ${filename} getting updated ...`)
                const fileDeleteStatus = await deleteFileByFilename(filename, gfs, conn, storage)
            }
        } else if(req.method === 'PUT'){ // update request, creates file when file is new
            console.log(`File did not exist in store. Creating file ${filename} ...`);
            console.log(`File: ${JSON.stringify(file)}`)
        }
        callback(null, true)
    }
})


// @route POST /
// @desc uplaods file to db
app.post('/add', upload.single('file'), async (req, res) => {
    console.log("File Added:\n", {file: req.file})
    await countWordsAndSave(req.file.id, storage)
    res.send(`Added file ${req.file.originalname} to the file store.`)
})

// @route GET /
// @desc lists file names stored in db
app.get('/ls', async (req, res) => {
    try {
        let files = await gfs.files.find().toArray();
        
        // Extract filenames from the files array
        let filenames = files.map(file => file.filename);

        // Send the array of filenames in the response
        console.log(`Listing stored filenames: ${filenames}`)
        res.send(filenames);
    } catch (error) {
        console.log(`Internal Error: ${error.message}`)
        res.status(500).send(`Internal Error`)
    }
})

// @route DELETE /
// @desc removes files from db
app.delete('/rm', async (req, res) => {
    //validating request body
    const schema = Joi.object({
        name: Joi.string().required()
    })
    const result = schema.validate(req.body)
    if(result.error) {
        //400 Bad Request
        console.log(`Invalid request: ${result.error.details[0].message}`)
        res.status(400).send(`Invalid request: ${result.error.details[0].message}`)
        return
    }

    //Deletion operation starts
    try {
        const filename = req.body.name
        const fileDeleteStatus = await deleteFileByFilename(filename, gfs, conn, storage)
        switch(fileDeleteStatus){
            case 0:
                console.log('File does not exist in the file store.')
                return res.status(404).send('File does not exist in the file store.')
            case 1:
                console.log('File successfully removed from store.')
                return res.status(200).send(`File successfully removed from store.`)
        }
    } catch (error) {
        console.log(`Internal Error: ${error.message}`)
        res.status(500).send(`Internal Error`)
    }
})

// @route PUT /
// @desc updates existing files and creates new files
app.put('/update', upload.single('file'), async (req, res) => {
    try {
        await countWordsAndSave(req.file.id, storage)
        res.send(`Updated file ${req.file.originalname} in the file store.`)
    } catch (error) {
        console.log(`Internal Error: ${error.message}`);
        res.status(500).send(`Internal Error`);
    }
})

// @route GET /
// @desc gets the total word count in all files
app.get('/wc', async (req, res) => {
    try {
        const total = await getTotalWordCount()
        console.log(`Total word count retrieved: ${total}`)
        res.send(`${total}`);
    } catch (error) {
        console.error('Internal Error:', error.message);
        res.status(500).send(`Internal Error`);
    }
})

// @route GET /
// @desc displays the n least frequent words in all currently stored files
app.get('/freq-words/:n', async (req, res) => {
    //Work in progress
    try {
        const n = req.params.n
        const leastFreqWords = await getLeastFreqWords(n)
        res.status(200).send(leastFreqWords)
    } catch (error){
        console.error(`Internal Error: ${error.message}`);
        res.status(500).send(`Internal Error`);
    }
})

app.listen(5000, () => console.log('Listening on port 5000...'))
