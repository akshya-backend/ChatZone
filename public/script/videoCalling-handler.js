import { showErrorNotification } from "../ErrorHandling-Message.js";
import { handlePeerError, peer, socket } from "./socket-handler.js";

// Event listeners
document.addEventListener('click', (e) => {
    if (e.target.id === 'end-call-btn') {
        endCall();
    } else if (e.target.id === 'toggle-audio-btn') {
        toggleAudio(e.target);
    }
});

document.getElementById("video-call")?.addEventListener("click", (e) => {
    const friendId = document.getElementById("friendId").getAttribute("data");
    socket.emit("isUser-Online", friendId);
});

// Handle incoming call
peer.on('call', (call) => {
    const isVideoCallActive = document.getElementById("videoCalling");

    if (isVideoCallActive) {
        const peerId = call.peer;
        socket.emit("already-In-VideoCall", peerId);
        return;
    }

    displayCallPopup();

    document.getElementById('accept-call-btn').addEventListener('click', () => {
        handleCallAcceptance(call);
    });

    document.getElementById('reject-call-btn').addEventListener('click', () => {
        handleCallRejection(call);
    });
});

// Functions
function handleCallAcceptance(call) {
    call.answerStream()
        .then((stream) => {
            const senderId = call.peer;
            call.onStream(stream, (remoteStream) => {
                displayVideo(stream, remoteStream, senderId);
            });
        })
        .catch((error) => {
            handleCallError(error);
        });
}

function handleCallRejection(call) {
    const peerId = call.peer;
    call.close();
    const message = "Call has been rejected";
    socket.emit('call-ended', { id: peerId, message });
    hideCallPopup();
}

function handleCallError(error) {
    showErrorNotification("Video Call Error: " + error.message);
    window.location.reload();
}

function displayVideo(localStream, remoteStream, id) {
    const videoCallUI = generateVideoCallUI(id);
    const mainElement = document.getElementById("body") || document.getElementById("app");
    mainElement.innerHTML = videoCallUI;

    const localVideo = document.getElementById('sender-video-element');
    const remoteVideo = document.getElementById('receiver-video-element');
    localVideo.srcObject = localStream;
    remoteVideo.srcObject = remoteStream;
}

function toggleAudio(button) {
    const content = button.textContent;
    const newColor = (content === 'Mute') ? "red" : "green";
    const newText = (content === 'Mute') ? "Unmute" : "Mute";
    button.style.backgroundColor = newColor;
    button.textContent = newText;

    const localVideo = document.getElementById('sender-video-element');
    const stream = localVideo.srcObject;

    if (!stream) {
        console.warn('No stream found');
        return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
        audioTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
    } else {
        console.warn('No audio tracks found');
    }
}

function generateVideoCallUI(id) {
    return `
    <div id="videoCalling" class="container3" style="display: flex; flex-direction: column; align-items: center; background-color: #f2f2f2; font-family: Arial, sans-serif;">
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

function showCallPopup() {
    const popup = document.createElement('div');
    popup.id = 'call-popup';
    popup.style.display = 'none';
    popup.style.position = 'fixed';
    popup.style.top = '10%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    popup.style.color = 'white';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.zIndex = '999';
    popup.style.width = "30%";

    const content = `
        <div style="text-align: center;">
            <p>Accept incoming call?</p>
            <div style="margin-top: 20px;">
                <button id="accept-call-btn" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s; margin: 0 10px;">Accept</button>
                <button id="reject-call-btn" style="padding: 10px 20px; background-color: #ff5858; color: white; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s; margin: 0 10px;">Reject</button>
            </div>
        </div>
    `;
    popup.innerHTML = content;
    document.body.appendChild(popup);
    return popup;
}

function hideCallPopup() {
    const popup = document.getElementById('call-popup');
    if (popup) popup.remove();
}

// Socket events
socket.on("User-status", (data) => {
    startVideoCalling(data.data, data.myid);
});

function startVideoCalling(id) {
    const mainEle = document.getElementById("body") || document.getElementById("app");
    const videoCallUI = generateVideoCallUI(id);
    mainEle.innerHTML = videoCallUI;

    const localVideo = document.getElementById('sender-video-element');
    const remoteVideo = document.getElementById('receiver-video-element');

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localVideo.srcObject = stream;
            const call = peer.call(id, stream);

            // Set a timeout for 10 seconds
            const timeout = setTimeout(() => {
                call.close();
                const message = "Call has been ended";
                socket.emit('call-ended', { id, message });
                showErrorNotification("Call automatically ended because the other party did not pick up");
                window.location.reload();
            }, 20000); // 10 seconds in milliseconds

            // If the call is answered, clear the timeout
            call.on('stream', (remoteStream) => {
                clearTimeout(timeout);
                remoteVideo.srcObject = remoteStream;
            });

            // Handle call errors
            call.on('error', (error) => {
                clearTimeout(timeout);
                handleCallError(error);
            });

            // Event listener for call close
            call.on('close', () => {
                clearTimeout(timeout);
                showErrorNotification("Video Call is Ended");
                window.location.reload();
            });
        })
        .catch(error => {
            console.error('Error accessing media devices:', error);
        });
}

function endCall() {
    const id = document.getElementById("receiver-video").getAttribute("data");
    const message = 'Video Call Ended';
    socket.emit('call-ended', { id, message });
    window.location.reload();
}


