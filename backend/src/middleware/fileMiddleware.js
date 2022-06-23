// ./src/middleware/fileMiddleware.js
const fs = require("fs");
const UPLOADS = "./uploads";
const formidable = require("formidable");

const fileMiddleware = (req, res, next) => {
  // create folder if not exist
  if (!fs.existsSync(UPLOADS)) {
    // create folder
    fs.mkdirSync(UPLOADS);
  }
  // create form
  const form = new formidable.IncomingForm({
    uploadDir: UPLOADS,
    keepExtensions: true,
  });
  // parse form
  form.parse(req, (err, fields, files) => {
    // check error
    if (err) {
      // return error
      res.status(500).json({ validationErrors: [{ message: err.message }] });
    } else {
      // else add fields to req.body & files to req.files
      req.body = fields;
      req.files = files;
      next();
    }
  });
};

module.exports = fileMiddleware;
