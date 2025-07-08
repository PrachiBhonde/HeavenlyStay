if(process.env.Node_ENV != "production") {
   require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

//import routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

//Database connection
async function main() {
    await mongoose.connect(dbUrl);
}
main().then(() => {
    console.log("connected to db");
}).catch(err => {
    console.log(err);
});


//view engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

//MongoAtlas Store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION store", err);
});

//Session & flash
const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge :  7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};


app.use(session(sessionOptions));
app.use(flash());

//Passport built-in methods
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

//serialize - to store user related information so that baar baar login nahi krna padega
//deserialize - to deserialize users in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Set local flash message variables
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// //To create demo user
// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//       email: "student@gmail.com",
//       username: "delta-student",
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");  //helloworld is a password value
//     res.send(registeredUser);
// });

//routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//Root route
// app.get("/", (req, res) => {
//     res.send("Hi, I am groot");
// });

//Catch-all for unknown routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not found!"));
})

//Error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
    // res.status(statusCode).send(message);
});

//Server start
app.listen(8080, (req, res) => {
    console.log("Server is Listening");
});