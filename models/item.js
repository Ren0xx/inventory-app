const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, maxLength: 200 },
    price: { type: Number, required: true },
    number_in_stock: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, required: true, ref: "category" },
});

ItemSchema.virtual("url").get(function () {
    return `/shop/item/${this._id}`;
});
module.exports = mongoose.model("Item", ItemSchema);
