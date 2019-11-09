const express = require('express')
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');

// running the express app
const app = express();
// middlewares
app.use(express.json())


var urlencodedParser = bodyparser.urlencoded({
  extended: true
});
app.use(bodyparser.json());

mongoose.set('useCreateIndex', true);
//Set up default mongoose connection
mongoose.connect('mongodb://localhost/signUpData', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
//Get the default connection
var db = mongoose.connection;
db.once('open', () => {
  console.log('connection-made!!');

}).on('error', error => {
  console.log('error');
});
// creating a schema
const schema = mongoose.Schema;
const MyUserSchema = new schema({
  firstname: {
    type: String,
    minlength: 1,
    maxlength: 250,
  },
  surname: {
    type: String,
    minlength: 1,
    maxlength: 250,
  },
  email: {
    type: String,
    maxlength: 250,
    unique: true,

  },
  password: {
    type: String
  }
})
// creating a model for the schema
const Users = mongoose.model('user', MyUserSchema);

// taking data from registration form and saving it in the mongodb database
app.post('/signup', urlencodedParser, async (req, res) => {
  //checking if user already exist in database
let user = await Users.findOne({email:req.body.email})
if(user)return res.status(404).send("User already in database");

  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    var myUser = new Users({
      firstname: req.body.fname,
      surname: req.body.sname,
      email: req.body.email,
      password: hashedPassword,

    });
    console.log(req.body)
    // saving data into database
    myUser.save().then(() => {
      res.sendFile(__dirname + '/login.html');
      console.log('data saved to mongodb');
    }).catch(err => {
      res.status(400).send("unable to save to database");
    });
  } catch {
    res.status(404).send("error");
  }
});

//login user
app.post('/login', urlencodedParser, async (req, res) => {
  const user = await Users.findOne({
    email: req.body.email
  });
  if (user) {
    try {
      if (await bcrypt.compare(req.body.password, user.password)) {
        res.status(200).send("sucess")
      } else {
        res.status(200).send("wrong credentials")
      }
    } catch {
      res.status(500).send("error validating")
    }

  } else {
    return res.status(403).send("cant find user")
  }

})



//running express server
app.listen(3000);