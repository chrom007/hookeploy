const http = require("http");

const server = http.createServer((req, res) => {
	var data = "";
	console.log("New connection");
	
	req.on("data", (chunk) => {
		data += chunk;
	});

	req.on("end", () => {
		console.log("Data: ", data);
		res.end("OK");
	});
});

server.listen(9000, () => {
	console.log("Hookeploy started as 9000 port");
});