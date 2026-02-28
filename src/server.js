import express from 'express';
import matchRoute from "./routes/matches.js";
import http from 'http';
import {attachWebsocketServer} from "./ws/server.js";
import {securityMiddleware} from "./arcjet.js";


const PORT = Number(process.env.PORT) || 8080
const HOST = process.env.HOST || '0.0.0.0';

const app = express()
const server = http.createServer(app)

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(securityMiddleware())

// routes
app.use('/matches', matchRoute);

const {broadcastMatchCreated} = attachWebsocketServer(server)

app.locals.broadcastMatchCreated = broadcastMatchCreated;


// root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the server!'
    })
})


server.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

    console.log(`Server is running at ${baseUrl}`);
    console.log(`Websocket server is running on ${baseUrl.replace('http', 'ws')}/ws`);
})

export default app;

