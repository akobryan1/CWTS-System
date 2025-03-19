console.log("Script loaded successfully");

function toggleDashboard() {
    const dashboard = document.querySelector(".dashboard");
    dashboard.classList.toggle("collapsed");
}

function showInstructorLogin() {
    document.getElementById("instructor-login-popup").style.display = "block";
}

function closeInstructorLogin() {
    document.getElementById("instructor-login-popup").style.display = "none";
}

function logoutInstructor() {
    localStorage.removeItem("faculty_id");
    alert("✅ Logged out successfully!");
    window.location.reload();
}


function resetLoginForm() {
    document.getElementById('login_faculty_id').value = '';
    document.getElementById('login_password').value = '';
}

function enforceNumericInput(event) {
    let value = event.target.value;
    event.target.value = value.replace(/\D/g, '');
}

