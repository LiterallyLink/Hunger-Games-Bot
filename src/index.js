const HungerGamesClient = require('./Structures/HungerGamesClient');
const config = require('../config.json');

const client = new HungerGamesClient(config);

client.start();
