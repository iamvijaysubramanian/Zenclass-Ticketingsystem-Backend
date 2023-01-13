const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const app = express();
const dotenv = require("dotenv").config();
const URL = process.env.DB;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;



// Midleware
app.use(
    cors({
      origin: "*",

    })
  );
  
  app.use(express.json());

let authorize = (req, res, next) => {
  try {
    // Check if authorization token present
    console.log(req.headers);
    if (req.headers.authorization) {
      // Check if the token is valid
      let decodedToken = jwt.verify(req.headers.authorization, JWT_SECRET);
      if (decodedToken) {
        next();
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
      // if valid say next()
      // if not valid say unauthorized
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

  let tickets = [];

app.post("/user/register", async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db("B39WDT2");

    // Hash the password
    var salt = await bcrypt.genSalt(10);
    var hash = await bcrypt.hash(req.body.password, salt); // $2a$10$nM/BXB6Pfz9r0m3yznVjouOENpKdqnMxqRuZWmlQgaU1XLOrL14KW
    req.body.password = hash;

    // Select Collection
    // Do operation (CRUD)
    const user = await db.collection("users").insertOne(req.body);

    // Close the connection
    await connection.close();

    res.json({ message: "User created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/user/login", async (req, res) => {
    try {
      // Connect the Database
      const connection = await mongoclient.connect(URL);
  
      // Select the DB
      const db = connection.db("B39WDT2");
  
      const user = await db
        .collection("users")
        .findOne({ email: req.body.email });
  
      if (user) {
        const compare = await bcrypt.compare(req.body.password, user.password);
        if (compare) {
          // Issue Token
          const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
            expiresIn: "2m",
          });
          res.json({ message: "Success", token });
        } else {
          res.json({ message: "Incorrect Username/Password" });
        }
      } else {
        res.status(404).json({ message: "Incorrect Username/Password" });
      }
    } catch (error) {}
  });

  // Create
app.post("/ticket", authorize, async (req, res) => {
    try {
      // Connect the Database
      const connection = await mongoclient.connect(URL);
  
      // Select the DB
      const db = connection.db("B39WDT2");
  
      // Select Collection
      // Do operation (CRUD)
      const ticket = await db.collection("tickets").insertOne(req.body);
  
      // Close the connection
      await connection.close();
  
      res.json({ message: "Ticket created", id: ticket.insertedId });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  
    // req.body.id = ticketss.length + 1;
    // tickets.push(req.body);
    // res.json({ message: "Ticket added",id : tickets.length });
  });

  // Read
app.get("/tickets", authorize, async (req, res) => {
    try {
      // Connect the Database
      const connection = await mongoclient.connect(URL);
  
      // Select the DB
      const db = connection.db("B39WDT2");
  
      // Select Collection
      // Do operation (CRUD)
      const ticket = await db.collection("tickets").find({}).toArray();
  
      // Close the connection
      await connection.close();
  
      res.json(ticket);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  });

  // URL Parameter // 3
app.put("/ticket/:ticketId", authorize, async (req, res) => {
    try {
      // Connect the Database
      const connection = await mongoclient.connect(URL);
  
      // Select the DB
      const db = connection.db("B39WDT2");
  
      const ticketData = await db
        .collection("tickets")
        .findOne({ _id: mongodb.ObjectId(req.params.ticketId) });
  
      if (ticketData) {
        // Select Collection
        // Do operation (CRUD)
        delete req.body._id;
        const ticket = await db
          .collection("tickets")
          .updateOne(
            { _id: mongodb.ObjectId(req.params.ticketId) },
            { $set: req.body }
          );
  
        // Close the connection
        await connection.close();
  
        res.json(ticket);
      } else {
        res.status(404).json({ message: "Ticket not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
});

app.get("/ticket/:ticketId", authorize, async (req, res) => {
    try {
      // Connect the Database
      const connection = await mongoclient.connect(URL);
  
      // Select the DB
      const db = connection.db("B39WDT2");
  
      // Select Collection
      // Do operation (CRUD)
      const ticket = await db
        .collection("tickets")
        .findOne({ _id: mongodb.ObjectId(req.params.ticketId) });
  
      // Close the connection
      await connection.close();
  
      if (ticket) {
        res.json(ticket);
      } else {
        res.status(404).json({ message: "Ticket not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.delete(`/ticket/:ticketId`, authorize, async (req, res) => {
    try {
      // Connect the Database
      const connection = await mongoclient.connect(URL);
  
      // Select the DB
      const db = connection.db("B39WDT2");
  
      const ticketData = await db
        .collection("tickets")
        .findOne({ _id: mongodb.ObjectId(req.params.ticketId) });
  
      if (ticketData) {
        // Select Collection
        // Do operation (CRUD)
        const ticket = await db
          .collection("tickets")
          .deleteOne({ _id: mongodb.ObjectId(req.params.ticketId) });
  
        // Close the connection
        await connection.close();
  
        res.json(ticket);
      } else {
        res.status(404).json({ message: "Ticket not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  
    // const ticketId = req.params.ticketId;
    // const ticketIndex = tickets.findIndex((tick) => tick.id == ticketId);
    // tickets.splice(ticketIndex, 1);
    // res.json({ message: "Deleted" });
  });
  
  app.listen(process.env.PORT || 5050);