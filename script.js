// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc as docRef,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";


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
let isClassOngoing = false;
let rfidBuffer = "";

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
    console.log("🔒 User Logged Out: Hiding dashboard buttons");

    // ✅ Hide all buttons except Sign In
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

    // ✅ Show Sign-In button
    const loginBtn = document.getElementById("google-login-btn");
    if (loginBtn) loginBtn.style.display = "block";
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

  const classBtn = document.getElementById("classButton");
if (classBtn) classBtn.addEventListener("click", toggleClass);


    // 🔥 Immediately hide all protected dashboard buttons
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
        const btn = document.getElementById(id);
        if (btn) btn.style.display = "none";  // ✅ Instantly hide buttons
    });

    // ✅ Check authentication state on page load
    auth.onAuthStateChanged(user => {
        if (user) {
            updateUIAfterLogin();
        } else {
            updateUIAfterLogout();
        }
    });

    // ✅ Google Login Button
    const loginBtn = document.getElementById("google-login-btn");
    if (loginBtn) loginBtn.addEventListener("click", loginWithGoogle);

    // ✅ Logout Button
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", logoutInstructor);

    // ✅ Dashboard Toggle
    const dashboardToggle = document.querySelector(".toggle-btn");
    if (dashboardToggle) dashboardToggle.addEventListener("click", toggleDashboard);

    // ✅ Bind table buttons
    const studentBtn = document.getElementById("students-btn");
    if (studentBtn) studentBtn.addEventListener("click", () => {
        setCurrentTable("students");
        fetchTable("students");
    });

    const facultyBtn = document.getElementById("faculty-btn");
    if (facultyBtn) facultyBtn.addEventListener("click", () => {
        setCurrentTable("faculty");
        fetchTable("faculty");
    });

    const attendanceBtn = document.getElementById("attendance-btn");
    if (attendanceBtn) attendanceBtn.addEventListener("click", () => {
        setCurrentTable("attendance");
        fetchTable("attendance");
    });

    // ✅ Search Button
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
let allRows = [];
let currentUpdateDocId = null;  // ✅ Fix: Declare this variable globally to prevent ReferenceError
       // holds the full dataset for searching

function setCurrentTable(tableName) {
    currentTable = tableName;
}

async function fetchTable(collectionName) {
    try {
        const isArchived = collectionName.startsWith("attendance_");

        const ref = isArchived
            ? collection(db, "archived_attendance", collectionName, "records")
            : collection(db, collectionName);

        const querySnapshot = await getDocs(ref);

        const headerRow = document.getElementById("table-header");
        const tableBody = document.getElementById("table-body");
        headerRow.innerHTML = "";
        tableBody.innerHTML = "";
        allRows = []; // ✅ Reset the search dataset

        if (querySnapshot.empty) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 10;
            td.textContent = "No records found.";
            row.appendChild(td);
            tableBody.appendChild(row);
            return;
        }

        const firstDoc = querySnapshot.docs[0].data();
        const headers = Object.keys(firstDoc);

        // Header
        headers.forEach(key => {
            const th = document.createElement("th");
            th.textContent = key;
            headerRow.appendChild(th);
        });

        // Add "Actions" column
        const th = document.createElement("th");
        th.textContent = "Actions";
        headerRow.appendChild(th);

        querySnapshot.forEach(docSnap => {
            const row = docSnap.data();
            const tr = document.createElement("tr");

            headers.forEach(key => {
                const td = document.createElement("td");
                td.textContent = row[key];
                tr.appendChild(td);
            });

            // Actions column (Update/Delete)
            const actionTd = document.createElement("td");

            const updateBtn = document.createElement("button");
            updateBtn.textContent = "Update";
            updateBtn.className = "update-btn";
            updateBtn.onclick = () => {
                updateBtn.classList.add("clicked");
                openUpdateForm(docSnap.id, row);
                setTimeout(() => updateBtn.classList.remove("clicked"), 200);
            };
            actionTd.appendChild(updateBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "delete-btn";
            deleteBtn.onclick = () => {
                deleteBtn.classList.add("clicked");
                deleteRecord(docSnap.id);
                setTimeout(() => deleteBtn.classList.remove("clicked"), 200);
            };
            actionTd.appendChild(deleteBtn);

            tr.appendChild(actionTd);
            tableBody.appendChild(tr);

            // ✅ Cache for searching
            allRows.push({ ...row, id: docSnap.id });
        });
    } catch (error) {
        console.error("❌ Error fetching table data:", error);
        alert("❌ Failed to load table data.");
    }
}


function renderTable(data) {
    const header = document.getElementById("table-header");
    const body = document.getElementById("table-body");

    header.innerHTML = "";
    body.innerHTML = "";

    if (data.length === 0) {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 10;
        td.textContent = "No data available";
        row.appendChild(td);
        body.appendChild(row);
        return;
    }

    const columns = Object.keys(data[0]).filter(col => col !== "id");

    // Render header
    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        header.appendChild(th);
    });

    // Add actions header
    const actionTh = document.createElement("th");
    actionTh.textContent = "Actions";
    header.appendChild(actionTh);

    data.forEach(row => {
        const tr = document.createElement("tr");

        columns.forEach(col => {
            const td = document.createElement("td");
            td.textContent = row[col];
            tr.appendChild(td);
        });

        const actionTd = document.createElement("td");

        const updateBtn = document.createElement("button");
        updateBtn.textContent = "Update";
        updateBtn.onclick = () => openUpdateForm(row.id, row);
        actionTd.appendChild(updateBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.style.marginLeft = "8px";
        deleteBtn.onclick = () => deleteRecord(row.id);
        actionTd.appendChild(deleteBtn);

        tr.appendChild(actionTd);
        body.appendChild(tr);
    });
}





function performSearch() {
    const query = document.getElementById("search-bar").value.toLowerCase();

    const filtered = allRows.filter(row =>
        Object.values(row).some(value =>
            value && String(value).toLowerCase().includes(query)
        )
    );

    renderTable(filtered);
}



// 🗂️ Table schema definitions
const tableSchemas = {
    students: ["student_id", "rfid", "first_name", "last_name", "faculty_id"],
    faculty: ["faculty_id", "gmail"],
    attendance: ["attendance_id", "student_id", "reader_id", "status", "timestamp"]
};

function openUpdateForm(docId, data) {
    currentUpdateDocId = docId;
    const form = document.getElementById("update-form");
    form.innerHTML = ""; // Clear existing form fields

    const currentSchema = tableSchemas[currentTable];

    currentSchema.forEach(field => {
        const label = document.createElement("label");
        label.setAttribute("for", `update_${field}`);
        label.textContent = field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

        const input = document.createElement("input");
        input.type = "text";
        input.id = `update_${field}`;
        input.name = field;
        input.required = true;
        input.value = data[field] || "";

        form.appendChild(label);
        form.appendChild(input);
    });

    document.getElementById("update-form-popup").style.display = "block";
}

function closeUpdateForm() {
    currentUpdateDocId = null;
    document.getElementById("update-form-popup").style.display = "none";
}

async function submitUpdate() {
    if (!currentUpdateDocId || !currentTable) {
        alert("Update failed: missing reference.");
        return;
    }

    const form = document.getElementById("update-form");
    const formData = new FormData(form);
    const updateData = {};

    for (let [key, value] of formData.entries()) {
        updateData[key] = value.trim();
    }

    try {
        const ref = docRef(db, currentTable, currentUpdateDocId);  // ✅ Use `docRef` instead of `doc`
        await updateDoc(ref, updateData);
        alert("✅ Record updated successfully.");
        closeUpdateForm();
        fetchTable(currentTable); // Refresh data
    } catch (error) {
        console.error("❌ Update failed:", error);
        alert("❌ Failed to update record. Check the console for details.");
    }
}


async function deleteRecord(docId) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
        // ✅ FIX: Ensure Firestore document reference uses `docRef`
        const ref = docRef(db, currentTable, docId);
        await deleteDoc(ref);
        
        alert("🗑️ Record deleted successfully.");
        fetchTable(currentTable); // Refresh data
    } catch (error) {
        console.error("❌ Deletion failed:", error);
        alert("❌ Failed to delete record. Check console for details.");
    }
}

async function toggleClass() {
    const classButton = document.getElementById("classButton");

    isClassOngoing = !isClassOngoing;
    classButton.textContent = isClassOngoing ? "End Class" : "Start Class";
    classButton.blur();

    if (!isClassOngoing) {
        await endClassAndArchive();
    }

    alert(`📘 Class ${isClassOngoing ? "started" : "ended"}.`);
}


async function handleRFIDScan(rfid) {
    if (!isClassOngoing) {
        alert("❌ Class has not started.");
        return;
    }

    try {
        const studentsRef = collection(db, "students");

        // ✅ Ensure RFID is a string before querying Firestore
        const q = query(studentsRef, where("rfid", "==", rfid.toString()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("❌ RFID not registered to any student.");
            return;
        }

        const studentDoc = querySnapshot.docs[0];
        const studentData = studentDoc.data();

        const instructorFacultyId = localStorage.getItem("faculty_id");

        if (studentData.faculty_id !== instructorFacultyId) {
            alert("❌ This student is not in your class.");
            return;
        }

        const attendanceRef = collection(db, "attendance");
        const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

        const existing = query(
            attendanceRef,
            where("student_id", "==", studentData.student_id),
            where("faculty_id", "==", instructorFacultyId),
            where("timestamp", ">=", new Date(`${today}T00:00:00`)),
            where("timestamp", "<=", new Date(`${today}T23:59:59`))
        );

        const attendanceSnapshot = await getDocs(existing);

        if (!attendanceSnapshot.empty) {
            alert("❌ Student already recorded for today.");
            return;
        }

        // 🔢 Determine the next attendance_id
        const latestQuery = query(attendanceRef, orderBy("attendance_id", "desc"), limit(1));
        const latestSnap = await getDocs(latestQuery);

        let nextId = 1;
        if (!latestSnap.empty) {
            const last = latestSnap.docs[0].data();
            nextId = parseInt(last.attendance_id) + 1;
        }

        // ✅ Log attendance
        await addDoc(attendanceRef, {
            attendance_id: nextId,
            reader_id: "1",
            status: "present",
            student_id: studentData.student_id,
            faculty_id: instructorFacultyId,
            timestamp: new Date()
        });

        alert(`✅ Attendance recorded for ${studentData.first_name} ${studentData.last_name}`);
        if (currentTable === "attendance") {
            fetchTable("attendance");
        }

    } catch (err) {
        console.error("❌ RFID handling error:", err);
        alert("❌ An error occurred while processing RFID.");
    }
}


// ✅ RFID scan handler: build input, trigger on Enter
document.addEventListener("keydown", function (e) {
    const isInputActive = document.activeElement.tagName === "INPUT";
    if (isInputActive) return;

    if (!isClassOngoing) return;

    if (e.key === "Enter") {
        if (rfidBuffer.trim()) {
            handleRFIDScan(rfidBuffer.trim());
            rfidBuffer = "";
        }
    } else if (!isNaN(e.key)) {
        rfidBuffer += e.key;
    }
});

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Opens the signup popup
function signupFaculty() {
    document.getElementById("instructor-signup-popup").style.display = "block";
}

function closeInstructorSignup() {
    document.getElementById("instructor-signup-popup").style.display = "none";
}

// 🔥 Faculty Signup Handler
async function submitInstructor() {
    const emailInput = document.getElementById("signup_faculty_email");
    const email = emailInput?.value.trim();

    if (!email) {
        alert("❌ Gmail is required.");
        return;
    }

    try {
        const facultyRef = collection(db, "faculty");

        // Check if Gmail is already registered
        const existingQuery = query(facultyRef, where("gmail", "==", email));
        const existingSnap = await getDocs(existingQuery);

        if (!existingSnap.empty) {
            alert("❌ This Gmail is already registered as faculty.");
            return;
        }

        // Get latest faculty_id
        const latestQuery = query(facultyRef, orderBy("faculty_id", "desc"), limit(1));
        const latestSnap = await getDocs(latestQuery);

        let nextFacultyId = 1;
        if (!latestSnap.empty) {
            nextFacultyId = parseInt(latestSnap.docs[0].data().faculty_id) + 1;
        }

        // Save to Firestore (not Firebase Auth)
        await addDoc(facultyRef, {
            faculty_id: nextFacultyId,
            gmail: email
        });

        alert("✅ Faculty registered successfully!");

        // Clear input and close popup
        emailInput.value = "";
        closeInstructorSignup();

        // Refresh if faculty table is open
        if (currentTable === "faculty") {
            fetchTable("faculty");
        }
    } catch (error) {
        console.error("❌ Faculty signup error:", error);
        alert("❌ Failed to register faculty. Check console for more info.");
    }
}

async function endClassAndArchive() {
    try {
        const attendanceRef = collection(db, "attendance");
        const snapshot = await getDocs(attendanceRef);

        if (snapshot.empty) {
            alert("⚠️ No attendance data to archive.");
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archiveCollectionName = `attendance_${timestamp}`;

        // ✅ FIX: Ensure we reference the correct collection structure
        const archiveRef = collection(db, "archived_attendance", archiveCollectionName, "records");
        const batch = writeBatch(db);

        snapshot.forEach(snapshotDoc => {
            const data = snapshotDoc.data();

            // ✅ FIX: Ensure doc reference is correct
            const newDocRef = docRef(archiveRef);
            batch.set(newDocRef, data);

            // ✅ Explicitly delete from original attendance collection
            const originalDocRef = docRef(db, "attendance", snapshotDoc.id);
            batch.delete(originalDocRef);
        });

        await batch.commit();

        // ✅ Log the archived sheet into attendance_sheets collection
        await addDoc(collection(db, "attendance_sheets"), {
            sheet_name: archiveCollectionName,
            created_at: new Date()
        });

        alert(`✅ Attendance archived and cleared: ${archiveCollectionName}`);

        // ✅ Refresh UI to reflect the updated attendance
        if (currentTable === "attendance") {
            fetchTable("attendance");
        }

    } catch (error) {
        console.error("❌ Error archiving attendance:", error);
        alert("❌ Failed to archive attendance. See console for details.");
    }
}


async function listArchivedSheets() {
    try {
        const sheetsRef = collection(db, "attendance_sheets");
        const snap = await getDocs(query(sheetsRef, orderBy("created_at", "desc")));

        if (snap.empty) {
            alert("⚠️ No archived sheets found.");
            return;
        }

        const sheetNames = snap.docs.map(doc => doc.data().sheet_name);
        openArchivedSheetsPopup(sheetNames);
    } catch (error) {
        console.error("❌ Error listing archived sheets:", error);
        alert("❌ Could not retrieve archived attendance sheets.");
    }
}



document.getElementById("viewAttendanceButton").addEventListener("click", listArchivedSheets);

function openArchivedSheetsPopup(sheetList) {
    const select = document.getElementById("archived-sheet-select");
    select.innerHTML = ""; // Clear previous list

    sheetList.forEach(sheetName => {
        const option = document.createElement("option");
        option.value = sheetName;
        option.textContent = sheetName;
        select.appendChild(option);
    });

    document.getElementById("archived-sheets-popup").style.display = "block";
}

function closeArchivedSheetsPopup() {
    document.getElementById("archived-sheets-popup").style.display = "none";
}

async function viewSelectedArchivedSheet() {
    const selected = document.getElementById("archived-sheet-select").value;
    if (!selected) {
        alert("❌ Please select a sheet.");
        return;
    }

    closeArchivedSheetsPopup();
    setCurrentTable(selected);
    fetchTable(selected);
}


window.listArchivedSheets = listArchivedSheets;
window.openArchivedSheetsPopup = openArchivedSheetsPopup;
window.closeArchivedSheetsPopup = closeArchivedSheetsPopup;
window.viewSelectedArchivedSheet = viewSelectedArchivedSheet;
window.signupFaculty = signupFaculty;
window.closeInstructorSignup = closeInstructorSignup;
window.submitInstructor = submitInstructor;
window.toggleClass = toggleClass;
window.handleRFIDScan = handleRFIDScan;
window.deleteRecord = deleteRecord;
window.openUpdateForm = openUpdateForm;
window.closeUpdateForm = closeUpdateForm;
window.submitUpdate = submitUpdate;
window.setCurrentTable = setCurrentTable;
window.fetchTable = fetchTable;
window.performSearch = performSearch;
window.submitStudent = submitStudent;
window.enforceNumericInput = enforceNumericInput;
window.logoutInstructor = logoutInstructor;
window.loginWithGoogle = loginWithGoogle;
window.openStudentForm = openStudentForm;
window.closeStudentForm = closeStudentForm;
