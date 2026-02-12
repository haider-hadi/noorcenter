import { supabase } from './supabase.js';

const form = document.getElementById("contactForm");
const msgBox = document.getElementById("contactMsg");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msgBox.innerText = "Sending...";
    msgBox.style.color = "black";

    const formData = new FormData(form);

    const { error } = await supabase.from("messages").insert([
        {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            message: formData.get("message")
        }
    ]);

    if (error) {
        console.error(error);
        msgBox.innerText = "Error sending message.";
        msgBox.style.color = "red";
    } else {
        msgBox.innerText = "Message sent successfully!";
        msgBox.style.color = "green";
        form.reset();
    }
});
