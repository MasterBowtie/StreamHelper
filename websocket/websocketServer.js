import { WebSocketServer } from "ws";

export function buildWebsocketServer() {
    let wss = null;
    const clients = new Set();

    function start(server) {
        wss = new WebSocketServer({
            server
        });

        wss.on("connection", (socket) =>{
            console.log("Websocket client connected");

            clients.add(socket);

            socket.on("close", ()=>{
                console.log("WebSocket client disconnected");

                clients.delete(socket);
            });

            socket.on("error", (error)=>{
                console.error("Websocket error:", error);

                clients.delete(socket);
            });
        });
    }

    function broadcast(message) {
        const data = JSON.stringify(message);

        for (const client of clients) {
            if (client.readyState === client.OPEN) {
                client.send(data);
            }
        }
    }

    function stop() {
        for (const client of clients) {
            client.close()
        }

        clients.clear();

        if (wss) {
            wss.close();
            wss = null;
        }
    }

    return {
        start,
        broadcast,
        stop
    }
}