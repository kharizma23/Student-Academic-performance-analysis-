import sqlite3
import uuid
import random
from datetime import datetime, timedelta

def seed_feedback():
    conn = sqlite3.connect('student_platform.db')
    cursor = conn.cursor()

    # Get all students
    cursor.execute("SELECT id FROM students")
    students = [row[0] for row in cursor.fetchall()]

    # Get all faculty (staff) - use user_id to match users table
    cursor.execute("SELECT user_id FROM staff")
    faculty = [row[0] for row in cursor.fetchall()]

    if not students or not faculty:
        print("Error: No students or faculty found in database.")
        return

    feedback_remarks = [
        "Excellent progress in DSA. Keep focusing on graph algorithms.",
        "Good understanding of core Java concepts. Need to improve on multithreading.",
        "Great work on the web project. The UI is very intuitive.",
        "Consistently performing well in Python assessments.",
        "Logical reasoning skills are sharp. Try participating in more coding contests.",
        "Demonstrates strong leadership qualities during group tasks.",
        "Attention to detail in system design is commendable.",
        "Participation in class discussions is very helpful for peers.",
        "Technical clarity is high, but debugging speed can be improved.",
        "Excellent ethical awareness and collaborative spirit."
    ]

    # Delete existing feedback to avoid mess
    cursor.execute("DELETE FROM feedback")

    for student_id in students:
        # Generate 6-7 entries
        num_entries = random.randint(6, 7)
        for _ in range(num_entries):
            feedback_id = str(uuid.uuid4())
            faculty_id = random.choice(faculty)
            remarks = random.choice(feedback_remarks)
            rating = round(random.uniform(7.0, 9.5), 1)
            created_at = (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat()

            # Insert into feedback
            # Feedback table schema: id, student_id, faculty_id, q1...q25, detailed_remarks, overall_rating, created_at
            # Using 0.0 for all q1-q25 for simplicity in seeding, or random values
            q_values = [round(random.uniform(6.0, 10.0), 1) for _ in range(25)]
            
            insert_query = f"""
            INSERT INTO feedback (
                id, student_id, faculty_id, 
                q1_technical_clarity, q2_problem_solving, q3_code_efficiency, q4_algorithm_knowledge, 
                q5_debugging_skills, q6_concept_application, q7_mathematical_aptitude, q8_system_design, 
                q9_documentation_quality, q10_test_coverage_awareness, q11_presentation_skills, q12_collaborative_spirit, 
                q13_adaptability, q14_curiosity_level, q15_deadline_discipline, q16_resourcefulness, 
                q17_critical_thinking, q18_puncuality, q19_peer_mentoring, q20_leadership_potential, 
                q21_ethical_awareness, q22_feedback_receptivity, q23_passion_for_field, q24_originality_of_ideas, 
                q25_consistency_index, detailed_remarks, overall_rating, created_at
            ) VALUES (?, ?, ?, {"?, " * 24} ?, ?, ?, ?)
            """
            
            cursor.execute(insert_query, (
                feedback_id, student_id, faculty_id,
                *q_values,
                remarks, rating, created_at
            ))

    conn.commit()
    conn.close()
    print(f"Successfully seeded feedback for {len(students)} students.")

if __name__ == "__main__":
    seed_feedback()
