const express = require("express");
const { BlobServiceClient, Storage } = require("@azure/storage-blob");
// const BlobGetPropertiesHeaders = require("@azure/storage-blob");

const app = express();

//
// Throws an error if the any required environment variables are missing.
//

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

// Quick start code goes here
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error("Azure Storage Connection string not found");
}

//
// Extracts environment variables to globals for convenience.
//


//
// Registers a HTTP GET route to retrieve videos from storage.
//
app.get("/video", async (req, res) => {
  try {
    // Create the BlobServiceClient object which will be used to create a container client
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    const containerName = 'videos';
    const blobName = req.query.path;

    console.log(req.headers.range);

    // Get a reference to a container

    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    
    
    console.log('\nDownloaded blob content...');

    const props = await blockBlobClient.getProperties();
    
    const range = req.headers.range;
    console.log(range);
    if (range) {
      let [start, end] = range.replace(/bytes=/, '').split('-');
      start = parseInt(start, 10);
      end = end ? parseInt(end, 10) : props.contentLength - 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${props.contentLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': (end - start) + 1,
        'Content-Type': 'video/mp4'
      });
      const downloadBlockBlobResponse = await blockBlobClient.download(start);

      downloadBlockBlobResponse.readableStreamBody.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": props.contentLength,
        "Content-Type": props.contentType,
      });
      const downloadBlockBlobResponse = await blockBlobClient.download(0);

      downloadBlockBlobResponse.readableStreamBody.pipe(res);
    }


  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }

});

//
// Starts the HTTP server.
//
app.listen(PORT, () => {
  console.log(`Microservice online`);
});