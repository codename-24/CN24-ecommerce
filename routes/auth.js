const router = require("express").Router();
const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
router.post("/register", async(req,res)=>{
    console.log("register-body",req.body);
    const hashedPass = await bcrypt.hash(req.body.password,10)
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPass,
    });
    
    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser)
        
    } catch (error) {
        res.status(500).json(error);   
    }
})

router.post('/login', async (req, res) => {
    try{
        const user = await User.findOne(
            {
                username: req.body.username
            }
        );
        if(user == null){
            return res.status(400).send("wrong credentials");
        }
        if(await bcrypt.compare(req.body.password,user.password)){
            
            const accessToken = jwt.sign({
                id: user._id,
                isAdmin: user.isAdmin,
            },process.env.JWT_SEC,
            {expiresIn:"3d"});
            const {password, ...others} = user._doc;
            res.status(200).json({...others,accessToken});
        }
        else{
            res.status(401).json("wrong credentials");
        }

    }catch(err){
        res.status(500).json(err);
    }

});


module.exports = router