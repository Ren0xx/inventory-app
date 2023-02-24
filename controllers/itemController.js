const Item = require("../models/item");
const Category = require("../models/category");
const async = require("async");
const mongoose = require("mongoose");
exports.index = (req, res) => {
    async.parallel(
        {
            item_count(callback) {
                Item.countDocuments({}, callback);
            },
            category_count(callback) {
                Category.countDocuments({}, callback);
            },
        },
        (err, results) => {
            res.render("index", {
                title: "Inventory App",
                error: err,
                data: results,
            });
        }
    );
};
// Display list of all items.
exports.item_list = (req, res) => {
    Item.find()
        .sort([["name", "ascending"]])
        .limit(25)
        .exec(function (err, items) {
            if (err) return next(err);
            res.render("item_list", {
                title: "Items",
                items: items,
            });
        });
};

// Display detail page for a specific item.
exports.item_detail = (req, res, next) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    async.parallel(
        {
            item(callback) {
                Item.findById(id).populate("category").exec(callback);
            },
        },
        (err, results) => {
            if (err) return next(err);
            if (results.item == null) {
                const err = new Error("Item not found");
                err.status = 404;
                return next(err);
            }
            res.render("item_detail", {
                title: results.item.name,
                item: results.item,
            });
        }
    );
};

// Display item create form on GET.
exports.item_create_get = (req, res) => {
    res.send("NOT IMPLEMENTED: item create GET");
};

// Handle item create on POST.
exports.item_create_post = (req, res) => {
    res.send("NOT IMPLEMENTED: item create POST");
};

// Display item delete form on GET.
exports.item_delete_get = (req, res) => {
    res.send("NOT IMPLEMENTED: item delete GET");
};

// Handle item delete on POST.
exports.item_delete_post = (req, res) => {
    res.send("NOT IMPLEMENTED: item delete POST");
};

// Display item update form on GET.
exports.item_update_get = (req, res) => {
    res.send("NOT IMPLEMENTED: item update GET");
};

// Handle item update on POST.
exports.item_update_post = (req, res) => {
    res.send("NOT IMPLEMENTED: item update POST");
};
