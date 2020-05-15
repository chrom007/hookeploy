const http = require("http");

const server = http.createServer((req, res) => {
	console.log("New connection");
	console.log(req);
	res.end("OK");
});

server.listen(9000, () => {
	console.log("Hookeploy started as 9000 port");
});