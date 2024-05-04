import express from 'express';
import dotenv from 'dotenv/config';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { Server as SocketIO } from "socket.io";
import  siofu from "socketio-file-upload"
import http from "http";
import connectDB from './config/MongoDB_Connection.js'; // MongoDB connection
import UserRoute from './routes/UserRoute.js';
import AuthRoute from './routes/AuthRoute.js';
import chatRoute from './routes/chatRoute.js';
import { RootPage } from './controller/Auth-Controller.js';
import { authenticateSocket } from './middlewares/socketAuth.js';
import { handleSocketConnections } from './config/serverSocket.js';

// Store messages
const app = express();
app.use(siofu.router)
app.use(cookieParser());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.set('views', 'views');
app.set('view engine', 'ejs');

await connectDB(); // MongoDB connection


app.use("/api/Chat-Zone/User", UserRoute);
app.use("/api/Chat-Zone/security", AuthRoute);
app.use("/api/Chat-Zone/chat", chatRoute);
app.get("/",RootPage)
const server = http.createServer(app);
const io = new SocketIO(server);
 io.use(authenticateSocket);
 await handleSocketConnections(io);

const PORT = process.env.PORT || 2000;
server.listen(PORT, () => {
  console.log(`⚙️ Server is running at port: ${PORT}`);
});
