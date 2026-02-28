import {WebSocketServer, WebSocket} from 'ws'
import {wsArcjet} from "../arcjet.js";


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

    wss.on('connection', async (socket, req) => {
        if(wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req);

                if (decision.isDenied()) {
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;
                    const reason = decision.reason.isRateLimit() ? 'Too many attempts' : 'Access denied'

                    socket.close(code, reason)
                    return
                }



            } catch (err) {
                console.error('WS connection error', err);
                socket.close(1011, 'Server security error');
                return;
            }
        }

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