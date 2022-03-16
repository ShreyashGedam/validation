const express = require("express")

const mongoose = require("mongoose")

const { body, validationResult } = require('express-validator');

const app = express()

app.use(express.json())

const connect = () =>
{
    return mongoose.connect("mongodb://localhost:27017/validation")
}

const userschema = new mongoose.Schema(
    {
        firstname : {type : String , required : true},
        lastname : {type : String , required : true},
        email : {type : String , required : true},
        // pincode, age, gender,
        pincode : {type : Number , required : true},
        age : {type : Number , required : true},
        gender : {type : String , required : true}
    }
)

const User = mongoose.model("user",userschema)

app.get("/users", async (req , res ) =>
{
    const data = await User.find().lean().exec()

    return res.send(data)
})

app.post("/users", body('firstname').not().isEmpty().withMessage("Enter the First name"),
body("lastname").not().isEmpty().withMessage("Enter the last name"),
body("email").not().isEmpty().isEmail().withMessage("Enter email properly"),
body("age").custom( async (value) =>
{
    if (val < 1 || val > 100) {
        throw new Error("Incorrect age provided");
      }
      return true;
}),
body("gender").custom( async(value) =>
{
    if(value != "Male" || value != "Female" || value != "Other")
    {
        throw new Error("Enter proper gender")
    }
} )
,async (req , res) =>
{
    // console.log("codes =  ",body('firstname'))

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.create(req.body)

    return res.send({user : user}) 
})

app.listen(5000, async () =>
{
    await connect()
    console.log("listening to the erver")
})