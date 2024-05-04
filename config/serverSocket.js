import { handleIncomingMessage, handleUserOnline, handle_sendFile} from "../controller/socket-Controller.js";
import path from 'path';
import  siofu from "socketio-file-upload"
import { MapManager } from "../utilis/mapManager.js";
const UPLOAD_DIR = path.join(process.cwd(), '/public/images/');

 export  async function handleSocketConnections(io) {
    io.on('connection', (socket) => {
      console.log(`${socket.userId}  has connected.`);
      let isOnline=true;
      socket.on("already-In-VideoCall",(id)=>{io.to(MapManager.get(id).emit("User-Already-In-Call"))})
      socket.on("userOnline", () => handleUserOnline(socket,io,isOnline));
      socket.on("Text-message", (data) => handleIncomingMessage(socket, data,io));
      socket.on("call-ended", (data) => {io.to(MapManager.get(data.id)).emit("close-videocall",(data.message)) });
      socket.on("isUser-Online", (data) =>{
        if (MapManager.get(data)) {
          socket.emit("User-status",({data,myid:socket.userId}))
          return;
        } else {
          let  message=" User is not Online at this Moment" 
          socket.emit("blocked-response",message)
          return;
        }
      });
     
      var uploader = new siofu();
      uploader.dir = UPLOAD_DIR; 
      uploader.listen(socket);
      uploader.on('start', (event) => {
      console.log('File upload started',event)
    });

    uploader.on('saved',  async (event) => {
      const extraData = event.file.meta.friendId// Access extra data sent with the file
         
        const path =event.file.pathName;
        const ext=event.file.name
        const type=getFileType(ext)
        handle_sendFile(type,extraData,path,socket,io)
    });

    uploader.on('error', (event) => {
        console.error('Error uploading file:', event.error);
    });

    uploader.on('end', (event) => {
        console.log('File upload completed:');
    });


  //     
      socket.on('disconnect', () => {

        MapManager.delete(socket.userId)
        let isOnline=false;
        handleUserOnline(socket,io,isOnline)
          console.log('A client has disconnected.');
      });
    });
  }





   function getFileType(name) {
    const ext=name.split('.').pop();
    switch (ext) {
      // Images
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
      case 'svg':
        return `image/${name}`;
      // Videos
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'mkv':
      case 'wmv':
      case 'flv':
      case 'webm':
        return `video/${name}`;
      // Audio
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'm4a':
      case 'flac':
      case 'aac':
      case 'wma':
        return `audio/${name}`;
      // Documents
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'xls':
      case 'xlsx':
      case 'ppt':
      case 'pptx':
      case 'rtf':
      case 'csv':
      case 'odt':
      case 'ods':
      case 'odp':
      case 'odg':
      case 'odf':
      case 'ott':
      case 'ots':
      case 'otp':
      case 'otg':
      case 'otf':
      case 'ott':
      case 'otm':
      case 'xml':
      case 'json':
      case 'yaml':
      case 'yml':
      case 'ini':
      case 'log':
        return `document/${name}`;
      default:
        return 'text/String';
    }
  }
  

  