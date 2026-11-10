import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Peer-led study groups. Every read and write is decided here: a group is only
// visible and joinable by a student enrolled in its course, and the leader is
// taken from the authenticated identity, never from the request body.
const FOCUS = ['exam_prep', 'problem_sets', 'readings', 'projects', 'general'];
const MAX_NAME = 80;
const MAX_DESCRIPTION = 600;
const MAX_TEXT = 140;
const DEFAULT_LIMIT = 8;

const list = (page: any) => (Array.isArray(page) ? page : page?.items || []);

const text = (value: any, max: number) => String(value ?? '').trim().slice(0, max);

// A student's own enrolments decide which groups exist for them.
async function enrolledCourses(base44: any, userId: string) {
  const students = list(
    await base44.asServiceRole.entities.Student.filter({ user_id: userId }, { limit: 2 })
  );
  const student = students[0] || null;
  if (!student) return { student: null, courses: [] };

  const [byStudentId, byUserId] = await Promise.all([
    base44.asServiceRole.entities.CourseEnrollment.filter({ student_id: student.id }, { limit: 200 }),
    base44.asServiceRole.entities.CourseEnrollment.filter({ student_user_id: userId }, { limit: 200 }),
  ]);

  const courseIds = [
    ...new Set(
      [...list(byStudentId), ...list(byUserId)].map((row: any) => row.course_id).filter(Boolean)
    ),
  ];
  if (!courseIds.length) return { student, courses: [] };

  const courses = list(
    await base44.asServiceRole.entities.Course.filter(
      { id: { $in: courseIds }, status: 'published' },
      { limit: 100 }
    )
  );

  return { student, courses };
}

async function loadBoard(base44: any, userId: string) {
  const { student, courses } = await enrolledCourses(base44, userId);
  const courseIds = courses.map((course: any) => course.id);
  if (!courseIds.length) return { student, courses: [], groups: [] };

  const [groups, members] = await Promise.all([
    base44.asServiceRole.entities.StudyGroup.filter(
      { course_id: { $in: courseIds }, status: { $ne: 'archived' } },
      { sort: '-created_date', limit: 200 }
    ),
    base44.asServiceRole.entities.StudyGroupMember.filter(
      { course_id: { $in: courseIds }, status: 'active' },
      { limit: 800 }
    ),
  ]);

  const roster = list(members);
  const board = list(groups).map((group: any) => {
    const active = roster.filter((member: any) => member.group_id === group.id);
    const mine = active.find((member: any) => member.user_id === userId) || null;
    return {
      ...group,
      member_count: active.length,
      is_member: Boolean(mine),
      is_leader: mine?.role === 'leader' || group.leader_user_id === userId,
      members: active.map((member: any) => ({
        user_id: member.user_id,
        user_name: member.user_name,
        role: member.role,
      })),
    };
  });

  return {
    student: student ? { id: student.id, full_name: student.full_name } : null,
    courses: courses.map((course: any) => ({
      id: course.id,
      code: course.code,
      title: course.title,
      semester: course.semester,
    })),
    groups: board,
  };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const action = String(payload.action || 'list');

    if (action === 'list') {
      return Response.json(await loadBoard(base44, user.id));
    }

    if (action === 'create') {
      const { courses } = await enrolledCourses(base44, user.id);
      const course = courses.find((row: any) => row.id === payload.course_id);
      if (!course) {
        return Response.json(
          { error: 'You can only start a group for a course you are enrolled in.' },
          { status: 403 }
        );
      }

      const name = text(payload.name, MAX_NAME);
      if (name.length < 3) {
        return Response.json({ error: 'Give the group a name of at least 3 characters.' }, { status: 400 });
      }
      const limit = Math.min(20, Math.max(3, Number(payload.member_limit) || DEFAULT_LIMIT));

      const group = await base44.asServiceRole.entities.StudyGroup.create({
        course_id: course.id,
        course_code: course.code,
        course_title: course.title,
        semester: course.semester,
        name,
        description: text(payload.description, MAX_DESCRIPTION),
        focus: FOCUS.includes(payload.focus) ? payload.focus : 'general',
        schedule: text(payload.schedule, MAX_TEXT),
        location: text(payload.location, MAX_TEXT),
        leader_user_id: user.id,
        leader_name: user.full_name || user.email || 'Student',
        member_count: 1,
        member_limit: limit,
        status: 'open',
      });

      await base44.asServiceRole.entities.StudyGroupMember.create({
        group_id: group.id,
        course_id: course.id,
        user_id: user.id,
        user_name: user.full_name || user.email || 'Student',
        role: 'leader',
        status: 'active',
        joined_at: new Date().toISOString(),
      });

      return Response.json({ group });
    }

    if (action === 'join' || action === 'leave') {
      const group = await base44.asServiceRole.entities.StudyGroup
        .get(payload.group_id)
        .catch((e: any) => (e.status === 404 ? null : Promise.reject(e)));
      if (!group) return Response.json({ error: 'This study group no longer exists.' }, { status: 404 });

      const { courses } = await enrolledCourses(base44, user.id);
      if (!courses.some((row: any) => row.id === group.course_id)) {
        return Response.json(
          { error: 'This group belongs to a course you are not enrolled in.' },
          { status: 403 }
        );
      }

      const existing = list(
        await base44.asServiceRole.entities.StudyGroupMember.filter(
          { group_id: group.id, user_id: user.id },
          { limit: 2 }
        )
      )[0] || null;

      if (action === 'join') {
        if (existing?.status === 'active') return Response.json({ ok: true, already: true });
        if (group.status !== 'open') {
          return Response.json({ error: 'This group is not accepting members.' }, { status: 409 });
        }

        const active = list(
          await base44.asServiceRole.entities.StudyGroupMember.filter(
            { group_id: group.id, status: 'active' },
            { limit: 100 }
          )
        ).length;
        if (active >= (group.member_limit || DEFAULT_LIMIT)) {
          await base44.asServiceRole.entities.StudyGroup.update(group.id, { status: 'full' });
          return Response.json({ error: 'This group already has its full number of members.' }, { status: 409 });
        }

        if (existing) {
          await base44.asServiceRole.entities.StudyGroupMember.update(existing.id, {
            status: 'active',
            joined_at: new Date().toISOString(),
          });
        } else {
          await base44.asServiceRole.entities.StudyGroupMember.create({
            group_id: group.id,
            course_id: group.course_id,
            user_id: user.id,
            user_name: user.full_name || user.email || 'Student',
            role: 'member',
            status: 'active',
            joined_at: new Date().toISOString(),
          });
        }

        const total = active + 1;
        await base44.asServiceRole.entities.StudyGroup.update(group.id, {
          member_count: total,
          status: total >= (group.member_limit || DEFAULT_LIMIT) ? 'full' : 'open',
        });
        return Response.json({ ok: true, member_count: total });
      }

      if (!existing || existing.status !== 'active') {
        return Response.json({ error: 'You are not a member of this group.' }, { status: 400 });
      }
      if (existing.role === 'leader') {
        return Response.json(
          { error: 'You lead this group, so you cannot leave it.' },
          { status: 400 }
        );
      }

      await base44.asServiceRole.entities.StudyGroupMember.update(existing.id, { status: 'left' });
      const active = list(
        await base44.asServiceRole.entities.StudyGroupMember.filter(
          { group_id: group.id, status: 'active' },
          { limit: 100 }
        )
      ).length;
      await base44.asServiceRole.entities.StudyGroup.update(group.id, {
        member_count: active,
        status: 'open',
      });
      return Response.json({ ok: true, member_count: active });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Study groups are unavailable' }, { status: 500 });
  }
}