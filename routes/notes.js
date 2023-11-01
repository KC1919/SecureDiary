const express = require("express");
const app = express();
const multer = require("multer"); //for uploading files
const CryptoJS = require("crypto-js");
// const multer = require("multer");
const fs = require('fs');
const jimp = require("jimp"); //for reducing the file size
const verify = require("../middlewares/verify");
const User = require("../models/User");

const Note = require("../models/Note");
const {
    log
} = require("console");

const noteRouter = express.Router();

app.use(express.text())

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
    res.render("imageUpload");
});

let buffer = ""; //variable to store the image data


//route to get the uploaded image
noteRouter.post("/imageUpload", upload.single('uploadImage'), async (req, res) => {
    console.log(req.body);

    // const buffer = 

    bufferString = buffer.toString();
    console.log(buffer);
    // console.log(buffer);
    // Encrypt
    let ciphertext = encrypt(bufferString, "kunal");

    // console.log(ciphertext);

    // Decrypt
    let plain = decrypt(ciphertext, "kunal");

    // console.log(plain);

    const result = await jimp.read(buffer, (err, res) => {
        if (err) throw new Error(err);
        res.quality(10).write("./images/resizeCapture.jpg");
    });

    if (result) {
        newBuffer = fs.readFileSync('./images/resizeCapture.jpg');
        console.log(newBuffer);

        res.send("File uploaded!")
    }
    // console.log(originalText);
})


// noteRouter.get("/textUpload",(req,res)=>{
//     res.render("textUpload");
// });

noteRouter.get("/textNotes", verify, async (req, res) => {

    const textNotes = await Note.find({
        user: req.userId
    }, {
        text: 1
    });
    console.log(textNotes);
    // if(textNotes.length==0){
    //     return res.send(`<h1 class="text-center mt-2">Nothing to display</h1>`);
    // }
    // console.log(textNotes[0].text);

    let notes;

    if (textNotes.length == 0)
        notes = [];

    else
        notes = textNotes[0].text;

    res.render("textfiles", {
        "notes": notes
    });
})

noteRouter.post("/text", verify, async (req, res) => {

    console.log(req.body);

    let json = await JSON.parse(req.body);

    const {
        data,
        secret,
        title
    } = json;

    //encrypting user data
    let cipher = encrypt(data, secret);

    let notes = await Note.find();

    let newNote = {
        user: req.userId
    };

    if (notes.length == 0) {
        let fnote = await Note.create(newNote);
        console.log(fnote);
    }

    let userNotes = await Note.find({
        user: req.userId
    });

    if (userNotes == null) {
        let res = await Note.create(newNote);
        console.log(res);
    }

    let note = {
        title: title,
        data: cipher
    }

    let resp = await Note.updateOne({
        user: req.userId
    }, {
        $push: {
            text: note
        }
    });
    console.log(resp);

    return res.json("executed");
})

//function for encryption
function encrypt(plainText, secretKey) {

    var ciphertext = CryptoJS.AES.encrypt(plainText, secretKey).toString();
    // console.log(ciphertext);

    return ciphertext

}

noteRouter.post("/decrypt", verify, async (req, res) => {

    const data = JSON.parse(req.body);
    const noteId = data.noteId;
    const password = data.password;
    // console.log(req.body);
    // console.log(data);

    let user = await User.find({
        user: req.userId
    });

    // console.log(user);

    if (user) {
        const fetchedCipher = await Note.find({
            user: req.userId
        }, {
            "text": {
                $elemMatch: {
                    "_id": noteId
                }
            }
        })
        const cipher = fetchedCipher[0].text[0].data;

        // console.log(cipher);

        // console.log(password);

        let plainText = decrypt(cipher, password);

        return res.json({
            message: "Decrypted text",
            data: plainText
        });
    } else {
        return res.status(401).json("Not authorized");
    }


    // const plain=decrypt()
})

//function for decryption
function decrypt(cipherText, secretKey) {

    //decrypting the cipher to bytes code
    var bytes = CryptoJS.AES.decrypt(cipherText, secretKey);

    //converting the byte code to plain text
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(originalText);
    return originalText;
}


module.exports = noteRouter;