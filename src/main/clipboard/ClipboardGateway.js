const { clipboard } = require('electron');

class ClipboardGateway {
    read() {
        return clipboard.readText();
    }

    write(text) {
        clipboard.writeText(String(text || ''));
    }
}

module.exports = { ClipboardGateway };