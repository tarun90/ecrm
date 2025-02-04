
const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv');
const { databseConnect } = require('./dbConnect.js');
const productRoutes = require('./src/routes/products.js');
const invoiceRoutes = require('./src/routes/invoice.js')
// const customerRoutes = require('./src/routes/Customers.js')

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

databseConnect()
    .then(() => {
        console.log("Database connect successfully!");
    })
    .catch((err) => {
        console.log("[ERROR]:Database connection");
        console.log(`${err}`);
    });

// Routes
app.use('/api/products', productRoutes);
// app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});