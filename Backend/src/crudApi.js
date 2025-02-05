const express = require('express');
const Product = require('./Schema/product');

const app = express();
app.use(express.json());

app.post("/product/add", async (req, resp) => {
    const data = new Product(req.body);
    const result = await data.save();
    resp.send(result);
});

app.get("/product/get", async (req, resp) => {
    const data = await Product.find();
    resp.send(data);
})

app.delete("/delete/:_id", async (req, resp) => {
    console.log(req.params)
    const data = await Product.deleteOne(req.params);
    resp.send(data);
})

app.put("/update/:_id", async (req, resp) => {
    console.log(req.params)
    const data = await Product.updateOne(
        req.params,
        { $set: req.body }
    );
    resp.send(data);
})

app.listen(5001)

// Note:: 
// Q: where you are passing id in put or delete method? params or body ?
// A: in Delete api method we generally delete the data so we pass id in params, and in Put method we can send it body or query params , its totally upto you.