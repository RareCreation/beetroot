const { clipboard } = require('electron');

function read() {
    return clipboard.readText();
}

function write(text) {
    clipboard.writeText(String(text || ''));
}

module.exports = { read, write };