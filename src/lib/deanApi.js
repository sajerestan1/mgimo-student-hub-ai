import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { DEMO_INSTITUTION } from '@/lib/demoInstitutionData';

function demoDeanData(action, params = {}) {
  const d = DEMO_INSTITUTION;
  const facultyById = new Map(d.faculties.map((f) => [f.id, f]));
  const deptById = new Map(d.departments.map((x) => [x.id, x]));
  const profById = new Map(d.professors.map((x) => [x.id, x]));
  const records = d.academicRecords.map((r) => ({ ...r, faculty_id: d.students.find((s) => s.id === r.student_id)?.faculty_id, department_id: d.students.find((s) => s.id === r.student_id)?.department_id }));
  const attendance = d.attendanceRecords.map((r) => ({ ...r, faculty_id: d.students.find((s) => s.id === r.student_id)?.faculty_id, department_id: d.students.find((s) => s.id === r.student_id)?.department_id }));
  const avg = (a) => a.length ? +(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1) : null;
  const metrics = (s) => { const g=records.filter(r=>r.student_id===s.id).map(r=>r.grade); const a=attendance.filter(r=>r.student_id===s.id); return {avgGrade:avg(g),attendanceRate:avg(a.map(r=>r.status==='present'?100:0)),riskLevel:(avg(g)<60||avg(a.map(r=>r.status==='present'?100:0))<65)?'high':(avg(g)<70||avg(a.map(r=>r.status==='present'?100:0))<75)?'medium':'low'}; };
  const students=d.students.map(s=>({...s,student_id:s.student_number,programme:s.program,group_name:`IR-${26+s.year}-A`,enrollment_status:s.status,faculty_code:facultyById.get(s.faculty_id)?.code||'',...metrics(s)}));
  if(action==='students'){let rows=students.filter(s=>(!params.q||`${s.full_name} ${s.student_id} ${s.email} ${s.group_name}`.toLowerCase().includes(params.q.toLowerCase()))&&(!params.faculty_id||s.faculty_id===params.faculty_id)&&(!params.programme||s.programme===params.programme)&&(!params.year||s.year===Number(params.year))&&(!params.risk||s.riskLevel===params.risk)&&(!params.status||s.enrollment_status===params.status));return {rows,total:rows.length,facets:{faculties:d.faculties.map(f=>({id:f.id,name:f.name,code:f.code})),programmes:[...new Set(students.map(s=>s.programme))],years:[1,2,3,4]},passMark:60,attendanceFloor:75};}
  if(action==='faculties')return {rows:d.faculties.map(f=>{const ss=students.filter(s=>s.faculty_id===f.id);return {...f,dean_name:f.dean,departments:d.departments.filter(x=>x.faculty_id===f.id).length,students:ss.length,professors:d.professors.filter(x=>x.faculty_id===f.id).length,courses:d.courses.filter(x=>x.faculty_id===f.id).length,avgGrade:avg(records.filter(r=>r.faculty_id===f.id).map(r=>r.grade)),attendanceRate:avg(attendance.filter(r=>r.faculty_id===f.id).map(r=>r.status==='present'?100:0)),atRisk:ss.filter(s=>s.riskLevel==='high').length}})};
  if(action==='departments')return {rows:d.departments.map(dep=>{const ss=students.filter(s=>s.department_id===dep.id);const f=facultyById.get(dep.faculty_id);return {...dep,code:dep.id,faculty:f?.name||'—',faculty_code:f?.code||'',head_name:'—',students:ss.length,professors:d.professors.filter(p=>p.department_id===dep.id).length,courses:d.courses.filter(c=>c.faculty_id===dep.faculty_id).length,avgGrade:avg(records.filter(r=>r.department_id===dep.id).map(r=>r.grade)),attendanceRate:avg(attendance.filter(r=>r.department_id===dep.id).map(r=>r.status==='present'?100:0)),atRisk:ss.filter(s=>s.riskLevel==='high').length}})};
  if(action==='professors')return {rows:d.professors.map(p=>({...p,faculty:facultyById.get(p.faculty_id)?.name||'—',department:deptById.get(p.department_id)?.name||'—',courses:d.courses.filter(c=>c.professor_id===p.id).length,students:d.courses.filter(c=>c.professor_id===p.id).reduce((n,c)=>n+c.enrolled_count,0),avgGrade:avg(records.filter(r=>d.courses.some(c=>c.id===r.course_id&&c.professor_id===p.id)).map(r=>r.grade)),attendanceRate:null,employment_status:'full_time'}))};
  if(action==='courses')return {rows:d.courses.map(c=>({...c,level:'Undergraduate',faculty_code:facultyById.get(c.faculty_id)?.code||'',professor:profById.get(c.professor_id)?.full_name||'—',enrolled:c.enrolled_count,avgGrade:avg(records.filter(r=>r.course_id===c.id).map(r=>r.grade)),attendanceRate:null,passRate:100,status:'published'})),facets:{faculties:d.faculties.map(f=>({id:f.id,name:f.name,code:f.code})),levels:['Undergraduate'],statuses:['published']}};
  if(action==='performance'){const graded=records.map(r=>({...r,faculty_id:d.students.find(s=>s.id===r.student_id)?.faculty_id,course:d.courses.find(c=>c.id===r.course_id)}));const overall={avgGrade:avg(records.map(r=>r.grade)),passRate:records.length?Math.round(records.filter(r=>r.grade>=60).length/records.length*100):null,assessed:records.length,students:new Set(records.map(r=>r.student_id)).size,courses:new Set(records.map(r=>r.course_id)).size};const byFaculty=d.faculties.map(f=>{const a=graded.filter(r=>r.faculty_id===f.id);return {id:f.id,name:f.name,students:students.filter(s=>s.faculty_id===f.id).length,avgGrade:avg(a.map(r=>r.grade)),passRate:a.length?Math.round(a.filter(r=>r.grade>=60).length/a.length*100):null,attendanceRate:avg(attendance.filter(r=>r.faculty_id===f.id).map(r=>r.status==='present'?100:0))}});const byCourse=d.courses.map(course=>{const a=records.filter(r=>r.course_id===course.id);return {code:course.code,title:course.title,faculty_code:facultyById.get(course.faculty_id)?.code,graded:a.length,avgGrade:avg(a.map(r=>r.grade))}}).filter(r=>r.graded);return {overall,byFaculty,terms:[{term:'Fall 2026',avgGrade:overall.avgGrade,assessed:overall.assessed}],distribution:[{label:'Below 60',count:records.filter(r=>r.grade<60).length},{label:'60–69',count:records.filter(r=>r.grade>=60&&r.grade<70).length},{label:'70–79',count:records.filter(r=>r.grade>=70&&r.grade<80).length},{label:'80–89',count:records.filter(r=>r.grade>=80&&r.grade<90).length},{label:'90–100',count:records.filter(r=>r.grade>=90).length}],strongest:[...byCourse].sort((a,b)=>b.avgGrade-a.avgGrade).slice(0,5),weakest:[...byCourse].sort((a,b)=>a.avgGrade-b.avgGrade).slice(0,5),byLevel:[{level:'Undergraduate',courses:d.courses.length,avgGrade:overall.avgGrade}]};}
  if(action==='attendance'){const total=attendance.length,present=attendance.filter(r=>r.status==='present'||r.status==='late').length;const mix=['present','late','excused','absent'].map(status=>{const count=attendance.filter(r=>r.status===status).length;return {status,count,share:total?Math.round(count/total*100):0}});const weeks=[...new Set(attendance.map(r=>r.session_date.slice(0,7)))].sort().map(week=>{const a=attendance.filter(r=>r.session_date.startsWith(week));return {week,rate:a.length?Math.round(a.filter(r=>r.status==='present'||r.status==='late').length/a.length*100):0,sessions:a.length}});const byFaculty=d.faculties.map(f=>{const a=attendance.filter(r=>r.faculty_id===f.id);return {name:f.name,code:f.code,rate:a.length?Math.round(a.filter(r=>r.status==='present'||r.status==='late').length/a.length*100):null,students:students.filter(s=>s.faculty_id===f.id).length}});const byDepartment=d.departments.map(dep=>{const a=attendance.filter(r=>r.department_id===dep.id),f=facultyById.get(dep.faculty_id);return {name:dep.name,faculty:f?.name||'—',students:students.filter(s=>s.department_id===dep.id).length,rate:a.length?Math.round(a.filter(r=>r.status==='present'||r.status==='late').length/a.length*100):null}});const belowFloor=students.filter(s=>s.attendanceRate!==null&&s.attendanceRate<75).map(s=>({id:s.id,full_name:s.full_name,student_id:s.student_id,group_name:s.group_name,faculty:facultyById.get(s.faculty_id)?.name||'—',sessions:attendance.filter(r=>r.student_id===s.id).length,attendanceRate:s.attendanceRate,avgGrade:s.avgGrade}));return {overall:{rate:total?Math.round(present/total*100):null,records:total,studentsTracked:students.length,belowFloor:belowFloor.length,floor:75},byFaculty,byDepartment,statusMix:mix,weeks,belowFloor};}
  if(action==='risk'){const flagged=students.filter(s=>s.riskLevel!=='low').map(s=>({...s,riskFlags:[s.avgGrade<60?'grade_below':'attendance_low'],labels:[s.avgGrade<60?'Grade below pass mark':'Attendance below requirement']}));return {counts:{high:flagged.filter(s=>s.riskLevel==='high').length,medium:flagged.filter(s=>s.riskLevel==='medium').length,low:students.length-flagged.length,monitoring:d.students.filter(s=>s.intervention_status==='monitor').length,total:students.length},byFaculty:d.faculties.map(f=>{const a=flagged.filter(s=>s.faculty_id===f.id);return {id:f.id,name:f.name,code:f.code,high:a.filter(s=>s.riskLevel==='high').length,medium:a.filter(s=>s.riskLevel==='medium').length,population:students.filter(s=>s.faculty_id===f.id).length,share:0}}),byReason:[{flag:'grade_below',label:'Grade below pass mark',count:flagged.filter(s=>s.avgGrade<60).length},{flag:'attendance_low',label:'Attendance below requirement',count:flagged.filter(s=>s.attendanceRate<75).length}],rows:flagged};}
  if(action==='reports')return {rows:[]};
  if(action==='programmes')return {rows:[...new Set(students.map(s=>s.programme))].map(name=>({id:name,name,students:students.filter(s=>s.programme===name).length,faculties:[],faculty_names:'',years:[1,2,3,4],groups:4,avgGrade:avg(students.filter(s=>s.programme===name).map(s=>s.avgGrade)),attendanceRate:null,atRisk:0,monitoring:0}))};
  if(action==='studentDetail'){const s=students.find(x=>x.id===params.studentId);return s?{student:s,metrics:s,courses:[],recent:[]}: {error:'Student not found'};}
  return {rows:[]};
}

// Every dean-level screen reads the institutional summary from one authorised
// endpoint; nothing here queries records directly.
export async function fetchDeanData(action, params = {}) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') return demoDeanData(action, params);
  const response = await base44.functions.invoke('deanData', { action, ...params });
  return response.data;
}

export function useDeanData(action, params = {}, revision = 0) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const key = JSON.stringify(params);

  useEffect(() => {
    let active = true;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    fetchDeanData(action, JSON.parse(key))
      .then((payload) => {
        if (!active) return;
        if (payload && payload.error) setState({ loading: false, data: null, error: payload.error });
        else setState({ loading: false, data: payload, error: null });
      })
      .catch((error) => {
        if (!active) return;
        setState({
          loading: false,
          data: null,
          error: error?.response?.data?.error || error?.message || 'The institutional dataset could not be opened',
        });
      });
    return () => {
      active = false;
    };
  }, [action, key, revision]);

  return state;
}

export function useDebouncedValue(value, delay = 320) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export const nf = (value, digits = 1) =>
  value === null || value === undefined || Number.isNaN(Number(value)) ? '—' : Number(value).toFixed(digits);

export const pct = (value, digits = 1) =>
  value === null || value === undefined || Number.isNaN(Number(value)) ? '—' : `${Number(value).toFixed(digits)}%`;

export const num = (value) =>
  value === null || value === undefined ? '—' : Number(value).toLocaleString('en-GB');

export const RISK_LABELS = { high: 'High risk', medium: 'Watch list', low: 'On track' };

export const RISK_TONES = { high: 'critical', medium: 'warning', low: 'positive' };

export const EMPLOYMENT_LABELS = {
  full_time: 'Full time',
  part_time: 'Part time',
  visiting: 'Visiting',
};

export const STATUS_LABELS = {
  active: 'Active',
  academic_leave: 'Academic leave',
  monitoring: 'Monitoring',
  none: 'No intervention',
};

export function gradeTone(value) {
  if (value === null || value === undefined) return 'neutral';
  if (value < 60) return 'critical';
  if (value < 70) return 'warning';
  if (value >= 85) return 'positive';
  return 'brand';
}

export function rateTone(value) {
  if (value === null || value === undefined) return 'neutral';
  if (value < 65) return 'critical';
  if (value < 75) return 'warning';
  return 'positive';
}

export function readFilter(key) {
  return new URLSearchParams(window.location.search).get(key) || '';
}