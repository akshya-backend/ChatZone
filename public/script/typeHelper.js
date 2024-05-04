 import { showErrorNotification,showSuccessMssge } from "../ErrorHandling-Message.js";
const inputs = document.querySelector("#loginContent");

inputs.addEventListener('input', async(e) => {
    const target = e.target;

    if (target.className === "form-control") {
        const val = target.value;
        if (isNaN(val)) {
            target.value = "";
            return;
        }

        if (val !== "") {
            const nextNumber = parseInt(target.id.slice(-1)) + 1;
            const nextInput = document.getElementById(`input${nextNumber}`);
            if (nextInput) {
                nextInput.focus();
            } else {
                const allInputValues = Array.from(inputs.querySelectorAll('.form-control')).map(input => input.value);
                
                if (allInputValues.every(value => value !== "")) {
                    const otp = parseInt(allInputValues.join(""));
                    const email= document.getElementById("resendButton").getAttribute("name")
                    const activate = document.getElementById("spinner")
                    activate.style.display = '';
                    const reply=  await fetch("/api/Chat-Zone/User/verify-otp", {method: "POST",headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email,otp})});
                    const response= await reply.json()
                    if (response.success) {
                        showSingUpForm(response.data)        
                    } else {
                        activate.style.display = 'none';
                        showErrorNotification(response.message)
        
                    }
                }
            }
        }
    }
});



inputs.addEventListener("keyup", function (e) {
    const target = e.target;
    const key = e.key;

    if (target.classList.contains("form-control") && key === "Backspace" && target.value === "") {
        const prev = target.previousElementSibling;
        if (prev && prev.classList.contains("form-control")) {
            prev.focus();
        }
    } else if(target.classList.contains("form-control") && key === "ArrowRight") {
        const next = target.nextElementSibling;
        if (next && next.classList.contains("form-control")) {
            next.focus();
        }
    } else if(target.classList.contains("form-control") && key === "ArrowLeft") {
        const prev = target.previousElementSibling;
        if (prev && prev.classList.contains("form-control")) {
            prev.focus();
        }
    }
});
document.getElementById("email").addEventListener("keypress", function(event) {
    // Check if the pressed key is Enter
    if (event.key === "Enter") {
            event.preventDefault(); 
         // Trigger click event on the 
        document.getElementById("submit").click();           
     }
});



// login page function 
function showSingUpForm(email) {
    const div = document.getElementById("loginContent");

    setTimeout(() => {
        div.style.opacity = 0;
        showSuccessMssge("Welcome To RealChat");

        const content =
            `<form style="margin-top: -110px;">
                <img src="/images/boy.png">
                <h2 class="title" style="text-transform: uppercase; font-size: 30px;">Create New Account</h2>
                <div class="input-div one">
                    <div class="i">
                        <i class='fa fa-user' style="font-size: 30px; color: #555555"></i>
                    </div>
                    <div class="div">
                        <input id="name" type="text" name="fullname" class="input" maxlength="20" placeholder="Full Name">
                        <input type="hidden" id="email" value='${email}'>
                    </div>
                </div>
                <div class="input-div one">
                    <div class="i">
                        <i class='fa fa-key' style="font-size: 26px; color: #555555"></i>
                    </div>
                    <div class="div">
                        <input id="pass" type="password" maxlength="4" minlength="4" name="password" class="input" placeholder="Enter Your App Pin">
                    </div>
                </div>
                <div id='register' class="btn btn-primary" style="margin-top: 10px;">
                    <span id="spinn" style="display: none; margin-right:8px" class="spinner-border spinner-border-sm"></span>
                    Register
                </div>
            </form>
            `;

        div.innerHTML = content;
        div.style.opacity = 1;
    }, 2000);
}

