# Hookeploy

Tool for deploy your project on you VPS server via Github Webhooks

## How to work:

1. Configurate your `config.json`
2. Run `npm run start` as background process (Example: on `pm2`)
3. Add your hook names and pathes to `config.reps`
4. Add `webhook` on Github with link on your server / domain
5. Add `deploy.json` to your rep folder.
6. Add `steps` in `deploy.json`
7. Profit!

## Default config:

```json
{
	"port": 9000,
	"default_deploy": "deploy.json",
	"deploy_timeout": 900000,
	"reps": {
		"hookeploy": "/var/www/hookeploy",
		"helloworld": "/var/www/helloworld"
	}
}
```

### Props: 

 * `port` - webhook listener port
 * `default_deploy` - default name of deploy config on your reps
 * `deploy_timeout` - max time for deploy (default 15 min)
 * `reps` - array with `hookname` and `path` to rep

## Example for deploy.json

```json
[
	"bin/stop.sh",
	"bin/start.sh"
]
```

This is json array.

These are steps to `.sh` files.

They will be executed in turn and `synchronously`.

## Todo: 

- Add linux service