import { showErrorNotification } from "../ErrorHandling-Message.js";
import { handle_friend_request, self_MessagePrint } from "./message-handler.js";

// Get authentication token
const token = document.getElementById("self-info").getAttribute("data");
const peerId = document.getElementById("self-id").getAttribute("data-custom")
export let peer;

// Function to initialize PeerJS connection
function initializePeer(id) {
    peer = new Peer(id);
    peer.on('open', (id) => {console.log('My peer ID is: ' + id);});
    peer.on('error', handlePeerError);
}

// Function to handle PeerJS connection errors
 export function handlePeerError(error) {
    showErrorNotification("Failed to establish WebSocket connection to PeerJS server");
    console.error('WebSocket connection error:', error);
    setTimeout(reconnectPeer, 2000);
}

// Function to reconnect PeerJS connection
function reconnectPeer() {
    console.log('Attempting to reconnect to PeerJS server...');
    initializePeer(peerId); // Reinitialize PeerJS connection
}

// Initialize PeerJS connection
initializePeer(peerId);

// Establish Socket.io connection with authentication
export const socket = io( { query: { token: token } });
var uploader = new SocketIOFileUpload(socket);
socket.emit('userOnline');
socket.on('userIsOnline',(v)=>{handleOnline(v)});
socket.on('userIsOffline',(v)=>{handleOffline(v)});
socket.on('connect', () => { console.log('Socket.io connected'); });
socket.on('disconnect', () => { console.log('Socket.io disconnected'); });
socket.on('error', (data) => { showErrorNotification(data) });
socket.on('message-response', (data) => self_MessagePrint(data))
socket.on('message-from-friend', (data) => handle_friend_request(data))
socket.on('blocked-response', (data) => { showErrorNotification(data) })
socket.on('close-videocall',(message)=>{CloseCall(message)});
socket.on("User-Already-In-Call",()=>{AlreadyInCall() })

// Function to send a message
function sendMessage() {
    const inputField = document.getElementById("type-area");
    const friendId = document.getElementById("friendId").getAttribute("data");

    if (inputField.value.trim() !== "") {
        const data = {
            message: inputField.value.trim(),
            friendId: friendId,
            fileType: "text"
        };
        socket.emit('Text-message', data);
        inputField.value = ""; // Clear the input field after sending the message
    } else {
        showErrorNotification("Message cannot be empty");
    }
}

// Event listener for clicking send button
const sendBtn = document.getElementById("send-btn");
if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
}

// Event listener for pressing Enter key in the input field
const inputField = document.getElementById("type-area");
if (inputField) {
    inputField.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default behavior (e.g., submitting a form)
            sendMessage();
        }
    });
}

// Create the file input element and attach the change event listener
const fileInput = document.createElement('input');
fileInput.id = "input-file";
fileInput.type = 'file';
fileInput.name = "file";
fileInput.style.display = 'none';
document.body.appendChild(fileInput)
// uploader.listenOnInput(document.getElementById("input-file"));

const fileSelect = document.getElementById('file-select');

fileSelect?.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', async () => {
    const friendId = document.getElementById("friendId").getAttribute("data");
    const MAX_SIZE= 10*1024*1024
      const FILE_SIZE=fileInput.files[0].size
    if (FILE_SIZE > MAX_SIZE) {
        showErrorNotification("Cannot Send File Over 10 mb")
        return;
    }
    // Check if files were selected
    if (fileInput.files.length > 0) {
        fileInput.files[0].meta={friendId}

        // Submit the file using socket.io-file-upload
        const lists=document.getElementById("chat-area")
        const message=`
        <div id="your-chat" class="your-chat">
          <div class="loading-dot">
             <img src="https://www.icegif.com/wp-content/uploads/2023/07/icegif-1263.gif" alt="Loading Animation" style="width: 250px; height: 200px; border-radius: 10px;">
               <div class="loading-text" id="loading-text">Sending....</div>
          </div>
        </div>

    `
        lists.insertAdjacentHTML('beforeend', message);
        lists.scrollTop = lists.scrollHeight;  

        uploader.submitFiles(fileInput.files);


        console.log('File submitted:',fileInput.files[0].size);
    } else {
        console.error("No files selected");
    }
});


function handleOnline(id){
 const findFriend=document.querySelector(`[data="${id}"]`)
 if (findFriend) {
    const getElement=findFriend?.querySelector(".friends-photo");
     const getstatus=findFriend?.querySelector("#onlinestatus");
     getstatus.style.backgroundColor= 'limegreen'
     getElement.style.border= '3px solid limegreen'
 }   
}
function handleOffline(id){
    const findFriend=document.querySelector(`[data="${id}"]`)
    if (findFriend) {
     const getElement=findFriend?.querySelector(".friends-photo");
     const getstatus=findFriend?.querySelector("#onlinestatus");
     getstatus.style.backgroundColor= 'red'
     getElement.style.border= '3px solid red'

}}

 function CloseCall(message) {
    const Ele= document.getElementById("videoCalling")
    const check2=document.getElementById("call-popup")

    if (Ele || check2) {
         showErrorNotification(message)
        setTimeout(() => {
        window.location.reload() 

    }, 1000);  
    }
 }

 function AlreadyInCall(){
    showErrorNotification(" Already in Video with Someone ")
    setTimeout(() => {
        window.location.reload() 
 
    }, 1000);
 }