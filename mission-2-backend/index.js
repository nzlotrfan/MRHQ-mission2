// Backend yo

const AWS = require("aws-sdk");
const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const PORT = 8000;
require("dotenv").config();

const awsKeyId = process.env.awsKeyId;
const awsAccessKey = process.env.awsAccessKey;
const awsArn = process.env.awsArn;

// AWS Access Details
AWS.config.update({
  accessKeyId: awsKeyId, // REVIEW needs to be a string.. need to check if it's working or not
  secretAccessKey: awsAccessKey, // REVIEW needs to be a string.. need to check if it's working or not
  region: "ap-southeast-2",
});

//  Call AWS Rekognition Class
const rekognition = new AWS.Rekognition();
let awsOutput;

const setOutput = (awsData) => {
  awsOutput = awsData;
  // console.log(awsOutput);
};

function searchByImage(image) {
  //  Input params
  const params = {
    Image: {
      Bytes: image.data.buffer,
    },
    MinConfidence: 60,
    MaxResults: 4,
    ProjectVersionArn: awsArn,
  };

  // Detect Custom labels
  rekognition.detectCustomLabels(params, function (err, data) {
    if (err) console.log(err, err.stack);
    // an error occurred
    else console.log(data); // successful response
    setOutput(data);
  });
}

let testJson = {
  CustomLabels: [{ Name: "Hatchback", Confidence: 76.83599853515625 }],
};
// console.log(testJson);

// START Express File Upload
app.use(fileUpload());
app.post("/upload", function (req, res) {
  let userImage;
  // let uploadPath;
  console.log("file is uploading yo");
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  // The name of the input field (i.e. "userImage") is used to retrieve the uploaded file
  userImage = req.files.userImage;
  // console.log(userImage);
  // const b64 = userImage.toString("base64");
  // const mimeType = "image/jpeg"; // e.g., image/jpeg
  // res.send(`<img src="data:${mimeType};base64,${b64}" />`);

  res.send(JSON.awsOutput);
  // console.log(awsres);
  searchByImage(userImage);

  // uploadPath = __dirname + "/HELLO/" + userImage.name;
  // // Use the mv() method to place the file somewhere on your server
  // userImage.mv(uploadPath, function (err) {
  //   if (err) return res.status(500).send(err);
  //   res.send("File uploaded!");
  // });
});

// END Express stuff

// The backend can now be queried at localhost:8000
app.listen(PORT, function () {
  console.log("Express server listening on port ", PORT);
});
