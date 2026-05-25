const express = require('express')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config();
const uri = process.env.MONGODB_URI;
const port = process.env.PORT;
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion } = require('mongodb');

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        await client.connect();
        const db = client.db('sportnest');
        const AllFacilitatesCollection = db.collection('allFacilitate');


        app.get('/allFacilitate', async (req, res) => {
            try{
                const result = await AllFacilitatesCollection.find().toArray();
                res.status(200).send(result);
            }catch(error){
                console.error("Error fetching data from MongoDB:", error);
                res.status(500).send({ error: "An error occurred while fetching data." });
            }
        })








        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }catch(error){
        console.error("Error connecting to MongoDB:", error);
    }finally {
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