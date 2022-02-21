const { default: mongoose } = require("mongoose");

//the user schema
const userSchema= new mongoose.Schema({
    user : String,
    password : String,
    gender : Boolean //true is male, false female
})
module.exports=mongoose.model("User",userSchema)