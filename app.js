const { my_express, static } = require('./module/my_express');

const app = my_express();

// Middleware Functions
const logger1 = (req, res, next) => {
    console.log('This is first logger middleware!');
    next();
}

const logger2 = (req, res, next) => {
    console.log('This is second logger middleware!');
    next();
}

app.use("/contact", logger1);
app.use("/about", logger2);
app.use(static(__dirname + "/public"));

// Routing

app.get('/', (req, res) => {
    res.sendFile('./public/index.html');
});

app.get('/about', (req, res) => {
    res.sendFile('./public/about.html');
});

app.get('/contact', (req, res) => {
    res.sendFile('./public/contact.html');
});

// Starting a server
app.listen(3000, (err) => {
    if (err) throw err;
    console.log('The server is running on port 3000....');
});

