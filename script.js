// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";



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

let isSigningIn = false;

async function loginWithGoogle() {
    if (isSigningIn) return;
    isSigningIn = true;

    try {
        provider.setCustomParameters({ prompt: "select_account" });

        let user;
        if (window.innerWidth < 600) {
            // 🔄 Use redirect-based login on mobile
            await signInWithRedirect(auth, provider);
            return; // Redirect exits function, no need to continue
        } else {
            // 🔄 Use popup login for desktops
            const result = await signInWithPopup(auth, provider);
            user = result.user;
        }

        if (!user) {
            throw new Error("User authentication failed.");
        }

        console.log("✅ Login Successful:", user.email);

        localStorage.setItem("user_email", user.email);

        // 🔎 Check if user is faculty
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
        console.error("❌ Google Sign-In Error:", error.message);

        if (error.code === "auth/popup-blocked") {
            alert("❌ Login failed: The popup was blocked. Enable popups.");
        } else if (error.code === "auth/cancelled-popup-request") {
            alert("❌ Login canceled. Try again.");
        } else {
            alert("❌ Login failed. Please try again.");
        }
    } finally {
        isSigningIn = false;
    }
}

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

    // ✅ Google Login Button
    const loginBtn = document.getElementById("google-login-btn");
    if (loginBtn) loginBtn.addEventListener("click", loginWithGoogle);

    // ✅ Dashboard Toggle
    const dashboardToggle = document.querySelector(".toggle-btn");
    if (dashboardToggle) dashboardToggle.addEventListener("click", toggleDashboard);

    // ✅ Bind table buttons (FIXED COLLECTION NAMES)
    const studentBtn = document.getElementById("students-btn");
    if (studentBtn) studentBtn.addEventListener("click", () => {
        setCurrentTable("students");  // 🔥 FIXED from "students_table"
        fetchTable("students");       // 🔥 FIXED from "students_table"
    });

    const facultyBtn = document.getElementById("faculty-btn");
    if (facultyBtn) facultyBtn.addEventListener("click", () => {
        setCurrentTable("faculty");  // 🔥 FIXED from "faculty_table"
        fetchTable("faculty");       // 🔥 FIXED from "faculty_table"
    });

    const attendanceBtn = document.getElementById("attendance-btn");
    if (attendanceBtn) attendanceBtn.addEventListener("click", () => {
        setCurrentTable("attendance");  // 🔥 FIXED from "attendance_table"
        fetchTable("attendance");       // 🔥 FIXED from "attendance_table"
    });

    // ✅ Search Button (No Changes)
    const searchBtn = document.querySelector('.controls button');
    if (searchBtn) searchBtn.addEventListener("click", performSearch);
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

let currentTable = ""; // holds the current collection name
let allRows = [];       // holds the full dataset for searching

function setCurrentTable(tableName) {
    currentTable = tableName;
}

async function fetchTable(collectionName) {
    try {
        const ref = collection(db, collectionName);
        const snapshot = await getDocs(ref);

        const data = [];
        snapshot.forEach(doc => {
            data.push({ id: doc.id, ...doc.data() });
        });

        allRows = data; // Store for search functionality
        renderTable(data);
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        alert("❌ Failed to fetch data. Check Firestore rules and collection name.");
    }
}

function renderTable(data) {
    const header = document.getElementById("table-header");
    const body = document.getElementById("table-body");

    // Clear existing content
    header.innerHTML = "";
    body.innerHTML = "";

    if (data.length === 0) {
        header.innerHTML = "<th>No data available</th>";
        return;
    }

    // Render table header
    const columns = Object.keys(data[0]);
    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.toUpperCase();
        header.appendChild(th);
    });

    // Render table rows
    data.forEach(row => {
        const tr = document.createElement("tr");
        columns.forEach(col => {
            const td = document.createElement("td");
            td.textContent = row[col];
            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
}

function performSearch() {
    const query = document.getElementById("search-bar").value.toLowerCase();
    const filtered = allRows.filter(row =>
        Object.values(row).some(value =>
            String(value).toLowerCase().includes(query)
        )
    );
    renderTable(filtered);
}


window.setCurrentTable = setCurrentTable;
window.fetchTable = fetchTable;
window.performSearch = performSearch;
window.submitStudent = submitStudent;
window.enforceNumericInput = enforceNumericInput;
window.logoutInstructor = logoutInstructor;
window.loginWithGoogle = loginWithGoogle;
window.openStudentForm = openStudentForm;
window.closeStudentForm = closeStudentForm;
