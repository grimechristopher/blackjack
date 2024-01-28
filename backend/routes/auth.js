const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('../models/account.js');

const { verifyAuth } = require('../middleware/verifyAuth.middleware.js');

const authRouter = express.Router();

authRouter.post('/login/', async (request, response, next) => {
    // Respond with an error if body is missing required fields
    // Require email in the request body
    const account = request.body;
    if (!account?.email) {
      return response.status(400).send('Missing email'); 
    }

    // Require password in the request body
    if (!account?.password) {
      return response.status(400).send('Missing password');
    }

    // Get the relevant account from the database and compare that password to the password in the request body
    const record = await db.findByEmail(account.email);

    if (!record) {
      return response.status(404).send('Account could not be logged in');
    }
    // Usue bcrypt to compare plain text to the hashed password
    try {
      const isValidPassword = await bcrypt.compare(account.password, record.password);

      // Invalid passwords respond with an error 
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
    }
    catch (error) {
      return response.status(403).send('Account could not be logged in');
    }

    // Password is verified. Create a JWT with the account data
    const token = jwt.sign(record, process.env.JWT_SECRET, {expiresIn: 3600 * 24});
    // Store the JWT in a cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 3600 * 24 * 1000), // ms not s 
      secure: process.env.ENVIRONMENT === "Local" ? false : true, 
      httpOnly: true, 
      sameSite: "none"
    }

    // respond with success and add the cookie
    const recordResponse = {
      id: record.id,
      username: record.username,
      email: record.email,
      isLoggedIn: true,
    }

    return response.status(200).cookie('jwt-auth', token, cookieOptions).json(recordResponse);
});

authRouter.post('/register/', async (request,response, next) => {
  const account = request.body;
  try {
    // Require username in the request body
    if (!account?.username) {
      return response.status(400).send('Missing username');
    }

    // Require email in the request body
    if (!account?.email) {
      return response.status(400).send('Missing email');
    }

    // Require password in the request body
    if (!account?.password) {
      return response.status(400).send('Missing password');
    }

    // Check if the email is already in use
    try {
      const existingAccount = await db.findByEmail(account.email);
      if (existingAccount) {
        return response.status(400).send('Account could not be created');
      }
    }
    catch (error) {
      return response.status(400).send('Account could not be created');
    }
    
    // Create the account with the data in the request
    await db.createAccount(
      { 
        username: account.username, 
        email: account.email,
        password: await bcrypt.hash(account.password,10), // Hash the password
      });
    
    return response.status(201).send('Account created successfully');
  }
  catch (error) {
    // next(error);
  };
});

authRouter.get('/test-public/', (request,response) => {
  console.log("test public")
});

authRouter.get('/test-private/', verifyAuth, (request,response) => {
  console.log("test private")
});


module.exports = authRouter
;