const express = require("express");
const app = express();

const cookieParser=require("cookie-parser");

app.use(cookieParser());

require("dotenv").config();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));



const authRouter=require("./routes/auth");

app.use("/auth",authRouter);


const db=require("./db");

app.listen(3000, () => {
    console.log("Server started at port 3000");
    db();
})