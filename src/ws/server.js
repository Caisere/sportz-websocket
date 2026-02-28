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
        sendJson(socket, {type: 'welcome'})

        socket.on('error', (err) => {
            console.error(err.message);
        })
    })

    function broadcastMatchCreated(match) {
        broadcast(wss, {type: 'match_created', data: match})
    }

    return { broadcastMatchCreated }
}