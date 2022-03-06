const { default: mongoose } = require("mongoose");

//the user schema
const userSchema= new mongoose.Schema({
    user : {type: String,required: true ,unique: true },
    password : {type: String,required: true },
    email: {type: String,required: true,unique: true },
    gender : {type : Boolean, default:true}  //true is male, false female
})
module.exports=mongoose.model("users",userSchema)

