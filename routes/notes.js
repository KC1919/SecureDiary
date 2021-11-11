const express = require("express");
const app = express();
const multer = require("multer");
const fs = require('fs');
const jimp = require("jimp");

const noteRouter = express.Router();

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, './images/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({
    storage: storage
});

noteRouter.get("/upload", (req, res) => {
    res.render("upload");
});

noteRouter.post("/upload", upload.single('uploadImage'), async (req, res) => {
    console.log(req.file);

    const buffer = fs.readFileSync('./images/Capture.png');
    console.log(buffer);

    const result = await jimp.read(buffer, (err, res) => {
        if (err) throw new Error(err);
        res.quality(10).write("./images/resizeCapture.jpg");
    });

    // if (result) {
    //     newBuffer = fs.readFileSync('./images/resizeCapture.jpg');
    //     console.log(newBuffer);

    //     res.send("File uploaded!")
    // }
})

module.exports = noteRouter;