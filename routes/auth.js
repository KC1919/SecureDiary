const express = require("express");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verify = require("../middlewares/verify");

//Global variables to store users info
let name = "",
    email = "",
    password = "";

let otp;
let changePassOtp;

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, //sender
        pass: process.env.PASS
    }
});

//Creating Router
const authRouter = express.Router();

// GET Routes

authRouter.get("/", async (req, res) => {
    res.render("home");
})

authRouter.get("/working",verify,(req,res)=>{
    res.render("index");
})


authRouter.get("/register", async (req, res) => {
    res.render("register");
})

authRouter.get("/login", async (req, res) => {
    res.render("login");
})

authRouter.get("/takeOTP", (req, res) => {
    res.render("otp");
})

authRouter.get("/forgot", (req, res) => {
    res.render("forgot");
})

authRouter.get("/changePassword/:email", (req, res) => {
    const email = req.params.email;
    console.log(email);
    res.render("newPassword", {
        "email": email
    });
})


//POST Routes

authRouter.post("/register", async (req, res) => {

    //generating the otp, to be sent to the user
    otp = Math.floor(100000 + Math.random() * 900000);

    //extracting the details of the user
    name = req.body.name;
    email = req.body.email;
    password = req.body.password;

    // console.log(name);
    // console.log(email);
    // console.log(password);

    const user = await User.findOne({
        email: email
    });
    if (user) {
        return res.status(400).json("Email not available! Choose a different email");
    }

    //sending the OTP via eamil to the user
    const mailData = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: "Secure Diary authentication OTP",
        text: "You've Succesfully sent an email",
        html: `<p>Hello ${name}. Your Email Verification OTP is : ${otp} </p>`
    };
    const sendMail = await transporter.sendMail(mailData);

    if(sendMail){
        console.log(sendMail);
        //res.redirect("/auth/takeOTP"); //redirecting the user to the OTP input form 
        return res.json("OTP sent successfully!");
    }

    else{
        console.log("error in registering!");
        return;
    }

    // const result = await axios({
    //     method: "GET",
    //     url: "http://localhost:3000/auth/takeOTP"
    // });
    // const json = await result.json;
    // res.send(json);
})

authRouter.post("/otp", async (req, res) => {

    try {
        //getting the user otp
        const userOTP = req.body.otp;

        console.log(userOTP);

        //comparing the generated otp with the user's otp
        if (parseInt(userOTP) === otp) {

            otp=null;
            //generating salt
            const salt = await bcrypt.genSalt(10);

            //hashing the password
            const hashPass = await bcrypt.hash(password, salt);

            //creating the user in the database
            const user = await User.create({
                name: name,
                email: email,
                password: hashPass
            });

            name = "", password = "", email = "";

            if (user) {
                console.log("User created successfully!");
                // return res.status(200).json({
                //     message: "User created successfully",
                //     user: user
                // });

                return res.status(200).json("success");
                // return res.redirect("/login");
            }
        } else {
            console.log("Invalid OTP");
            return res.status(401).json("failure");
        }
        otp = "";
    } catch (error) {
        console.log("Failed to create user");
        return res.status(500).json({
            message: "Failed to create user, internal server error",
            error: error
        });
    }
})

// Login route

authRouter.post("/login", async (req, res) => {

    try {

        // console.log(req.body);

        //creating user object
        const {
            email,
            password
        } = req.body;

        //searching for the user in the database
        const user = await User.findOne({
            email: email
        });

        // const users=await User.find();
        console.log(user);
        // console.log(users);

        //if user found
        if (user) {

            //check the password
            const result = await bcrypt.compare(password,user.password);
            // console.log(result);

            //if the password is correct
            if (result) {

                //generate token for further interactions
                const token = jwt.sign({
                    userId: user._id
                }, process.env.JWT_KEY);

                //create a cookie, and embed the token inside the cookie
                res.cookie("secret", token, {
                    maxAge: 86400,
                    httpOnly: true
                });

                console.log("User signed in successfully!");
                return res.status(200).json("success");
                
            }else{
                console.log("Invalid email or Password");
                return res.json("Invalid email or Password");
            }
        } else {
            console.log("User not found");
            return res.json("User not found")
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Login failed, internal server error",
            error: error
        });
    }
})                          


authRouter.post("/forgot", async (req, res) => {

    //generating the otp, to be sent to the user
    changePassOtp = Math.floor(100000 + Math.random() * 900000);
    console.log(req.body.email);
    const mailData = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: "Forgot password OTP for Secure Diary",
        text: "You've Succesfully sent an email",
        html: `<p>Hello ${name}. Your Email Verification OTP is : ${changePassOtp} </p>`
    };
    const sendMail = await transporter.sendMail(mailData);
    console.log(sendMail);
    return res.redirect(`/auth/changePassword/` + req.body.email); //redirecting the user to the change password form
})

authRouter.post("/changePass", async (req, res) => {

    try {
        const {
            OTP,
            email,
            password
        } = req.body;

        if (changePassOtp === parseInt(OTP)) {

            changePassOtp=null;
            const salt = await bcrypt.genSalt(10);
            //hashing the password
            const hashPass = await bcrypt.hash(password, salt);
            const result = await User.findOneAndUpdate({
                email: email
            }, {
                $set: {
                    password: hashPass
                }
            }, {
                new: true
            });

            if (result) {
                console.log("Password updated successfully");
                return res.json("Password updated successfully");
            } else {
                console.log("Failed to update password!");
                return res.json("Failed to update password!")
            }
        } else {
            console.log("OTP verification failed!");
            return res.json("OTP verification failed!")
        }
    } catch (error) {
        console.log("Server Error");
        return res.json("Failed to update password, internal server error");
    }

});

// Session verification


module.exports = authRouter;