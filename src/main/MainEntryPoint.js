const { ApplicationBootstrap } = require('./bootstrap/ApplicationBootstrap');

const bootstrap = new ApplicationBootstrap({ logger: console });
bootstrap.run();