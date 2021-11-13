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