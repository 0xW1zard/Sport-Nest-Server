const express = require('express')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config();
const uri = process.env.MONGODB_URI;
const port = process.env.PORT;
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ error: "Unauthorized" });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).send({ error: "Unauthorized" });
    }
    try {
        const { payload } = await jwtVerify(token, JWKS);
        console.log("Payload from token:", payload);
        next();
    } catch (error) {
        res.status(403).send({ message: "Forbidden" });
    }
}


async function run() {
    try {
        // await client.connect();
        const db = client.db('sportnest');
        const AllFacilitatesCollection = db.collection('allFacilities');
        const BookingsCollection = db.collection('bookings');


        app.get('/allFacilities', async (req, res) => {
            try {
                const result = await AllFacilitatesCollection.find().toArray();
                res.status(200).send(result);
            } catch (error) {
                console.error("Error fetching data from MongoDB:", error);
                res.status(500).send({ error: "An error occurred while fetching data." });
            }
        })

        app.get('/allFacilities/:id', verifyToken, async (req, res) => {
            try {
                const { id } = req.params;
                const result = await AllFacilitatesCollection.findOne({ _id: new ObjectId(id) });
                res.status(200).send(result);
            } catch (error) {
                console.error("Error fetching data from MongoDB:", error);
                res.status(500).send({ error: "An error occurred while fetching data." });
            }
        })

        //get for manage my facilities
        app.get('/manage-facilities/:userId', async (req, res) => {
            try {
                const { userId } = req.params;
                const result = await AllFacilitatesCollection.find({ userId: userId }).toArray();
                res.status(200).send(result);
            } catch (error) {
                console.error("Error fetching data from MongoDB:", error);
                res.status(500).send({ error: "An error occurred while fetching my facilites data." });
            }
        })

        app.put('/manage-facilities/:id', verifyToken, async (req, res) => {
            try {
                const { id } = req.params;
                const updatedData = req.body;
                const result = await AllFacilitatesCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedData }
                );
                res.status(200).send(result);
            } catch (error) {
                console.error("Error updating facility:", error);
                res.status(500).send({ error: "An error occurred while updating the facility." });
            }
        });

        app.delete('/manage-facilities/:id', verifyToken, async (req, res) => {
            try {
                const { id } = req.params;
                const result = await AllFacilitatesCollection.deleteOne({ _id: new ObjectId(id) })
                res.status(200).send(result);
            } catch (error) {
                console.error("Error fetching data from MongoDB:", error);
                res.status(500).send({ error: "An error occurred while Deleteing data." });
            }
        })

        //get bookings of user
        app.get('/bookings/:userId', async (req, res) => {
            try {
                const { userId } = req.params;
                const result = await BookingsCollection.find({ userId: userId }).toArray();
                res.status(200).send(result);
            } catch (error) {
                console.error("Error fetching data from MongoDB:", error);
                res.status(500).send({ error: "An error occurred while fetching data." });
            }
        })

        app.delete('/my-bookings/:id', verifyToken, async (req, res) => {
            try {
                const { id } = req.params;
                const result = await BookingsCollection.deleteOne({ _id: new ObjectId(id) })
                res.status(200).send(result);
            } catch (error) {
                console.error("Error fetching data from MongoDB:", error);
                res.status(500).send({ error: "An error occurred while Deleteing data." });
            }
        })

        //add facility data to database
        app.post('/allFacilities', verifyToken, async (req, res) => {
            try {
                const facilityData = req.body;
                console.log("Received facility data:", facilityData);
                const result = await AllFacilitatesCollection.insertOne(facilityData);
                res.status(201).send(result);
            } catch (error) {
                console.error("Error adding facility:", error);
                res.status(500).send({ error: "An error occurred while adding the facility." });
            }
        })
        //from my booking page
        app.post('/bookings', verifyToken, async (req, res) => {
            try {
                const bookingDetails = req.body;
                console.log("Received booking data:", bookingDetails);
                const result = await BookingsCollection.insertOne(bookingDetails);
                res.status(201).send(result);
            } catch (error) {
                console.error("Error processing booking data:", error);
                res.status(500).send({ error: "An error occurred while processing booking data." });
            }
        })

        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})