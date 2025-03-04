// Fetch Job Listings from Backend
async function fetchJobs() {
    try {
        const response = await fetch("http://localhost:5000/api/jobs");
        const jobs = await response.json();
        displayJobs(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
    }
}

// Display Jobs in the UI
function displayJobs(jobs) {
    const jobsContainer = document.getElementById("jobs-list");
    jobsContainer.innerHTML = ""; // Clear previous jobs
    
    jobs.forEach(job => {
        const jobElement = document.createElement("div");
        jobElement.classList.add("job-item");
        jobElement.innerHTML = `
            <h3>${job.title}</h3>
            <p><strong>Company:</strong> ${job.company}</p>
            <p>${job.description}</p>
        `;
        jobsContainer.appendChild(jobElement);
    });
}

// Handle User Registration
async function registerUser(event) {
    event.preventDefault();
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    
    try {
        const response = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        alert(data.msg);
    } catch (error) {
        console.error("Registration error:", error);
    }
}

// Handle User Login
async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    
    try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem("authToken", data.token);
            alert("Login successful!");
            window.location.href = "dashboard.html";
        } else {
            alert("Login failed: " + data.msg);
        }
    } catch (error) {
        console.error("Login error:", error);
    }
}

// Event Listeners
document.getElementById("register-form")?.addEventListener("submit", registerUser);
document.getElementById("login-form")?.addEventListener("submit", loginUser);

document.addEventListener("DOMContentLoaded", fetchJobs);
