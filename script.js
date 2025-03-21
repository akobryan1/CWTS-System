// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
setLogLevel('debug');



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


await signOut(auth); // just before signInWithPopup

// Google Sign-In Function with Faculty Verification
let isSigningIn = false;

async function loginWithGoogle() {
    if (isSigningIn) return;
    isSigningIn = true;

    try {
        provider.setCustomParameters({ prompt: "select_account" });

        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        console.log("✅ Login Successful:", user.email);

        localStorage.setItem("user_email", user.email);

        const facultyRef = collection(db, "faculty");
        const q = query(facultyRef, where("gmail", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("❌ Access Denied: Your email is not registered as faculty.");
            isSigningIn = false;
            return;
        }

        let facultyId = null;
        querySnapshot.forEach(doc => {
            facultyId = doc.data().faculty_id;
        });

        if (!facultyId) {
            alert("❌ Error: Faculty ID not found.");
            isSigningIn = false;
            return;
        }

        localStorage.setItem("faculty_id", facultyId);
        localStorage.setItem("faculty_email", user.email);

        alert(`✅ Login Successful! Faculty ID: ${facultyId}`);
        updateUIAfterLogin();
    } catch (error) {
        console.error("Google Sign-In Error:", error.message);
        alert("❌ Login failed. Please try again.");
    } finally {
        isSigningIn = false;
    }
}


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

// Function to open the Student Registration pop-up
function openStudentForm() {
    document.getElementById("student-form-popup").style.display = "block";
}

function closeStudentForm() {
    document.getElementById("student-form-popup").style.display = "none";
}



async function submitStudent() {
    // Get form input values
    const studentId = document.getElementById("student_id").value.trim();
    const rfid = document.getElementById("rfid_card").value.trim();
    const firstName = document.getElementById("first_name").value.trim();
    const lastName = document.getElementById("last_name").value.trim();
    const facultyId = document.getElementById("faculty_id").value.trim();

    // Validate inputs (Ensure fields are not empty)
    if (!studentId || !rfid || !firstName || !lastName || !facultyId) {
        alert("❌ All fields must be filled out!");
        return;
    }

    try {
        // Reference Firestore "students" collection
        const studentsRef = collection(db, "students");

        // Add new student document to Firestore
        await addDoc(studentsRef, {
            student_id: parseInt(studentId),
            rfid: parseInt(rfid),
            first_name: firstName,
            last_name: lastName,
            faculty_id: facultyId
        });

        alert("✅ Student Registered Successfully!");

        // Close the form and reset fields
        closeStudentForm();
        document.getElementById("student_id").value = "";
        document.getElementById("rfid_card").value = "";
        document.getElementById("first_name").value = "";
        document.getElementById("last_name").value = "";
        document.getElementById("faculty_id").value = "";
    } catch (error) {
        console.error("❌ Error adding student:", error);
        alert("❌ Failed to register student. Please try again.");
    }
}

function enforceNumericInput(event) {
    const input = event.target;
    input.value = input.value.replace(/\D/g, '');
}




window.submitStudent = submitStudent;
window.enforceNumericInput = enforceNumericInput;
window.logoutInstructor = logoutInstructor;
window.loginWithGoogle = loginWithGoogle;
window.openStudentForm = openStudentForm;
window.closeStudentForm = closeStudentForm;
