const mongoose = require("mongoose");

const db=async ()=>{
    // url = `mongodb+srv://dbUser:${process.env.DB_PASS}@securediary.vxvvb.mongodb.net/secureDB`;
    url='mongodb://127.0.0.1:27017/secureDiary';
    try {
        mongoose.connect(process.env.DB_URL);
        console.log("Connected to DB successfully!");
    } catch (error) {
        res.status(500).json({message:"Failed to connect to Database",error:error});
    }   
}

module.exports=db;

