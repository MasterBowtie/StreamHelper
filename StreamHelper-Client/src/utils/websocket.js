export default class WebSocketClient {

    #socket = null;
    #listeners = new Map();
    #shouldReconnect = true;
    #reconnectAttempts = 0
    #reconnectTimer = null;

    constructor(url) {
        this.url = url;
    }

    connect() {
        this.#shouldReconnect = true;
        if (this.#socket) {
            return;
        }

        this.#socket = new WebSocket(this.url);

        this.#socket.onopen = () => {
            console.log("Websocket connected.");
            this.#reconnectAttempts = 0;
        };

        this.#socket.onclose = () => {
            console.log("WebSocket disconnected.");
            this.#socket = null;
            if (this.#shouldReconnect) {
                this.#scheduleReconnect();
            }
        };

        this.#socket.onerror = (error) => {
            console.error(error);
        };

        this.#socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.#dispatch(message);
        };
    }

    disconnect() {
        this.#shouldReconnect = false;
        clearTimeout(this.#reconnectTimer);
        
        if (!this.#socket) {
            return;
        }


        this.#socket.close();
    }

    on(type, callback) {
        if (typeof callback !== "function") {
            console.error("Invalid callback:", type, callback);
            return;
        }

        if (!this.#listeners.has(type)) {
            this.#listeners.set(type, new Set());
        }


        this.#listeners.get(type).add(callback);

        return () => this.off(type, callback);
    }

    off(type, callback) {
        const listeners = this.#listeners.get(type);

        if (!listeners) {
            return;
        }

        listeners.delete(callback);

        if (listeners.size === 0) {
            this.#listeners.delete(type);
        }
    }

    #dispatch(message) {
        const listeners = this.#listeners.get(message.type);

        if (listeners) {
            listeners.forEach(callback => callback(message));
        }

        const wildcard = this.#listeners.get("*");
        if (wildcard) {
            wildcard.forEach(callback => callback(message));
        }
    }

    #scheduleReconnect() {
        clearTimeout(this.#reconnectTimer);

        const delay = Math.min(
            1000 * (1 << this.#reconnectAttempts),
            30000
        );

        this.#reconnectTimer = setTimeout(()=> {
            this.connect();
            console.log(`Reconnecting in ${delay/1000}sec...`,);
        }, delay);

        this.#reconnectAttempts++;
    }
}