/* eslint-env node */

const fs = require('fs')
const path = require('path')
const mime = require('mime')
const multer = require('multer')
// -----

var Project = require('../models/project')
var imagePaths = require('../helpers/imagePaths')

var PROJECT_UPLOAD_URL = '/uploads/projects'
var PROJECT_UPLOAD_DIR = path.join(__dirname, '..', 'www', 'uploads', 'projects')

function ensureDirectory(dir) {
	fs.mkdirSync(dir, {
		recursive: true
	})
}

function localUploadPathFromUrl(url) {
	if (!url || url.indexOf(PROJECT_UPLOAD_URL + '/') !== 0) {
		return null
	}

	return path.join(PROJECT_UPLOAD_DIR, path.basename(url))
}

function deleteLocalProjectImage(url) {
	var filePath = localUploadPathFromUrl(url)

	if (!filePath) {
		return
	}

	fs.unlink(filePath, function(err) {
		if (err && err.code !== 'ENOENT') {
			console.error(err)
		}
	})
}

var projectImageUpload = multer({
	storage: multer.diskStorage({
		destination: function(req, file, cb) {
			ensureDirectory(PROJECT_UPLOAD_DIR)
			cb(null, PROJECT_UPLOAD_DIR)
		},
		filename: function(req, file, cb) {
			var extension = mime.getExtension(file.mimetype) || path.extname(file.originalname).slice(1) || 'jpg'
			var safeName = path
				.basename(file.originalname, path.extname(file.originalname))
				.replace(/[^a-z0-9_-]/gi, '-')
				.toLowerCase()
			cb(null, Date.now() + '-' + safeName + '.' + extension)
		}
	})
})

function sendDefaultProjectImage(res) {
	res.sendFile(path.join(__dirname, '..', 'www', imagePaths.DEFAULT_PROJECT_IMAGE))
}

// Display list of all Projects.
exports.project_list = function(req, res) {
	Project.find({}).exec(function(err, list_projects) {
		if (err) {
			throw err
		}
		//Successful, so render
		res.render('gallery', {
			projects: list_projects
		})
		//res.send(list_projects);
	})
	//res.send('NOT IMPLEMENTED: Project list');
}

exports.project_edit = function(req, res) {
	// Project.find({})
	//     .exec(function (err, list_projects) {
	//         if (err) {
	//             throw err;
	//         }
	//Successful, so render
	res.render('edit-projects' /* , {
                projects: list_projects
            } */)
	//res.send(list_projects);
	// });
}

exports.project_list_api = function(req, res) {
	Project.find({}).exec(function(err, list_projects) {
		if (err) {
			throw err
		}
		res.send(list_projects)
	})
}

// Display detail page for a specific Project.
exports.project_detail = function(req, res) {
	Project.findById(req.params.id).exec(function(err, project) {
		if (err) {
			throw err
		}
		//Successful, so render
		//console.log(product)
		res.send(project)
		//res.send(list_products);
	})
}

// Handle Project create on POST.
exports.project_create_post = function(req, res) {
	// Create a Book object with escaped and trimmed data.
	var project = new Project(req.body)

	// var storage = multer.diskStorage({
	// 	destination: './uploads',
	// 	filename: function(req, file, cb) {
	// 		cb(null, project._id + '.' + mime.getExtension(file.mimetype))
	// 	}
	// })

	// var upload = multer({
	// 	storage: storage
	// }).any()

	// upload(req, res, function(err) {
	// 	if (err) {
	// 		throw err
	// 		//return res.end('Error uploading file.');
	// 	} else {
	// 		//console.log(req.body);
	// 		//console.log(req.files);

	// 		/* */
	// 		project.name = req.body.project_name
	// 		project.owner = req.body.project_owner
	// 		project.description = req.body.project_description
	// 		project.date = req.body.project_date
	// 		project.cost = req.body.project_cost
	// 		project.url = req.body.project_url
	// 		project.categories = req.body.project_categories

	// 		project.image.data = fs.readFileSync(req.files[0].path)
	// 		project.image.contentType = req.files[0].mimetype
	// 		//console.log(product);

	project.save(function(err) {
		if (err) {
			throw err
		}
		//successful - redirect to new book record.
		// res.redirect('/dashboard/projects')
		res.send(project)
	})
	// fs.unlink(req.files[0].path, function(err) {
	// 	if (err) {
	// 		throw err
	// 	}
	// })
	// //res.end("File has been uploaded");
	// /**/
	// }
	// })

	//res.send('NOT IMPLEMENTED: Project create POST');
}

// Handle Project delete on POST.
exports.project_delete_post = function(req, res) {
	Project.findById(req.params.id, function(err, data) {
		if (err) {
			return res.status(500).send(err)
		}

		if (!data) {
			return res.send(true)
		}

		data.images.forEach(deleteLocalProjectImage)

		Project.findByIdAndRemove(req.params.id, function(err) {
			if (err) return res.status(500).send(err)
			return res.send(true)
		})
	})

	// res.send('NOT IMPLEMENTED: Project delete POST');
}

// Handle Project update on POST.
exports.project_update_post = function(req, res) {
	// Create a Book object with escaped and trimmed data.
	var project = new Project(req.body)

	Project.findByIdAndUpdate(req.params.id, project, {}, function(err) {
		if (err) {
			throw err
		}
		//successful - redirect to new book record.
		// res.redirect('/dashboard/projects')
		res.send(project)
	})

	// var storage = multer.diskStorage({
	//     destination: './www/catalog/project',
	//     filename: function (req, file, cb) {

	//         cb(null, req.params.id + '.' + mime.getExtension(file.mimetype));
	//     }
	// });

	// var upload = multer({
	//     storage: storage
	// }).any();

	// upload(req, res, function (err) {
	//     if (err) {
	//         throw err;
	//         //return res.end('Error uploading file.');
	//     } else {
	//         //console.log(req.body);
	//         //console.log(req.files);

	//         project.name = req.body.project_name;
	//         project.owner = req.body.project_owner;
	//         project.description = req.body.project_description;
	//         project.date = req.body.project_date;
	//         project.cost = req.body.project_cost;
	//         project.url = req.body.project_url;
	//         project._id = req.params.id;
	//         project.categories = req.body.project_categories;
	//         project.imagetype = mime.getExtension(req.files[0].mimetype);
	//         //console.log(product);

	//         Project.findByIdAndUpdate(req.params.id, project, {}, function (err) {
	//             if (err) {
	//                 throw err;
	//             }
	//             //successful - redirect to new book record.
	//             res.redirect('/dashboard/projects');
	//         });

	//         //res.end("File has been uploaded");
	//     }
	// });

	//res.send('NOT IMPLEMENTED: Project update POST');
}

// Display detail image for a specific Enquiry.
exports.project_image_get = function(req, res) {
	Project.findById(req.params.id).exec(function(err, project) {
		if (err) {
			throw err
		}

		if (!project) {
			return sendDefaultProjectImage(res)
		}

		var image = imagePaths.projectImage(project)

		if (image === imagePaths.DEFAULT_PROJECT_IMAGE) {
			return sendDefaultProjectImage(res)
		}

		res.redirect(image)

		//res.send(list_products);
	})
	// res.send('NOT IMPLEMENTED: Enquiry detail: ' + req.params.id);
}

exports.project_image_upload_post = function(req, res) {
	projectImageUpload.single('project_image')(req, res, function(err) {
		if (err) {
			return res.status(500).send(err)
		}

		if (!req.file) {
			return res.status(400).send({
				error: 'No image selected'
			})
		}

		res.send({
			url: PROJECT_UPLOAD_URL + '/' + req.file.filename
		})
	})
}

exports.project_image_delete_get = (req, res) => {
	const filenameToRemove = req.query.fileName

	if (!filenameToRemove) {
		return res.send(true)
	}

	deleteLocalProjectImage(PROJECT_UPLOAD_URL + '/' + filenameToRemove)
	res.send(true)
}

exports.deleteLocalProjectImages = function(images) {
	if (!Array.isArray(images)) {
		return
	}

	images.forEach(deleteLocalProjectImage)
}
