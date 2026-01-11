import time
import datetime
from plyer import notification

def remind(task_name):
    notification.notify(
        title="🔔 Taskly Reminder",
        message=f"Time for: {task_name}",
        app_name="Taskly",
        timeout=20
    )
    print(f"\n[!] REMINDER SENT: {task_name}")

def start_app():
    print("=== Taskly Specific Day Reminder ===")
    
    task = input("Enna task summary? (What task?): ")
    date_str = input("Endha date-la remind pannanum? (DD-MM-YYYY): ")
    time_str = input("Endha time-la? (HH:MM in 24h format): ")

    try:
        # Parse the input date and time
        target_datetime = datetime.datetime.strptime(f"{date_str} {time_str}", "%d-%m-%Y %H:%M")
        
        if target_datetime < datetime.datetime.now():
            print("\n❌ Error: Idhu mudhinja kaalam (The time you entered has already passed!)")
            return

        print(f"\n✅ Reminder set for: {task}")
        print(f"📅 On: {target_datetime.strftime('%B %d, %Y at %I:%M %p')}")
        print("Indha window-va close pannaadhinga (Keep this window open).")

        while True:
            now = datetime.datetime.now()
            if now >= target_datetime:
                remind(task)
                break
            
            # Show a countdown pulse in the terminal
            remaining = target_datetime - now
            print(f"\rWaiting... Time left: {str(remaining).split('.')[0]}", end="", flush=True)
            
            time.sleep(1)
            
        print("\n\nTask completed! Press Enter to exit.")
        input()

    except ValueError:
        print("\n❌ Error: Formate thappu! (Wrong format!)")
        print("Date: DD-MM-YYYY (eg: 12-01-2026)")
        print("Time: HH:MM (eg: 22:30)")

if __name__ == "__main__":
    start_app()
