/*********************************************************************************
 * WEB322 – Assignment 6 * 
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
 * * No part of this assignment has been copied manually or electronically from any other source 
 * * (including web sites) or distributed to other students. 
 * 
 * Name: Jihyun Nam  Student ID: 130641210 Date: Dec 5th, 2022
 * 
 * Online (Cyclic) Link:  
 * 
 **********************************************************************************/

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/collegeData.js");
const e = require("express");
const clientSessions = require('client-sessions');

const app = express();

// I got an error when I use "8080" port, so I just changed it to "5500" port
const HTTP_PORT = process.env.PORT || 5500;

app.engine('.hbs', exphbs.engine({ 
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }        
    }
}));

app.set('view engine', '.hbs');

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

// ClientSessions
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "Assign06_130641210", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
  }));

  // Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

const user = {
    username: "sampleuser",
    password: "samplepassword",
    email: "sampleuser@example.com"
  };

// Setup a route on the 'root' of the url to render to login.hbs
app.get("/login", (req, res) => {
    res.render("login");
  });

// The login route that adds the user to the session
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if(username === "" || password === "") {
      // Render 'missing credentials'
      return res.render("login", { errorMsg: "Missing credentials.", layout: false });
    }
  
    // use sample "user" (declared above)
    if(username === user.username && password === user.password){
  
      // Add the user on the session and redirect them to the dashboard page.
      req.session.user = {
        username: user.username,
        email: user.email
      };
  
      res.redirect("/students");
    } else {
      // render 'invalid username or password'
      res.render("login", { errorMsg: "invalid username or password!", layout: false});
    }
  });
  
  // Log a user out by destroying their session
  // and redirecting them to /login
  app.get("/logout", function(req, res) {
    req.session.reset();
    res.render("login");
  });

// This is a helper middleware function that checks if a user is logged in
// we can use it in any route that we want to protect against unauthenticated access.
// A more advanced version of this would include checks for authorization as well after
// checking if the user is authenticated
function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
}
  
app.get("/", ensureLogin, (req,res) => {
    res.render("home");
});

app.get("/about", ensureLogin, (req,res) => {
    res.render("about");
});

app.get("/htmlDemo", ensureLogin, (req,res) => {
    res.render("htmlDemo");
});

app.get("/students", ensureLogin, (req, res) => {
    if (req.query.course) {
        data.getStudentsByCourse(req.query.course).then((data) => {
            res.render("students", {students: data});
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    } else {
        data.getAllStudents().then((data) => {       
            if(data.length > 0) {
                res.render("students", {students: data});
            } else {
                res.render("students", {message: "no results"});    
            }
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });   
    }
});

app.get("/courses", ensureLogin, (req,res) => {
    data.getCourses().then((data)=>{
        if(data.length > 0) {
            res.render("courses", {courses: data});
        } else {
            res.render("courses", {message: "no results"});    
        }
    }).catch(err=>{
        res.render("courses", {message: "no results"});
    });
});

app.get("/students/add", ensureLogin, (req,res) => {
    data.getCourses().then((data) => {
        res.render("addStudent", {courses: data,});
      }).catch(() => {
        res.render("addStudent", {courses: []});
      });
});

app.post("/students/add", ensureLogin, (req, res) => {
    data.addStudent(req.body).then(()=>{
      res.redirect("/students");
    });
  });

app.get("/student/:studentNum", ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    data.getStudentByNum(req.params.studentNum).then((data) => {
        if (data) {
        viewData.student = data; //store student data in the "viewData" object as "student"
        } else {
        viewData.student = null; // set student to null if none were returned
        }
    }).catch(() => {
        viewData.student = null; // set student to null if there was an error
    }).then(data.getCourses)
        .then((data) => {
            viewData.courses = data; // store course data in the "viewData" object as "courses"
    // loop through viewData.courses and once we have found the courseId that matches
    // the student's "course" value, add a "selected" property to the matching
    // viewData.courses object
        for (let i = 0; i < viewData.courses.length; i++) {
             if (viewData.courses[i].courseId == viewData.student.course) {
                 viewData.courses[i].selected = true;
             }
         }
      }).catch(() => {
            viewData.courses = []; // set courses to empty if there was an error
        }).then(() => {
             if (viewData.student == null) { // if no student - return an error
                 res.status(404).send("Student Not Found");
            } else {
                res.render("student", { viewData: viewData }); // render the "student" view
            }
        });
});

app.post("/student/update",ensureLogin, (req, res) => {
    data.updateStudent(req.body).then(() => {
        res.redirect("/students");
    });
});

//A6: Updating routes to Add/Update Courses
app.get("/courses/add", ensureLogin,(req,res) => {
    res.render("addCourse");
});

app.post("/courses/add", ensureLogin,(req, res) => {
    data.addCourse(req.body).then(()=>{
      res.redirect("/courses");
    });
  });

app.post("/course/update", ensureLogin,(req, res) => {
    data.updateCourse(req.body).then(() => {
        res.redirect("/courses");
    });
});

app.get("/course/:id", ensureLogin,(req, res) => {
    data.getCourseById(req.params.id).then((data) => {
        (data)? res.render("course", { course: data }) : res.status(404).send("Course Not Found"); 
    }).catch((err) => {
        res.status(404).send("Course Not Found");
    });
});

app.get("/courses/delete/:id", ensureLogin,(req, res) => {
    data.deleteCourseById(req.params.id).then(() => {
        res.redirect("/courses");
    }).catch(() => {
        res.status(500).send("Unable to Remove Course / Course not found");
    })
});

app.get("/students/delete/:studentNum", ensureLogin,(req, res) => {
    data.deleteStudentByNum(req.params.studentNum).then(() => {
        res.redirect("/students");
    }).catch(() => {
        res.status(500).send("Unable to Remove Student / Student not found");
    })
});

app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});

data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});
