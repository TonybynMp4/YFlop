const app = require('./app');
app
.set('port', process.env.PORT ?? 3000)
.set('host', process.env.HOST);

// good ol' Node.js way
const port = app.get('port');
app.listen(port, () => {
    console.log(`Server listening on ${app.get('host')} ${port}`);
});