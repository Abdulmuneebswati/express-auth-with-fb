const express = require("express");
require("dotenv").config();
const authRoute = require("./routes/authRoutes");




const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/auth", authRoute);


app.listen("3000",()=>{
    console.log("listening");
})