const jwt = require("jsonwebtoken");
const signToken = (id, expiresIn) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn });
};
exports.createSendToken = (data, statusCode, expiresIn, res) => {
  //console.log("created Token:", user.unevirsityId);
  const token = signToken(data.id, expiresIn);
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  // res.cookie("jwt", token, cookieOptions);
  //localStorage.setItem("jwt", token);
  // Remove password from output
  data.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data,
  });
};
