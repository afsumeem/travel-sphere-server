const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload')
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleaware
app.use(cors());
app.use(express.json());
app.use(fileUpload())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7s5ai.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();

        const database = client.db("travel-sphere");
        const blogCollection = database.collection("blogs");
        const spotsCollection = database.collection("top-spots");
        const usersCollection = database.collection("users");


        //POST API- New Blog
        app.post('/blogs', async (req, res) => {
            const name = req.body.name;
            const title = req.body.title;
            const location = req.body.location;
            const expense = req.body.expense;
            const email = req.body.email;
            const date = req.body.date;
            const time = req.body.time;
            const status = req.body.status;
            const comment = req.body.comment;
            const image2 = req.body.pic;
            const rating = req.body.rating;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imgBuffer = Buffer.from(encodedPic, 'base64');
            const brand = {
                name,
                title,
                location,
                expense,
                email,
                date,
                time,
                rating,
                status,
                comment,
                image2,
                image: imgBuffer
            };
            const result = await blogCollection.insertOne(brand);
            console.log(result);
            res.json(result);
        });

        //get blog api
        app.get("/blogs", async (req, res) => {
            const blogs = await blogCollection.find({}).toArray();
            res.send(blogs);
        });

        // get single blog
        app.get("/blogs/:id", async (req, res) => {
            const blogDetails = await blogCollection.findOne({ _id: ObjectId(req.params.id) });
            res.send(blogDetails);
        })

        //Delete API - Blog

        app.delete("/blogs/:id", async (req, res) => {
            const deleteBlog = await blogCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.json(deleteBlog);
        });

        //UPDATE API - manage blog 
        app.put('/blogs/:id', async (req, res) => {
            const blog = req.body;
            const options = { upsert: true };
            const updatedBlog = {
                $set: { status: blog.status }

            };
            const updateStatus = await blogCollection.updateOne({ _id: ObjectId(req.params.id) }, updatedBlog, options);

            res.json(updateStatus);
        });



        //get top spots api
        app.get("/spots", async (req, res) => {
            const spots = await spotsCollection.find({}).toArray();
            res.send(spots);
        });


        //save users
        app.post('/users', async (req, res) => {
            const user = await usersCollection.insertOne(req.body);
            console.log(user);
            res.json(user);
        });

        // UPDATE API - users

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateUser = { $set: user }
            const result = await usersCollection.updateOne(filter, updateUser, options);
            res.json(result);
        });

        // UPDATE API- update users role 

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        //GET API- admin users

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);

            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            };
            console.log(isAdmin);
            res.json({ admin: isAdmin });
        });



        console.log('database connected successfully');

    } finally {
        //await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send(' server is running');
});

app.listen(port, () => {
    console.log('server running at port', port);
});