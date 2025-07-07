const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email : {
        type : String,
        required : true
    },
});

//It will automatically build username, pasword, salt value and their hash for the login form
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
