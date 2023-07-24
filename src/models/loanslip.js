const mongoose = require("mongoose");

const loanslipSchema = new mongoose.Schema({
    nameUser: {
        type: String,
        require: true
    },
    phoneUser: {
        type: String,
        require: true
    },
    idBook: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: "Book"  
    },
    price: {
        type: Number,
        default: 0
    },
    //ngy muong
    borrowedDate: {
        type: Number
    },
    // ngay tra
    payDay: {
        type: Number
    },
    //ngay tra thuc the
    actualPaymentDate: {
        type: Number
    },
    isPay: {
        type: Boolean,
        default: false
    }
})
module.exports = mongoose.model("Loanslip", loanslipSchema);