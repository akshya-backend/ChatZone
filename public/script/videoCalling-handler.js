import { showErrorNotification } from "../ErrorHandling-Message.js";
import { peer, socket } from "./socket-handler.js";

// Event listeners
document.addEventListener('click', (e) => {
    if (e.target.id === 'end-call-btn') {
         const id=document.getElementById("receiver-video").getAttribute("data")
         let message='Video Call Ended'
        socket.emit('call-ended',({id,message}));
        window.location.reload();
    } else if (e.target.id === 'toggle-audio-btn') {
        toggleAudio(e.target);
    }
});
document.getElementById("video-call")?.addEventListener("click", (e) => {
    const id = document.getElementById("friendId").getAttribute("data");
    socket.emit("isUser-Online", id);
});

// Initialize PeerJS
peer.on('open', (id) => {
    console.log('My peer ID is: ' + id);
});


// Handle incoming call
peer.on('call', (call) => {
    const check=document.getElementById("videoEle")
    if (check) {
     const Id=call.peer;
     socket.emit("already-In-VideoCall",(Id))  
     return;
    }
    const confirmCall = confirm('Accept incoming call?');
    if (confirmCall) {
        stopNotificationLoop()
        handleIncomingCall(call);
    } else {
        const Id=call.peer;
        call.close();
        let message="Call is been Rejected"
       socket.emit('call-ended',({id:Id,message}));

    }
});

// Functions
function handleIncomingCall(call) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            call.answer(stream);


            const senderId=call.peer;
            call.on('stream', (remoteStream) => {
                displayVideo(stream, remoteStream,senderId);
            });


        })
        .catch((error) => {
            console.error('Error accessing media devices:', error);
        });

        call.on('error', (error) => {
            showErrorNotification("Video Call is Ended")
            window.location.reload()            // Handle the error here, such as displaying an error message to the user
        });
    
        // Event listener for call close
        call.on('close', () => {
            showErrorNotification("Video Call is Ended")
            window.location.reload()            // Handle the call closure here, such as displaying a message to the user
        });
}

function displayVideo(localStream, remoteStream,id) {
    const videoCallUI = generateVideoCallUI(id);
    const mainEle = document.getElementById("body")
    if (!mainEle) {
        const Ele = document.getElementById("app");
        Ele.innerHTML = videoCallUI;
    } else {
        mainEle.innerHTML = videoCallUI;
    }

    const localVideo = document.getElementById('sender-video-element');
    const remoteVideo = document.getElementById('receiver-video-element');
    localVideo.srcObject = localStream;
    remoteVideo.srcObject = remoteStream;
}

function toggleAudio(button) {
    const content = button.textContent;
    button.style.backgroundColor = (content === 'Mute') ? "red" : "green";
    button.textContent = (content === 'Mute') ? "Unmute" : "Mute";

    const localVideo = document.getElementById('sender-video-element');
    const stream = localVideo.srcObject;

    if (stream) {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
        } else {
            console.warn('No audio tracks found');
        }
    } else {
        console.warn('No stream found');
    }
}

function generateVideoCallUI(id) {
    return `
    <div class="container3" style="display: flex; flex-direction: column; align-items: center; background-color: #f2f2f2; font-family: Arial, sans-serif;">
    <h1 style="color: #333; margin-top: 20px;">Video Call</h1>
    <div id="videoEle" class="video-container" style="display: flex; flex-direction: row; justify-content: space-between; width: 80%; margin-bottom: 20px;">
        <div id="receiver-video" data=${id} class="video-container" style="width: 48%; display: flex; justify-content: center; align-items: center; margin: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <video id="receiver-video-element" autoplay="" style="width: 100%; transform:scaleX(-1);height: 600px; border-radius: 10px; object-fit: cover;"></video>
        </div>
        <div id="sender-video" class="video-container" style="width: 48%; display: flex; justify-content: center; align-items: center; margin: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <video id="sender-video-element" autoplay="" style="width: 100%;transform:scaleX(-1) ;height: 600px; border-radius: 10px; object-fit: cover;"></video>
        </div>
    </div>

    <div id="videocall" style="display: flex; flex-direction: column; align-items: center;">
        <div class="controls" style="display: flex; justify-content: center; margin-top: 10px;">
            <button id="end-call-btn" style="padding: 10px 20px; background-color: #ff5858; color: white; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s; margin: 0 10px;">End Call</button>
            <button id="toggle-audio-btn" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s; margin: 0 10px;">Mute</button>
        </div>
    </div>
</div>

    `;
}

// Socket events
socket.on("User-status", (data) => {
    startVideoCalling(data.data,data.myid);
});

function startVideoCalling(id,myid) {
    const mainEle = document.getElementById("body");
    const videoCallUI = generateVideoCallUI(id);
    mainEle.innerHTML = videoCallUI;

    const localVideo = document.getElementById('sender-video-element');
    const remoteVideo = document.getElementById('receiver-video-element');

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localVideo.srcObject = stream;
            const call = peer.call(id, stream);
            call.on('stream', (remoteStream) => {
                remoteVideo.srcObject = remoteStream;
            });
            call.on('error', (error) => {
                showErrorNotification("Video Call is Ended")
             window.location.reload()
            });
        
            // Event listener for call close
            call.on('close', () => {
                showErrorNotification("Video Call is Ended")
                window.location.reload()

            });
        })
        .catch(error => {
            console.error('Error accessing media devices:', error);
        });
}

