const http = require("http");
const express = require("express");
const path = require('path');

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);

server.listen(port);
server.on('listening', () => {
    console.log(`Server running on ${host}:${port}`);
});

app.use( express.static( path.join(__dirname, 'public') ) );
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

