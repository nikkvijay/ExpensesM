const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  fs.readdir(`./hissab`, (err, files) => {
    res.render("index", { files });
  });
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.post("/createHisab", (req, res) => {
  const currentDate = new Date();

  var fDatename = `${currentDate.getDate()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getFullYear()}`;
  const fname = req.body.title ? `${req.body.title}_${fDatename}` : fDatename;
  let data = req.body.Chisaab;
  fs.stat(`./hissab/${fname}.txt`, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        fs.writeFile(`./hissab/${fname}.txt`, data, (error) => {
          if (error) return res.send(error);
          else res.redirect("/");
        });
      } else {
        res.send(err);
      }
    } else {
      res.redirect("/");
    }
  });
});

app.get("/delete/:filename", (req, res) => {
  const filename = req.params.filename;

  fs.unlink(`./hissab/${filename}`, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("File not found or could not be read.");
    }
    res.redirect("/");
  });
});

app.get("/hissab/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "hissab", filename); // Use path.join for reliable path resolution

  //   console.log("File path:", filePath); // For debugging, log the file path

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      //   console.error("Error reading file:", err); // Log the error details
      return res.status(500).send("File not found or could not be read.");
    }
    res.render("hissab", { data: data, fileName: filename });
  });
});

app.get("/edit/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "hissab", filename); // Use path.join for reliable path resolution

  //   console.log("File path:", filePath); // Log the path for debugging

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      //   console.error("Error reading file:", err); // Log the error details
      return res.status(500).send("Error reading file.");
    }
    res.render("edit", { data: data, fileName: filename });
  });
});

app.post("/edit/:filename", (req, res) => {
  const oldFilename = req.params.filename;
  const newFileName = req.body.newFileName; // Get the new file name from the form
  const newData = req.body.fileData; // Get the updated content from the textarea

  // Construct the old and new file paths
  const oldFilePath = path.join(__dirname, "hissab", oldFilename);
  const newFilePath = path.join(__dirname, "hissab", newFileName);

  // First, update the file content
  fs.writeFile(oldFilePath, newData, (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return res.status(500).send("Error writing file.");
    }

    // Then, rename the file if the file name has changed
    if (oldFilename !== newFileName) {
      fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
          console.error("Error renaming file:", err);
          return res.status(500).send("Error renaming file.");
        }
        res.redirect("/"); // Redirect to the updated file
      });
    } else {
      res.redirect("/"); // No renaming needed
    }
  });
});

app.listen(3001);
