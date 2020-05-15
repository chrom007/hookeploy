const { execFileSync } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");

var server = null;
var config_file = path.join(__dirname, "config.json");
var config = [];

function createServer() {
	var port = config.port || 9000;

	if (server) {
		server.close();
	}

	server = http.createServer((req, res) => {
		var date = new Date();
		var data = "";

		console.log("New connection", date);
		
		req.on("data", (chunk) => {
			data += chunk;
		});
	
		req.on("end", () => {
			// console.log("Data: ", data);
			res.end("OK");
			processHook(data);
		});
	});

	server.listen(port, () => {
		console.log(`Hookeploy started as ${port} port`);
	});
}


function processHook(hook) {
	if (hook.length < 50) return console.log("Not github hook");

	var data = typeof hook == "string" ? JSON.parse(hook) : hook;
	var rep_name = data.repository.name;
	var rep_folder = config.reps[rep_name] || null;
	var timeout = config.deploy_timeout || 900000;

	console.log(`\nWebhook for ${rep_name} has started!`);

	if (!rep_folder) return console.log("Not config rep for " + rep_name);

	var deploy_path = path.join(rep_folder, config.default_deploy);
	var deploy_file = fs.readFileSync(deploy_path, {encoding: "utf8", flag: "r"});
	var deploy_config = JSON.parse(deploy_file);

	for(var step of deploy_config) {
		try {
			var step_file = path.join(rep_folder, step);
			var log = execFileSync(step_file, {uid: 0, cwd: rep_folder, encoding: "utf8", timeout});
			console.log(`Step ${step} on ${rep_name} rep has success running`);
			// console.log(`Log for ${rep_name} rep. Step ${step}`);
			// console.log(log);
		}
		catch(e) {
			console.log(`Step ${step} crash on rep ${rep_name}`);
		}
	}
}


function loadReps() {
	try {
		var file = fs.readFileSync(config_file, {encoding: "utf8", flag: "r"});
		config = JSON.parse(file);
	}
	catch(e) {
		config = [];
	}
}


function start() {
	loadReps();
	createServer();

	setTimeout(() => {
		processHook({repository: {name: "hookeploy"}});
	}, 5000);
}

start();