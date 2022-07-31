const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const findOrCreate = require("mongoose-findorcreate");

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: (value) => {
      if (!validator.isEmail(value)) {
        throw new Error({ error: `${value} is not a valid email` });
      }
    },
  },
  password: {
    type: String,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
  },
});
UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return null;
  }
  return user;
};
UserSchema.plugin(findOrCreate);
module.exports = mongoose.model("User", UserSchema);
