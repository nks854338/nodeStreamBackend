const express = require('express');
const fs = require('fs');
const app = express();
const cors = require('cors');
const path = require('path');
const port = 5000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to the Video Streaming Service");
});

app.get("/video/:videoName", (req, res) => {
  const videoPath = path.join(__dirname, 'videos', `${req.params.videoName}.mp4`);

  fs.stat(videoPath, (err, stat) => {
    if (err || !stat) {
      return res.status(404).send("File not found");
    }

    const fileSize = stat.size;
    const range = req.headers.range;
    if (!range) {
      const headers = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(200, headers);
      fs.createReadStream(videoPath).pipe(res);
      return;
    }

    const chunkSize = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, fileSize - 1);

    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const fileStream = fs.createReadStream(videoPath, { start, end });
    fileStream.pipe(res);
  });
});

app.listen(port, () => {
  console.log(`Video Streaming Server is running at http://localhost:${port}`);
});
