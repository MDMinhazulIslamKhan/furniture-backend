const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.usk5q3y.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const publicCollection = client.db('e-com').collection('public');
        const orderCollection = client.db('e-com').collection('furnitureOrder');

        // all public
        app.get('/allpublic', async (req, res) => {
            const query = {};
            const result = await publicCollection.find(query).toArray();
            res.send({ result })
        });

        //login
        app.get('/public', async (req, res) => {
            const phone = req.query.phone;
            const password = req.query.password;
            const query = { phone: phone };
            const exist = await publicCollection.findOne(query);
            console.log(exist);
            if (exist) {
                if (password === exist.password) {
                    return res.send({ success: true, massage: { id: exist._id.toString(), name: exist.name, phone: exist.phone, x: exist.role } })
                }
                else return res.send({ success: false, massage: "Password didn't match" })
            }
            else return res.send({ success: false, massage: "Phone number didn't match" })
        });

        // add public
        app.post('/public', async (req, res) => {
            const public = req.body;
            const query = { phone: public.phone };
            const exist = await publicCollection.findOne(query);
            if (exist) {
                return res.send({ success: false, massage: 'Phon number is already used' })
            }
            public.role = '000';
            const result = await publicCollection.insertOne(public);
            return res.send({ success: true });
        })

        // add order
        app.post('/order', async (req, res) => {
            const order = req.body;
            const query = order.product;
            if (!query.length) {
                return res.send({ success: false, massage: 'Phon number is already used' })
            }
            order.status = 'pending';
            const result = await orderCollection.insertOne(order);
            return res.send({ success: true });
        });

        // all public
        app.get('/allorder', async (req, res) => {
            const status = req.query.status;
            const query = { status: status };
            const result = await orderCollection.find(query).toArray();
            res.send({ result })
        });

        // user order
        app.get('/order', async (req, res) => {
            const id = req.query.id;
            const status = req.query.status;
            const query = { user: id, status: status };
            const result = await orderCollection.find(query).toArray();
            return res.send({ result })
        });

        //conform order
        app.put('/confirm', async (req, res) => {
            const id = req.query.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: { status: 'ok' },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            return res.send({ result })
        });

    }

    finally {

    }
}
run().catch(console.log);

app.get('/', (req, res) => {
    res.send('Running my node e-com Server!');
})


app.listen(port, () => {
    console.log(`e-com Server is running on ${port}`);
})
