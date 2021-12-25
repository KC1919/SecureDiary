const express = require("express");
const app = express();
const multer = require("multer");   //for uploading files
const CryptoJS = require("crypto-js");
const multer = require("multer");
const fs = require('fs');
const jimp = require("jimp");   //for reducing the file size

const noteRouter = express.Router();

//storing the file 
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

//rendering the upload image page
noteRouter.get("/upload", (req, res) => {
    res.render("upload");
});

let buffer=""; //variable to store the image data


//route to get the uploaded image
noteRouter.post("/upload", upload.single('uploadImage'), async (req, res) => {
    // console.log(req.file);

    const buffer = fs.readFileSync('./images/Capture.png');
    // console.log(buffer);

    buff = buffer.toString()
    console.log(buff);
    // Encrypt
    var ciphertext = CryptoJS.AES.encrypt(buff, 'secret key 123').toString();

    // Decrypt
    var bytes = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
    var originalText = bytes.toString(CryptoJS.enc.Utf8);

    // const result = await jimp.read(buffer, (err, res) => {
    //     if (err) throw new Error(err);
    //     res.quality(10).write("./images/resizeCapture.jpg");
    // });

    // if (result) {
    //     newBuffer = fs.readFileSync('./images/resizeCapture.jpg');
    //     console.log(newBuffer);

    //     res.send("File uploaded!")
    // }
    // console.log(originalText);
})

noteRouter.get("/show",(req,res)=>{
    res.render("show",{"buffer":buffer});
})

noteRouter.get("/getIt",(req,res)=>{
    res.redirect("/notes/zingo");
})

noteRouter.get("/zingo",(req,res)=>{
    res.render("show");
})

module.exports = noteRouter;
module.exports = noteRouter;
