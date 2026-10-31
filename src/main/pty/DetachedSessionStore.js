class DetachedSessionStore {
    constructor() {
        this._sessions = new Map();
    }

    set(id, session) {
        this._sessions.set(id, session);
    }

    get(id) {
        return this._sessions.get(id) || null;
    }

    has(id) {
        return this._sessions.has(id);
    }

    delete(id) {
        this._sessions.delete(id);
    }

    entries() {
        return Array.from(this._sessions.entries());
    }

    list() {
        return Array.from(this._sessions.entries()).map(([id, session]) => ({
            id,
            title: session.title
        }));
    }

    size() {
        return this._sessions.size;
    }

    clear() {
        this._sessions.clear();
    }
}

module.exports = { DetachedSessionStore };