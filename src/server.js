import express from 'express';
import matchRoute from "./routes/matches.js";

const app = express()
const PORT = 8080

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/matches', matchRoute);


// root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the server!'
    })
})


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})

