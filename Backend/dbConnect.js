const mongoose = require("mongoose");
const path = require("path");

// mongoose.Promise = global.Promise;
class Database {
  databseConnect = () => {
    console.log("helloo", mongoose.connect("mongodb://localhost:27017/crmcrud"))
    return mongoose.connect("mongodb://localhost:27017/crmcrud");
  };

}

module.exports = new Database();
