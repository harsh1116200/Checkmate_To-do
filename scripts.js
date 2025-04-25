document.addEventListener('DOMContentLoaded', () => {
    let selectedPriority = ''; // Initialize priority variable

    const taskList = document.getElementById('taskList');

    // Fetch and display tasks from the backend
    const loadTasks = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/todos');
            const tasks = await response.json();
            tasks.forEach(task => displayTask(task));
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    // Display a task in the task list
    const displayTask = (task) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';

        const taskContent = document.createElement('div');
        taskContent.innerHTML = `<strong>${task.title}</strong><p>${task.desc}</p>`;
        taskItem.appendChild(taskContent);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = () => deleteTask(task._id, taskItem);
        taskItem.appendChild(deleteButton);

        taskList.appendChild(taskItem);
    };

    // Add a new task
    window.addTask = async function () {
        const taskName = document.getElementById("taskName").value.trim();
        const taskDescription = document.getElementById("taskDescription").value.trim();
    
        if (!taskName) {
            alert("Task name is required!");
            return;
        }
        // if (!selectedPriority) {
        //     alert("Please select a priority for the task!");
        //     return;
        // }
        const newTask = {
            title: taskName,
            desc: taskDescription,
            priority: selectedPriority, // Add priority here
            completed: false,
        };
    
        try {
            const response = await fetch("http://localhost:3000/api/todos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask),
            });
    
            if (!response.ok) {
                const errorMsg = await response.json();
                console.error("Error adding task:", errorMsg);
                alert("Failed to add task: " + errorMsg.message);
                return;
            }
    
            const task = await response.json();
            displayTask(task); // Add the new task to the UI
            clearForm();
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };
// Changes

    // Clear the form inputs
    window.clearForm = function() {
        document.getElementById('taskName').value = '';
        document.getElementById('taskDescription').value = '';
        selectedPriority = ''; // Reset priority
    };

    // Delete task from both UI and backend
    const deleteTask = async (taskId, taskElement) => {
        try {
            const response = await fetch(`http://localhost:3000/api/todos/${taskId}`, {
                method: 'DELETE',
            });
    
            if (response.ok) {
                taskElement.remove(); // Remove the task from UI
            } else {
                const errorData = await response.json();
                console.error('Error deleting task:', errorData.message);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };
    
    // changes

    // Load tasks when the page is loaded
    loadTasks();
});

function filterTasks() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const tasks = document.querySelectorAll('.task-item');

    tasks.forEach(task => {
        const taskName = task.querySelector('strong').textContent.toLowerCase();
        const taskDescription = task.querySelector('p').textContent.toLowerCase();

        if (taskName.includes(searchInput) || taskDescription.includes(searchInput)) {
            task.style.display = 'block';
        } else {
            task.style.display = 'none';
        }
    });
}

// Function to hide all content sections
function hideAllSections() {
    document.getElementById('calendarContainer').style.display = 'none';
    document.getElementById('priorityOptions').style.display = 'none';
    document.getElementById('reminderContainer').style.display = 'none';
    
    // Remove 'active' class from all buttons
    document.getElementById('toggleCalendarBtn').classList.remove('active');
    document.getElementById('togglePriorityBtn').classList.remove('active');
    document.getElementById('toggleReminderBtn').classList.remove('active');
}

// Toggle Today Button and Calendar
document.getElementById('toggleCalendarBtn').addEventListener('click', function() {
    const calendarContainer = document.getElementById('calendarContainer');
    if (calendarContainer.style.display === 'none') {
        hideAllSections(); // Hide other sections
        calendarContainer.style.display = 'block';
        this.classList.add('active');
    } else {
        calendarContainer.style.display = 'none';
        this.classList.remove('active');
    }
});

// Toggle Priority Button and Options
document.getElementById('togglePriorityBtn').addEventListener('click', function() {
    const priorityOptions = document.getElementById('priorityOptions');
    if (priorityOptions.style.display === 'none') {
        hideAllSections(); // Hide other sections
        priorityOptions.style.display = 'block';
        this.classList.add('active');
    } else {
        priorityOptions.style.display = 'none';
        this.classList.remove('active');
    }
});

// Handle Priority Selection
document.querySelectorAll('.priority-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        selectedPriority = this.textContent.toLowerCase(); // Save the priority selection
        alert(`Priority set to: ${selectedPriority}`); // Show alert with selected priority
    });
});
//Filter task as per priority
function filterTasks(priority) {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const tasks = document.querySelectorAll('.task-item');

    tasks.forEach(task => {
        const taskName = task.querySelector('strong').textContent.toLowerCase();
        const taskDescription = task.querySelector('p').textContent.toLowerCase();
        const taskPriority = task.getAttribute('data-priority') ? task.getAttribute('data-priority').toLowerCase() : null; // Get priority from data attribute

        if ((taskName.includes(searchInput) || taskDescription.includes(searchInput)) &&
            (taskPriority === priority || priority === 'all' || !priority)) {
            task.style.display = 'block';
        } else {
            task.style.display = 'none';
        }
    });
}


// Toggle Reminders Button and Reminder Input
document.getElementById('toggleReminderBtn').addEventListener('click', function() {
    const reminderContainer = document.getElementById('reminderContainer');
    if (reminderContainer.style.display === 'none') {
        hideAllSections(); // Hide other sections
        reminderContainer.style.display = 'block';
        this.classList.add('active');
    } else {
        reminderContainer.style.display = 'none';
        this.classList.remove('active');
    }
});

// Handle Reminder Date Selection
document.getElementById('reminderDate').addEventListener('change', function() {
    alert(`Reminder set for: ${this.value}`);
});

// ......
async function assignRandomTask() {
    try {
        // Fetch available tasks
        const tasksResponse = await fetch("http://localhost:3000/api/assign-task");
        const tasks = await tasksResponse.json();

        if (!tasks.length) {
            alert("No tasks available.");
            return;
        }

        // Pick a random task
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)];

        // Make API call to assign task
        const response = await fetch("http://localhost:3000/api/assign-task", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId: randomTask._id }),
        });
// Log the content-type and body of the response to debug
const contentType = response.headers.get('Content-Type');
console.log('Response content type:', contentType);

if (!response.ok) {
    const errorMsg = await response.text();
    console.error('Error response body:', errorMsg);
    alert(`Failed to assign task. Server returned: ${errorMsg}`);
    return;
}

        const assignedTask = await response.json();
        alert(`Task '${assignedTask.title}' assigned to ${assignedTask.assignedTo.name}`);

        fetchTeamTasks(); // Refresh team task list
    } catch (error) {
        console.error("Error assigning task:", error);
        alert("Failed to assign task. Check console for details.");
    }
}
