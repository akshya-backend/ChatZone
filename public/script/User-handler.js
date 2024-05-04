import { showSuccessMssge,showErrorNotification } from "../ErrorHandling-Message.js";

const SignUpLogin = {
    // Function to validate email format


    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Function to validate email and send OTP


    validateAndSendOTP: function(email) {
        if (!navigator.onLine) {
            return showErrorNotification("You are not connected to the internet")
        }
       else if (email === '' || !this.isValidEmail(email)) {
             return showErrorNotification('Invalid email. Please provide a valid email address.');
        } else {
            this.sendOTP(email);
        }
    },

    // Function to simulate sending OTP


    sendOTP: async function(email) {
        const spinner = document.getElementById("spinn");
        spinner.style.display = '';
            const reply=  await fetch("/api/Chat-Zone/User/sendOTP", {method: "POST",headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email})});
            const response= await reply.json()
            if (response.success) {
                if (response.redirect) { // for case jwt is remove
                  return  window.location.reload()
                }
                 showSuccessMssge(response.message)
                this.loadOTPPage(email,startCountdown);

            } else {
              showErrorNotification(response.message)

            }
         // Simulate delay of 1 second
    },

    // Function to simulate loading OTP page
    loadOTPPage: function(email) {
        const div = document.getElementById("loginContent");
        div.style.transition = "opacity 0.5s ease-in-out";

        div.style.opacity = 0;
    
        // Wait for 3 mili seconds
         new Promise(resolve=> setTimeout(resolve,300))
    
        const part = email.split("@");
        const last_4_digit = part[0].slice(-4);
        const hiddenEmail = `${last_4_digit}@gmail.com`;
    
        const addThis = `
            <div id="otp" class="card py-5 px-3">
                <h3 style="font-size: xx-large;" class="m-0">Email Verification</h3>
                <span class="mobile-text">Code sent to <b class="text-danger"><span style="font-family:cursive">xxxx</span>${hiddenEmail}</b><a href="/" style="display:inline;"><i class="fa fa-pencil" style="font-size:26px; margin-left:15px;"></i></a></span>
                <div id="allinputs" style="max-width: 300px;margin-left: 120px;" class="d-flex flex-row mt-5">
                    <input id='input1' type="tel" class="form-control" maxlength="1" autofocus required>
                    <input id='input2' type="tel" maxlength="1" class="form-control" required>
                    <input id='input3' type="tel" maxlength="1" class="form-control" required>
                    <input id='input4' type="tel" maxlength="1" class="form-control"  autocomplete="new-password" required>
                </div>
                <div class="text-center mt-5">
                    <div id="otpdivbtn">
                        <button id="otpbtn" type="submit" style="max-width: 220px;margin-left: 160px;" onclick='verify()' class="btn btn-primary">
                            <span id="spinner" style="display: none; margin-right: 10px" class="spinner-border spinner-border-sm"></span>
                            Verify
                        </button>
                    </div>
                    <span class="d-block mobile-text">Didn't receive the code?</span>
                    <div id="countdownTimer" style="color: #0062cc; font-size: x-large;">120s</div>
                    <span id="resendButton" name="${email}" class="font-weight-bold text-danger cursor disabled")">Resend</span>
                </div>
            </div>`;
    
        div.innerHTML = addThis;
        div.style.opacity = 1;
        startCountdown()
    
    },

    // Entry point function to submit email
    submitEmail: function(email) {
        this.validateAndSendOTP(email);
    }
};

// Example usage
document.getElementById("submit").addEventListener("click",()=>{
    const emailInput = document.getElementById("email");
    const email = emailInput.value.trim();
    SignUpLogin.submitEmail(email);

},{ once: true } )



// Function to start the countdown
const startCountdown = () => {
    let seconds = 120; // Initial time
    const countdownTimer = document.getElementById("countdownTimer");
    const countdown = setInterval(() => {
        seconds--;
        countdownTimer.innerText = seconds + "s";
        if (seconds <= 0) {
            clearInterval(countdown);
            enableResendButton(); // Enable resend button when countdown finishes
        }
    }, 1000);
};

// Function to enable the resend button
const enableResendButton = () => {
    const resendButton = document.getElementById("resendButton");
    if (resendButton) {
        resendButton.classList.remove("disabled");
    }
};

// Function to disable the resend button and initiate the countdown
const disableResendButton = () => {
    const resendButton = document.getElementById("resendButton");
    if (resendButton) {
        resendButton.classList.add("disabled");
         // Start the countdown
    }
};

// Function to restart the countdown and resend OTP
const restartCountdown = async (email,callback) => {
    try {
        const reply = await fetch("/api/Chat-Zone/User/sendOTP", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const response = await reply.json();
        if (response.success) {
            showSuccessMssge(response.message);
            callback()
        } else {
            showErrorNotification(response.message);
        }
    } catch (error) {
        console.error("Error resending OTP:", error);
    }
};
   document.addEventListener('click', function(event) {
       if (event.target && event.target.id === 'resendButton') {
              const email=event.target.getAttribute('name');
              disableResendButton()
            restartCountdown(email,startCountdown); // Call restartCountdown function
        }
        else if(event.target && event.target.id === 'register'){
            register()
        }
    });
    


    async function register() {
        const fullName = document.getElementById("name").value.trim();
        const pin = document.getElementById("pass").value;
        const email = document.getElementById("email").value;
    
        // Validate full name
        if (!isValidName(fullName)) {
            showErrorNotification("Full name can only contain alphabetic characters.");
            return;
        }
    
        // Validate PIN
        if (!isValidPin(pin)) {
            showErrorNotification("App Pin must be a 4-digit number.");
            return;
        }
    
        // Display loading spinner
        document.getElementById("spinn").style.display = '';
    
        try {
            const response = await fetch("/api/Chat-Zone/User/signUP", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fullName, pass:pin, email })
            });
    
            const reply = await response.json();
            
            if (reply.success) {
                // If registration is successful, you can perform any necessary actions here
                showSuccessMssge("Successfully Registered ");
                new Promise(resolve=> setTimeout(resolve,2000))

                    const form = document.createElement('form');
    
                 form.setAttribute('method', 'GET');
                 form.setAttribute('action', '/');

                  document.body.appendChild(form);
                   form.submit();
            } else {
                // If there's an error, show error notification
                showErrorNotification(reply.message)

            }
        } catch (error) {
            // Handle network errors
            console.error("Error during registration:", error);
            showErrorNotification("An error occurred during registration. Please try again later.");
        } finally {
            // Hide loading spinner
            document.getElementById("spinn").style.display = 'none';
        }
    }
    function isValidName(name) {
        return /^[A-Za-z\s]+$/.test(name);
    }
    
    // Function to validate PIN containing only 4-digit numbers
    function isValidPin(pin) {
        return /^\d{4}$/.test(pin);
    }

    