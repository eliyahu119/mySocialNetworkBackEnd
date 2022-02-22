const { default: mongoose } = require("mongoose");

//the user schema
const userSchema= new mongoose.Schema({
    user : {type: String,required: true },
    password : {type: String,required: true },
    gender : Boolean //true is male, false female 
})
module.exports=mongoose.model("User",userSchema)

