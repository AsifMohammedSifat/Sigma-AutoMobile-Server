const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const objectId = require('mongodb').ObjectId;

// uri and client for mongoDB 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ltd8o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const run = async () => {
    try {
      await client.connect();
      const database = client.db("automobileDb");
      console.log('connected successfully');
      const carhubCollection = database.collection("carhub");
      const orderCollection = database.collection("carorder");
      const reviewCollection = database.collection("review");
      const userCollection = database.collection("user");


       // Get all the car from client side Homecar and carhub menu
    app.get("/carhub", async (req, res) => {
        const allCar = await carhubCollection.find({});
        const convertedCar = await allCar.toArray();
        res.json(convertedCar);
      });
      // Get clicked car 
    app.get('/carhub/:id',async (req,res)=> {
        const id = req.params.id;
        const searchedCar = await carhubCollection.findOne({_id:objectId(id)});
        // console.log(searchedCar);
        res.json(searchedCar);
      });
        // POST carorder 
        app.post('/order',async (req,res)=>{
            const orderData=req.body;
            // console.log(orderData);
            const result =await orderCollection.insertOne(orderData);
            res.json(result.acknowledged);
            // res.send('hitten')
        });

          // Get my orders 
    app.get('/allOrder/:userEmail', async (req,res)=> {
        const userEmail = req.params.userEmail;
        console.log(userEmail);
        const result = await orderCollection.find({userEmail:userEmail});
        const convertedOrders = await result.toArray();
        res.json(convertedOrders);
        res.send(userEmail);
    });
    // Delete a booking 
    app.delete('/booked', async(req,res)=> {
        const deleteId = req.body.deleteId;
        const result = await orderCollection.deleteOne({_id:objectId(deleteId)});
        res.json({res:' '})
      })
    // Update a booking by admin 
    app.put('/booked', async (req,res)=> {
        const updateId = req.body.updateId;
        const status = req.body.status;
        const filter = { _id: objectId(updateId)};
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            status: status
          },
        };
        const result = await orderCollection.updateOne(filter, updateDoc, options);
        // console.log(result);
        res.json({res:' '});
      })
      //check booked item
      app.get('/booked', async(req,res)=> {
        const userEmail = req.query.userEmail;
        const id = req.query.id;
        if(userEmail!=undefined && id!=='undefined') {
          const result = await orderCollection.findOne({userEmail:userEmail,id:id});
          if(result) res.json({res:' '});
          else res.json({res: ''});
        }
      });
       // Get all orders 
       app.get('/allOrders', async (req,res)=> {
        const result = await orderCollection.find({});
        const convertedOrders = await result.toArray();
        res.json(convertedOrders);
      });
       //   post add tour api 
       app.post('/addcar',async (req,res)=>{
        const tour=req.body;
        const result =await carhubCollection.insertOne(tour);
        console.log(result);
        res.json(result);
    });

    // Delete a car product 
    app.delete('/managecar', async(req,res)=> {
        const deleteId = req.body.deleteId;
        const result = await carhubCollection.deleteOne({_id:objectId(deleteId)});
        res.json({res:' '})
      })
    // Update a booking by admin 
    app.put('/managecar', async (req,res)=> {
        const updateId = req.body.updateId;
        const status = req.body.status;
        const filter = { _id: objectId(updateId)};
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            status: status
          },
        };
        const result = await carhubCollection.updateOne(filter, updateDoc, options);
        // console.log(result);
        res.json({res:' '});
      });

       //   post review 
       app.post('/review',async (req,res)=>{
        const review=req.body;
        const result =await reviewCollection.insertOne(review);
        // console.log(result);
        res.json(result);
    });
    // Get all the car from client review
    app.get("/review", async (req, res) => {
        const allReview = await reviewCollection.find({});
        const convertedReview = await allReview.toArray();
        res.json(convertedReview);
      });

    //   add user 
    app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await userCollection.insertOne(user);
        // console.log(result);
        res.json(result);
    });

    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });
    // make admin  method 
    app.put('/user/admin', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: { role: 'admin' } };
        const result = await userCollection.updateOne(filter, updateDoc);
        console.log(result);
        res.json(result);
   

    });
      //filtr admin
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            // console.log('success');
            res.json({ admin: isAdmin });
        })

      
  
      
   
    } finally {
      // client.close();
    }
  };
  run().catch(console.dir);
  // Home page for node server
  app.get("/", (req, res) => {
    res.send("Hello from server");
  });
  //   Listening at port
  app.listen(port, () => {
    console.log("listening", port);
  });

