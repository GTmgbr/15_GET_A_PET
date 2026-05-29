const mongoose = require("mongoose")

const Pet = mongoose.model("Pet", {
  name: String,
  age: String,
  weight: String,
  color: String,
  images: Array,
  available: Boolean,
  user: Object,
  adopter: Object
})

module.exports = Pet