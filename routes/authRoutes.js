const express = require("express");
const router = express.Router();
const admin = require("../Config/Config");
const cors = require("cors");
const  authenticate  = require("../Auth/Auth");
const verifyEmail = require("../Auth/email-verification-auth");
require("dotenv").config();
const transporter = require("../Config/transporter")
const multer = require('multer');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.use(cors());


const { API_KEY } = process.env;

// Register a new user
router.post("/register",upload.single('profilePicture'), async (req, res) => {
    try {
      const {email,password} = req.body; 
    const profilePicture = req.file;
    const bucket = admin.storage().bucket("gs://fir-auth-with-express.appspot.com");
    const filename = `${email}/${profilePicture.originalname}`;
    const file = bucket.file(filename);
    const photoURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;
     file.createWriteStream().end(profilePicture.buffer);
      const createUser = await admin.auth().createUser({
        email,
        password,
        photoURL:photoURL
      })
      if (createUser) {
        let message = await verifyEmail(createUser);
        if (message) {
          res.json(message)
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

// Login an existing user
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await admin.auth().getUserByEmail(email);
    if (user.emailVerified) {
        const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
    fetch(signInUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        res.json(
            data
          );
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send(error);
      });
    } else {
        res.send("email not verified")
    }
    
  });

// private routes access
router.get("/private", authenticate, async (req,res)=>{
        try {
            res.send("hi i am muneeb")
        } catch (error) {
            console.log(error);
        }
})

// reset password
router.post('/reset-password', async (req, res) => {
    const {email} = req.body;
    const user = await admin.auth().getUserByEmail(email);
    if (user) {
        const link = await admin.auth().generatePasswordResetLink(user.email);
        if (link) {
          let info = await transporter.sendMail({ 
                from: process.env.Email_User,
                to: user.email, 
                subject:"Reset your password",  
                html:`<b>Hello</b>,
          
                Follow this link to reset your %APP_NAME% password for your ${user.email} account.
                <br>
                ${link}
                <br>
                
                If you didn’t ask to reset your password, you can ignore this email.
                <br>
                Thanks,
                <br>
                <b>Your %APP_NAME% team</b>`,
              })
              if (info) {
                res.send("An email has been sent")
              }
        }
    } 
  });

// check email
router.get('/email', async(req, res) => {
  try {
    let info = await transporter.sendMail({ 
      from: process.env.Email_User,
      to: "muneeb.swati@productbox.dev", 
      subject:"Reset your password",  
      html:`<b>Hello</b>,
      \n
      Follow this link to reset your %APP_NAME% password for your %EMAIL% account.
      \n
      ${link}
      \n
      If you didn't ask to reset your password, you can ignore this email.
      \n
      Thanks,
      \n
      <b>Your %APP_NAME% team</b>`,
    });
      console.log(info);
  } catch (error) {
    console.log(error);
  }
});

router.post("/changePassword", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await admin.auth().getUserByEmail(email);
    const uid = user.uid;
    // Reauthenticate the user with their old password
    await admin.auth().revokeRefreshTokens(uid); // Revoke the user's refresh tokens to force them to sign in again with their new password
    await admin.auth().updateUser(uid, {
      password: newPassword,
    });
    res.status(200).send("Password updated successfully");
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});




  
module.exports = router;