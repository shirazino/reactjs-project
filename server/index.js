const express = require("express");
const app = express();
require("dotenv/config"); //DB credential file is on gitIgnore list

const cors = require("cors");
const bodyParser = require("body-parser");
var crypto = require("crypto");
const html = require("./tagSchema");
const users = require("./userSchema");
const posts = require("./postSchema");
const TagsObj = require("../server/tagsObject");

app.use(cors());
app.use(express.json());

// var jsonParser = bodyParser.json();
// var urlencodedParser = bodyParser.urlencoded({ extended: false });

//new connection to no SQL Mongo DB
const mongo = require("mongodb").MongoClient;
const url = process.env.myConnection;
const mongoose = require("mongoose");
const { post } = require("jquery");

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => console.log("connected to Mongose"))
  .catch((error) => console.log(error));

app.get("/resample", (req, res) => {
  html
    .insertMany(TagsObj)
    .then(function () {
      console.log("Data inserted"); // Success
      res.send(TagsObj);
    })
    .catch(function (error) {
      console.log(error); // Failure
    });
});

app.get("/home", async (req, res) => {
  try {
    const justTags = await html.find({});
    res.json(justTags);
  } catch (err) {
    console.log(err);
  }
});

app.get("/home/:tag", async (req, res) => {
  const tag = req.params.tag;
  var query = { tagName: tag };
  try {
    const find = await html.find(query).exec();
    res.json(find);
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  var user = req.body.user;
  var userPassword = req.body.userPassword;
  var email = req.body.email;

  var encript = crypto.createCipher("aes-128-cbc", "mypassword");
  var pw = encript.update(userPassword, "utf8", "hex");
  pw += encript.final("hex");

  var obj = { userName: user, userPwd: pw, userEmail: email };

  const createAccount = new users(obj);

  try {
    await createAccount.save();
    res.send("Account created!");
  } catch (error) {
    console.log(error);
    res.send("Something went wrong");
  }
});

app.post("/enter", async (req, res) => {
  var email = req.body.Email;
  var userPassword = req.body.Password;

  var encript = crypto.createCipher("aes-128-cbc", "mypassword");
  var encrypted = encript.update(userPassword, "utf8", "hex");
  encrypted += encript.final("hex");

  var decript = crypto.createDecipher("aes-128-cbc", "mypassword");
  var decripted = decript.update(encrypted, "hex", "utf8");
  decripted += decript.final("utf8");

  var person = { userPwd: encrypted, userEmail: email };

  try {
    const q = await users.find(person, "userName").exec();
    res.json(q);
  } catch (error) {
    console.log(error);
  }
});

app.post("/addpost", async (req, res) => {
  var question = req.body;
  const ask = new posts(question);
  try {
    await ask.save();
    res.send("posted");
  } catch (error) {
    console.log(error);
  }
});

app.post("/replypost", async (req, res) => {
  var reply = req.body.reply;
  post.findByIdAndUpdate();
});

app.get("/getposts", async (req, res) => {
  const communityPost = await posts.find({});
  try {
    res.json(communityPost);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

app.listen(5000, () => {
  console.log("server running on port 5000");
});
