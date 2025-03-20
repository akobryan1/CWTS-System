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

// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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

async function loginInstructor() {
    const facultyId = document.getElementById("login_faculty_id").value.trim();
    const password = document.getElementById("login_password").value.trim();

    if (!facultyId || !password) {
        alert("❌ Faculty ID and password are required.");
        return;
    }

    try {
        // Get faculty data from Firestore
        const facultyRef = doc(db, "faculty", facultyId);
        const facultySnap = await getDoc(facultyRef);

        if (!facultySnap.exists()) {
            alert("❌ Incorrect Faculty ID or password.");
            return;
        }

        const facultyData = facultySnap.data();

        // Authenticate using Firebase Auth
        await signInWithEmailAndPassword(auth, facultyData.email, password);
        
        // Store faculty ID in localStorage
        localStorage.setItem("faculty_id", facultyId);

        alert("✅ Login successful!");
        window.location.reload();
    } catch (error) {
        console.error("Login Error:", error.message);
        alert("❌ Incorrect Faculty ID or password.");
    }
}

