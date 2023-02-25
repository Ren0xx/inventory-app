console.log(
    "This script populates some test items and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

var async = require("async");
var Item = require("./models/item");
var Category = require("./models/category");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var categories = [];
var items = [];

function categoryCreate(name, description, cb) {
    var category = new Category({
        name: name,
        description: description,
    });

    category.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }

        console.log("New Category: " + category);
        categories.push(category);
        cb(null, category);
    });
}

function itemCreate(name, description, price, number_in_stock, category, cb) {
    var item = new Item({
        name: name,
        description: description,
        price: price,
        number_in_stock: number_in_stock,
        category: category,
    });

    item.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }

        console.log("New Item: " + item);
        items.push(item);
        cb(null, item);
    });
}

function createCategories(cb) {
    async.series(
        [
            function (callback) {
                categoryCreate(
                    "Books",
                    "Fiction and non-fiction books",
                    callback
                );
            },
            function (callback) {
                categoryCreate(
                    "Electronics",
                    "Electronic devices and accessories",
                    callback
                );
            },
            function (callback) {
                categoryCreate(
                    "Clothing",
                    "Clothing items and accessories",
                    callback
                );
            },
        ],
        cb
    );
}

function createItems(cb) {
    async.parallel(
        [
            function (callback) {
                itemCreate(
                    "The Catcher in the Rye",
                    "A classic novel by J.D. Salinger",
                    10.99,
                    5,
                    categories[0],
                    callback
                );
            },
            function (callback) {
                itemCreate(
                    "iPhone 13 Pro",
                    "The latest iPhone model with advanced features",
                    999.99,
                    2,
                    categories[1],
                    callback
                );
            },
            function (callback) {
                itemCreate(
                    "Levi's 501 Jeans",
                    "The iconic pair of jeans that never go out of style",
                    69.99,
                    10,
                    categories[2],
                    callback
                );
            },
            function (callback) {
                itemCreate(
                    "T-Shirt",
                    "A comfortable and casual T-shirt for everyday wear",
                    19.99,
                    50,
                    categories[2],
                    callback
                );
            },
            function (callback) {
                itemCreate(
                    "Dress",
                    "A stylish and elegant dress for special occasions",
                    99.99,
                    15,
                    categories[2],
                    callback
                );
            },
            function (callback) {
                itemCreate(
                    "Running Shoes",
                    "Lightweight and comfortable shoes for running",
                    79.99,
                    20,
                    categories[2],
                    callback
                );
            },
            function (callback) {
                itemCreate(
                    "Leather Belt",
                    "A stylish and durable leather belt",
                    29.99,
                    30,
                    categories[2],
                    callback
                );
            },
        ],
        cb
    );
}

async.series([createCategories, createItems], function (err, results) {
    if (err) {
        console.log("FINAL ERR: " + err);
    } else {
        console.log("Items: " + items);
    }

    // Disconnect mongoose
    mongoose.connection.close();
});
