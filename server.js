const app = require("./src/app");

const PORT = process.env.PORT; 

const server = app.listen(PORT || 8001, () => {
  console.log(`Server start in  ${PORT}`);
});


process.on('SIGINT', () => {
    server.close(() => console.log('Exit server express'))
})