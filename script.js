document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const addTaskBtn = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const taskCount = document.getElementById('task-count');
    const notificationPortal = document.getElementById('notification-portal');

    let tasks = JSON.parse(localStorage.getItem('tasks_v2')) || [];

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;

    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission();
    }

    function saveTasks() {
        localStorage.setItem('tasks_v2', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        taskList.innerHTML = '';
        taskCount.textContent = tasks.length;

        if (tasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';

            // Sort by date and time
            tasks.sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`);
                const dateTimeB = new Date(`${b.date}T${b.time}`);
                return dateTimeA - dateTimeB;
            });

            tasks.forEach((task, index) => {
                const item = document.createElement('div');
                item.className = 'task-item';
                item.innerHTML = `
                    <div class="task-info">
                        <span class="task-name">${task.name}</span>
                        <div class="task-meta">
                            <span>📅 ${formatDate(task.date)}</span>
                            <span>⏰ ${formatTime(task.time)}</span>
                        </div>
                    </div>
                    <button class="btn-delete" onclick="deleteTask(${index})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                `;
                taskList.appendChild(item);
            });
        }
    }

    window.deleteTask = (index) => {
        tasks.splice(index, 1);
        saveTasks();
    };

    function formatDate(dateStr) {
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    }

    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        let h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${minutes} ${ampm}`;
    }

    addTaskBtn.addEventListener('click', () => {
        const name = taskInput.value.trim();
        const date = dateInput.value;
        const time = timeInput.value;

        if (name && date && time) {
            const taskDateTime = new Date(`${date}T${time}`);
            if (taskDateTime < new Date()) {
                alert("You can't set a reminder for the past!");
                return;
            }

            tasks.push({
                name,
                date,
                time,
                notified: false,
                id: Date.now()
            });

            taskInput.value = '';
            saveTasks();

            // Success feedback
            const originalText = addTaskBtn.innerHTML;
            addTaskBtn.innerHTML = '✨ Added!';
            addTaskBtn.style.background = '#10b981';
            setTimeout(() => {
                addTaskBtn.innerHTML = originalText;
                addTaskBtn.style.background = '';
            }, 1000);
        } else {
            alert('Please fill in all fields!');
        }
    });

    // Scheduler Core Logic
    setInterval(() => {
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        tasks.forEach(task => {
            if (!task.notified && task.date === currentDate && task.time === currentTime) {
                showVisualNotification(task);
                task.notified = true;
                saveTasks();
            }
        });
    }, 1000);

    function showVisualNotification(task) {
        // Create Toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-icon">🔔</div>
            <div class="toast-content">
                <h4>Task Reminder</h4>
                <p>${task.name}</p>
            </div>
        `;
        notificationPortal.appendChild(toast);

        // Sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => { });

        // System Notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Taskly Reminder', {
                body: task.name,
                icon: 'https://cdn-icons-png.flaticon.com/512/311/311024.png'
            });
        }

        // Auto remove toast
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 500);
        }, 8000);
    }

    renderTasks();
});
