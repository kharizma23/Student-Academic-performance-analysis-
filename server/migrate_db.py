import sqlite3

db_path = "student_platform.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

commands = [
    "ALTER TABLE students ADD COLUMN xp_points INTEGER DEFAULT 0",
    "ALTER TABLE students ADD COLUMN streak_count INTEGER DEFAULT 0",
    "ALTER TABLE students ADD COLUMN last_completion_date DATETIME",
    "ALTER TABLE todos ADD COLUMN status VARCHAR DEFAULT 'Not Started'",
    "ALTER TABLE todos ADD COLUMN difficulty VARCHAR DEFAULT 'Medium'",
    "ALTER TABLE todos ADD COLUMN start_time DATETIME",
    "ALTER TABLE todos ADD COLUMN time_spent INTEGER DEFAULT 0",
]

for cmd in commands:
    try:
        c.execute(cmd)
        print(f"Executed: {cmd}")
    except Exception as e:
        print(f"Skipped {cmd}: {e}")

conn.commit()
conn.close()
print("Migration completed.")
