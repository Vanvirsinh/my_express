const http = require('http');
const URL = require('url');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

const my_express = () => {

    const app = {};

    const middlewareStack = [];

    const get = {
        handler: [],
        path: []
    }

    // our app.use() function

    app.use = (path, middleware) => {

        if (typeof path === 'function') {
            middleware = path;
            path = undefined;
        }
        middlewareStack.push({ path, middleware });
    }


    // app.get() function

    app.get = (path, handler) => {

        get.handler.push(handler);

        if (path.includes('/:')) {
            let splittedUrl = path.split(':');
            let urlPath = splittedUrl[0];
            urlPath = urlPath.substring(0, urlPath.length - 1);

            get.path.push(urlPath);
        } else {
            get.path.push(path);
        }
    }


    // The Middleware Handler
    function handleMiddleware(req, res, index) {

        if (index === middlewareStack.length) {
            manageRequestHandler(req, res);
            return;
        } else {

            if (middlewareStack[index].path) {

                if (middlewareStack[index].path === req.url) {
                    const middlewareFunction = middlewareStack[index].middleware;
                    middlewareFunction(req, res, () => {
                        handleMiddleware(req, res, index + 1);
                    });
                } else {
                    handleMiddleware(req, res, index + 1);
                }

            } else {
                const middlewareFunction = middlewareStack[index].middleware;
                middlewareFunction(req, res, () => {
                    handleMiddleware(req, res, index + 1);
                });
            }

        }
    }


    // The Request Handler

    function manageRequestHandler(req, res) {

        const method = req.method;
        const url = req.url;
        const parsedUrl = URL.parse(url);
        const parsedQuery = querystring.parse(parsedUrl.query);

        req.query = parsedQuery;

        if (method === 'GET' && get.path.includes(parsedUrl.pathname)) {

            const handlerIndex = get.path.indexOf(parsedUrl.pathname);
            get.handler[handlerIndex](req, res);

        } else {
            res.statusCode = 404;
            res.end(`Cannot ${method} ${url}`);
        }
    }


    const requestHandler = (req, res) => {

        // This function will handle all the request
        res.send = (response) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(`<p>${response}</p>`);
            res.end();
        }

        function getContentType(fileName) {
            switch (fileName.split('.').pop()) {
                case 'html':
                    return 'text/html';
                case 'css':
                    return 'text/css';
                case 'js':
                    return 'text/javascript';
                case 'png':
                    return 'image/png';
                case 'jpg':
                    return 'image/jpeg';
                default:
                    return 'application/octet-stream';
            }
        }

        res.sendFile = (pathOfFile) => {

            const contentType = getContentType(pathOfFile);

            fs.readFile(pathOfFile, (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(data);
                }
            });

        }

        res.redirect = (route) => {
            res.writeHead(301, { 'Location': route });
            res.end();
        }

        handleMiddleware(req, res, 0);
    }


    // our app.listen() method

    app.listen = (port, callback) => {
        const server = http.createServer(requestHandler);
        server.listen(port, (err) => {
            callback(err);
        });
    }

    return app;
}

// This will server static files

const static = (directoryPath) => {
    return function (req, res, next) {
        const filePath = path.join(directoryPath, req.url);
        const fileStream = fs.createReadStream(filePath);

        fileStream.on('error', () => {
            next();
        });

        fileStream.pipe(res);
    };
}


module.exports = { my_express, static };
