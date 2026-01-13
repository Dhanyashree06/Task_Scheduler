import time
import datetime
import json
import os
from plyer import notification
import threading

TASKS_FILE = "tasks.json"

def load_tasks():
    if os.path.exists(TASKS_FILE):
        with open(TASKS_FILE, "r") as f:
            return json.load(f)
    return []

def save_tasks(tasks):
    with open(TASKS_FILE, "w") as f:
        json.dump(tasks, f, indent=4)

def notify_user(task_name):
    notification.notify(
        title="🔔 Taskly Reminder",
        message=f"Time for: {task_name}",
        app_name="Taskly",
        timeout=15
    )

def background_scheduler():
    """Checks for due tasks every 30 seconds."""
    while True:
        tasks = load_tasks()
        now = datetime.datetime.now()
        current_time_str = now.strftime("%Y-%m-%d %H:%M")
        
        updated = False
        for task in tasks:
            if not task.get("completed"):
                task_time = f"{task['date']} {task['time']}"
                if current_time_str >= task_time:
                    notify_user(task['name'])
                    task["completed"] = True
                    updated = True
        
        if updated:
            save_tasks(tasks)
        
        time.sleep(30)

def add_task():
    print("\n--- Add New Task ---")
    name = input("Task Name: ")
    date = input("Date (YYYY-MM-DD, e.g., 2026-01-13): ")
    time_val = input("Time (HH:MM, 24h format, e.g., 17:30): ")

    try:
        # Validate format
        datetime.datetime.strptime(f"{date} {time_val}", "%Y-%m-%d %H:%M")
        
        tasks = load_tasks()
        tasks.append({
            "name": name,
            "date": date,
            "time": time_val,
            "completed": False
        })
        save_tasks(tasks)
        print(f"✅ Success! Reminder set for {name} at {time_val}.")
    except ValueError:
        print("❌ Invalid format! Use YYYY-MM-DD and HH:MM.")

def main():
    # Start the scheduler in a separate background thread
    daemon = threading.Thread(target=background_scheduler, daemon=True)
    daemon.start()

    print("=== Taskly Background Service ===")
    print("This script will notify you even if the browser is closed.")
    
    while True:
        print("\n1. Add Task")
        print("2. View All Tasks")
        print("3. Exit (Keeps scheduler running in current session)")
        choice = input("Select an option: ")

        if choice == '1':
            add_task()
        elif choice == '2':
            tasks = load_tasks()
            print("\n--- Current Tasks ---")
            for t in tasks:
                status = "✅ Done" if t['completed'] else "⏳ Pending"
                print(f"[{status}] {t['name']} - {t['date']} {t['time']}")
        elif choice == '3':
            print("Running in background... (Press Ctrl+C to stop entirely)")
            while True: time.sleep(100)
        else:
            print("Invalid choice.")

if __name__ == "__main__":
    main()
