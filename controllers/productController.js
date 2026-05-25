/* eslint-env node */




var fs = require('fs');
var path = require('path');
var mime = require('mime');
var multer = require('multer');


// -----






var Product = require('../models/product');
var imagePaths = require('../helpers/imagePaths');

var PRODUCT_UPLOAD_URL = '/uploads/products';
var PRODUCT_UPLOAD_DIR = path.join(__dirname, '..', 'www', 'uploads', 'products');

function ensureDirectory(dir) {
    fs.mkdirSync(dir, {
        recursive: true
    });
}

function localUploadPathFromUrl(url) {
    if (!url || url.indexOf(PRODUCT_UPLOAD_URL + '/') !== 0) {
        return null;
    }

    return path.join(PRODUCT_UPLOAD_DIR, path.basename(url));
}

function deleteLocalProductImage(url) {
    var filePath = localUploadPathFromUrl(url);

    if (!filePath) {
        return;
    }

    fs.unlink(filePath, function (err) {
        if (err && err.code !== 'ENOENT') {
            console.error(err);
        }
    });
}

function productUploadStorage(filenameFromRequest) {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            ensureDirectory(PRODUCT_UPLOAD_DIR);
            cb(null, PRODUCT_UPLOAD_DIR);
        },
        filename: function (req, file, cb) {
            cb(null, filenameFromRequest(req, file));
        }
    });
}

function productUpload(filenameFromRequest) {
    return multer({
        storage: productUploadStorage(filenameFromRequest)
    }).any();
}

function sendDefaultProductImage(res) {
    res.sendFile(path.join(__dirname, '..', 'www', imagePaths.DEFAULT_PRODUCT_IMAGE));
}

// Display list of all Products.
exports.product_list = function (req, res) {
    Product.find({})
        //.populate('categories')
        .exec(function (err, list_products) {
            if (err) {
                throw err;
            }
            //Successful, so render
            res.render('shop', {
                products: list_products
            });
            //res.send(list_products);
        });
};

exports.product_edit = function (req, res) {
    Product.find({})
        //.populate('categories')
        .exec(function (err, list_products) {
            if (err) {
                throw err;
            }
            //Successful, so render
            res.render('edit-products', {
                products: list_products
            });
            //res.send(list_products);
        });
};

// Display detail page for a specific Product.
exports.product_detail = function (req, res) {
    Product.findById(req.params.id)
        //.populate('categories')
        .exec(function (err, product) {
            if (err) {
                throw err;
            }
            //Successful, so render
            //console.log(product)
            res.send(product);
            //res.send(list_products);
        });
    //res.send('NOT IMPLEMENTED: Product detail: ' + String(req.params.id));
};


// Handle Product create on POST.
exports.product_create_post = function (req, res) {
    // Create a Book object with escaped and trimmed data.
    var product = new Product({});


    productUpload(function (req, file) {
        return product._id + '-' + Date.now() + '.' + mime.getExtension(file.mimetype);
    })(req, res, function (err) {
        if (err) {
            throw err;
            //return res.end('Error uploading file.');
        } else {
            //console.log(req.body);
            //console.log(req.files);


            product.name = req.body.product_name;
            product.description = req.body.product_description;
            product.cost = req.body.product_cost;

            if (req.files && req.files[0]) {
                product.imagePath = PRODUCT_UPLOAD_URL + '/' + req.files[0].filename;
            }
            //console.log(product);

            product.save(function (err) {
                if (err) {
                    throw err;
                }
                //successful - redirect to new book record.
                res.redirect('/dashboard/products');
            });

            //res.end("File has been uploaded");
        }
    });

    /*

    */

    //console.log(req.body);
    //res.send('request recieved for product' + product.name);
};


// Handle Product delete on POST.
exports.product_delete_post = function (req, res) {
    Product.findByIdAndRemove(req.params.id, function (err, product) {
        if (err) {
            throw err;
        }
        if (product) {
            deleteLocalProductImage(product.imagePath);
        }
        // Success - go to author list
        res.redirect('/dashboard/products');
    });

    //es.send('NOT IMPLEMENTED: Product delete POST');
};


// Handle Product update on POST.
exports.product_update_post = function (req, res) {
    productUpload(function (req, file) {
        return req.params.id + '-' + Date.now() + '.' + mime.getExtension(file.mimetype);
    })(req, res, function (err) {
        if (err) {
            throw err;
        } else {

            var product = {
                name: req.body.product_name,
                description: req.body.product_description,
                cost: req.body.product_cost
            };

            if (req.files && req.files[0]) {
                product.imagePath = PRODUCT_UPLOAD_URL + '/' + req.files[0].filename;
            }


            Product.findById(req.params.id, function (err, oldProduct) {
                if (err) {
                    throw err;
                }

                Product.findByIdAndUpdate(req.params.id, product, {}, function (err) {
                    if (err) {
                        throw err;
                    }

                    if (oldProduct && product.imagePath && oldProduct.imagePath !== product.imagePath) {
                        deleteLocalProductImage(oldProduct.imagePath);
                    }

                    //successful - redirect to new book record.
                    res.redirect('/dashboard/products');
                });
            });
        }
    });

};




// Display detail image for a specific Enquiry.
exports.product_image_get = function (req, res) {
    Product.findById(req.params.id)
        .exec(function (err, product) {
            if (err) {
                throw err;
            }

            if (!product) {
                return sendDefaultProductImage(res);
            }

            var localImagePath = localUploadPathFromUrl(product.imagePath);
            if (localImagePath && fs.existsSync(localImagePath)) {
                return res.sendFile(localImagePath);
            }

            if (product.image && product.image.data) {
                res.contentType(product.image.contentType || 'image/png');
                return res.send(product.image.data);
            }

            return sendDefaultProductImage(res);

            //res.send(list_products);

        });
    // res.send('NOT IMPLEMENTED: Enquiry detail: ' + req.params.id);
};
