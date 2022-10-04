//Including Dependancies
var express = require('express');
var path = require('path');
//Including additional features to support the project
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const { request } = require('http');
const session = require('cookie-session')
//Validations for phone number and quantity 
const {
    validatePhone, validateNumber
} = require('./public/js/validations');
const {
    check,
    validationResult
} = require('express-validator');
var myapp = express();
//setting the paths for ejs and public folders
myapp.set('views', path.join(__dirname, 'views'));
myapp.use(express.static(__dirname + '/public'));
myapp.set('view engine', 'ejs');
myapp.use(express.urlencoded({
    extended: false
}));
myapp.use(bodyParser.urlencoded({
    extended: true
}))
myapp.use(fileUpload())
//Cookie will be active only for 30 minutes, Installed for security of login page
myapp.use(session({
    secret: "mysecret",
    resave: false,
    maxAge: 30 * 60 * 1000,
    saveUninitiated: true
}))
// mongoDB Connection
mongoose.connect("mongodb://localhost:27017/juicestore", { useNewUrlParser: true, useUnifiedTopology: true, });

//settingup a model for collection
const ordersSchema = new mongoose.Schema({
    name: String,
    phone: String,
    mangojuice: String,
    berryjuice: String,
    applejuice: String,
    subtotal: Number,
    tax: Number,
    total: Number
});
const juicePrice = {
    mangojuice: 2.99,
    berryjuice: 1.99,
    applejuice: 2.49,
};
const orders = mongoose.model('Order', ordersSchema);
//Middleware function for security
middleware = function (req, res, next) {
    if (req.session.isauthenticated) {
        return next()
    }
    else {
        res.redirect("/login")
    }
}
//To Home page
myapp.get("/", (req, res) => {
    res.render("Home", { session: req.session })
})
// Functions in Request new page 
myapp.post("/addorder", [
    check('userName', 'Please enter a name').not().isEmpty(),
    check('userPhone', 'Please enter a user phone').not().isEmpty(),
    check('userPhone').custom(validatePhone),
    check('mangojuice').custom(validateNumber),
    check('berryjuice').custom(validateNumber),
    check('applejuice').custom(validateNumber)
], (req, res) => {
    const errors = validationResult(req);
    var result = {
        data: req.body,
        errors: errors.array(),
    };
    let subtotal = (req.body.mangojuice * juicePrice.mangojuice) + (req.body.berryjuice * juicePrice.berryjuice) +
        (req.body.applejuice * juicePrice.applejuice)
    let tax = subtotal * 0.13
    let total = subtotal + tax
    if (subtotal <= 0) {
        result.errors.push({
            msg: "Please enter atleast one item", resultclass: "danger"
        })
    }
    if (result.errors.length) {
        res.render('home', { result: result.errors, session: req.session });
    }
    else {
        let newOrder = new orders({
            name: req.body.userName,
            phone: req.body.userPhone,
            mangojuice: (req.body.mangojuice) ? req.body.mangojuice : 0,
            berryjuice: (req.body.berryjuice) ? req.body.berryjuice : 0,
            applejuice: (req.body.applejuice) ? req.body.applejuice : 0,
            subtotal: subtotal,
            tax: tax,
            total: total
        })
        newOrder.save().then(() => {
            res.render("result", { message: "Thank you for your order", session: req.session, resultclass: "success", newOrder })
        })
    }
})
//To  Login Page 
myapp.get("/login", (req, res) => {
    res.render("login", { session: req.session })
})
myapp.post("/login", (req, res) => {
    if (req.body.userName === "admin" && req.body.password === "123admin") {
        req.session.isauthenticated = true
        res.render("home", { session: req.session })
    }
    else {
        res.render("login", {
            message: "Your Credentials are invalid, please use username:admin, password:123admin",
            session: req.session
        })
    }
})
//Logout page
myapp.get("/logout", (req, res) => {
    req.session.isauthenticated = false
    res.render("result", { message: "Thank you for using the application, you are successfully logged out", session: req.session, resultclass: "success" })
})
//To new View entries Page 
myapp.get("/dashboard", middleware, (req, res) => {
    console.log(req.session)
    orders.find({}, (error, data) => {
        if (!error && data.length > 0) {
            res.render("dashboard", { orders: data, session: req.session })
        }
        else {
            res.render("home", { session: req.session })
        }

    })
})
//To delete requests from dashboard
myapp.get("/delete/:requestid", middleware, (req, res) => {
    orders.findByIdAndRemove({ _id: req.params.requestid }).exec((error, data) => {
        res.render("result", { message: "Order deleted successfully", session: req.session, resultclass: "success" })
    })
})

//Command to port 8080
myapp.listen(process.env.PORT || 8080, () => {
    console.log("Server started at port 8080.\nGo to http://localhost:8080");
});