import {WebSocketServer, WebSocket} from 'ws'


function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) {
        return;
    }

    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
    // iterate over all the connected client
    for (const client of wss.clients) {
        // check maybe connection is open
        if (client.readyState !== WebSocket.OPEN) continue;

        client.send(JSON.stringify(payload));
    }
}

export function attachWebsocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024
    })

    wss.on('connection', (socket) => {

        socket.isAlive = true;

        socket.on('pong', () => {socket.isAlive = true;});

        sendJson(socket, {type: 'welcome'})

        socket.on('error', (err) => {
            console.error(err.message);
        })
    })


    const interval = setInterval(() => {
        wss.clients.forEach((client) => {
            // check if client is no more active and disconnect client when they are no more active
            if (client.isAlive === false) return client.close();

            // sent client active status to false
            client.isAlive = false;

            client.ping()
        })
    }, 30000)

    wss.on('close', () => clearInterval(interval))

    function broadcastMatchCreated(match) {
        broadcast(wss, {type: 'match_created', data: match})
    }

    return { broadcastMatchCreated }
}