import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildStudentContext } from '../../shared/student/context.ts';

// The single authorised academic context for the Student Portal.
// The student is resolved from the authenticated account, never from the payload.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const context = await buildStudentContext(base44, user);
    return Response.json(context);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}