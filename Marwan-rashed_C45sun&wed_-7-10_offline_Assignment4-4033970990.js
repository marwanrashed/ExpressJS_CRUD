/**
 * Assignment 4
 * Author: Marwan Rashed
 * ID: 4033970990
 * Date: 28/01/2025
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
  fs.writeFileSync("./users.json", JSON.stringify(users, null, 2));
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
  return response.status(statusCode).json(message);
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
const UserAddedMsg = { message: "User added successfully!" };
const UserUpdatedMsg = { message: "User updated successfully!" };
const UserDeletedMsg = { message: "User deleted successfully!" };
const userReadMsg = { message: "User read successfully!" };
const UserNotFoundMsg = { message: "User not found" };
const InvalidUrlMsg = { message: "Invalid Url" };
const InvalidId = { message: "User ID not found" };
const InvalidUserData = { message: "Invalid User Data" };
const loadFailure = { message: "Failed to load users" };
const ServerErrorMsg = { message: "Server error" };
const InvalidEmailMsg = {
  message: "User Already Exists please enter another email",
};
// Questions Implementation
// util functions
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

//middleware to flatten json file into an array
const flattenUsersJson = (req, res, next) => {
  //flatten id entry
  let usersArr = [];
  for (const [key, val] of Object.entries(req.users)) {
    usersArr.push({
      id: key,
      ...val,
    });
  }
  req.usersArr = usersArr;
  next();
};
// incoming data middleware
app.use(express.json());
// loading users middleware
app.use(loadUsers);
/** Q1. Create an API that adds a new user to your users stored in a JSON file. (ensure that the email of the new user doesn’t exist before)(1
Grades)
o URL: POST /users  */
app.post("/user", checkDataValidity, checkEmalExists, (req, res, next) => {
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
});
/** Q2. Create an API that updates an existing user's name, age, or email by their ID. The user ID should be retrieved from the params. (1 Grade)
Note: Remember to update the corresponding values in the JSON file
o URL: PATCH /user/:id  */

app.patch("/user/:id", (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (req.users[userId]) {
      if (req.body.name) req.users[userId].name = req.body.name;
      if (req.body.age) req.users[userId].age = req.body.age;
      if (req.body.email) req.users[userId].email = req.body.email;
      writeUsers(req.users);
      // I am assuming several fields can be updated at once
      responseHandler(
        res,
        SuccessStatusCode,
        "User data updated successfully.",
      );
    } else {
      responseHandler(res, ErrorStatusCode, InvalidId);
    }
  } catch (err) {
    responseHandler(res, ErrorStatusCode, InvalidUrlMsg);
  }
});

/** Q3. Create an API that deletes a User by ID. The user id should be retrieved from either the request body or optional params. (1 Grade)
Note: Remember to delete the user from the file
o URL: DELETE /user{/:id}  */
app.delete("/user{/:id}", (req, res, next) => {
  try {
    const userID = Number(req.params.id || req.body.id);
    if (req.users[userID]) {
      delete req.users[userID];
      writeUsers(req.users);
      responseHandler(res, SuccessStatusCode, UserDeletedMsg);
    } else {
      responseHandler(res, ErrorStatusCode, InvalidId);
    }
  } catch (err) {
    responseHandler(res, ErrorStatusCode, InvalidUrlMsg);
  }
});
/** Q4. Create an API that gets a user by their name. The name will be provided as a query parameter. (1 Grade)
o URL: GET /user/getByName */
app.get("/user/getByName", flattenUsersJson, (req, res, next) => {
  try {
    const userName = req.query.name;
    if (userName) {
      const userJson = req.usersArr.find((user) => user.name === userName);
      if (userJson) {
        responseHandler(res, SuccessStatusCode, userJson);
      } else {
        responseHandler(res, SuccessStatusCode, {
          message: "User name not found",
        });
      }
    } else {
      return responseHandler(res, ErrorStatusCode, InvalidUrlMsg);
    }
  } catch (err) {
    responseHandler(res, ErrorStatusCode, InvalidUrlMsg);
  }
});
/** Q5. Create an API that gets all users from the JSON file. (1 Grade)
o URL: GET /user */
app.get("/user", flattenUsersJson, (req, res, next) => {
  // I added the objects into an array to follow the example in the picture provided
  // in the assignment.
  try {
    responseHandler(res, SuccessStatusCode, { data: req.usersArr });
  } catch (err) {
    responseHandler(res, ErrorStatusCode, InvalidUrlMsg);
  }
});
/** Q6. Create an API that filters users by minimum age. (1 Grade)
o URL: GET /user/filter */
app.get("/user/filter", flattenUsersJson, (req, res, next) => {
  try {
    const userAge = req.query.age;
    if (userAge) {
      const userJson = req.usersArr.filter((user) => user.age >= userAge);
      if (userJson && userJson.length > 0) {
        if (userJson.length === 1) {
          // to return a single object instead of an array with one object
          // to match format in the assignemnt example
          return responseHandler(res, SuccessStatusCode, userJson[0]);
        }
        responseHandler(res, SuccessStatusCode, userJson);
      } else {
        responseHandler(res, SuccessStatusCode, {
          UserNotFoundMsg,
        });
      }
    } else {
      return responseHandler(res, ErrorStatusCode, InvalidUrlMsg);
    }
  } catch (err) {
    responseHandler(res, ErrorStatusCode, InvalidUrlMsg);
  }
});
/** Q7. Create an API that gets User by ID. (1 Grade)
o URL: GET /user/:id */
app.get("/user/:id", flattenUsersJson, (req, res, next) => {
  try {
    const userID = Number(req.params.id);
    const userJson = req.usersArr.find((user) => Number(user.id) === userID);
    if (userJson) {
      responseHandler(res, SuccessStatusCode, userJson);
    } else {
      responseHandler(res, NotFoundStatusCode, UserNotFoundMsg);
    }
  } catch (err) {
    responseHandler(res, ErrorStatusCode, InvalidUrlMsg);
  }
});
// handler of all invalid urls
app.all("{/*dummy}", (req, res, next) => {
  responseHandler(res, ErrorStatusCode, InvalidUrlMsg);
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

/**
 ************************************************ Part 3: Bonus ************************************************
 Problem Solving
 */
/**
 * Bonus Question
 * Solve the problem Longest Common Prefix on LeetCode
Longest Common Prefix:  https://leetcode.com/problems/longest-common-prefix/description/?envType=study-plan-v2&envId=top-interview-150
*/
