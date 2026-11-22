<?php
declare(strict_types=1);

/**
 * Additive, repeatable demo records for every existing active workspace.
 * This helper never creates, edits, or deletes user accounts or real records.
 */
function sl_seed_demo_workspace_expansion(PDO $db, int $adminId, int $lecturerId, array $studentIds, array $offeringIds): void
{
    $workspaceUsers = $db->query("SELECT id,role FROM users WHERE account_status='active' AND is_demo=1 AND role IN ('student','lecturer','administrator') ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);

    // Give administrators visible sample work as well as the shared institutional records.
    foreach ($workspaceUsers as $user) {
        $userId = (int)$user['id'];
        $role = (string)$user['role'];
        $tasks = $role === 'student' ? [
            ['[DEMO] Read the weekly course brief','IR101','2026-12-02','normal'],
            ['[DEMO] Submit comparative policy analysis','IR205','2026-12-05','high'],
        ] : ($role === 'lecturer' ? [
            ['[DEMO] Prepare seminar discussion questions','IR101','2026-12-03','normal'],
            ['[DEMO] Review sample student submissions','ECON101','2026-12-06','high'],
        ] : [
            ['[DEMO] Review academic activity summary','ADMIN','2026-12-04','normal'],
            ['[DEMO] Check semester announcements','ADMIN','2026-12-07','normal'],
        ]);
        foreach ($tasks as [$title,$course,$due,$priority]) {
            $q=$db->prepare('SELECT id FROM tasks WHERE user_id=? AND title=?');
            $q->execute([$userId,$title]);
            if (!$q->fetchColumn()) {
                $q=$db->prepare('INSERT INTO tasks(user_id,title,course,due_date,priority) VALUES(?,?,?,?,?)');
                $q->execute([$userId,$title,$course,$due,$priority]);
            }
        }

        $events = $role === 'student' ? [
            ['[DEMO] Study skills workshop','2026-12-08','13:00:00','Student learning centre'],
        ] : ($role === 'lecturer' ? [
            ['[DEMO] Department teaching review','2026-12-08','10:00:00','Faculty meeting room'],
        ] : [
            ['[DEMO] Academic services review','2026-12-09','11:00:00','Administration office'],
        ]);
        foreach ($events as [$title,$date,$time,$place]) {
            $q=$db->prepare('SELECT id FROM events WHERE user_id=? AND title=? AND event_date=? AND start_time=?');
            $q->execute([$userId,$title,$date,$time]);
            if (!$q->fetchColumn()) {
                $q=$db->prepare('INSERT INTO events(user_id,title,event_date,start_time,location) VALUES(?,?,?,?,?)');
                $q->execute([$userId,$title,$date,$time,$place]);
            }
        }

        // One sample AI conversation per workspace user, with no external AI/API call.
        $conversationTitle='[DEMO] Academic planning example';
        $q=$db->prepare('SELECT id FROM ai_conversations WHERE owner_id=? AND workspace_role=? AND title=?');
        $q->execute([$userId,$role,$conversationTitle]);
        $conversationId=(int)$q->fetchColumn();
        if (!$conversationId) {
            $q=$db->prepare("INSERT INTO ai_conversations(owner_id,workspace_role,course_code,title,support_mode) VALUES(?,?,?,?,?)");
            $q->execute([$userId,$role,$role==='student'?'IR101':'','[DEMO] Academic planning example','general']);
            $conversationId=(int)$db->lastInsertId();
        }
        $q=$db->prepare('SELECT COUNT(*) FROM ai_messages WHERE conversation_id=?');
        $q->execute([$conversationId]);
        if (!(int)$q->fetchColumn()) {
            $prompt = $role==='student'
                ? 'Help me organise my reading and revision for this week.'
                : ($role==='lecturer' ? 'Suggest a clear structure for a seminar and follow-up feedback.' : 'Summarise the academic areas an administrator should review this week.');
            $answer = 'DEMO EXAMPLE: This conversation contains fictional sample content only. Use the real academic records and institutional guidance when making decisions.';
            $q=$db->prepare('INSERT INTO ai_messages(conversation_id,message_role,content) VALUES(?,?,?)');
            $q->execute([$conversationId,'user',$prompt]);
            $q->execute([$conversationId,'assistant',$answer]);
        }
    }

    // Student study groups are fictional, private to enrolled active students, and created once.
    foreach (['IR101'=>'[DEMO] International Relations Study Circle','ECON101'=>'[DEMO] Economics Revision Group'] as $courseCode=>$groupTitle) {
        $ownerId = $studentIds ? (int)$studentIds[0] : 0;
        if (!$ownerId) continue;
        $q=$db->prepare('SELECT id FROM study_groups WHERE owner_id=? AND title=?');
        $q->execute([$ownerId,$groupTitle]);
        $groupId=(int)$q->fetchColumn();
        if (!$groupId) {
            $q=$db->prepare('INSERT INTO study_groups(owner_id,course_code,title,purpose) VALUES(?,?,?,?)');
            $q->execute([$ownerId,$courseCode,$groupTitle,'Fictional preview group for demonstrating student collaboration tools.']);
            $groupId=(int)$db->lastInsertId();
        }
        foreach ($studentIds as $studentId) {
            $q=$db->prepare('INSERT IGNORE INTO study_group_members(group_id,user_id) VALUES(?,?)');
            $q->execute([$groupId,(int)$studentId]);
        }
    }

    // Sample support messages let students see the inbox without exposing real conversations.
    foreach ($studentIds as $studentId) {
        $subject='[DEMO] Welcome and academic support';
        $q=$db->prepare('SELECT id FROM student_messages WHERE sender_id=? AND recipient_id=? AND subject=?');
        $q->execute([$adminId,(int)$studentId,$subject]);
        if (!$q->fetchColumn()) {
            $q=$db->prepare('INSERT INTO student_messages(sender_id,recipient_id,subject,body) VALUES(?,?,?,?)');
            $q->execute([$adminId,(int)$studentId,$subject,'This is a fictional preview message. In the live service, use this inbox to contact the appropriate university office.']);
        }

        // Clearly labelled sample intervention; it is not an actual risk judgement.
        $offeringId=(int)($offeringIds['IR101']??0);
        $q=$db->prepare("SELECT id FROM academic_interventions WHERE student_id=? AND action_title=?");
        $q->execute([(int)$studentId,'[DEMO] Offer study-planning support']);
        if (!$q->fetchColumn()) {
            $q=$db->prepare('INSERT INTO academic_interventions(student_id,created_by,course_offering_id,action_title,notes,follow_up_date,status) VALUES(?,?,?,?,?,?,?)');
            $q->execute([(int)$studentId,$adminId,$offeringId?:null,'[DEMO] Offer study-planning support','Fictional example only. This is not a real student risk assessment or an official intervention.','2026-12-10','open']);
        }

        $goalTitle='[DEMO] Build a weekly study routine';
        $q=$db->prepare('SELECT id FROM student_personal_goals WHERE owner_id=? AND title=?');
        $q->execute([(int)$studentId,$goalTitle]);
        if (!$q->fetchColumn()) {
            $q=$db->prepare("INSERT INTO student_personal_goals(owner_id,category,title,details,review_date,status,share_with_ai) VALUES(?,?,?,?,?,'active',0)");
            $q->execute([(int)$studentId,'study_habits',$goalTitle,'Fictional preview goal: plan reading, attend classes and review notes each week.','2026-12-15']);
        }
        $planTitle='[DEMO] IR101 revision plan';
        $q=$db->prepare('SELECT id FROM student_academic_plans WHERE owner_id=? AND title=?');
        $q->execute([(int)$studentId,$planTitle]);
        if (!$q->fetchColumn()) {
            $q=$db->prepare("INSERT INTO student_academic_plans(owner_id,course_code,title,plan_text,target_date,status) VALUES(?,?,?,?,?,'active')");
            $q->execute([(int)$studentId,'IR101',$planTitle,'Fictional sample plan: review lecture notes, make a one-page summary, and prepare two discussion questions.','2026-12-12']);
        }
    }

    // Admin audit examples are visibly labelled and contain no changes to account/security state.
    $auditTitle='[DEMO] Preview data prepared';
    $q=$db->prepare("SELECT id FROM admin_audit WHERE actor_id=? AND action='demo_seed_preview' AND details=?");
    $q->execute([$adminId,$auditTitle]);
    if (!$q->fetchColumn()) {
        $q=$db->prepare('INSERT INTO admin_audit(actor_id,action,details) VALUES(?,?,?)');
        $q->execute([$adminId,'demo_seed_preview',$auditTitle]);
    }

    // A lecturer-authored class-channel announcement gives enrolled students a sample discussion thread.
    if (function_exists('sl_comms_room_by_key') && function_exists('sl_comms_add_member') && !empty($offeringIds['IR101'])) {
        $offeringId=(int)$offeringIds['IR101'];
        // Preserve an existing class-room title and membership. Create only when absent.
        $roomLookup=$db->prepare('SELECT id FROM sl_conversations WHERE room_key=? LIMIT 1');
        $roomLookup->execute(['offering:'.$offeringId]);
        $roomId=(int)$roomLookup->fetchColumn();
        if (!$roomId) $roomId=sl_comms_room_by_key($db,'class','offering:'.$offeringId,'IR101 · Introduction to International Relations · Demo discussion',$lecturerId,$offeringId);
        // Only add the lecturer actually assigned to this offering.
        $assigned=$db->prepare("SELECT u.id FROM course_offerings o JOIN users u ON u.id=o.lecturer_id WHERE o.id=? AND u.role='lecturer' AND u.account_status='active' AND u.is_demo=1");
        $assigned->execute([$offeringId]);
        $assignedLecturer=(int)$assigned->fetchColumn();
        if ($assignedLecturer) {
            sl_comms_add_member($db,$roomId,$assignedLecturer,'lecturer');
            foreach ($studentIds as $studentId) sl_comms_add_member($db,$roomId,(int)$studentId,'member');
            $nonce=substr(hash('sha256','studentlife-demo-ir101-welcome'),0,32);
            $q=$db->prepare('SELECT id FROM sl_messages WHERE sender_id=? AND client_nonce=?');
            $q->execute([$assignedLecturer,$nonce]);
            $messageId=(int)$q->fetchColumn();
            if (!$messageId) {
                $q=$db->prepare('INSERT INTO sl_messages(conversation_id,sender_id,body,client_nonce) VALUES(?,?,?,?)');
                $q->execute([$roomId,$assignedLecturer,'[DEMO] Welcome to the IR101 discussion. Use this sample thread to explore course communication.',$nonce]);
                $messageId=(int)$db->lastInsertId();
            }
            foreach ($studentIds as $studentId) {
                $q=$db->prepare('INSERT IGNORE INTO sl_notifications(user_id,conversation_id,message_id) VALUES(?,?,?)');
                $q->execute([(int)$studentId,$roomId,$messageId]);
            }
        }
    }
}
