/**
 * Assignment 3
 * Author: Marwan Rashed
 * ID: 4033970990
 * Date: 23/12/2025
 */
// Imports
const path = require("path");
const fs = require("fs");
const EventEmitter = require("node:events");
const os = require("node:os");
const http = require("http");
const zipIt = require("node:zlib");
const URL = require("node:url");
const express = require("express");
const { error } = require("node:console");
const app = express();

const port = 3000;

/** Part1:Simple CRUD Operations Using Express.js:
ı.For all the following tasks, you must use the fs module to read and write data from a JSON file (e.g.,
users.json). Do not store or manage data using arrays. (2 Grades) */
// Utility functions and constants
function readUsers() {
  const data = fs.readFileSync("./users.json", "utf-8");
  return data;
}

function writeUsers(users) {
  fs.writeFileSync("./users.json", JSON.stringify(users));
}

function generateId(users) {
  // generate incremental id if the user does not add an id
  // expet users as a jsoon with key as id
  let maxId = 0;
  for (const id in users) {
    if (Number(id) > maxId) {
      maxId = Number(id);
    }
  }
  return maxId + 1;
}

function isEmailExist(users, newEmail) {
  for (const id in users) {
    if (users[id].email == newEmail) {
      return true;
    }
  }
}

function responseHandler(response, statusCode, message) {
  return response.status(statusCode).json({
    message: message,
  });
}

function dataHandler() {
  let users = {};
  if (readUsers() == "") {
    writeUsers(users);
  } else {
    users = JSON.parse(readUsers());
  }
  return users;
}

const SuccessStatusCode = 201;
const ErrorStatusCode = 400;
const NotFoundStatusCode = 404;
const ServerErrorStatusCode = 500;
const UserAddedMsg = "User added successfully!";
const UserUpdatedMsg = "User updated successfully!";
const UserDeletedMsg = "User deleted successfully!";
const userReadMsg = "User read successfully!";
const UserNotFoundMsg = "User not found";
const InvalidUrlMsg = "Invalid Url";
const InvalidUserData = "Invalid User Data";
const loadFailure = "Failed to load users";
const ServerErrorMsg = "Server error";
const InvalidEmailMsg = "User Already Exists please enter another email";
// Questions Implementation

// data middleware
app.use(express.json());
/** Q1. Create an API that adds a new user to your users stored in a JSON file. (ensure that the email of the new user doesn’t exist before)(1
Grades)
o URL: POST /users  */
// middleware to load data
const loadUsers = (req, res, next) => {
  try {
    req.users = dataHandler();
    next();
  } catch (err) {
    return responseHandler(res, ErrorStatusCode, loadFailure);
  }
};
// middleware to check if data is undefined
const checkDataValidity = (req, res, next) => {
  if (
    undefined === req.body.name ||
    undefined === req.body.age ||
    undefined === req.body.email
  ) {
    return responseHandler(res, ErrorStatusCode, InvalidUserData);
  } else {
    next();
  }
};
//middleware to for email condition
const checkEmalExists = (req, res, next) => {
  if (isEmailExist(req.users, req.body.email)) {
    return responseHandler(res, ErrorStatusCode, InvalidEmailMsg);
  } else {
    next();
  }
};

app.post(
  "/users",
  loadUsers,
  checkDataValidity,
  checkEmalExists,
  (req, res, next) => {
    try {
      console.log(req.users);
      const newUserId = generateId(req.users);
      req.users[newUserId] = {
        id: newUserId,
        name: req.body.name,
        age: req.body.age,
        email: req.body.email,
      };
      writeUsers(req.users);
      responseHandler(res, SuccessStatusCode, UserAddedMsg);
    } catch (err) {
      responseHandler(res, ErrorStatusCode, InvalidUrlMsg);
    }
  },
);
/** Q2. Create an API that updates an existing user's name, age, or email by their ID. The user ID should be retrieved from the params. (1 Grade)
Note: Remember to update the corresponding values in the JSON file
o URL: PATCH /user/:id  */

app.patch("/user/:id", (req, res, next) => {});

/** Q3. Create an API that deletes a User by ID. The user id should be retrieved from either the request body or optional params. (1 Grade)
Note: Remember to delete the user from the file
o URL: DELETE /user{/:id}  */

/** Q4. Create an API that gets a user by their name. The name will be provided as a query parameter. (1 Grade)
o URL: GET /user/getByName */

/** Q5. Create an API that gets all users from the JSON file. (1 Grade)
o URL: GET /user */
app.get("/user", loadUsers, (req, res, next) => {
  try {
    responseHandler(res, SuccessStatusCode, { data: req.users });
  } catch (err) {
    responseHandler(res, ErrorStatusCode, InvalidUrlMsg);
  }
});
/** Q6. Create an API that filters users by minimum age. (1 Grade)
o URL: GET /user/filter */

/** Q7. Create an API that gets User by ID. (1 Grade)
o URL: GET /user/:id */

// handler of all invalid urls
app.all("{/*dummy}", (req, res, next) => {
  responseHandler(res, ErrorStatusCode, InvalidUrlMsg);
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
/** Part2: ERD Diagram */
/**
 * 
Musicana records have decided to store information on musicians who perform on their albums in
a database. The company has wisely chosen to hire you as a database designer.
o Each musician that is recorded at Musicana has an ID number,a name, an address (street, city) and a
phone number.
o Each instrument that is used in songs recorded at Musicana has a unique name and a musical key (e.g.,
C, B-flat, E-flat).
o Each album that is recorded at the Musicana label has a unique title, a copyright date, and an album
identifier.
o Each song recorded at Musicana has a unique title and an author.
o Each musician may play several instruments, and a given instrument may be played by several
musicians.
o Each album has a number of songs on it, but no song may appear on more than one album.
o Each song is performed by one or more musicians, and a musician may perform a number of songs.
o Each album has exactly one musician who acts as its producer.
o A producer may produce several albums.

 */

/**
 ************************************************ Part 3: Bonus ************************************************
 Problem Solving
 */

/**
 * Bonus Question
 * Solve the problem Longest Common Prefix on LeetCode
Longest Common Prefix:  https://leetcode.com/problems/longest-common-prefix/description/?envType=study-plan-v2&envId=top-interview-150
*/
