const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const methodOverride = require("method-override");
const { triggerAsyncId } = require('async_hooks');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(methodOverride('_method'));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: 'sachin.sahu@s.amity.edu'
});

// show number of registed user
app.get("/", (req, res) => { 
  let q = `SELECT COUNT(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log(result[0]["COUNT(*)"]);
      
      let count = result[0]["COUNT(*)"];
      // res.send("this is home page");
      res.render("home.ejs",{count});
      
    });
  } catch (err) {
    console.log(err);
    res.send("something went wrong in database");
  }

});

// Detail information of user

app.get("/user",(req,res)=>{
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let len = result.length;
      console.log(len);
      res.render("users.ejs",{result});
      
    });   
  } catch (err) {
    console.log(err);
    res.send("something went wrong in database");
  }
  
});

//edit

app.get("/user/:id/edit",(req,res)=>{
    
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    console.log(id);
    try{
    connection.query(q,(err,result)=>{
      if(err)throw err;
      console.log(result);
      let user = result[0];
      res.render("edit.ejs",{user});
    });
  }catch(err){
    console.log(err);
    res.send("something went wrong");
  }

});

app.patch("/user/:id/edit",(req,res)=>{
    let {id} = req.params;
    console.log(id);
    let {username:updatedUser,password:pass} = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    console.log(updatedUser," ",pass);

    try {
      connection.query(q,(err,result)=>{
        if(err)throw err;
        let userData = result[0];
        console.log(userData);
        if(userData.password!=pass){
          res.send("Password don't match, try again");
        }else{

          let q2 = `UPDATE user SET username = '${updatedUser}' WHERE id='${id}'`;
          try {
            connection.query(q2,(err,result)=>{
              if(err)throw err;
              res.redirect("/user");
            });
          } catch (error) {
            console.log(error);
            res.send("something went wrong");
          }
        }
      });
    } catch (error) {
      console.log(error);
      res.send("something went wrong");      
    }

});

// add 
app.get("/user/new",(req,res)=>{
  res.render("add.ejs");

});

app.post("/user/new",(req,res)=>{
    let {username:username,email:email,password:password} = req.body;
    console.log(username," ",email," ", password);
    let q = `SELECT * FROM user WHERE email='${email}'`;
    try {
      connection.query(q,(err,result)=>{
        if(err)throw err;
        if(result.length>0){
          
          res.send("Already exist");
        }else{
          let id = uuidv4();
          let q2 = `INSERT INTO user (id,username,email,password) VALUES ('${id}','${username}', '${email}','${password}')`;
          
          try {
              connection.query(q2,(err,result)=>{
                if(err)throw err;
                res.redirect("/user");
                
              });
          } catch (error) {
            console.log(error);
            res.send("Something went wrong");
          }
        }
        
      });
    } catch (error) {
      console.log(error);
      res.send("Something went wrong");
    }
    
});

//search based on your name
app.get("/user/username",(req,res)=>{
  let {username} = req.query;
  console.log("This is search bar",username);
  let q = `SELECT * FROM user WHERE username='${username}'`;
  try {
    connection.query(q,(err,result)=>{
      if(err)throw err;
     
      res.render("result.ejs",{result});
    });
  } catch (error) {
    console.log(error);
    res.send("Something went wrong");
  }
});

//delete
app.get("/user/:id",(req,res)=>{
  let {id} = req.params;
  res.render("remove.ejs",{id});
});

app.delete("/user/:id",(req,res)=>{
  let {id} = req.params;
  let {username,email,password} = req.body;
  console.log(username,email,password);
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      let user = result[0];
      console.log(user);

      if(user.username!=username)res.send("username is wrong");
      else if(user.email!=email) res.send("email is wrong");
      else if(user.password!=password)res.send("password is wrong");
      else{
        let q2 = `DELETE FROM user WHERE id='${id}'`
        try {
          connection.query(q2,(err,result)=>{
            if(err)throw err;
            console.log("Deleted");
            // res.send("Deleted successfully");
            res.redirect("/user");
          });
        } catch (error) {
          
        }
      }
    });
  }catch(error){
    console.log(error);
    res.send("Something went wrong");
  }

});

app.listen(8080, () => {
  console.log("server is working ");
});







// let q = 'INSERT INTO user (id,username,email,password) VALUES (?,?,?,?)';
// let data = [10,'anjali','anjali@gmail.com','2030anjali@'];
// let q = "INSERT INTO user (id,username,email,password) VALUES ?"
// let userdata =[
  //   [12,'ruplai','rupali@gmail.com','rupali@3222'],
  //   [12,'deepak','deepak@gmail.com','deepak@9122'],
  //   [12,'sandeep','sandeep@gmail.com','sandeep@9022'],
  //   [12,'sachin','sachin@gmail.com','sachin@sahu144'],
  //   [12,'peter salt','petersalt@gmail.com','petersalt@8923'],
  //   [12,'volt hame','hame@gmail.com','volt@3422']
  // ];
  
  // let userdata = [];
  
  // const getRandomUser= ()=>{
  //   return [
  //     faker.string.uuid(),
  //     faker.internet.userName(),
  //     faker.internet.email(),
  //     faker.internet.password(),
  //   ];
  // }
  
  // for(let i=0;i<1000;i++){
  //   userdata.push(getRandomUser());
  //   // console.log(getRandomUser());
  // }
  
  // try {
  //   connection.query(q,[userdata],(err,res)=>{
  //     if(err)throw err;
  //     console.log(res);
  //   });
  // } catch (err) {
  //     console.log(err);
  // }
  // connection.end();

