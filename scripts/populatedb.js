#! /usr/bin/env node

console.log('This script populates some test projects, products, productCategorys and projectinstances to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

require('dotenv').config();

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
var mongoDB = userArgs[0] || process.env.MONGODB_URI;
if (!mongoDB || !/^mongodb(\+srv)?:\/\//.test(mongoDB)) {
    console.log('ERROR: You need to specify a valid MongoDB URL as the first argument or set MONGODB_URI in .env');
    return
}

var async = require('async')

var Product = require('../models/product')
var Project = require('../models/project')
var ProductCategory = require('../models/productcategory')
var Enquiry = require('../models/enquiry')


var mongoose = require("mongoose");
mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var products = []
var productCategories = []
var projects = []
var enquiries = []

function publicImagePath(relativePath) {
    return '/' + relativePath.replace(/^www[\/\\]/, '').replace(/\\/g, '/');
}

function productCreate(name, description, cost, status, categories, imagePath, cb) {
    var productdetail = {
        name: name,
        description: description,
        cost: cost,
        status: status,
        categories: categories,
        imagePath: publicImagePath(imagePath)
    }


    var product = new Product(productdetail);

    product.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New product: ' + product);
        products.push(product)
        cb(null, product)
    });
}

function productCategoryCreate(name, cb) {
    var productCategory = new ProductCategory({
        name: name
    });

    productCategory.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New productCategory: ' + productCategory);
        productCategories.push(productCategory)
        cb(null, productCategory);
    });
}

function projectCreate(name, owner, description, date, cost, projectUrl, youtubeUrl, categories, images, cb) {
    var projectdetail = {
        name: name,
        owner: owner,
        description: description,
        date: date,
        cost: cost,
        projectUrl: projectUrl,
        youtubeUrl: youtubeUrl,
        categories: categories,
        images: images
    }

    var project = new Project(projectdetail);
    project.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New project: ' + project);
        projects.push(project)
        cb(null, project)
    });
}


function enquiryCreate(name, comment, email, status, phone, date, cb) {
    enquirydetail = {
        name: name,
        comment: comment,
        email: email,
        status: status,
        phone: phone,
        date: date
    }


    var enquiry = new Enquiry(enquirydetail);
    enquiry.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New enquiry: ' + enquiry);
        enquiries.push(enquiry)
        cb(null, enquiry)
    });
}


function createProductCategory(cb) {
    async.parallel([
        function (callback) {
                productCategoryCreate("chair", callback);
        },
        function (callback) {
                productCategoryCreate("lamp", callback);
        },
        function (callback) {
                productCategoryCreate("wood", callback);
        },
        ],
        cb);
}

function createProduct(cb) {
    async.parallel([
        function (callback) {
                productCreate("woodlamp", "wooden lamp description", 300, true, [productCategories[2], productCategories[1],], "www/images/lamps.jpg", callback);
        },
        function (callback) {
                productCreate("woodchair", "wooden chair description", 300, true, [productCategories[2], productCategories[0],], "www/images/img chair.jpg", callback);

        },
        function (callback) {
                productCreate("lamp", "lamp description", 300, true, [productCategories[1], ], "www/images/interior.jpg", callback);

        },
        function (callback) {
                productCreate("chair", "chair description", 300, true, [productCategories[0], ], "www/images/architecture.jpg", callback);

        },
        ],
        // optional callback
        cb);
}


function createprojects(cb) {
    async.parallel([
        function (callback) {
                projectCreate("project 1", "owner 1", "description for 1", "1998-07-27", 234000, "http://google.com", "", ["commercial", "office"], [publicImagePath("www/images/gallery.jpg"), publicImagePath("www/images/architecture.jpg")], callback);
        },
        function (callback) {
                projectCreate("project 2", "owner 2", "description for 2", "1968-07-27", 234000, "http://google.com", "", ["commercial", "shop"], [publicImagePath("www/images/interior.jpg"), publicImagePath("www/images/archi.jpg")], callback);
        },
        function (callback) {
                projectCreate("project 3", "owner 2", "description for 3", "1998-05-27", 234000, "http://google.com", "", ["residential", "bunglow"], [publicImagePath("www/images/partment.jpg"), publicImagePath("www/images/build.jpg")], callback);
        },
        function (callback) {
                projectCreate("project 4", "owner 3", "description for 4", "1999-07-29", 234000, "http://google.com", "", ["residential", "farmhouse"], [publicImagePath("www/images/landscaping.jpg"), publicImagePath("www/images/green.jpg")], callback);
        },
        function (callback) {
                projectCreate("project 5", "owner 4", "description for 5", "1990-07-24", 234000, "http://google.com", "", ["residential", "apartment"], [publicImagePath("www/images/background1.jpg"), publicImagePath("www/images/background2.jpg")], callback);
        }
        ],
        // optional callback
        cb);
}


function createenquiries(cb) {
    async.parallel([
        function (callback) {
                enquiryCreate("name 1", "comment 1", "email 1", true, "phone 1", "2005-05-23", callback)
        },
        function (callback) {
                enquiryCreate("name 2", "comment 2", "email 2", true, "phone 2", "2010-06-04", callback)
        },
        function (callback) {
                enquiryCreate("name 3", "comment 3", "email 3", true, "phone 3", "2009-09-09", callback)
        }
        ],
        // Optional callback
        cb);
}



async.series([
    createProductCategory,
    createProduct,
    createprojects,
    createenquiries
],
    // Optional callback
function (err, results) {
    if (err) {
        console.log('FINAL ERR: ' + err);
    } else {
        console.log('Enquiries: ' + enquiries);

    }
    // All done, disconnect from database
    mongoose.connection.close();
});
