const Item = require("../models/item");
const Category = require("../models/category");
const async = require("async");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
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
exports.item_create_get = (req, res, next) => {
    async.parallel(
        {
            categories(callback) {
                Category.find(callback);
            },
        },
        (err, results) => {
            if (err) return next(err);
            res.render("item_form", {
                title: "Create Item",
                categories: results.categories,
            });
        }
    );
};

// Handle item create on POST.
exports.item_create_post = [
    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            req.body.category =
                typeof req.body.category === "undefined"
                    ? []
                    : [req.body.category];
        }
        next();
    },

    body("name", "Name must not be empty").trim().isLength({ min: 1 }).escape(),
    body("description", "Description must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("price", "Price must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("category.*").escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            number_in_stock: 1,
            category: req.body.category,
        });
        if (!errors.isEmpty()) {
            async.parallel(
                {
                    categories(callback) {
                        Category.find(callback);
                    },
                },
                (err, results) => {
                    if (err) return next(err);
                    res.render("item_form", {
                        title: "Create Item",
                        categories: results.categories,
                        item: item,
                        errors: errors.array(),
                    });
                }
            );
            return;
        }

        item.save((err) => {
            if (err) return next(err);
            res.redirect(item.url);
        });
    },
];

// Display item delete form on GET.
exports.item_delete_get = (req, res, next) => {
    async.parallel(
        {
            item(callback) {
                Item.findById(req.params.id).exec(callback);
            },
        },
        (err, results) => {
            if (err) return next(err);
            if (results.item == null) res.redirect("/shop/items");
            res.render("item_delete", {
                title: "Delete Item",
                item: results.item,
            });
        }
    );
};

// Handle item delete on POST.
exports.item_delete_post = (req, res) => {
    async.parallel(
        {
            item(callback) {
                Item.findById(req.params.id).exec(callback);
            },
        },
        (err, results) => {
            if (err) return next(err);
            Item.findByIdAndRemove(req.body.itemid, (err) => {
                if (err) return next(err);
                res.redirect("/shop/items");
            });
        }
    );
};

// Display item update form on GET.
exports.item_update_get = (req, res, next) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    async.parallel(
        {
            item(callback) {
                Item.findById(id).populate("category").exec(callback);
            },
            categories(callback) {
                Category.find(callback);
            },
        },
        (err, results) => {
            if (err) return next(err);
            if (results.item == null) {
                const err = new Error("Item not found");
                err.status = 404;
                return next(err);
            }
            for (const category of results.categories) {
                for (const itemCategory of results.item.category) {
                    if (
                        category._id.toString() == itemCategory._id.toString()
                    ) {
                        category.checked = "true";
                    }
                }
            }
            res.render("item_form", {
                title: "Update Book",
                categories: results.categories,
                item: results.item,
            });
        }
    );
};

// Handle item update on POST.
exports.item_update_post = [
    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            req.body.category =
                typeof req.body.category === "undefined"
                    ? []
                    : [req.body.category];
        }
        next();
    },

    body("name", "Name must not be empty").trim().isLength({ min: 1 }).escape(),
    body("description", "Description must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("price", "Price must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("category.*").escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            number_in_stock: 1,
            category:
                typeof req.body.category === "undefined"
                    ? []
                    : req.body.category,
            _id: req.params.id,
        });
        if (!errors.isEmpty()) {
            async.parallel(
                {
                    categories(callback) {
                        Category.find(callback);
                    },
                },
                (err, results) => {
                    if (err) return next(err);

                    for (const category in results.categories) {
                        category.checked = "true";
                    }
                    res.render("item_form", {
                        title: "Create Item",
                        categories: results.categories,
                        item: item,
                        errors: errors.array(),
                    });
                }
            );
            return;
        }

        Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
            if (err) return next(err);

            res.redirect(theitem.url);
        });
    },
];
