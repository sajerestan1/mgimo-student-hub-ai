#!/usr/bin/env python3
"""Black-box acceptance tests for the StudentLife PHP/MySQL application."""
import http.cookiejar
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import date, timedelta
from pathlib import Path
import pymysql

BASE = os.environ.get("STUDENTLIFE_TEST_URL", "http://127.0.0.1:8080")
TEST_SESSION_DATE = (date.today() + timedelta(days=1)).isoformat()
TEST_REPEAT_UNTIL = (date.today() + timedelta(days=15)).isoformat()
PASSWORD = "TestPassword-2026!"
COOKIE_JAR = http.cookiejar.CookieJar()
OPENER = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(COOKIE_JAR))
passed = 0

def check(condition, message):
    global passed
    if not condition:
        raise AssertionError(message)
    passed += 1
    print("PASS:", message)

def request(path="/", data=None):
    encoded = urllib.parse.urlencode(data).encode() if data is not None else None
    req = urllib.request.Request(BASE + path, data=encoded)
    try:
        response = OPENER.open(req)
        return response.status, response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode("utf-8", "replace")

def upload_document(token, filename, contents):
    boundary = "StudentLifeBoundary" + uuid.uuid4().hex
    body = bytearray()
    for name, value in (("csrf", token), ("action", "upload_ai_document")):
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
        body.extend(value.encode())
        body.extend(b"\r\n")
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(f'Content-Disposition: form-data; name="document"; filename="{filename}"\r\n'.encode())
    body.extend(b"Content-Type: text/plain; charset=utf-8\r\n\r\n")
    body.extend(contents)
    body.extend(f"\r\n--{boundary}--\r\n".encode())
    req = urllib.request.Request(BASE + "/", data=bytes(body),
                                 headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    try:
        response = OPENER.open(req)
        return response.status, response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode("utf-8", "replace")




def upload_communication(token, conversation_id, filename, contents):
    boundary = "StudentLifeMessageBoundary" + uuid.uuid4().hex
    body = bytearray()
    fields = (("csrf", token), ("action", "communication_send"),
              ("conversation_id", str(conversation_id)), ("body", "Shared class note"),
              ("client_nonce", uuid.uuid4().hex), ("parent_message_id", "0"))
    for name, value in fields:
        body.extend(f"--{boundary}\\r\\n".encode())
        body.extend(f'Content-Disposition: form-data; name="{name}"\\r\\n\\r\\n'.encode())
        body.extend(value.encode())
        body.extend(b"\\r\\n")
    body.extend(f"--{boundary}\\r\\n".encode())
    body.extend(f'Content-Disposition: form-data; name="attachment"; filename="{filename}"\\r\\n'.encode())
    body.extend(b"Content-Type: text/plain; charset=utf-8\\r\\n\\r\\n")
    body.extend(contents)
    body.extend(f"\\r\\n--{boundary}--\\r\\n".encode())
    req = urllib.request.Request(BASE + "/", data=bytes(body),
                                 headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    try:
        response = OPENER.open(req)
        return response.status, response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode("utf-8", "replace")

def csrf_token():
    status, html = request("/?page=login")
    check(status == 200, "sign-in page loads")
    match = re.search(r"""name=["']csrf["']\s+value=["']([^"']+)""", html)
    if not match:
        raise AssertionError("CSRF token was not found on the sign-in page")
    return match.group(1)

def login(email, role):
    token = csrf_token()
    status, _ = request("/", {
        "csrf": token, "action": "login", "email": email,
        "password": PASSWORD, "role": role,
    })
    check(status == 200, f"{role} account can authenticate")
    return token

def post_action(token, action, **fields):
    payload = {"csrf": token, "action": action}
    payload.update(fields)
    return request("/", payload)

def db_count(query, args=()):
    connection = pymysql.connect(host="127.0.0.1", user="root", password="root",
                                 database="studentlife_test", cursorclass=pymysql.cursors.DictCursor)
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, args)
            return next(iter(cursor.fetchone().values()))
    finally:
        connection.close()

def db_execute(query, args=()):
    connection = pymysql.connect(host="127.0.0.1", user="root", password="root",
                                 database="studentlife_test")
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, args)
            inserted_id = cursor.lastrowid
        connection.commit()
        return inserted_id
    finally:
        connection.close()

def main():
    # Pending email verification must block an otherwise valid password login.
    connection = pymysql.connect(host="127.0.0.1", user="root", password="root",
                                 database="studentlife_test")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT password_hash FROM users WHERE email=%s", ("admin@studentlife.test",))
            password_hash = cursor.fetchone()[0]
            cursor.execute("INSERT INTO users(name,email,password_hash,role,account_status,email_verified) VALUES(%s,%s,%s,%s,%s,0)",
                           ("Pending User", "pending@studentlife.test", password_hash,
                            "student", "pending"))
        connection.commit()
    finally:
        connection.close()
    pending_token = csrf_token()
    status, html = request("/", {"csrf": pending_token, "action": "login",
                                 "email": "pending@studentlife.test",
                                 "password": PASSWORD, "role": "student"})
    check(status == 200 and "verify your email" in html.lower(),
          "unverified account is blocked from signing in")

    token = login("admin@studentlife.test", "administrator")
    status, risk_html = request("/?page=risk_radar")
    check(status == 200 and "Academic Risk Radar" in risk_html and
          "Course-linked grades" in risk_html and "faculty records" in risk_html.lower(),
          "administrator risk radar reports attendance evidence and missing data limits")
    status, html = request("/?page=academic")
    check(status == 200 and "Academic Management" in html,
          "administrator can open Academic Management")

    post_action(token, "create_department", name="CI Test Department", code="CIT")
    check(db_count("SELECT COUNT(*) AS n FROM departments WHERE code=%s", ("CIT",)) == 1,
          "department creation persists")

    post_action(token, "create_term", name="CI Test Term", starts_on="2026-09-01", ends_on="2026-12-20")
    check(db_count("SELECT COUNT(*) AS n FROM academic_terms WHERE name=%s", ("CI Test Term",)) == 1,
          "academic term creation persists")

    post_action(token, "create_academic_course", code="CIT101", title="Automated Test Course",
                credits="3", department_id="1", description="CI acceptance test")
    check(db_count("SELECT COUNT(*) AS n FROM academic_courses WHERE code=%s", ("CIT101",)) == 1,
          "catalogue course creation persists")

    post_action(token, "create_offering", course_id="1", term_id="1", lecturer_id="3",
                section_code="BAD", capacity="5")
    check(db_count("SELECT COUNT(*) AS n FROM course_offerings WHERE section_code=%s", ("BAD",)) == 0,
          "non-lecturer assignment is rejected")

    post_action(token, "create_offering", course_id="1", term_id="1", lecturer_id="2",
                section_code="A", capacity="1")
    check(db_count("SELECT COUNT(*) AS n FROM course_offerings WHERE section_code=%s AND lecturer_id=2", ("A",)) == 1,
          "course section creation with active lecturer succeeds")

    post_action(token, "create_academic_course", code="CIT999", title="Invalid Credits",
                credits="99", department_id="1")
    check(db_count("SELECT COUNT(*) AS n FROM academic_courses WHERE code=%s", ("CIT999",)) == 0,
          "course credits outside 1–30 are rejected")

    post_action(token, "enrol_student", offering_id="1", student_id="3")
    check(db_count("SELECT COUNT(*) AS n FROM course_enrolments WHERE offering_id=1 AND student_id=3") == 1,
          "first student enrolment is accepted")

    post_action(token, "enrol_student", offering_id="1", student_id="3")
    check(db_count("SELECT COUNT(*) AS n FROM course_enrolments WHERE offering_id=1") == 1,
          "duplicate enrolment does not increase enrolment count")

    post_action(token, "enrol_student", offering_id="1", student_id="4")
    check(db_count("SELECT COUNT(*) AS n FROM course_enrolments WHERE offering_id=1") == 1,
          "section capacity prevents a second enrolment")

    post_action(token, "schedule_session", offering_id="1", session_date=TEST_SESSION_DATE,
                repeat_until=TEST_REPEAT_UNTIL, starts_at="10:00", ends_at="11:30",
                room="Room 101", topic="CI scheduled class")
    check(db_count("SELECT COUNT(*) AS n FROM class_sessions WHERE offering_id=1") == 3,
          "weekly recurring class scheduling creates expected sessions")

    own_course = db_execute("INSERT INTO courses(user_id,code,name) VALUES(3,%s,%s)",
                            ("PERS101", "Student One Personal Course"))
    other_course = db_execute("INSERT INTO courses(user_id,code,name) VALUES(4,%s,%s)",
                              ("PRIV101", "Student Two Private Course"))
    db_execute("INSERT INTO grades(user_id,course_id,assessment,score) VALUES(3,%s,%s,%s)",
               (own_course, "Own quiz", 80))
    db_execute("INSERT INTO grades(user_id,course_id,assessment,score) VALUES(3,%s,%s,%s)",
               (other_course, "Foreign course row", 100))
    private_conversation = db_execute(
        "INSERT INTO ai_conversations(owner_id,workspace_role,title) VALUES(4,'student','Private conversation')")
    db_execute("INSERT INTO ai_messages(conversation_id,message_role,content) VALUES(%s,'assistant','PRIVATE_CONTEXT_SENTINEL')",
               (private_conversation,))
    own_conversation = db_execute(
        "INSERT INTO ai_conversations(owner_id,workspace_role,title,support_mode) VALUES(3,'student','My study session','planner')")
    formatted_conversation = db_execute(
        "INSERT INTO ai_conversations(owner_id,workspace_role,title) VALUES(3,'student','Formatted response check')")
    db_execute("INSERT INTO ai_messages(conversation_id,message_role,content) VALUES(%s,'assistant',%s)",
               (formatted_conversation,
                "#### Revision plan\n\n**Review this topic**\n\n- First point\n- Second point\n\n<script>alert(1)</script>"))

    request("/?logout=1")
    lecturer_token = login("lecturer@studentlife.test", "lecturer")
    status, html = request("/?page=ai_teaching")
    check(status == 200 and "AI Teaching Assistant" in html and "AI service is not configured" in html,
          "lecturer AI workspace is visible and clearly disabled without provider settings")
    check("1 assigned course sections" in html and "3 upcoming class sessions" in html,
          "lecturer AI context contains only assigned course timetable data")
    status, _ = request("/?page=risk_radar")
    check(status == 403, "lecturer cannot open administrator risk radar")
    status, html = request("/?page=timetable")
    check(status == 200 and "CI scheduled class" in html,
          "assigned lecturer can view scheduled classes and attendance roster")
    post_action(lecturer_token, "mark_attendance", session_id="1", student_id="3", status="present")
    post_action(lecturer_token, "mark_attendance", session_id="2", student_id="3", status="absent")
    post_action(lecturer_token, "mark_attendance", session_id="3", student_id="3", status="absent")
    check(db_count("SELECT COUNT(*) AS n FROM attendance_records WHERE student_id=3") == 3,
          "lecturer attendance records persist across scheduled sessions")
    post_action(lecturer_token, "save_intervention", student_id="3",
                course_offering_id="1", action_title="Attendance follow-up",
                notes="Discuss missed classes")
    check(db_count("SELECT COUNT(*) AS n FROM academic_interventions WHERE created_by=2 AND student_id=3") == 1,
          "lecturer can record intervention for enrolled student")
    post_action(lecturer_token, "save_intervention", student_id="4",
                course_offering_id="1", action_title="Unauthorized follow-up",
                notes="Student is not enrolled")
    check(db_count("SELECT COUNT(*) AS n FROM academic_interventions") == 1,
          "lecturer intervention is blocked for a student outside the assigned roster")

    request("/?logout=1")
    student_token = login("student1@studentlife.test", "student")
    status, html = request("/?page=ai_study")
    check(status == 200 and "AI Academic Assistant" in html and "AI service is not configured" in html,
          "student AI workspace uses the requested name and clearly reports provider status")
    check("1 enrolled course sections" in html and "3 upcoming class sessions" in html,
          "student AI context reflects the student's enrollment and timetable")
    check("1 personal grade entries" in html,
          "student AI context excludes a grade linked to another student's personal course")
    check("Recorded grade review" in html,
          "student AI page includes its recorded grade review")
    check("PERS101" in html,
          "grade review identifies the student's own course")
    check("80.0" in html,
          "grade review calculates the recorded course average")
    check("Foreign course row" not in html,
          "grade review excludes a mark belonging to another student's course")
    post_action(student_token, "save_academic_plan", title="CI improvement plan",
                course_code="", plan_text="Review lecture notes twice each week and record questions for the next tutorial.")
    check(db_count("SELECT COUNT(*) AS n FROM student_academic_plans WHERE owner_id=3") == 0,
          "academic plan save requires explicit student confirmation")
    post_action(student_token, "save_academic_plan", title="CI improvement plan",
                course_code="", plan_text="Review lecture notes twice each week and record questions for the next tutorial.",
                confirm_plan="1")
    plan_id = db_count("SELECT MAX(id) AS id FROM student_academic_plans WHERE owner_id=3")
    check(plan_id and "CI improvement plan" in request("/?page=ai_study")[1],
          "student can save and view a personal academic improvement plan")
    check("Learn a subject" in html and "Exam preparation" in html and "University guide" in html,
          "student AI page exposes unified academic support modes")
    check("Document output" in html and "Quick summary" in html and
          "Flashcards" in html and "Multiple-choice practice" in html,
          "student can choose useful outputs for a selected lecture document")
    status, formatted_html = request(f"/?page=ai_study&conversation_id={formatted_conversation}")
    check(status == 200 and "<h4>Revision plan</h4>" in formatted_html and
          "<strong>Review this topic</strong>" in formatted_html and "#### " not in formatted_html and
          "<script>alert(1)</script>" not in formatted_html,
          "AI response headings and emphasis render as safe formatted HTML without raw hashes")
    check("Memory and Personalization" in html and "No memories saved" in html,
          "student memory controls start empty and private")
    check("Goals and follow-ups" in html and "No personal goals saved yet" in html and
          "Personal support" in html and "Goals stay private unless you check Share with AI" in html,
          "personal support and private goal controls are available to students")
    post_action(student_token, "save_personal_goal", category="career", title="CI career goal",
                details="Update my CV and review progress next week.", review_date="",
                confirm_goal="1", share_with_ai="1")
    check(db_count("SELECT COUNT(*) AS n FROM student_personal_goals WHERE owner_id=3") == 0,
          "sharing a personal goal with AI requires separate consent")
    post_action(student_token, "save_personal_goal", category="career", title="CI career goal",
                details="Update my CV and review progress next week.", review_date="",
                confirm_goal="1", share_with_ai="1", confirm_share="1")
    shared_goal_id = db_count("SELECT MAX(id) AS id FROM student_personal_goals WHERE owner_id=3")
    check(shared_goal_id and db_count("SELECT COUNT(*) AS n FROM student_personal_goals WHERE id=%s AND owner_id=3 AND share_with_ai=1",
                                      (shared_goal_id,)) == 1,
          "student can save an AI-shared goal after separate consent")
    post_action(student_token, "save_personal_goal", category="study_habits", title="CI private goal",
                details="Set aside two short study blocks this week.", review_date="", confirm_goal="1")
    private_goal_id = db_count("SELECT MAX(id) AS id FROM student_personal_goals WHERE owner_id=3")
    check(private_goal_id and db_count("SELECT COUNT(*) AS n FROM student_personal_goals WHERE id=%s AND owner_id=3 AND share_with_ai=0",
                                       (private_goal_id,)) == 1,
          "personal goals are private by default")
    post_action(student_token, "save_ai_memory", category="learning",
                memory_text="I prefer a short example before a detailed explanation.",
                confirm_memory="1")
    check(db_count("SELECT COUNT(*) AS n FROM student_ai_memories WHERE owner_id=3") == 0,
          "memory cannot be saved until the student enables consent")
    post_action(student_token, "save_ai_memory_settings", memory_enabled="1",
                allow_learning="1")
    post_action(student_token, "save_ai_memory", category="personal",
                memory_text="Unapproved personal detail", confirm_memory="1")
    check(db_count("SELECT COUNT(*) AS n FROM student_ai_memories WHERE owner_id=3") == 0,
          "memory categories require separate student consent")
    post_action(student_token, "save_ai_memory", category="learning",
                memory_text="I prefer a short example before a detailed explanation.",
                confirm_memory="1")
    memory_id = db_count("SELECT MAX(id) AS id FROM student_ai_memories WHERE owner_id=3")
    check(memory_id and db_count("SELECT COUNT(*) AS n FROM student_ai_memories WHERE id=%s AND category='learning'",
                                 (memory_id,)) == 1,
          "student can save an explicitly approved learning preference")
    check("I prefer a short example before a detailed explanation." in request("/?page=ai_study")[1],
          "student can view their saved memory")
    request("/?logout=1")
    student2_token = login("student2@studentlife.test", "student")
    status, other_student_html = request("/?page=ai_study")
    check(status == 200 and "I prefer a short example before a detailed explanation." not in other_student_html and
          "CI improvement plan" not in other_student_html and "CI career goal" not in other_student_html and
          "CI private goal" not in other_student_html,
          "another student cannot view saved memory, plan or personal goals")
    post_action(student2_token, "update_personal_goal", goal_id=str(shared_goal_id),
                category="career", title="Unauthorized goal edit", details="Change another student's goal.",
                review_date="", status="completed", confirm_goal="1")
    post_action(student2_token, "delete_personal_goal", goal_id=str(shared_goal_id))
    check(db_count("SELECT COUNT(*) AS n FROM student_personal_goals WHERE id=%s AND owner_id=3 AND title=%s AND share_with_ai=1",
                   (shared_goal_id, "CI career goal")) == 1,
          "another student cannot edit or delete a goal by changing its ID")
    post_action(student2_token, "update_academic_plan", plan_id=str(plan_id),
                course_code="", title="Unauthorized plan change",
                plan_text="Replace the student's plan", target_date="",
                status="completed", confirm_plan="1")
    post_action(student2_token, "delete_academic_plan", plan_id=str(plan_id))
    check(db_count("SELECT COUNT(*) AS n FROM student_academic_plans WHERE id=%s AND owner_id=3 AND title=%s AND status='active'",
                   (plan_id, "CI improvement plan")) == 1,
          "another student cannot edit or delete the plan by changing its ID")
    post_action(student2_token, "save_ai_memory_settings", memory_enabled="1",
                allow_learning="1")
    post_action(student2_token, "update_ai_memory", memory_id=str(memory_id),
                category="learning", memory_text="Unauthorized edit", confirm_memory="1")
    post_action(student2_token, "delete_ai_memory", memory_id=str(memory_id))
    check(db_count("SELECT COUNT(*) AS n FROM student_ai_memories WHERE id=%s AND owner_id=3 AND memory_text=%s",
                   (memory_id, "I prefer a short example before a detailed explanation.")) == 1,
          "another student cannot edit or delete the memory by changing its ID")
    request("/?logout=1")
    student_token = login("student1@studentlife.test", "student")
    status, restored_memory_html = request("/?page=ai_study")
    check(status == 200 and "I prefer a short example before a detailed explanation." in restored_memory_html and
          "CI improvement plan" in restored_memory_html and "CI career goal" in restored_memory_html and
          "CI private goal" in restored_memory_html,
          "approved memory, improvement plan and personal goals persist across sign-in")
    post_action(student_token, "update_personal_goal", goal_id=str(shared_goal_id),
                category="career", title="CI career goal", details="Update my CV and review progress next week.",
                review_date="", status="in_progress", confirm_goal="1")
    check(db_count("SELECT COUNT(*) AS n FROM student_personal_goals WHERE id=%s AND owner_id=3 AND status='in_progress' AND share_with_ai=0",
                   (shared_goal_id,)) == 1,
          "student can update a goal and revoke AI sharing")
    post_action(student_token, "delete_personal_goal", goal_id=str(shared_goal_id))
    post_action(student_token, "delete_personal_goal", goal_id=str(private_goal_id))
    check(db_count("SELECT COUNT(*) AS n FROM student_personal_goals WHERE owner_id=3") == 0,
          "student can delete their own personal goals")
    post_action(student_token, "update_academic_plan", plan_id=str(plan_id),
                course_code="", title="CI improvement plan",
                plan_text="Review lecture notes twice each week and record questions for the next tutorial.",
                target_date="", status="completed", confirm_plan="1")
    check(db_count("SELECT COUNT(*) AS n FROM student_academic_plans WHERE id=%s AND owner_id=3 AND status='completed'",
                   (plan_id,)) == 1,
          "student can update and complete their own improvement plan")
    post_action(student_token, "delete_academic_plan", plan_id=str(plan_id))
    check(db_count("SELECT COUNT(*) AS n FROM student_academic_plans WHERE id=%s AND owner_id=3",
                   (plan_id,)) == 0,
          "student can delete their own improvement plan")
    post_action(student_token, "clear_ai_memory")
    check(db_count("SELECT COUNT(*) AS n FROM student_ai_memories WHERE owner_id=3") == 0,
          "student can clear all of their own saved memories")
    upload_document(student_token, "CI lecture.txt",
                    "A sample lecture note about international relations.\nThe core claim is that institutions shape cooperation.".encode())
    document_id = db_count("SELECT MAX(id) AS id FROM student_documents WHERE owner_id=3")
    stored_name = db_count("SELECT stored_name FROM student_documents WHERE id=%s", (document_id,))
    private_file = Path(__file__).resolve().parents[2] / "studentlife-private-documents" / stored_name
    check(document_id and stored_name.endswith(".txt") and private_file.is_file() and
          "CI lecture.txt" in request("/?page=ai_study")[1],
          "student text upload is extracted and stored outside the public directory")
    status, own_html = request(f"/?page=ai_study&conversation_id={own_conversation}")
    check(status == 200 and 'option value="planner" selected' in own_html,
          "student conversation remembers its selected support mode")
    status, private_html = request(f"/?page=ai_study&conversation_id={private_conversation}")
    check(status == 200 and "PRIVATE_CONTEXT_SENTINEL" not in private_html,
          "student cannot read another student's AI conversation")
    status, _ = post_action(student_token, "rename_ai_conversation",
                            conversation_id=str(own_conversation), title="Renamed study session")
    check(db_count("SELECT COUNT(*) AS n FROM ai_conversations WHERE id=%s AND title=%s",
                   (own_conversation, "Renamed study session")) == 1,
          "student can rename their own AI conversation")
    status, _ = post_action(student_token, "delete_ai_conversation",
                            conversation_id=str(private_conversation))
    check(status == 403 and db_count("SELECT COUNT(*) AS n FROM ai_conversations WHERE id=%s",
                                     (private_conversation,)) == 1,
          "student cannot delete another student's AI conversation")
    status, _ = post_action(student_token, "delete_ai_conversation",
                            conversation_id=str(own_conversation))
    check(db_count("SELECT COUNT(*) AS n FROM ai_conversations WHERE id=%s",
                   (own_conversation,)) == 0,
          "student can delete their own AI conversation")
    before = db_count("SELECT COUNT(*) AS n FROM ai_conversations")
    status, _ = post_action(student_token, "ai_ask", question="Show me another student's records")
    check(status == 200 and db_count("SELECT COUNT(*) AS n FROM ai_conversations") == before,
          "unconfigured AI stores and sends no student question")
    status, _ = request("/?page=ai_teaching")
    check(status == 403, "student cannot open lecturer AI workspace")
    status, html = request("/?page=timetable")
    check(status == 200 and "CI scheduled class" in html,
          "enrolled student can view institutional timetable")
    status, html = request("/?page=reports")
    check(status == 200 and "Attendance Reports" in html and "Present" in html,
          "student can view own attendance report")
    status, _ = request("/?page=risk_radar")
    check(status == 403, "student cannot open administrator risk radar")
    status, _ = post_action(student_token, "mark_attendance", session_id="1",
                            student_id="3", status="absent")
    check(status == 403, "student cannot mark attendance")
    status, _ = post_action(student_token, "save_intervention", student_id="3",
                            course_offering_id="1", action_title="Unauthorized",
                            notes="Should be rejected")
    check(status == 403, "student cannot create academic interventions")
    status, _ = post_action(student_token, "create_department",
                            name="Forbidden Department", code="NOPE")
    check(status == 403, "student is blocked from administrator academic actions")

    task_count = db_count("SELECT COUNT(*) AS n FROM tasks WHERE user_id=3")
    post_action(student_token, "ai_save_task", title="Review CI course notes",
                course_code="CIT101", due_date="2026-11-25", priority="high")
    check(db_count("SELECT COUNT(*) AS n FROM tasks WHERE user_id=3") == task_count,
          "AI-assisted task save requires explicit confirmation")
    post_action(student_token, "ai_save_task", title="Review CI course notes",
                course_code="CIT101", due_date="2026-11-25", priority="high",
                confirm_save="1")
    check(db_count("SELECT COUNT(*) AS n FROM tasks WHERE user_id=3 AND title=%s AND course=%s AND priority='high'",
                   ("Review CI course notes", "CIT101")) == 1,
          "student can save a confirmed AI-assisted task to the existing task list")
    status, _ = post_action(student_token, "ai_save_task", title="Foreign course task",
                            course_code="PRIV101", confirm_save="1")
    check(status == 403 and db_count("SELECT COUNT(*) AS n FROM tasks WHERE user_id=3 AND title=%s",
                                     ("Foreign course task",)) == 0,
          "student task action rejects a course outside their enrolments")


    status, comm_html = request("/?page=communication")
    check(status == 200 and "Communication Hub" in comm_html and "Class ·" in comm_html,
          "student communication hub creates a chat for each enrolled course section")
    class_conversation_id = db_count("SELECT MAX(id) AS id FROM sl_conversations WHERE room_type='class'")
    post_action(student_token, "communication_send", conversation_id=str(class_conversation_id),
                body="CI class chat message", parent_message_id="0", client_nonce="a"*32)
    class_message_id = db_count("SELECT MAX(id) AS id FROM sl_messages WHERE conversation_id=%s AND sender_id=3",
                                (class_conversation_id,))
    check(class_message_id and db_count("SELECT COUNT(*) AS n FROM sl_messages WHERE id=%s AND body=%s",
                                        (class_message_id, "CI class chat message")) == 1,
          "student message persists in the authorized course-section chat")
    post_action(student_token, "communication_start_direct", recipient_id="4")
    direct_id = db_count("SELECT MAX(id) AS id FROM sl_conversations WHERE room_type='direct'")
    post_action(student_token, "communication_send", conversation_id=str(direct_id),
                body="CI direct message", parent_message_id="0", client_nonce="b"*32)
    direct_message_id = db_count("SELECT MAX(id) AS id FROM sl_messages WHERE conversation_id=%s AND sender_id=3",
                                 (direct_id,))
    check(db_count("SELECT COUNT(*) AS n FROM sl_conversation_members WHERE conversation_id=%s", (direct_id,)) == 2 and
          db_count("SELECT COUNT(*) AS n FROM sl_notifications WHERE user_id=4 AND conversation_id=%s AND read_at IS NULL", (direct_id,)) == 1,
          "direct conversation is private to its two participants and notifies the recipient")
    post_action(student_token, "communication_send", conversation_id=str(direct_id),
                body="CI reply", parent_message_id=str(direct_message_id), client_nonce="c"*32)
    reply_id = db_count("SELECT MAX(id) AS id FROM sl_messages WHERE conversation_id=%s", (direct_id,))
    check(db_count("SELECT COUNT(*) AS n FROM sl_messages WHERE id=%s AND parent_message_id=%s", (reply_id, direct_message_id)) == 1,
          "reply references a message in the same conversation")
    post_action(student_token, "communication_send", conversation_id=str(direct_id),
                body="Invalid cross-conversation reply", parent_message_id=str(class_message_id), client_nonce="d"*32)
    check(db_count("SELECT COUNT(*) AS n FROM sl_messages WHERE body=%s", ("Invalid cross-conversation reply",)) == 0,
          "reply cannot reference a message from another conversation")
    post_action(student_token, "communication_react", conversation_id=str(direct_id),
                message_id=str(direct_message_id), reaction="helpful")
    check(db_count("SELECT COUNT(*) AS n FROM sl_message_reactions WHERE message_id=%s AND user_id=3 AND reaction='helpful'",
                   (direct_message_id,)) == 1,
          "student can add a permitted message reaction")
    post_action(student_token, "communication_react", conversation_id=str(direct_id),
                message_id=str(direct_message_id), reaction="helpful")
    check(db_count("SELECT COUNT(*) AS n FROM sl_message_reactions WHERE message_id=%s AND user_id=3 AND reaction='helpful'",
                   (direct_message_id,)) == 0,
          "student can remove their own reaction without creating duplicates")
    status, comm_search = request(f"/?page=communication&conversation_id={direct_id}&q=CI+direct+message")
    check(status == 200 and "CI direct message" in comm_search,
          "student can search messages inside an authorized conversation")
    status, _ = upload_communication(student_token, class_conversation_id, "CI class note.txt",
                                     b"Private communication attachment sentinel")
    attachment_id = db_count("SELECT MAX(id) AS id FROM sl_message_attachments WHERE conversation_id=%s",
                             (class_conversation_id,))
    status, downloaded = request(f"/?page=communication&comms_attachment={attachment_id}")
    check(attachment_id and status == 200 and "Private communication attachment sentinel" in downloaded,
          "authorized class-chat member can download a validated private attachment")

    request("/?logout=1")
    second_student_token = login("student2@studentlife.test", "student")
    status, private_owner_html = request(f"/?page=ai_study&conversation_id={private_conversation}")
    check(status == 200 and "PRIVATE_CONTEXT_SENTINEL" in private_owner_html,
          "second student can read their own AI conversation")

    status, denied_class = request(f"/?page=communication&conversation_id={class_conversation_id}")
    check(status == 404, "student outside a course section cannot open its class chat")
    status, direct_html = request(f"/?page=communication&conversation_id={direct_id}")
    check(status == 200 and "CI direct message" in direct_html and "CI reply" in direct_html,
          "direct conversation history persists for the other authorized participant")
    post_action(second_student_token, "communication_edit", conversation_id=str(direct_id),
                message_id=str(direct_message_id), body="Unauthorized message alteration")
    check(db_count("SELECT COUNT(*) AS n FROM sl_messages WHERE id=%s AND sender_id=3 AND body=%s",
                   (direct_message_id, "CI direct message")) == 1,
          "a participant cannot edit another participant's message")
    status, denied_attachment = request(f"/?page=communication&comms_attachment={attachment_id}")
    check(status == 404, "non-member cannot download a class-chat attachment by guessing its ID")

    status, second_student_html = request("/?page=ai_study")
    check(status == 200 and "Own quiz" not in second_student_html and
          "Review CI course notes" not in second_student_html and "CI lecture.txt" not in second_student_html,
          "second student cannot see the first student's grade, task or private document")
    status, _ = post_action(second_student_token, "delete_ai_document", document_id=str(document_id))
    check(status == 403 and db_count("SELECT COUNT(*) AS n FROM student_documents WHERE id=%s AND owner_id=3",
                                     (document_id,)) == 1,
          "second student cannot delete another student's private document")

    request("/?logout=1")
    student_token = login("student1@studentlife.test", "student")
    post_action(student_token, "delete_ai_document", document_id=str(document_id))
    check(db_count("SELECT COUNT(*) AS n FROM student_documents WHERE id=%s", (document_id,)) == 0 and
          not private_file.exists(),
          "owner can delete private document and stored file")
    request("/?logout=1")
    admin_token = login("admin@studentlife.test", "administrator")
    status, html = request("/?page=risk_radar")
    check(status == 200 and "CI Student One" in html and "High" in html and "33.3%" in html,
          "risk radar classifies a student from three recorded attendance entries")
    post_action(admin_token, "save_risk_rules", moderate_below="75", high_below="60",
                critical_below="40", moderate_min_records="2",
                high_min_records="3", critical_min_records="5")
    check(db_count("SELECT COUNT(*) AS n FROM app_settings WHERE setting_key='risk_moderate_min_records' AND setting_value='2'") == 1,
          "administrator risk thresholds persist")
    post_action(admin_token, "save_risk_rules", moderate_below="75", high_below="60",
                critical_below="40", moderate_min_records="51",
                high_min_records="100", critical_min_records="200")
    check(db_count("SELECT COUNT(*) AS n FROM app_settings WHERE setting_key='risk_moderate_min_records' AND setting_value='2'") == 1,
          "risk rule input outside supported bounds is rejected")
    post_action(admin_token, "save_intervention", student_id="3",
                course_offering_id="0", action_title="Adviser meeting",
                notes="Review attendance and agree on support")
    check(db_count("SELECT COUNT(*) AS n FROM academic_interventions WHERE created_by=1 AND student_id=3 AND course_offering_id IS NULL") == 1,
          "administrator can create an institutional support intervention")
    check(db_count("SELECT COUNT(*) AS n FROM admin_audit WHERE action='academic_intervention_created'") == 2,
          "staff intervention creation is recorded in the audit trail")


    print(f"\n{passed} automated acceptance checks passed.")
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print("FAIL:", exc, file=sys.stderr)
        sys.exit(1)
