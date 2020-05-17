const { execFileSync, execSync } = require("child_process");
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
		var data = "";
		
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
		console.log(`\n${getDate()} | Hookeploy started as ${port} port`);
	});
}


function processHook(hook) {
	if (hook.length < 50) {
		return console.log(`${getDate()} | Not github hook`);
	}

	var data = typeof hook == "string" ? JSON.parse(hook) : hook;
	var rep_name = data.repository.name;
	var rep_folder = config.reps[rep_name] || null;
	var timeout = config.deploy_timeout || 900000;

	console.log(`\n${getDate()} | Webhook for "${rep_name}" has started!`);

	if (!rep_folder) {
		return console.log(`${getDate()} | Not config rep for "${rep_name}"`);
	}

	try {
		console.log(`${getDate()} | Git pulling for "${rep_name}"`);
		execSync("git pull", {cwd: rep_folder, uid: 0});
	}
	catch(e) {
		return console.log(`${getDate()} | Git pull error for "${rep_name}"`);
	}

	try {
		var deploy_path = path.join(rep_folder, config.deploy_name);
		var deploy_file = fs.readFileSync(deploy_path, {encoding: "utf8", flag: "r"});
		var deploy_config = JSON.parse(deploy_file);
	}
	catch(e) {
		return console.log(`${getDate()} | Deploy config not found for "${rep_name}" rep`);
	}

	for(var step of deploy_config) {
		try {
			var step_file = path.join(rep_folder, step);
			var log = execFileSync(step_file, {uid: 0, cwd: rep_folder, encoding: "utf8", timeout});
			console.log(`${getDate()} | Step "${step}" on "${rep_name}" rep has success running`);
			// console.log(`Log for "${rep_name}" rep. Step "${step}"`);
			// console.log(log);
		}
		catch(e) {
			return console.log(`${getDate()} | Step "${step}" crash on rep "${rep_name}"`);
		}
	}

	console.log(`${getDate()} | All steps for "${rep_name}" rep completed successfully!`);
}


function loadConfig() {
	try {
		var file = fs.readFileSync(config_file, {encoding: "utf8", flag: "r"});
		config = JSON.parse(file);
		console.log(`${getDate()} | Config success loaded`);
	}
	catch(e) {
		config = [];
		console.log(`${getDate()} | Config loading error`);
	}
}

function getDate() {
	return (new Date().toISOString());
}

function watchConfig() {
	fs.watch(config_file, (event, file) => {
		loadConfig();
	});
}


function start() {
	loadConfig();
	createServer();
	watchConfig();

	// setTimeout(() => {
	// 	processHook({repository: {name: "hookeploy"}});
	// }, 5000);
}

start();