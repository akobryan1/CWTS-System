console.log("Testing JavaScript");


function toggleDashboard() {
    const dashboard = document.querySelector(".dashboard");
    if (dashboard) {
        dashboard.classList.toggle("collapsed");
    } else {
        console.error("❌ Dashboard element not found!");
    }
}


function showInstructorLogin() {
    document.getElementById("instructor-login-popup").style.display = "block";
}

function closeInstructorLogin() {
    document.getElementById("instructor-login-popup").style.display = "none";
}

import { signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

console.log("Testing JavaScript");

// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
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

// Google Sign-In Function
// Google Sign-In Function with Faculty Verification
async function loginWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
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
            alert("❌ Access Denied: Your email is not registered.");
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
}

function updateUIAfterLogin() {
    const userEmail = localStorage.getItem("user_email");
    if (userEmail) {
        document.getElementById("viewAttendanceButton").style.display = "block";
        document.getElementById("classButton").style.display = "block";
        document.getElementById("instructor-login-btn").style.display = "none";
        document.getElementById("logout-btn").style.display = "block";
    } else {
        document.getElementById("viewAttendanceButton").style.display = "none";
        document.getElementById("classButton").style.display = "none";
        document.getElementById("instructor-login-btn").style.display = "block";
        document.getElementById("logout-btn").style.display = "none";
    }
}

function updateUIAfterLogout() {
    document.getElementById("viewAttendanceButton").style.display = "none";
    document.getElementById("classButton").style.display = "none";
    document.getElementById("instructor-login-btn").style.display = "block";
    document.getElementById("logout-btn").style.display = "none";
}


// ✅ Call this function when page loads
window.onload = updateUIAfterLogin;




// Logout Function
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Improved Logout Function
async function logoutInstructor() {
    const auth = getAuth();

    try {
        await signOut(auth); // ✅ Logs out the user from Firebase
        localStorage.removeItem("user_email");
        localStorage.removeItem("faculty_id");

        alert("✅ Successfully logged out.");

        // ✅ Hide buttons after logout
        updateUIAfterLogout();

        window.location.reload(); // ✅ Ensures a fresh UI state after logout
    } catch (error) {
        console.error("Logout Error:", error.message);
        alert("❌ Logout failed. Please try again.");
    }
}



window.onload = function() {
    const userEmail = localStorage.getItem("user_email");
    if (userEmail) {
        document.getElementById("viewAttendanceButton").style.display = "block";
        document.getElementById("classButton").style.display = "block";
        document.getElementById("instructor-login-btn").style.display = "none";
        document.getElementById("logout-btn").style.display = "block";
    }
};

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ JavaScript Loaded Successfully!");

    // Auto-show buttons if user is logged in
    const userEmail = localStorage.getItem("user_email");
    if (userEmail) {
        document.getElementById("viewAttendanceButton").style.display = "block";
        document.getElementById("classButton").style.display = "block";
        document.getElementById("instructor-login-btn").style.display = "none";
        document.getElementById("logout-btn").style.display = "block";
    }
});



// Attach event listener to the login button
document.getElementById("google-login-btn").addEventListener("click", loginWithGoogle);
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ JavaScript Loaded Successfully!");

    // Ensure buttons update correctly
    updateUIAfterLogin();

    // ✅ Add event listener to logout button
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutInstructor);
    }
});



