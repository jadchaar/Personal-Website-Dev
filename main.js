process.title = 'dev-server';

const liveServer = require('live-server');

const params = {
  ignore: 'assets/sass,assets/js,node_modules,build', // comma-separated string for paths to ignore
  wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
  logLevel: 0 // 0 = errors only, 1 = some, 2 = lots
};

liveServer.start(params);
