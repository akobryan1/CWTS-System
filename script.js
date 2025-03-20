// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8qK7GrYlOj_NFWaSTD8xhWYdCmoYrWzo",
  authDomain: "cwts-system.firebaseapp.com",
  projectId: "cwts-system",
  storageBucket: "cwts-system.firebasestorage.app",
  messagingSenderId: "1022635923004",
  appId: "1:1022635923004:web:57b050e34840ba9c6e1539",
  measurementId: "G-SCWVRFQ9Y6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Google Sign-In Function with Faculty Verification
async function loginWithGoogle() {
    try {
        provider.setCustomParameters({ prompt: "select_account" });

        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        console.log("✅ Login Successful:", user.email);

        // Store user email in local storage
        localStorage.setItem("user_email", user.email);

        // Fetch faculty ID from Firestore
        const facultyRef = collection(db, "faculty");
        const q = query(facultyRef, where("gmail", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("❌ Access Denied: Your email is not registered as faculty.");
            return;
        }

        let facultyId = null;
        querySnapshot.forEach(doc => {
            facultyId = doc.data().faculty_id;
        });

        if (!facultyId) {
            alert("❌ Error: Faculty ID not found.");
            return;
        }

        // Store faculty_id and email in localStorage
        localStorage.setItem("faculty_id", facultyId);
        localStorage.setItem("faculty_email", user.email);

        alert(`✅ Login Successful! Faculty ID: ${facultyId}`);

        // ✅ Show buttons after login
        updateUIAfterLogin();
    } catch (error) {
        console.error("Google Sign-In Error:", error.message);
        alert("❌ Login failed. Please try again.");
    }
};


// Logout Function
// Logout Function
async function logoutInstructor() {
    try {
        await signOut(auth);
        localStorage.removeItem("user_email");
        localStorage.removeItem("faculty_id");

        alert("✅ Successfully logged out.");

        // ✅ Reset UI
        updateUIAfterLogout();

        // Refresh the page to clear the session
        setTimeout(() => {
            window.location.reload();
        }, 500);
    } catch (error) {
        console.error("Logout Error:", error.message);
        alert("❌ Logout failed. Please try again.");
    }
}
window.logoutInstructor = logoutInstructor;



// UI Updates After Login
function updateUIAfterLogin() {
    const userEmail = localStorage.getItem("user_email");

    if (userEmail) {
        const buttonsToShow = [
            "students-btn",
            "faculty-btn",
            "attendance-btn",
            "register-student-btn",
            "signup-faculty-btn",
            "logout-btn",
            "viewAttendanceButton",
            "classButton"
        ];

        buttonsToShow.forEach(id => {
            const button = document.getElementById(id);
            if (button) button.style.display = "block";
        });

        // Hide the login button after login
        const loginBtn = document.getElementById("google-login-btn");
        if (loginBtn) loginBtn.style.display = "none";

        console.log("✅ UI updated after login");
    } else {
        updateUIAfterLogout();
    }
}

/*function updateUIAfterLogin() {
    const userEmail = localStorage.getItem("user_email");

    if (userEmail) {
        const viewAttendanceButton = document.getElementById("viewAttendanceButton");
        const classButton = document.getElementById("classButton");
        const logoutBtn = document.getElementById("logout-btn");

        if (viewAttendanceButton) viewAttendanceButton.style.display = "block";
        if (classButton) classButton.style.display = "block";
        if (logoutBtn) logoutBtn.style.display = "block";

        console.log("✅ UI updated after login");
    } else {
        updateUIAfterLogout();
    }
}*/



// UI Updates After Logout
function updateUIAfterLogout() {
    const buttonsToHide = [
        "students-btn",
        "faculty-btn",
        "attendance-btn",
        "register-student-btn",
        "signup-faculty-btn",
        "logout-btn",
        "viewAttendanceButton",
        "classButton"
    ];

    buttonsToHide.forEach(id => {
        const button = document.getElementById(id);
        if (button) button.style.display = "none";
    });

    // Show the login button after logout
    const loginBtn = document.getElementById("google-login-btn");
    if (loginBtn) loginBtn.style.display = "block";

    console.log("✅ UI reset after logout");
}


// Toggle Dashboard Collapse
function toggleDashboard() {
    const dashboard = document.querySelector(".dashboard");
    if (dashboard) {
        dashboard.classList.toggle("collapsed");
        console.log("✅ Dashboard Toggled");
    } else {
        console.error("❌ Dashboard element not found!");
    }
};

// Ensure Scripts Run After DOM Loads
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ JavaScript Loaded Successfully!");

    // ✅ Bind login button event listener
    const loginBtn = document.getElementById("google-login-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", loginWithGoogle);
    } else {
        console.error("❌ Login button not found!");
    }

    // ✅ Bind dashboard toggle button event listener
    const dashboardToggle = document.querySelector(".toggle-btn");
    if (dashboardToggle) {
        dashboardToggle.addEventListener("click", toggleDashboard);
    } else {
        console.error("❌ Dashboard button not found!");
    }
});
