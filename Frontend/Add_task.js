// DOM Elements
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const closeModal = document.getElementById('closeModal');
const taskForm = document.getElementById('taskForm');
const personalTasksContainer = document.getElementById('personalTasks');

// Load tasks from Local Storage
let tasks = JSON.parse(localStorage.getItem('personalTasks')) || [];

// UI Functions
function renderTasks() {
    personalTasksContainer.innerHTML = '';

    if (tasks.length === 0) {
        const message = document.createElement('div');
        message.className = 'no-tasks-message';
        message.textContent = 'No personal tasks yet. Start your learning journey!';
        personalTasksContainer.appendChild(message);
        return;
    }

    // Sort tasks by deadline
    tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        personalTasksContainer.appendChild(taskElement);
    });
}

// Create Task Element
function createTaskElement(task, index) {
    const div = document.createElement('div');
    div.className = `task-card personal-task ${task.status === 'Done' ? 'completed' : ''}`;

    const deadline = new Date(task.deadline).toLocaleDateString();
    const titleClass = task.status === 'Done' ? 'completed' : '';

    div.innerHTML = `
        <h3 class="${titleClass}">${task.title}</h3>
        <p class="${titleClass}">${task.description}</p>
        <div class="task-footer">
            <span class="deadline">Due: ${deadline}</span>
            <button onclick="toggleTaskStatus(${index})" class="status-btn">
                ${task.status === 'Done' ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <button onclick="deleteTask(${index})" class="delete-btn">Delete</button>
        </div>
    `;

    return div;
}

// Add New Task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const deadline = document.getElementById('deadline').value;

    if (!title || !description || !deadline) {
        showNotification('All fields are required!', 'error');
        return;
    }

    const newTask = {
        title,
        description,
        deadline,
        status: 'Todo'
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    showNotification('Task added successfully!', 'success');
    closeModalHandler();
});

// Toggle Task Status
function toggleTaskStatus(index) {
    tasks[index].status = tasks[index].status === 'Done' ? 'Todo' : 'Done';
    saveTasks();
    renderTasks();
}

// Delete Task
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
    showNotification('Task deleted!', 'success');
}

// Save to Local Storage
function saveTasks() {
    localStorage.setItem('personalTasks', JSON.stringify(tasks));
}

// Helper Functions
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Modal Functions
function openModal() {
    taskModal.style.display = 'flex';
    document.getElementById('deadline').min = new Date().toISOString().split('T')[0];
}

function closeModalHandler() {
    taskModal.style.display = 'none';
    taskForm.reset();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', renderTasks);
addTaskBtn.addEventListener('click', openModal);
closeModal.addEventListener('click', closeModalHandler);
window.addEventListener('click', (e) => {
    if (e.target === taskModal) {
        closeModalHandler();
    }
});
