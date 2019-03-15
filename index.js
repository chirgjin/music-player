const http = require("http");
const express = require("express");
const path = require('path');
const request = require('request');

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
app.use('*', (req,res,next) => {

    res.error = (obj) => res.json({ status : 'error', data : obj});
    res.success = (obj) => res.json({ status : 'success', data : obj});

    next();
});

app.post('/api/search', (req,res) => {

    request('https://www.downloadanysong.com/api/website/v1/', {
        headers : {
            'Search-String' : req.body.query
        }
    }, (err, resp, body) => {

        if(err) {
            return res.error(err);
        }

        try {
            res.success(typeof body == 'object' ? body : JSON.parse(body));
        }
        catch (e) {
            res.error(e);
        }
    });
});

app.post('/api/download', (req,res) => {

    request.put('https://www.downloadanysong.com/api/website/v1/', {
        json : {
            audio_quality : '320',
            video_id : req.body.videoId
        }
    }, (err, resp, body) => {
        if(err) {
            console.log(err);
            return res.error(err);
        }

        try {
            const data = typeof body == 'object' ? body : JSON.parse(body);
            // if(data && data.download_link) {
            //     data.download_link = "/play?url=" + encodeURIComponent(data.download_link);
            // }
            res.success(data);
        }
        catch (e) {
            console.error(e);
            res.error(e);
        }
    })
});

app.get("/play", (req,res) => {

    request.get(req.query.url).pipe(res);

})