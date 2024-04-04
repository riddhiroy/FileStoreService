const Joi = require('joi');
const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const { name } = require('ejs');

const app = express();

// Middleware 
app.use(bodyParser.json())
app.use(express.json());
app.use(methodOverride('_method'))


app.set('view engine' , 'ejs');


// MongoDB URI
const mongoURI = 'mongodb+srv://riddhiroy2000:riddhiroypassword@mongoclusterriddhi.ljucxap.mongodb.net/FileStore?retryWrites=true&w=majority'

// MongoDB Connection
const conn = mongoose.createConnection(mongoURI)

let gfs
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo)
    gfs.collection('uploads')
})

// Create storage engine
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

// Set destination for storing uploaded files

const upload = multer({
    storage: storage,
    // Filter file uplaod based on request method
    fileFilter: async function (req, file, callback) {
        const existingFile = await getFileByFilename(file.originalname)
        if(existingFile) {
            if (req.method === 'POST')
                return callback(`Error: File upload attempted for an already existing file ${file.originalname}`)
            else if (req.method === 'PUT') {
                const isDeleted = await deleteFileByFilename(file.originalname)
                console.log(isDeleted)
                return callback(null, true)
            }
        }
        if(req.method === 'PUT'){
            console.log(`File did not exist in store. Created file ${file.originalname}`);
        }
        callback(null, true)
    }
})

app.post('/add', upload.single('file'), async (req, res) => {
    console.log("File Added:\n", {file: req.file})
    res.send(`Added file ${req.file.originalname} to the file store.`)
})

app.get('/ls', async (req, res) => {
    try {
        let files = await gfs.files.find().toArray();
        
        // Extract filenames from the files array
        let filenames = files.map(file => file.filename);

        // Send the array of filenames in the response
        res.send(filenames);
    } catch (err) {
        res.json({err})
    }
})

app.delete('/rm', async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required()
    })
    const result = schema.validate(req.body)
    if(result.error) {
        //400 Bad Request
        res.status(400).send(result.error.details[0].message)
        return
    }
    try {
        const file = await gfs.files.findOne({ filename: req.body.name });
        // check if file exists in file store
        if(!file){
            res.status(400).send('File does not exist in the file store.')
            return
        }
        const gsfb = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
        gsfb.delete(file._id);
        return res.status(200).send(`File successfully removed from store.`)  
    } catch (error) {
        console.log(error.message)
        res.status(404).send(`Error ${error.message}`)
    }
})

app.put('/update', upload.single('file'), async (req, res) => {

    //TODO: skip sending contents if the server already has it
    try {
        console.log(`Updated file ${req.file.originalname}`)
        res.send(`Updated file ${req.file.originalname}`)
    } catch (error) {
        console.log(error.message);
        res.status(500).send(`Error ${error.message}`);
    }
})

app.get('/wc', (req, res) => {

})

app.get('/freq-words', (req, res) => {

})


// Utility functions

// Get a file by filename
const getFileByFilename = async (filename) => {
    try {
        return await gfs.files.findOne({ filename });
    } catch (err) {
        throw err;
    }
};

//Delete a file by filename: returns 1 : successful, 0 : failure
const deleteFileByFilename = async (filename) => {
    try {
        console.log(filename)
        const file = await gfs.files.findOne({ filename });
        // check if file exists in file store
        if(!file){
            console.log('check 1')
            console.log(file)
            return 0
        }
        const gsfb = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
        gsfb.delete(file._id);
        return 1
    } catch (error) {
        console.log(error.message)
        console.log('check 2')
        return 0
    }
}

app.listen(5000, () => console.log('Listening on port 5000...'))
