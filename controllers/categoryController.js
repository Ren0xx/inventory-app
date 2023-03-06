const { default: mongoose } = require("mongoose");
const Category = require("../models/category");
const Item = require("../models/item");
const async = require("async");
// Display list of all categorys.
const { body, validationResult } = require("express-validator");
exports.category_list = (req, res) => {
    Category.find()
        .sort([["name", "ascending"]])
        .exec(function (err, categories) {
            if (err) return next(err);
            res.render("category_list", {
                title: "Categories List",
                categories: categories,
            });
        });
};

// Display detail page for a specific category.
exports.category_detail = (req, res, next) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    async.parallel(
        {
            category(callback) {
                Category.findById(id).exec(callback);
            },
            items_in_category(callback) {
                Item.find({ category: id }).exec(callback);
            },
        },
        (err, results) => {
            if (err) return next(err);
            if (results.category == null) {
                const err = new Error("Category not found.");
                err.status = 404;
                return next(err);
            }
            res.render("category_detail", {
                title: results.category.name,
                category: results.category,
                items_in_category: results.items_in_category,
            });
        }
    );
};
// Handle category create on POST.
exports.category_create_get = (req, res) => {
    res.render("category_form", { title: "Create category" });
};
// Display category create form on GET.
exports.category_create_post = [
    body("name", "Category name required").trim().isLength({ min: 1 }).escape(),
    body("description", "Category description required")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        const category = new Category({
            name: req.body.name,
            description: req.body.description,
        });
        if (!errors.isEmpty()) {
            res.render("category_form", {
                title: "Create category",
                category: category,
                errors: errors.array(),
            });
            return;
        } else {
            Category.findOne({ name: req.body.name }).exec(
                (err, found_category) => {
                    if (err) return next(err);
                    if (found_category) red.redirect(found_category.url);
                    else {
                        category.save((err) => {
                            if (err) return next;
                            res.redirect(category.url);
                        });
                    }
                }
            );
        }
    },
];

// Display category delete form on GET.
exports.category_delete_get = (req, res, next) => {
    async.parallel(
        {
            category(callback) {
                Category.findById(req.params.id).exec(callback);
            },
            items_with_category(callback) {
                Item.find({ category: req.params.id }).exec(callback);
            },
        },
        (err, results) => {
            if (err) return next(err);
            if (results.category == null) {
                res.redirect("/shop/categories");
            }
            res.render("category_delete", {
                title: "Delete Catergory",
                category: results.category,
                items_with_category: results.items_with_category,
            });
        }
    );
};

// Handle category delete on POST.
exports.category_delete_post = (req, res) => {
    async.parallel(
        {
            category(callback) {
                Category.findById(req.params.id).exec(callback);
            },
            items_with_category(callback) {
                Item.find({ category: req.params.id }).exec(callback);
            },
        },
        (err, results) => {
            if (err) return next(err);
            if (results.items_with_category > 0) {
                res.render("category_delete", {
                    title: "Delete Genre",
                    category: results.category,
                    item_with_category: results.item_with_category,
                });
                return;
            }
            Category.findByIdAndDelete(req.body.categoryid, (err) => {
                if (err) return next(err);
                res.redirect("/shop/categories");
            });
        }
    );
};

// Display category update form on GET.
exports.category_update_get = (req, res) => {
    res.send("NOT IMPLEMENTED: category update GET");
};

// Handle category update on POST.
exports.category_update_post = (req, res) => {
    res.send("NOT IMPLEMENTED: category update POST");
};
