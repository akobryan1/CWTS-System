console.log("Testing JavaScript");


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

import { signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Logout Function
function logoutInstructor() {
    const auth = getAuth();

    signOut(auth).then(() => {
        // Clear stored user data
        localStorage.removeItem("faculty_id");
        localStorage.removeItem("faculty_email");

        alert("✅ Successfully logged out.");
        window.location.reload();
    }).catch((error) => {
        console.error("Logout Error:", error.message);
        alert("❌ Logout failed. Please try again.");
    });
}



function resetLoginForm() {
    document.getElementById('login_faculty_id').value = '';
    document.getElementById('login_password').value = '';
}

function enforceNumericInput(event) {
    let value = event.target.value;
    event.target.value = value.replace(/\D/g, '');
}

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
async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (!user || !user.email) {
            alert("❌ Unable to retrieve email from Google.");
            return;
        }

        // Check if the user exists in Firestore
        const facultyRef = collection(db, "faculty");
        const q = query(facultyRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("❌ Access Denied: Your email is not registered.");
            return;
        }

        // Extract faculty_id and store it
        let facultyId = null;
        querySnapshot.forEach(doc => {
            facultyId = doc.data().faculty_id;
        });

        if (!facultyId) {
            alert("❌ Error: Faculty ID not found.");
            return;
        }

        // Store faculty_id in localStorage
        localStorage.setItem("faculty_id", facultyId);
        localStorage.setItem("faculty_email", user.email);

        alert(`✅ Login successful! Faculty ID: ${facultyId}`);
        window.location.reload();

    } catch (error) {
        console.error("Google Sign-In Error:", error.message);
        alert("❌ Google Sign-In failed.");
    }
}

// Attach event listener to the login button
document.getElementById("google-login-btn").addEventListener("click", loginWithGoogle);


