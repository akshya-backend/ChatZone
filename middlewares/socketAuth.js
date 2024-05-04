import jwt from 'jsonwebtoken';
import { MapManager } from '../utilis/mapManager.js';

export async function authenticateSocket(socket, next) {
  
  const token = socket.handshake.query.token;

  jwt.verify(token, process.env.JwtsecretKey4user, (err, decoded) => {
    if (err) {
      socket.emit('error', { message: 'Authentication failed' });
      socket.disconnect(true);
    } else {
     MapManager.set(decoded,socket.id)
      socket.userId = decoded
      next();
    }
  });
}