const express = require("express");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const axios = require("axios");
const bcrypt = require("bcryptjs");

let otp;

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, //sender
        pass: process.env.PASS
    }
});

const authRouter = express.Router();

authRouter.get("/", async (req, res) => {
    res.render("home");
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

//Global variables to store users info
let name = "",
    email = "",
    password = "";

authRouter.post("/register", async (req, res) => {

    //generating the otp, to be sent to the user
    otp = Math.floor(100000 + Math.random() * 900000);

    //extracting the details of the user
    name = req.body.name;
    email = req.body.email;
    password = req.body.password;

    const user=await User.findOne({email:email});
    if(user)
    {
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
    return res.redirect("/auth/takeOTP"); //redirecting the user to the OTP input form

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

        //comparing the generated otp with the user's otp
        if (parseInt(userOTP) === otp) {

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
                return res.status(200).json({
                    message: "User created successfully",
                    user: user
                });
            }
        } else {
            console.log("Invalid OTP");
            return res.status(401).json("Invalid OTP");
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

authRouter.post("/login", async (req, res) => {

    try {

        console.log(req.body);
        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({
            email: email
        });

        console.log(user);

        if (user) {
            const result = await bcrypt.compare(password, user.password);
            if (result) {
                console.log("User signed in successfully!");
                return res.status(200).json("User signed in successfully!");
            }
        } else {
            console.log("Invalid email or password");
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Login failed, internal server error",
            error: error
        });
    }
})

module.exports = authRouter;