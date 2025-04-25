// DOM Elements
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const closeModal = document.getElementById('closeModal');
const taskForm = document.getElementById('taskForm');
const columns = document.querySelectorAll('.column');

// State
let tasks = JSON.parse(localStorage.getItem('teamTasks')) || [];
let draggedTask = null;
const teamMembers = ['Yashwant', 'Harsh', 'Rishabh', 'Rajat', 'Krishna','JayPrakash','Sourav'];

// UI Functions
function renderTasks() {
    document.getElementById('todoTasks').innerHTML = '';
    document.getElementById('inProgressTasks').innerHTML = '';
    document.getElementById('doneTasks').innerHTML = '';

    if (tasks.length === 0) {
        const message = document.createElement('div');
        message.className = 'no-tasks-message';
        message.textContent = 'No tasks yet. Create one by clicking the "Add Task" button!';
        document.getElementById('todoTasks').appendChild(message);
        return;
    }

    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);

        if (task.status === 'Todo') {
            document.getElementById('todoTasks').appendChild(taskElement);
        } else if (task.status === 'In Progress') {
            document.getElementById('inProgressTasks').appendChild(taskElement);
        } else if (task.status === 'Done') {
            document.getElementById('doneTasks').appendChild(taskElement);
        }
    });

    updateTaskCounts();
}

function createTaskElement(task, index) {
    const div = document.createElement('div');
    div.className = 'task-card';
    div.draggable = true;
    div.dataset.taskIndex = index;
    
    div.innerHTML = `
        <h3 class="${task.status === 'Done' ? 'completed' : ''}">${task.title}</h3>
        <p class="${task.status === 'Done' ? 'completed' : ''}">${task.description}</p>
        <div class="task-footer">
            <span class="assignee">Assigned to: ${task.assignee || 'Unassigned'}</span>
            <button onclick="moveTask(${index}, 'In Progress')" class="move-btn">Move to In Progress</button>
            <button onclick="moveTask(${index}, 'Done')" class="move-btn">Move to Done</button>
            <button onclick="toggleTaskStatus(${index})" class="status-btn">
                ${task.status === 'Done' ? 'Undo' : 'Complete'}
            </button>
            <button onclick="deleteTask(${index})" class="delete-btn">Delete</button>
        </div>
    `;

    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);

    return div;
}

function moveTask(index, newStatus) {
    tasks[index].status = newStatus;
    saveTasks();
    renderTasks();
}

function toggleTaskStatus(index) {
    tasks[index].status = tasks[index].status === 'Done' ? 'Todo' : 'Done';
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

function updateTaskCounts() {
    const statuses = ['Todo', 'In Progress', 'Done'];
    statuses.forEach(status => {
        const count = tasks.filter(task => task.status === status).length;
        const columnTitle = document.querySelector(`[data-status="${status}"] h2`);
        if (columnTitle) {
            columnTitle.textContent = `${status} (${count})`;
        }
    });
}

function saveTasks() {
    localStorage.setItem('teamTasks', JSON.stringify(tasks));
}

function openModal() {
    taskModal.style.display = 'flex';
    const assigneeSelect = document.getElementById('assignee');
    assigneeSelect.innerHTML = `
        <option value="">Select Team Member</option>
        <option value="random">Random Assignment</option>
        ${teamMembers.map(member => `<option value="${member}">${member}</option>`).join('')}
    `;
}

function closeModalHandler() {
    taskModal.style.display = 'none';
    taskForm.reset();
}

// Drag and Drop Functions
function handleDragStart(e) {
    draggedTask = e.target;
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedTask = null;
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    if (!draggedTask) return;

    const column = e.target.closest('.column');
    if (!column) return;

    const newStatus = column.dataset.status;
    const taskIndex = parseInt(draggedTask.dataset.taskIndex);

    tasks[taskIndex].status = newStatus;
    saveTasks();
    renderTasks();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', renderTasks);
addTaskBtn.addEventListener('click', openModal);
closeModal.addEventListener('click', closeModalHandler);

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const assigneeSelect = document.getElementById('assignee');
    let assignee = assigneeSelect.value;
    if (assignee === 'random') {
        assignee = teamMembers[Math.floor(Math.random() * teamMembers.length)];
    }

    const newTask = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        assignee: assignee,
        status: 'Todo' 
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    closeModalHandler();
});

columns.forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('drop', handleDrop);
});

window.addEventListener('click', (e) => {
    if (e.target === taskModal) {
        closeModalHandler();
    }
});
