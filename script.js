/* ========================================= */
/* DOM ELEMENTS */
/* ========================================= */
const modalTitle = document.getElementById("modal-title");
// Navigation
const navButtons = document.querySelectorAll(".nav-button");
const pages = document.querySelectorAll(".page");

// Page Heading
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");

// Theme
const themeToggle = document.getElementById("theme-toggle");

// Modal
const taskModal = document.getElementById("task-modal");
const openTaskModal = document.getElementById("open-task-modal");
const newTaskBtn = document.getElementById("new-task-btn");
const closeModal = document.getElementById("close-modal");

// Task Form
const saveTask = document.getElementById("save-task");
const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskStatus = document.getElementById("task-status");


// Task Containers
const backlog = document.getElementById("backlog");
const progress = document.getElementById("progress");
const review = document.getElementById("review");
const done = document.getElementById("done");

// Profile
const profileName = document.getElementById("profile-name");
const profileRole = document.getElementById("profile-role");
const settingsName = document.getElementById("settings-name");
const settingsRole = document.getElementById("settings-role");
const saveProfile = document.getElementById("save-profile");

// Analytics
const analyticsTotal = document.getElementById("analytics-total");
const analyticsCompleted = document.getElementById("analytics-completed");
const analyticsProgress = document.getElementById("analytics-progress");
const analyticsPending = document.getElementById("analytics-pending");
const completionBar = document.getElementById("completion-bar");
const completionPercent = document.getElementById("completion-percent");
const productivityScore = document.getElementById("productivity-score");

// Dashboard lists
const recentTaskList = document.getElementById("recent-task-list");
const deadlineList = document.getElementById("deadline-list");

// Clear data
const clearData = document.getElementById("clear-data");

// Dashboard
const totalTasks = document.getElementById("total-tasks");
const completedTasks = document.getElementById("completed-tasks");
const progressTasks = document.getElementById("progress-tasks");
const pendingTasks = document.getElementById("pending-tasks");
/* ========================================= */
/* APP DATA */
/* ========================================= */

let tasks = [];

let draggedTaskId = null;
let currentTheme = "light";
let editTaskId = null;
/* ========================================= */
/* PAGE SWITCHING */
/* ========================================= */

const pageInfo = {
    dashboard: {
        title: "Dashboard",
        subtitle: "Welcome back! Let's stay productive."
    },
    board: {
        title: "Board",
        subtitle: "Manage your workflow using Kanban."
    },
    analytics: {
        title: "Analytics",
        subtitle: "Monitor your productivity."
    },
    settings: {
        title: "Settings",
        subtitle: "Customize your Flowva workspace."
    }
};

navButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Remove active class from all sidebar buttons
        navButtons.forEach(btn => btn.classList.remove("active"));

        // Activate clicked button
        button.classList.add("active");

        // Hide all pages
        pages.forEach(page => page.classList.remove("active"));

        // Get page id from data-page
        const pageId = button.dataset.page;

        // Show selected page
        document.getElementById(pageId).classList.add("active");

        // Update navbar title
        pageTitle.textContent = pageInfo[pageId].title;
        pageSubtitle.textContent = pageInfo[pageId].subtitle;

    });

});
/* ========================================= */
/* TASK MODAL */
/* ========================================= */

function openModal(){

    taskModal.style.display = "flex";

}

function closeTaskModal(){

    taskModal.style.display = "none";

}

// Navbar Button
newTaskBtn.addEventListener("click", openModal);

// Board Button
openTaskModal.addEventListener("click", openModal);

// Close Button
closeModal.addEventListener("click", closeTaskModal);

// Click Outside Modal
window.addEventListener("click",(event)=>{

    if(event.target === taskModal){

        closeTaskModal();

    }

});
/* ========================================= */
/* ADD TASK */
/* ========================================= */

saveTask.addEventListener("click", () => {

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const status = taskStatus.value;

    // Validation
    if(title === ""){

        alert("Please enter task title.");

        return;

    }

    // Create Task Object
    const task = {

        id: Date.now(),

        title,

        description,

        status

    };

    // Save in Array
    if(editTaskId === null){

    tasks.push(task);

}
else{

    const index = tasks.findIndex(task => task.id === editTaskId);

    tasks[index] = {

        id: editTaskId,

        title,

        description,

        status

    };

    editTaskId = null;

}

    // Render Tasks
    renderTasks();

    // Save to Local Storage
    saveToLocalStorage();

    // Clear Form
    taskTitle.value = "";

    taskDescription.value = "";

    taskStatus.value = "backlog";

    modalTitle.textContent = "Add New Task";

   editTaskId = null;

    // Close Modal
    closeTaskModal();

});
/* ========================================= */
/* RENDER TASKS */
/* ========================================= */

function renderTasks(){

    backlog.innerHTML = "";

    progress.innerHTML = "";

    review.innerHTML = "";

    done.innerHTML = "";

    tasks.forEach(task=>{

        const card = document.createElement("div");

        card.className = "task-card";
        card.draggable = true;
        card.id = task.id;

       card.innerHTML = `
       <div class="task-header">

    <h3>${task.title}</h3>

    <div class="task-actions">

        <button class="edit-task" data-id="${task.id}">
            <i class="fa-solid fa-pen"></i>
        </button>

        <button class="delete-task" data-id="${task.id}">
            <i class="fa-solid fa-trash"></i>
        </button>

    </div>

</div>
    <p>${task.description}</p>

`;

card.addEventListener("dragstart", (e) => {
    draggedTaskId = card.id;
    e.dataTransfer.setData("text/plain", card.id);
});

        if(task.status === "backlog"){

            backlog.appendChild(card);

        }

        else if(task.status === "progress"){

            progress.appendChild(card);

        }

        else if(task.status === "review"){

            review.appendChild(card);

        }

        else{

            done.appendChild(card);

        }

    });

    // Delete Task

const deleteButtons = document.querySelectorAll(".delete-task");

deleteButtons.forEach(button => {

    button.addEventListener("click", () => {

        const taskId = Number(button.dataset.id);

        tasks = tasks.filter(task => task.id !== taskId);

        renderTasks();

        saveToLocalStorage();

    });

});
// Edit Task

const editButtons = document.querySelectorAll(".edit-task");

editButtons.forEach(button => {

    button.addEventListener("click", () => {

        const taskId = Number(button.dataset.id);

        const task = tasks.find(task => task.id === taskId);

        editTaskId = taskId;

        taskTitle.value = task.title;

        taskDescription.value = task.description;

        taskStatus.value = task.status;

        modalTitle.textContent = "Edit Task";

        openModal();

    });

});

    updateDashboard();

}
/* ========================================= */
/* DASHBOARD */
/* ========================================= */

function updateDashboard(){

    const total = tasks.length;
    const done = tasks.filter(t => t.status === "done").length;
    const inProgress = tasks.filter(t => t.status === "progress").length;
    const backlog = tasks.filter(t => t.status === "backlog").length;
    const review = tasks.filter(t => t.status === "review").length;
    const completion = total ? Math.round((done / total) * 100) : 0;

    // Dashboard stats
    totalTasks.textContent = total;
    completedTasks.textContent = done;
    progressTasks.textContent = inProgress;
    pendingTasks.textContent = backlog;

    // Board column counts
    document.getElementById("backlog-count").textContent = backlog;
    document.getElementById("progress-count").textContent = inProgress;
    document.getElementById("review-count").textContent = review;
    document.getElementById("done-count").textContent = done;

    // Analytics
    analyticsTotal.textContent = total;
    analyticsCompleted.textContent = done;
    analyticsProgress.textContent = inProgress;
    analyticsPending.textContent = backlog;
    completionBar.style.width = completion + "%";
    completionPercent.textContent = completion + "%";
    productivityScore.textContent = completion + "%";

    // Recent tasks (last 5)
    const recent = [...tasks].reverse().slice(0, 5);
    if (recent.length) {
        recentTaskList.innerHTML = recent.map(t =>
            `<div class="recent-task"><span>${t.title}</span> <small>${t.status}</small></div>`
        ).join("");
    } else {
        recentTaskList.innerHTML = '<p class="empty-message">No recent tasks yet.</p>';
    }

}
/* ========================================= */
/* LOCAL STORAGE */
/* ========================================= */

function saveToLocalStorage(){

    localStorage.setItem("tasks",JSON.stringify(tasks));

}

function loadTasks(){

    const savedTasks = localStorage.getItem("tasks");

    if(savedTasks){

        tasks = JSON.parse(savedTasks);

        renderTasks();

    }

}

try { loadTasks(); } catch(e) {}

// Clear all data
clearData.addEventListener("click", () => {
    if (confirm("Delete all tasks?")) {
        tasks = [];
        renderTasks();
        saveToLocalStorage();
    }
});

// Theme toggle

function setTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark-theme");
        document.querySelectorAll("#theme-toggle i, #toggle-theme-btn i").forEach(el => {
            el.className = "fa-solid fa-sun";
        });
    } else {
        document.body.classList.remove("dark-theme");
        document.querySelectorAll("#theme-toggle i, #toggle-theme-btn i").forEach(el => {
            el.className = "fa-solid fa-moon";
        });
    }
    currentTheme = theme;
    localStorage.setItem("theme", theme);
}

document.getElementById("theme-toggle").addEventListener("click", () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
});

document.getElementById("toggle-theme-btn").addEventListener("click", () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
});

// Profile save

function loadProfile() {
    const savedName = localStorage.getItem("profileName");
    const savedRole = localStorage.getItem("profileRole");
    if (savedName) {
        profileName.textContent = savedName;
        settingsName.value = savedName;
    }
    if (savedRole) {
        profileRole.textContent = savedRole;
        settingsRole.value = savedRole;
    }
}

saveProfile.addEventListener("click", () => {
    const name = settingsName.value.trim() || "Guest";
    const role = settingsRole.value;
    profileName.textContent = name;
    profileRole.textContent = role;
    localStorage.setItem("profileName", name);
    localStorage.setItem("profileRole", role);
});

loadProfile();

// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme) setTheme(savedTheme);

// Drag & drop — allow drop on entire column area

document.addEventListener("dragover", e => {
    if (e.target.closest(".board-column")) {
        e.preventDefault();
    }
});

document.addEventListener("drop", e => {
    const column = e.target.closest(".board-column");
    if (!column) return;
    e.preventDefault();

    if (!draggedTaskId) return;

    const card = document.getElementById(draggedTaskId);
    if (!card) return;

    // Find the task list inside the column and move card there
    const taskList = column.querySelector(".task-list");
    if (!taskList) return;

    taskList.appendChild(card);

    const task = tasks.find(t => t.id === Number(draggedTaskId));
    if (task) task.status = taskList.id;

    saveToLocalStorage();
    updateDashboard();
});