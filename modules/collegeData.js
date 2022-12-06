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

// A6: Installing "sequelize"
const Sequelize = require('sequelize');
var sequelize = new Sequelize('nrpxfysc', 'nrpxfysc', 'FNnxYyvLYjYxkiMsd2Hz_jzpCWfIlpLn', {
    host: 'babar.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: { rejectUnauthorized: false }
    },
    query:{ raw: true }
});

// A6: Creating Data Models
var Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,  
        autoIncrement: true  
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

var Course = sequelize.define('Course',{
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

// Since a course can have many students, we must define a relationship between Students and Courses, specifically:
Course.hasMany(Student, {foreignKey: 'course'});

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function(Student){
            resolve();
        }).then(function(Course){
            resolve();
        }).catch (function(){
            reject("Error: unable to sync the database");
        });
    });
}

module.exports.getAllStudents = function(){
    return new Promise(function (resolve, reject) {
        Student.findAll().then((data) => {
            console.log("####### getAllStudents: success! #######")
            resolve(data);
        }).catch(() => {
            console.log("#######  getAllStudents: error! #######");
            reject("Error: no results returned");
        })
    });
}

module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: {course: course}
        }).then((data) => {
            resolve(data);
            console.log("####### getStudentsByCourse: success! #######");
        }).catch(() => {
            reject("Error: no result returned");
            console.log("####### getStudentsByCourse: error! #######");
        })
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: {studentNum: num}
        }).then((data) => {
            resolve(data[0]);
            console.log("####### getStudentByNum: success! #######");
        }).catch(() => {
            reject("Error: no result returned");
            console.log("####### getStudentByNum: error! #######");
        })
    });
};

module.exports.getCourses = function(){
    return new Promise(function (resolve, reject) {
        Course.findAll().then((data) => {
            resolve(data);
            console.log("####### getCourses: success! #######");
        }).catch(() => {
            reject("Error: no results returned");
            console.log("####### getCourses: error! #######");
        })
    });
};

module.exports.getCourseById = function (id) {
    return new Promise(function (resolve, reject) {
        Course.findAll({
            where: {courseId: id}
        }).then((data) => {
            resolve(data[0]);
            console.log("####### getCourseById: success! #######");
        }).catch(() => {
            reject("Error: no results returned");
            console.log("####### getCourseById: error! #######");
        })
    });
};

module.exports.addStudent = function (studentData) { 
    return new Promise(function (resolve, reject) {

        studentData.TA = (studentData.TA) ? true : false;

        for (const prop in studentData) {
            if (studentData[prop] == "") {
                studentData[prop] = null;
            }
        }

        Student.create(studentData).then(() => {
            resolve("Success: create Student!");
        }).catch(() => {
            reject("Error: unable to create Student..");
        });
    });   
};

module.exports.updateStudent = function (studentData) {
    
    return new Promise(function (resolve, reject) {

        studentData.TA = (studentData.TA) ? true : false;
        
        for (const prop in studentData) {
            if (studentData[prop] == "") {
                studentData[prop] = null;
            }
        }
        
        Student.update(studentData, {
            where: { studentNum: studentData.studentNum }
        }).then(function(){
            resolve("Success: Update Student!");
        }).catch(function (err) {
            reject("Error: unable to update Student..");
        });
        
    });
};

module.exports.addCourse = function (courseData) {
    return new Promise(function (resolve, reject) {
        for (const prop in courseData) {
            if (courseData[prop] == "") {
                courseData[prop] = null;
            }
        }
        
        Course.create(courseData).then(() => {
            resolve("Success: add new Course!");
        }).catch(() => {
            reject("Error: unable to create Course..");
        });
    });
}

module.exports.updateCourse = function (courseData) {
    return new Promise(function (resolve, reject) {
        for (const prop in courseData) {
            if (courseData[prop] == "") {
                courseData[prop] = null;
            }
        }
  
        Course.update(courseData, {
            where: { courseId: courseData.courseId }
        }).then(function(){
            resolve("Success: Update Course!");
        }).catch(function (err) {
            reject("Error: unable to update Course..");
        });

    });
};

module.exports.deleteCourseById = function (id) {
    return new Promise(function (resolve, reject) {
        Course.destroy({
            where: {  courseId: id }
        }).then(function(){
            resolve("Success: Delete Course By Id!");
        }).catch(function (err) {
            reject("Error: rejected..");
        });
    });
}

module.exports.deleteStudentByNum = function (sn) {
    return new Promise(function (resolve, reject) {
        Student.destroy({
            where: { studentNum: sn }
        }).then(function(){
            resolve("Success: Delete Student By Num!");
        }).catch(function (err) {
            reject("Error: rejected..");
        });
    });
}