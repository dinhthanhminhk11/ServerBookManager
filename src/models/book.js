const mongoose = require("mongoose");
const bookSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    price: {
        type: Number
    },
    discount: {
        type: Number
    },
    idCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }
})
module.exports = mongoose.model("Book", bookSchema);