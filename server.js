const express = require("express");
const app = express();

const cookieParser=require("cookie-parser");

app.use(cookieParser());

require("dotenv").config();

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(express.text())
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.get("/",(req,res)=>{
    res.render("landing");
})

app.get("/textUpload",(req,res)=>{
    res.render("textUpload")
})

app.get("/textFiles",(req,res)=>{
    res.redirect("/notes/textNotes")
})

app.get("/gallery",(req,res)=>{
    res.render("gallery");
})

app.get("/imageUpload",(req,res)=>{
    res.render("imageUpload");
})


const authRouter=require("./routes/auth");
const noteRouter=require("./routes/notes");

app.use("/auth",authRouter);
app.use("/notes",noteRouter);


const db=require("./db");

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started at port 3000");
    db();
})
