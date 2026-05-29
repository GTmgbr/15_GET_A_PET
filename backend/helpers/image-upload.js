const multer = require("multer")
const path = require("path")

// =====================
// STORAGE - USERS
// =====================
const imageStoreUsers = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/images/users"))
    },
    filename: function (req, file, cb) {
        cb(
            null,
            Date.now() +
            "-" +
            Math.floor(Math.random() * 1000) +
            path.extname(file.originalname)
        )
    },
})

// =====================
// STORAGE - PETS
// =====================
const imageStorePets = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/images/pets"))
    },
    filename: function (req, file, cb) {
        cb(
            null,
            Date.now() +
            "-" +
            Math.floor(Math.random() * 1000) +
            path.extname(file.originalname)
        )
    },
})

// =====================
// UPLOAD - USERS
// =====================
const imageUpload = multer({
    storage: imageStoreUsers,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/i)) {
            return cb(new Error("Por favor, envie apenas jpg, jpeg ou png!"))
        }
        cb(null, true)
    },
})

// =====================
// UPLOAD - PETS
// =====================
const imageUploadPets = multer({
    storage: imageStorePets,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/i)) {
            return cb(new Error("Por favor, envie apenas jpg, jpeg ou png!"))
        }
        cb(null, true)
    },
})

module.exports = { imageUpload, imageUploadPets }