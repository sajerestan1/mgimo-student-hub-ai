#!/usr/bin/env python3
"""Black-box acceptance tests for the StudentLife PHP/MySQL application."""
import http.cookiejar
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import pymysql

BASE = os.environ.get("STUDENTLIFE_TEST_URL", "http://127.0.0.1:8080")
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

    post_action(token, "schedule_session", offering_id="1", session_date="2026-11-20",
                repeat_until="2026-12-04", starts_at="10:00", ends_at="11:30",
                room="Room 101", topic="CI scheduled class")
    check(db_count("SELECT COUNT(*) AS n FROM class_sessions WHERE offering_id=1") == 3,
          "weekly recurring class scheduling creates expected sessions")

    request("/?logout=1")
    lecturer_token = login("lecturer@studentlife.test", "lecturer")
    status, html = request("/?page=timetable")
    check(status == 200 and "CI scheduled class" in html,
          "assigned lecturer can view scheduled classes and attendance roster")
    post_action(lecturer_token, "mark_attendance", session_id="1", student_id="3", status="present")
    check(db_count("SELECT COUNT(*) AS n FROM attendance_records WHERE session_id=1 AND student_id=3 AND status='present'") == 1,
          "lecturer can record enrolled student's attendance")

    request("/?logout=1")
    student_token = login("student1@studentlife.test", "student")
    status, html = request("/?page=timetable")
    check(status == 200 and "CI scheduled class" in html,
          "enrolled student can view institutional timetable")
    status, html = request("/?page=reports")
    check(status == 200 and "Attendance Reports" in html and "Present" in html,
          "student can view own attendance report")
    status, _ = post_action(student_token, "mark_attendance", session_id="1",
                            student_id="3", status="absent")
    check(status == 403, "student cannot mark attendance")
    status, _ = post_action(student_token, "create_department",
                            name="Forbidden Department", code="NOPE")
    check(status == 403, "student is blocked from administrator academic actions")


    print(f"\n{passed} automated acceptance checks passed.")
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print("FAIL:", exc, file=sys.stderr)
        sys.exit(1)
