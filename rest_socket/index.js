const express = require ("express");

const app = express();

app.set("view engine", "ejs");

app.set(express.urlencoded({extended:false}));

app.set(express.json());

app.get('/',(req,res)=>{
    res.send("index");

});

app.listen(3001,()=>{
    console.log("server is running on port 3001");
})