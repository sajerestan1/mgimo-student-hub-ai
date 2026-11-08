import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { DEAN_ROLES, GRADE_NOTE, loadInstitution, resolveScope } from '../../shared/dean/dataset.ts';
import {
  attendanceView,
  courseRowsView,
  departmentRowsView,
  facultyRowsView,
  performanceView,
  professorRowsView,
  programmeRowsView,
  reportView,
  riskView,
  studentDetailView,
  studentRowsView,
} from '../../shared/dean/views.ts';

// One endpoint for every dean-level screen. The caller's role is verified here
// and the dataset is scoped to their unit before anything is returned, so a
// faculty administrator can never receive another faculty's records.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const role = String(user.role || '').toLowerCase();
    if (!DEAN_ROLES.includes(role)) {
      return Response.json({ error: 'This workspace is open to the dean’s office only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'faculties');
    const scope = resolveScope(user);
    const inst = await loadInstitution(base44.asServiceRole, scope);
    const scopeLabel = scope.label;

    if (action === 'faculties') {
      return Response.json({ scope: scopeLabel, gradeNote: GRADE_NOTE, rows: facultyRowsView(inst) });
    }
    if (action === 'departments') {
      return Response.json({ scope: scopeLabel, gradeNote: GRADE_NOTE, rows: departmentRowsView(inst) });
    }
    if (action === 'programmes') {
      return Response.json({ scope: scopeLabel, gradeNote: GRADE_NOTE, rows: programmeRowsView(inst) });
    }
    if (action === 'students') {
      const payload = studentRowsView(inst, body);
      return Response.json({ scope: scopeLabel, gradeNote: GRADE_NOTE, ...payload });
    }
    if (action === 'studentDetail') {
      if (!body.studentId) return Response.json({ error: 'studentId is required' }, { status: 400 });
      const detail = studentDetailView(inst, String(body.studentId));
      if (!detail) return Response.json({ error: 'Student not found in your scope' }, { status: 404 });
      return Response.json({ scope: scopeLabel, gradeNote: GRADE_NOTE, ...detail });
    }
    if (action === 'professors') {
      const payload = professorRowsView(inst, body);
      return Response.json({ scope: scopeLabel, gradeNote: GRADE_NOTE, ...payload });
    }
    if (action === 'courses') {
      const payload = courseRowsView(inst, body);
      return Response.json({ scope: scopeLabel, gradeNote: GRADE_NOTE, ...payload });
    }
    if (action === 'performance') {
      return Response.json({ scope: scopeLabel, gradeNote: GRADE_NOTE, ...performanceView(inst) });
    }
    if (action === 'attendance') {
      return Response.json({ scope: scopeLabel, gradeNote: GRADE_NOTE, ...attendanceView(inst) });
    }
    if (action === 'risk') {
      return Response.json({ scope: scopeLabel, gradeNote: GRADE_NOTE, ...riskView(inst) });
    }
    if (action === 'reports') {
      return Response.json({ scope: scopeLabel, gradeNote: GRADE_NOTE, ...reportView(inst) });
    }

    return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || 'The institutional dataset could not be read' }, { status: 500 });
  }
}