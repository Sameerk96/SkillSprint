const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* MongoDB Connection */

mongoose.connect("mongodb://127.0.0.1:27017/skillsprint")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));


/* User Model */
const User = mongoose.model("User",{

uid:String,
name:String,
email:String,
password:String,
role:{type:String,default:"user"},

requestedCourses:[String],
approvedCourses:[String]

});


/* Signup */

app.post("/signup", async(req,res)=>{

    const user = new User({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        role:"user"
    });

    await user.save();

    res.send("User Created");

});


/* Login */

app.post("/login", async(req,res)=>{

const user = await User.findOne({
    email:req.body.email,
    password:req.body.password
});

if(user){

    if(user.role=="admin")
        res.send("admin");

    else
        res.send("user");

}
else{
res.send("not found");
}

});


/* Get All Users (Admin) */

app.get("/users", async(req,res)=>{

const users = await User.find();

res.json(users);

});
/* SAVE FIREBASE USERS */

app.post("/saveUser", async(req,res)=>{

const exists = await User.findOne({
uid:req.body.uid
});

if(!exists){

const user = new User({

uid:req.body.uid,
name:req.body.name,
email:req.body.email,
role:"user",
requestedCourses:[],
approvedCourses:[]

});

await user.save();

console.log("User saved in MongoDB");

}

res.send("saved");

});
/* COURSE MODEL */

const Course = mongoose.model("Course",{

name:String,
image:String,
description:String

});

/* VIDEO MODEL */

const Video = mongoose.model("Video",{

course:String,
title:String,
videoId:String

});


/* ADD COURSE */

app.post("/addCourse",async(req,res)=>{

if(!req.body.name){

res.send("Course Name Required");

return;

}

const exists = await Course.findOne({

name:req.body.name

});

if(exists){

res.send("Course Already Exists");

return;

}

const course = new Course({

name:req.body.name,
image:req.body.image,
description:req.body.description

});

await course.save();

res.send("Course Added");

});


/* GET COURSES */

app.get("/courses",async(req,res)=>{

const courses = await Course.find();

res.json(courses);

});


/* ADD VIDEO */

app.post("/addVideo",async(req,res)=>{

const video = new Video({

course:req.body.course,
title:req.body.title,
videoId:req.body.videoId

});

await video.save();

res.send("Video Added");

});


/* GET VIDEOS */

app.get("/videos/:course",async(req,res)=>{

const videos = await Video.find({

course:req.params.course

});

res.json(videos);

});



/* DELETE COURSE */

app.delete("/deleteCourse/:name", async(req,res)=>{

await Course.deleteOne({

name:req.params.name

});

await Video.deleteMany({

course:req.params.name

});

res.send("Course Deleted");

});


/* DELETE VIDEO */

app.delete("/deleteVideo/:id", async(req,res)=>{

await Video.deleteOne({

_id:req.params.id

});

res.send("Video Deleted");

});


/* GET ALL VIDEOS */

app.get("/allVideos", async(req,res)=>{

const videos = await Video.find();

res.json(videos);

});

app.post("/approveCourse", async(req,res)=>{

await User.updateOne(

{email:req.body.email},

{

$addToSet:{approvedCourses:req.body.course},

$pull:{requestedCourses:req.body.course}

}

);

res.send("Approved");

});



/* REQUEST COURSE */

app.post("/requestCourse", async(req,res)=>{

console.log("Incoming Request:", req.body);

await User.updateOne(

{email:req.body.email},

{$addToSet:{requestedCourses:req.body.course}}

);

res.send("Request Saved");

});


/* GET REQUESTS */

app.get("/requests", async(req,res)=>{

const users = await User.find({

requestedCourses:{$exists:true,$ne:[]}

});

res.json(users);

});
/* CHECK ACCESS */

app.get("/checkAccess", async(req,res)=>{

const user = await User.findOne({

email:req.query.email

});

if(user && user.approvedCourses &&
user.approvedCourses.includes(req.query.course)){

res.send("yes");

}else{

res.send("no");

}

});


app.listen(3000,()=>{

console.log("Server Running");

});
