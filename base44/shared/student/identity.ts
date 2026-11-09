// Resolves the signed-in account to its one institutional Student record.
//
// The rules themselves live in academicIdentity.ts, which is the single
// authority every surface uses (dashboard, profile, timetable, attendance,
// course lists, Communication Center, administration register). This module is
// the student-facing entry point to that same resolver, so there is exactly one
// implementation of "which student record is this account".
import { resolveAcademicIdentity } from './academicIdentity.ts';

export async function resolveStudentAccount(base44, user) {
  const identity = await resolveAcademicIdentity(base44.asServiceRole, user);
  return identity.student;
}

export async function resolveStudentIdentity(base44, user) {
  return resolveAcademicIdentity(base44.asServiceRole, user);
}