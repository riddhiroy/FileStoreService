const Joi = require('joi');
const express = require('express');
const mongoose = require('mongoose')
const fileStore = require('../FileStoreService/Models/fileStoreModel')

const app = express();
app.use(express.json())

mongoose.connect('mongodb+srv://riddhiroy2000:riddhiroypassword@mongoclusterriddhi.ljucxap.mongodb.net/FileStore?retryWrites=true&w=majority')
    .then(() => {
        console.log('MongoDB connected...');
    }).catch(err => {
    console.error('MongoDB connection error:', err);
});

let files = new Map();


app.get('/', (req, res) => {
    res.send('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>File Store App</title></head><body><div><h1>Home page</h1><p>Select an action to execute for File Store App.</p><p>Choose from:</p><ul><li>Add: <code>/add</code></li><li>Remove: <code>/rmv</code></li><li>List: <code>/ls</code></li></ul></div></body></html>')
})

app.post('/add', (req, res) => {
    //handle n/w interruptions.
    const schema = Joi.object({
        name: Joi.string().required(),
        content: Joi.string()
    })
    const result = schema.validate(req.body)
    if(result.error) {
        //400 Bad Request
        res.status(400).send(result.error.details[0].message)
        return
    }
    if(fileStore.findOne({"name":req.body.name})!=null){
        //400 Bad Request
        res.status(400).send('Error: File already exists in store.')
        return
    }
    const file = new fileStore(req.body)
    file.save().then(result => {
        console.log(result)
        res.send(`Added file ${file.name}`)
    }).catch(err => {
        console.log(err.message)
        res.send(`Error ${err.message}`)
    })
})

app.get('/ls', async (req, res) => {
    try{
        const fileList = await fileStore.find({},{__v: 0}) //query,projection
        res.send(fileList)
    } catch (error){
        console.log(err.message)
        res.send(`Error ${err.message}`)
    }
})

app.put('/rm', async (req, res) => {
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
        let file = await fileStore.findOne({"name": req.body.name});
        const isFileAbsent = !file
        if(isFileAbsent){
            //400 Bad Request
            res.status(400).send('File does not exist in the file store.')
            return
        }
        const result = await fileStore.findOneAndDelete({ "name" : req.body.name })
        res.send(`File removed successfully from store. File: ${req.body.name}`)
    } catch (error) {
        console.log(error.message)
        res.send(`Error ${error.message}`)
    }
})

app.put('/update', async (req, res) => {

    //TODO: skip sending contents if the server already has it
    const schema = Joi.object({
        name: Joi.string().required(),
        content: Joi.string().required()
    })
    const result = schema.validate(req.body)
    if(result.error) {
        //400 Bad Request
        res.status(400).send(result.error.details[0].message)
        return
    }
    try {
        let file = await fileStore.findOne({"name": req.body.name});
        const isFileNew = !file
        if (isFileNew) {
            // File doesn't exist, so create a new one
            file = new fileStore(req.body);
        } else {
            // File exists, update its content
            file.content = req.body.content;
        }

        await file.save()

        if (isFileNew) {
            // If the file is new, send a message indicating that it's created
            res.send(`File did not exist in store. Created file ${req.body.name}`);
        } else {
            // If the file already existed, send message accordingly
            res.send(`Updated file ${req.body.name}`);
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send(`Error ${error.message}`);
    }
})

app.get('/wc', (req, res) => {

})

app.get('/freq-words', (req, res) => {

})

app.listen(5000, () => console.log('Listening on port 5000...'))
