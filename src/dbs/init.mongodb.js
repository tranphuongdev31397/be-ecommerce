"use strict";

const mongoose = require("mongoose");

const connectString = "mongodb://127.0.0.1:27017/ecommerce";
const env = "DEV";

class Database {
  constructor() {
    this.connect();
  }
  //connect
  connect(type = "mongodb") {
    if (env === "DEV") {
        // Run only dev
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }   
    mongoose
      .connect(connectString, {maxPoolSize: 50})
      .then((_) => {

        console.log("Connect success");
      })
      .catch((err) => {
        console.log(err);
        console.log("Connect Error!");
      });
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const instanceMongoDb = Database.getInstance();

module.exports = instanceMongoDb;
