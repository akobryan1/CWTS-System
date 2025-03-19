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




async function loginInstructor() {
    const facultyId = document.getElementById('login_faculty_id').value.trim();
    const password = document.getElementById('login_password').value.trim();

    if (!facultyId || !password) {
        alert("❌ Faculty ID and password are required.");
        return;
    }

    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbxEDDaJK6cdGAZ_jeYOk5ZDjLiUsbaO0LFLUtrkaG4rhS6hgkE3y2zu0BDcQUOZcwo6aA/exec", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "login",
                facultyId: facultyId,
                password: password
            })
        });
        

        const result = await response.json();

        if (result.success) {
            alert("✅ Login successful!");
            localStorage.setItem("faculty_id", facultyId);
            window.location.reload(); // Reload to reveal dashboard features
        } else {
            alert("❌ Invalid Faculty ID or password.");
            resetLoginForm();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("❌ Failed to login. Please try again.");
    }
}

