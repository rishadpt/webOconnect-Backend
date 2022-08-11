const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./src/models/index');
require('dotenv').config();

app.use(cors())   //cors Configuration for development
//Get port  
const PORT = process.env.PORT || 8080

// Body parser
app.use(express.json());        
app.use(express.urlencoded({ extended: true }));


//set the routes
const userRouter = require('./src/routes/users.route');


app.use("/api/user/", userRouter);



//index page
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Weboconnect." });
});


    // connect to the database 
  db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });



  // Creating server
app.listen(PORT, () => {
    console.log(`Server is up and running on the port ${PORT}`);
  })    //listen to the port
  