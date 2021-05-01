const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const xlsxFile = require("read-excel-file/node");
const StaticData = require("./models/staticData");
const fs = require("fs");

// create express app
const app = express();

// connect to mongodb & listen for requests
const dbURI =
  "mongodb+srv://project318:project318@318project.uu8vs.gcp.mongodb.net/project?retryWrites=true&w=majority";

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => app.listen(3000))
  .catch((err) => app.listen(3000));

var excelData = [];

// register view engine
app.set("view engine", "ejs");

// middleware & static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

// default options
app.use(fileUpload());

// Exception Handling: error handler middleware, handle the status when loading the page
app.use((error, req, res, next) => {
  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    },
  });
});

// routes
app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

// dynamic routes
app.get("/map", (req, res) => {
  if (excelData.length == 0) {
    res.render("dataVisual", { title: "Data" });
  } else {
    res.render("dataVisual", { title: "Hospital Location" });
  }
});

app.get("/chart", (req, res) => {
  if (excelData.length == 0) {
    res.render("chart", { staticdatas: excelData, title: "Data" });
  } else {
    res.render("chart", {
      staticdatas: excelData,
      title: "Data Visualization",
    });
  }
});

app.get("/hInfo", (req, res) => {
  if (excelData.length == 0) {
    res.render("hInfo", { staticdatas: excelData, title: "Hospital Info" });
  } else {
    res.render("hInfo", { staticdatas: excelData, title: "Hospital Info" });
  }
});

// index
app.get("/", (req, res) => {
  if (excelData.length == 0) {
    res.render("index", { staticdatas: excelData, title: "Home" });
  } else {
    res.render("index", { staticdatas: excelData, title: "Show Data" });
  }
});

app.post("/", (req, res) => {

  var data_set = req.files.data_set;
  var direc = "./public/" + req.files.data_set.name;


  if (!fs.existsSync(direc)) {
    // Use the mv() method to save the file in public folder and proceed
    // Exception Handling: error handler when copying the file to the public folder, if error occurs we show the error message
    data_set.mv(direc, function (err) {
      if (err) return res.status(500).send(err);
    });
  }


  // read excel file and proceed
  function readTheExcelFile() {
    xlsxFile(direc).then((rows) => {
      for (i in rows) {
        excelData[i] = [];
        for (j in rows[i]) {
          excelData[i][j] = rows[i][j];
        }
      }
    });
  }

  setTimeout(readTheExcelFile, 1000);


  function running() {
    res.render("index", { staticdatas: excelData, title: "Show Data" });
  }

  // Exception Handling: try-catch handle the error when perform a function with setTimeout method call
  setTimeout(function () {
    try {
      running();
    } catch {
      alert("Error is caught. Please try re-run website again!");
    }
  }, 1500);
});


// 404 page
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});