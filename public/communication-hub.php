<?php
declare(strict_types=1);

/**
 * StudentLife Communication Hub.
 * All conversation reads and writes are gated by authenticated membership.
 */
function sl_comms_bootstrap(PDO $db): void
{
    $statements = [
        "CREATE TABLE IF NOT EXISTS sl_conversations (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            room_type VARCHAR(12) NOT NULL,
            room_key VARCHAR(120) NOT NULL UNIQUE,
            title VARCHAR(180) NOT NULL,
            source_id BIGINT UNSIGNED NULL,
            created_by INT UNSIGNED NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX(room_type, updated_at),
            FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        "CREATE TABLE IF NOT EXISTS sl_conversation_members (
            conversation_id BIGINT UNSIGNED NOT NULL,
            user_id INT UNSIGNED NOT NULL,
            member_role VARCHAR(12) NOT NULL DEFAULT 'member',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_read_at DATETIME NULL,
            muted_at DATETIME NULL,
            PRIMARY KEY(conversation_id,user_id),
            INDEX(user_id,conversation_id),
            FOREIGN KEY(conversation_id) REFERENCES sl_conversations(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        "CREATE TABLE IF NOT EXISTS sl_messages (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            conversation_id BIGINT UNSIGNED NOT NULL,
            sender_id INT UNSIGNED NOT NULL,
            body TEXT NOT NULL,
            parent_message_id BIGINT UNSIGNED NULL,
            client_nonce CHAR(32) NOT NULL,
            edited_at DATETIME NULL,
            deleted_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_sl_message_nonce(sender_id,client_nonce),
            INDEX(conversation_id,id),
            INDEX(sender_id,created_at),
            FOREIGN KEY(conversation_id) REFERENCES sl_conversations(id) ON DELETE CASCADE,
            FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(parent_message_id) REFERENCES sl_messages(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        "CREATE TABLE IF NOT EXISTS sl_message_reactions (
            message_id BIGINT UNSIGNED NOT NULL,
            user_id INT UNSIGNED NOT NULL,
            reaction VARCHAR(12) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(message_id,user_id,reaction),
            FOREIGN KEY(message_id) REFERENCES sl_messages(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        "CREATE TABLE IF NOT EXISTS sl_message_attachments (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            message_id BIGINT UNSIGNED NOT NULL,
            conversation_id BIGINT UNSIGNED NOT NULL,
            uploader_id INT UNSIGNED NOT NULL,
            original_name VARCHAR(180) NOT NULL,
            stored_name VARCHAR(80) NOT NULL UNIQUE,
            mime_type VARCHAR(80) NOT NULL,
            file_size INT UNSIGNED NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX(conversation_id,message_id),
            FOREIGN KEY(message_id) REFERENCES sl_messages(id) ON DELETE CASCADE,
            FOREIGN KEY(conversation_id) REFERENCES sl_conversations(id) ON DELETE CASCADE,
            FOREIGN KEY(uploader_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        "CREATE TABLE IF NOT EXISTS sl_notifications (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            conversation_id BIGINT UNSIGNED NOT NULL,
            message_id BIGINT UNSIGNED NOT NULL,
            read_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_sl_notification(user_id,message_id),
            INDEX(user_id,read_at,created_at),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(conversation_id) REFERENCES sl_conversations(id) ON DELETE CASCADE,
            FOREIGN KEY(message_id) REFERENCES sl_messages(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        "CREATE TABLE IF NOT EXISTS sl_message_reports (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            message_id BIGINT UNSIGNED NOT NULL,
            conversation_id BIGINT UNSIGNED NOT NULL,
            reporter_id INT UNSIGNED NOT NULL,
            reason VARCHAR(32) NOT NULL,
            status VARCHAR(16) NOT NULL DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX(status,created_at),
            FOREIGN KEY(message_id) REFERENCES sl_messages(id) ON DELETE CASCADE,
            FOREIGN KEY(conversation_id) REFERENCES sl_conversations(id) ON DELETE CASCADE,
            FOREIGN KEY(reporter_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    ];
    foreach ($statements as $sql) $db->exec($sql);
}

function sl_comms_require_student(): int
{
    if (($_SESSION['user']['role'] ?? '') !== 'student' || empty($_SESSION['user']['id'])) {
        http_response_code(403);
        exit('Student access required.');
    }
    return (int)$_SESSION['user']['id'];
}

function sl_comms_redirect(int $conversationId = 0): never
{
    header('Location: ?page=communication'.($conversationId > 0 ? '&conversation_id='.$conversationId : ''));
    exit;
}

function sl_comms_room(PDO $db, int $conversationId, int $userId): ?array
{
    $q = $db->prepare("SELECT c.*,m.muted_at FROM sl_conversations c
        JOIN sl_conversation_members m ON m.conversation_id=c.id AND m.user_id=?
        WHERE c.id=?");
    $q->execute([$userId,$conversationId]);
    return $q->fetch() ?: null;
}

function sl_comms_add_member(PDO $db, int $conversationId, int $userId, string $role = 'member'): void
{
    $q=$db->prepare("INSERT IGNORE INTO sl_conversation_members(conversation_id,user_id,member_role) VALUES(?,?,?)");
    $q->execute([$conversationId,$userId,$role]);
}

function sl_comms_room_by_key(PDO $db, string $type, string $key, string $title, int $creator, ?int $sourceId = null): int
{
    $q=$db->prepare("INSERT INTO sl_conversations(room_type,room_key,title,source_id,created_by)
        VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id),title=VALUES(title)");
    $q->execute([$type,$key,$title,$sourceId,$creator]);
    return (int)$db->lastInsertId();
}

function sl_comms_sync_student(PDO $db, int $userId): void
{
    $classQ=$db->prepare("SELECT DISTINCT o.id,c.code,c.title,o.section_code,t.name AS term_name
        FROM course_enrolments e
        JOIN course_offerings o ON o.id=e.offering_id
        JOIN academic_courses c ON c.id=o.course_id
        JOIN academic_terms t ON t.id=o.term_id
        WHERE e.student_id=? AND e.status='enrolled' AND o.status='open'
        ORDER BY c.code,o.section_code");
    $classQ->execute([$userId]);
    foreach($classQ as $row){
        $offerId=(int)$row['id'];
        $title=trim($row['code'].' · '.$row['title'].' · '.$row['term_name'].' · Section '.$row['section_code']);
        $roomId=sl_comms_room_by_key($db,'class','offering:'.$offerId,$title,$userId,$offerId);
        $db->prepare("INSERT IGNORE INTO sl_conversation_members(conversation_id,user_id,member_role)
            SELECT ?,e.student_id,'member' FROM course_enrolments e
            WHERE e.offering_id=? AND e.status='enrolled'")->execute([$roomId,$offerId]);
    }
    $groups=$db->prepare("SELECT g.id,g.title,g.owner_id,m.joined_at
        FROM study_groups g JOIN study_group_members m ON m.group_id=g.id
        JOIN users u ON u.id=m.user_id AND u.account_status='active'
        WHERE m.user_id=? ORDER BY g.created_at DESC");
    $groups->execute([$userId]);
    foreach($groups as $group){
        $groupId=(int)$group['id'];
        $roomId=sl_comms_room_by_key($db,'group','group:'.$groupId,$group['title'],(int)$group['owner_id'],$groupId);
        $members=$db->prepare("INSERT IGNORE INTO sl_conversation_members(conversation_id,user_id,member_role)
            SELECT ?,gm.user_id,IF(gm.user_id=?,'owner','member')
            FROM study_group_members gm JOIN users u ON u.id=gm.user_id AND u.account_status='active'
            WHERE gm.group_id=?");
        $members->execute([$roomId,(int)$group['owner_id'],$groupId]);
    }
}

function sl_comms_dispatch(PDO $db, string $action): void
{
    $userId=sl_comms_require_student();
    $conversationId=(int)($_POST['conversation_id']??0);
    if($action==='communication_start_direct'){
        $recipient=(int)($_POST['recipient_id']??0);
        if($recipient<1||$recipient===$userId){$_SESSION['err']='Choose another active student.';sl_comms_redirect();}
        $q=$db->prepare("SELECT id,name FROM users WHERE id=? AND role='student' AND account_status='active'");
        $q->execute([$recipient]);$target=$q->fetch();
        if(!$target){$_SESSION['err']='That student is not available for messaging.';sl_comms_redirect();}
        $low=min($userId,$recipient);$high=max($userId,$recipient);$key='direct:'.$low.':'.$high;
        $roomId=sl_comms_room_by_key($db,'direct',$key,'Direct message',$userId);
        sl_comms_add_member($db,$roomId,$low);sl_comms_add_member($db,$roomId,$high);
        sl_comms_redirect($roomId);
    }
    if($action==='communication_mark_read'){
        $room=sl_comms_room($db,$conversationId,$userId);
        if(!$room){http_response_code(404);exit('Conversation not found.');}
        $db->prepare("UPDATE sl_conversation_members SET last_read_at=NOW() WHERE conversation_id=? AND user_id=?")->execute([$conversationId,$userId]);
        $db->prepare("UPDATE sl_notifications SET read_at=NOW() WHERE conversation_id=? AND user_id=? AND read_at IS NULL")->execute([$conversationId,$userId]);
        sl_comms_redirect($conversationId);
    }
    $room=sl_comms_room($db,$conversationId,$userId);
    if(!$room){http_response_code(404);exit('Conversation not found.');}
    if($action==='communication_send'){
        $body=trim((string)($_POST['body']??''));$parentId=(int)($_POST['parent_message_id']??0);
        $file=$_FILES['attachment']??null;
        $hasFile=is_array($file)&&($file['error']??UPLOAD_ERR_NO_FILE)===UPLOAD_ERR_OK;
        if(($body===''&&!$hasFile)||mb_strlen($body)>4000){$_SESSION['err']='Enter a message up to 4,000 characters, or attach a permitted file.';sl_comms_redirect($conversationId);}
        if($parentId){$check=$db->prepare("SELECT COUNT(*) FROM sl_messages WHERE id=? AND conversation_id=? AND deleted_at IS NULL");$check->execute([$parentId,$conversationId]);if(!(int)$check->fetchColumn()){$_SESSION['err']='That reply target is no longer available in this conversation.';sl_comms_redirect($conversationId);}}
        $limit=$db->prepare("SELECT COUNT(*) FROM sl_messages WHERE sender_id=? AND created_at>=DATE_SUB(NOW(),INTERVAL 1 MINUTE)");$limit->execute([$userId]);
        if((int)$limit->fetchColumn()>=20){$_SESSION['err']='Please wait a moment before sending another message.';sl_comms_redirect($conversationId);}
        $tmp='';$stored='';$original='';$mime='';$size=0;
        if($hasFile){
            $extension=strtolower(pathinfo((string)$file['name'],PATHINFO_EXTENSION));$size=(int)$file['size'];$tmp=(string)$file['tmp_name'];
            $allowed=['pdf'=>['application/pdf'],'txt'=>['text/plain'],'png'=>['image/png'],'jpg'=>['image/jpeg'],'jpeg'=>['image/jpeg'],'webp'=>['image/webp'],'docx'=>['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],'pptx'=>['application/vnd.openxmlformats-officedocument.presentationml.presentation']];
            if(!isset($allowed[$extension])||$size<1||$size>10485760||!is_uploaded_file($tmp)||!function_exists('finfo_open')){$_SESSION['err']='Upload a supported PDF, TXT, DOCX, PPTX, PNG, JPG or WebP file up to 10 MB.';sl_comms_redirect($conversationId);}
            $finfo=finfo_open(FILEINFO_MIME_TYPE);$mime=$finfo?(string)finfo_file($finfo,$tmp):'';if($finfo)finfo_close($finfo);
            if(!in_array($mime,$allowed[$extension],true)){$_SESSION['err']='The file contents do not match its file type.';sl_comms_redirect($conversationId);}
            $original=mb_substr(basename((string)$file['name']),0,180);
            $stored=bin2hex(random_bytes(20)).'.'.$extension;
            $dir=dirname(__DIR__).'/studentlife-private-communication';
            if(!is_dir($dir)&&!mkdir($dir,0700,true)){$_SESSION['err']='Private file storage is unavailable.';sl_comms_redirect($conversationId);}
            if(!move_uploaded_file($tmp,$dir.'/'.$stored)){$_SESSION['err']='The attachment could not be stored.';sl_comms_redirect($conversationId);}
        }
        $nonce=preg_replace('/[^a-f0-9]/','',strtolower((string)($_POST['client_nonce']??'')));
        if(strlen($nonce)!==32){$nonce=bin2hex(random_bytes(16));}
        try{
            $db->beginTransaction();
            $q=$db->prepare("INSERT INTO sl_messages(conversation_id,sender_id,body,parent_message_id,client_nonce) VALUES(?,?,?,?,?)");
            $q->execute([$conversationId,$userId,$body,$parentId?:null,$nonce]);$messageId=(int)$db->lastInsertId();
            if($hasFile){
                $db->prepare("INSERT INTO sl_message_attachments(message_id,conversation_id,uploader_id,original_name,stored_name,mime_type,file_size) VALUES(?,?,?,?,?,?,?)")
                   ->execute([$messageId,$conversationId,$userId,$original,$stored,$mime,$size]);
            }
            $db->prepare("UPDATE sl_conversations SET updated_at=NOW() WHERE id=?")->execute([$conversationId]);
            $notify=$db->prepare("INSERT IGNORE INTO sl_notifications(user_id,conversation_id,message_id)
                SELECT m.user_id,?,? FROM sl_conversation_members m
                WHERE m.conversation_id=? AND m.user_id<>? AND m.muted_at IS NULL
                AND NOT EXISTS (SELECT 1 FROM sl_notifications n WHERE n.user_id=m.user_id AND n.conversation_id=? AND n.read_at IS NULL AND n.created_at>=DATE_SUB(NOW(),INTERVAL 5 MINUTE))");
            $notify->execute([$conversationId,$messageId,$conversationId,$userId,$conversationId]);
            $db->commit();
        }catch(Throwable $e){
            if($db->inTransaction())$db->rollBack();
            if($stored!=='')@unlink(dirname(__DIR__).'/studentlife-private-communication/'.$stored);
            $_SESSION['err']='The message could not be saved. Please try again.';sl_comms_redirect($conversationId);
        }
        $_SESSION['notice']='Message sent.';sl_comms_redirect($conversationId);
    }
    if($action==='communication_react'){
        $messageId=(int)($_POST['message_id']??0);$reaction=(string)($_POST['reaction']??'');
        if(!in_array($reaction,['like','love','helpful','celebrate','laugh'],true)){http_response_code(400);exit('Invalid reaction.');}
        $check=$db->prepare("SELECT id FROM sl_messages WHERE id=? AND conversation_id=? AND deleted_at IS NULL");$check->execute([$messageId,$conversationId]);
        if(!$check->fetchColumn()){http_response_code(404);exit('Message not found.');}
        $exists=$db->prepare("SELECT COUNT(*) FROM sl_message_reactions WHERE message_id=? AND user_id=? AND reaction=?");$exists->execute([$messageId,$userId,$reaction]);
        if((int)$exists->fetchColumn())$db->prepare("DELETE FROM sl_message_reactions WHERE message_id=? AND user_id=? AND reaction=?")->execute([$messageId,$userId,$reaction]);
        else $db->prepare("INSERT IGNORE INTO sl_message_reactions(message_id,user_id,reaction) VALUES(?,?,?)")->execute([$messageId,$userId,$reaction]);
        sl_comms_redirect($conversationId);
    }
    if($action==='communication_edit'){
        $messageId=(int)($_POST['message_id']??0);$body=trim((string)($_POST['body']??''));
        if($body===''||mb_strlen($body)>4000){$_SESSION['err']='Enter an edited message up to 4,000 characters.';sl_comms_redirect($conversationId);}
        $q=$db->prepare("UPDATE sl_messages SET body=?,edited_at=NOW()
            WHERE id=? AND conversation_id=? AND sender_id=? AND deleted_at IS NULL AND created_at>=DATE_SUB(NOW(),INTERVAL 15 MINUTE)");
        $q->execute([$body,$messageId,$conversationId,$userId]);
        if(!$q->rowCount()){$_SESSION['err']='Only your own recent messages can be edited.';}
        sl_comms_redirect($conversationId);
    }
    if($action==='communication_delete'){
        $messageId=(int)($_POST['message_id']??0);
        $q=$db->prepare("UPDATE sl_messages SET body='',deleted_at=NOW()
            WHERE id=? AND conversation_id=? AND sender_id=? AND deleted_at IS NULL");
        $q->execute([$messageId,$conversationId,$userId]);
        if(!$q->rowCount()){$_SESSION['err']='Only your own message can be removed.';}
        sl_comms_redirect($conversationId);
    }
    if($action==='communication_mute'){
        $mute=isset($_POST['mute'])?1:0;
        $db->prepare("UPDATE sl_conversation_members SET muted_at=".($mute?'NOW()':'NULL')." WHERE conversation_id=? AND user_id=?")->execute([$conversationId,$userId]);
        sl_comms_redirect($conversationId);
    }
    if($action==='communication_report'){
        $messageId=(int)($_POST['message_id']??0);$reason=(string)($_POST['reason']??'');
        if(!in_array($reason,['harassment','spam','threat','private_information','other'],true)){http_response_code(400);exit('Invalid report reason.');}
        $check=$db->prepare("SELECT id FROM sl_messages WHERE id=? AND conversation_id=? AND deleted_at IS NULL");$check->execute([$messageId,$conversationId]);
        if(!$check->fetchColumn()){http_response_code(404);exit('Message not found.');}
        $db->prepare("INSERT INTO sl_message_reports(message_id,conversation_id,reporter_id,reason) VALUES(?,?,?,?)")->execute([$messageId,$conversationId,$userId,$reason]);
        $_SESSION['notice']='Report sent for authorized review.';sl_comms_redirect($conversationId);
    }
    http_response_code(400);exit('Unknown communication action.');
}

function sl_comms_download(PDO $db, array $user): never
{
    $userId=(int)($user['id']??0);$attachmentId=(int)($_GET['comms_attachment']??0);
    if(($user['role']??'')!=='student'||$attachmentId<1){http_response_code(404);exit('Attachment not found.');}
    $q=$db->prepare("SELECT a.* FROM sl_message_attachments a
        JOIN sl_conversation_members m ON m.conversation_id=a.conversation_id AND m.user_id=?
        WHERE a.id=?");
    $q->execute([$userId,$attachmentId]);$attachment=$q->fetch();
    if(!$attachment){http_response_code(404);exit('Attachment not found.');}
    $path=dirname(__DIR__).'/studentlife-private-communication/'.$attachment['stored_name'];
    if(!is_file($path)){http_response_code(404);exit('Attachment not found.');}
    header('Content-Type: '.$attachment['mime_type']);header('Content-Length: '.(int)$attachment['file_size']);
    header('Content-Disposition: attachment; filename="'.rawurlencode($attachment['original_name']).'"');
    header('X-Content-Type-Options: nosniff');readfile($path);exit;
}

function sl_comms_render(PDO $db, array $user): void
{
    $userId=sl_comms_require_student();sl_comms_sync_student($db,$userId);
    $conversationId=(int)($_GET['conversation_id']??0);$room=$conversationId?sl_comms_room($db,$conversationId,$userId):null;
    if($conversationId&&!$room){http_response_code(404);exit('Conversation not found.');}
    $q=$db->prepare("SELECT c.id,c.room_type,c.title,c.updated_at,
        (SELECT COUNT(*) FROM sl_notifications n WHERE n.conversation_id=c.id AND n.user_id=? AND n.read_at IS NULL) AS unread,
        (SELECT body FROM sl_messages m WHERE m.conversation_id=c.id ORDER BY m.id DESC LIMIT 1) AS last_message
        FROM sl_conversations c JOIN sl_conversation_members mine ON mine.conversation_id=c.id AND mine.user_id=?
        WHERE c.updated_at>=DATE_SUB(NOW(),INTERVAL 365 DAY)
        ORDER BY c.updated_at DESC,c.id DESC");
    $q->execute([$userId,$userId]);$rooms=$q->fetchAll();
    if($room){
        $db->prepare("UPDATE sl_conversation_members SET last_read_at=NOW() WHERE conversation_id=? AND user_id=?")->execute([$conversationId,$userId]);
        $db->prepare("UPDATE sl_notifications SET read_at=NOW() WHERE conversation_id=? AND user_id=? AND read_at IS NULL")->execute([$conversationId,$userId]);
    }
    $query=trim((string)($_GET['q']??''));$before=(int)($_GET['before']??0);$messages=[];
    if($room){
        $where="m.conversation_id=? AND ".($before>0?"m.id<?":"1=1");
        if($query!=='')$where.=" AND (m.body LIKE ? OR EXISTS(SELECT 1 FROM sl_message_attachments a WHERE a.message_id=m.id AND a.original_name LIKE ?))";
        $sql="SELECT m.*,u.name AS sender,pm.body AS parent_body,pu.name AS parent_sender,
            (SELECT COUNT(*) FROM sl_message_reactions r WHERE r.message_id=m.id AND r.reaction='like') AS like_count,
            (SELECT COUNT(*) FROM sl_message_reactions r WHERE r.message_id=m.id AND r.reaction='love') AS love_count,
            (SELECT COUNT(*) FROM sl_message_reactions r WHERE r.message_id=m.id AND r.reaction='helpful') AS helpful_count,
            (SELECT COUNT(*) FROM sl_message_reactions r WHERE r.message_id=m.id AND r.reaction='celebrate') AS celebrate_count,
            (SELECT COUNT(*) FROM sl_message_reactions r WHERE r.message_id=m.id AND r.reaction='laugh') AS laugh_count
            FROM sl_messages m JOIN users u ON u.id=m.sender_id
            LEFT JOIN sl_messages pm ON pm.id=m.parent_message_id LEFT JOIN users pu ON pu.id=pm.sender_id
            WHERE ".$where." ORDER BY m.id DESC LIMIT 50";
        $params=[$conversationId];if($before>0)$params[]=$before;if($query!==''){$params[]='%'.$query.'%';$params[]='%'.$query.'%';}
        $mq=$db->prepare($sql);$mq->execute($params);$messages=array_reverse($mq->fetchAll());
    }
    $unreadQ=$db->prepare("SELECT COUNT(*) FROM sl_notifications WHERE user_id=? AND read_at IS NULL");$unreadQ->execute([$userId]);$unreadCount=(int)$unreadQ->fetchColumn();
    $students=$db->prepare("SELECT id,name FROM users WHERE role='student' AND account_status='active' AND id<>? ORDER BY name LIMIT 200");$students->execute([$userId]);$studentList=$students->fetchAll();
    $activeClass=$room&&$room['room_type']==='class';
    ?>
    <style>
    #slCommunication{--sc-navy:#17385f;--sc-gold:#c3932d;--sc-line:#dfe6ef;--sc-muted:#687991;color:#152b49}
    #slCommunication *{box-sizing:border-box}
    #slCommunication .sc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}
    #slCommunication h1{margin:0 0 6px;font-size:clamp(1.6rem,4vw,2.2rem)}
    #slCommunication .sc-muted{color:var(--sc-muted);font-size:.94rem}
    #slCommunication .sc-layout{display:grid;grid-template-columns:minmax(260px,320px) minmax(0,1fr);gap:14px;min-height:580px;height:min(76vh,780px)}
    #slCommunication .sc-panel{background:#fff;border:1px solid var(--sc-line);border-radius:16px;overflow:hidden}
    #slCommunication .sc-side{display:flex;flex-direction:column;min-width:0}
    #slCommunication .sc-side-top,#slCommunication .sc-thread-top{padding:14px 16px;border-bottom:1px solid var(--sc-line)}
    #slCommunication .sc-room-list{overflow:auto;flex:1}
    #slCommunication .sc-room{display:block;padding:14px 16px;border-bottom:1px solid #edf0f5;color:inherit;text-decoration:none;transition:background .15s}
    #slCommunication .sc-room:hover,#slCommunication .sc-room[aria-current="page"]{background:#f2f7fb}
    #slCommunication .sc-room b{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px}
    #slCommunication .sc-room small{display:block;color:var(--sc-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #slCommunication .sc-badge{display:inline-block;flex:none;border-radius:999px;background:#244a76;color:#fff;padding:3px 8px;font-size:.75rem}
    #slCommunication .sc-thread{display:flex;flex-direction:column;min-width:0;min-height:0;height:100%}
    #slCommunication .sc-thread-top{flex:none}
    #slCommunication .sc-conversation-title{display:flex;align-items:center;gap:12px;min-width:0}
    #slCommunication .sc-conversation-title>a{flex:none;text-decoration:none}
    #slCommunication .sc-room-avatar{width:42px;height:42px;display:grid;place-items:center;flex:none;border-radius:50%;background:#e8f2f7;color:var(--sc-navy);font-weight:700}
    #slCommunication .sc-room-name{display:flex;flex:1;min-width:0;flex-direction:column;gap:3px}
    #slCommunication .sc-room-name strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #slCommunication .sc-room-name small{color:var(--sc-muted)}
    #slCommunication .sc-messages{padding:20px;overflow:auto;display:flex;flex:1;flex-direction:column;gap:9px;min-height:0;background-color:#f5f7f6;background-image:radial-gradient(#d8e1dc .7px,transparent .7px);background-size:18px 18px}
    #slCommunication .sc-message{position:relative;max-width:min(78%,680px);border:1px solid #e5e9e6;border-radius:4px 15px 15px 15px;padding:8px 12px;background:#fff;overflow-wrap:anywhere;box-shadow:0 1px 1px #102c4712}
    #slCommunication .sc-message.sc-own{align-self:flex-end;background:#dcf8c6;border-color:#d0edb8;border-radius:15px 4px 15px 15px}
    #slCommunication .sc-message-meta{display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:.76rem}
    #slCommunication .sc-message-meta b{color:#477a6b}
    #slCommunication .sc-message-meta small{color:#718078;text-align:right;font-size:.7rem}
    #slCommunication .sc-message-body{margin:4px 22px 2px 0;white-space:pre-wrap;line-height:1.45}
    #slCommunication .sc-message.sc-own .sc-message-body{margin-right:0}
    #slCommunication .sc-attachment{display:inline-flex;align-items:center;gap:6px;margin:5px 0;padding:7px 10px;border-radius:9px;background:#ffffffc9;color:var(--sc-navy);text-decoration:none;overflow-wrap:anywhere}
    #slCommunication .sc-message-options{position:absolute;top:5px;right:6px}
    #slCommunication .sc-message-options>summary{list-style:none;cursor:pointer;color:#73817a;font-size:18px;line-height:20px;width:24px;text-align:center;border-radius:50%}
    #slCommunication .sc-message-options>summary::-webkit-details-marker{display:none}
    #slCommunication .sc-options-popover{position:absolute;z-index:4;right:0;top:24px;display:flex;flex-direction:column;gap:7px;min-width:180px;max-height:270px;overflow:auto;padding:10px;background:#fff;border:1px solid var(--sc-line);border-radius:12px;box-shadow:0 8px 25px #142b4926}
    #slCommunication .sc-reactions{display:flex;flex-wrap:wrap;gap:4px}
    #slCommunication .sc-actions{display:flex;flex-wrap:wrap;gap:4px}
    #slCommunication button,#slCommunication input,#slCommunication select,#slCommunication textarea{font:inherit}
    #slCommunication .sc-btn{border:1px solid var(--sc-line);background:#fff;color:var(--sc-navy);border-radius:9px;padding:7px 10px;cursor:pointer}
    #slCommunication .sc-btn.primary{background:var(--sc-navy);color:#fff;border-color:var(--sc-navy)}
    #slCommunication .sc-btn.icon{width:40px;height:40px;padding:0;border-radius:50%}
    #slCommunication .sc-form{display:flex;gap:8px;align-items:center}
    #slCommunication .sc-form textarea{flex:1;min-width:0;min-height:42px;max-height:120px;resize:vertical;border:1px solid var(--sc-line);border-radius:22px;padding:10px 14px}
    #slCommunication .sc-form input[type=file]{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;clip-path:inset(50%)}
    #slCommunication .sc-attach{display:inline-grid;place-items:center;flex:none;width:40px;height:40px;border:1px solid var(--sc-line);border-radius:50%;color:var(--sc-navy);cursor:pointer}
    #slCommunication .sc-compose{flex:none;padding:12px 14px;border-top:1px solid var(--sc-line);display:flex;flex-direction:column;gap:6px;background:#fff}
    #slCommunication .sc-toolbar{display:flex;gap:8px;flex-wrap:wrap}
    #slCommunication .sc-search{display:flex;gap:6px;margin:8px 0 0}
    #slCommunication .sc-search input{min-width:0;flex:1}
    #slCommunication .sc-empty{padding:24px;text-align:center;color:var(--sc-muted)}
    #slCommunication .sc-panel input,#slCommunication .sc-panel select{max-width:100%;padding:8px;border:1px solid var(--sc-line);border-radius:8px}
    #slCommunication .sc-older{padding:8px;text-align:center;background:#f5f7f6}
    #slCommunication .sc-older a{color:var(--sc-navy)}
    #slCommunication .sc-header-actions{margin-left:auto}
    @media(max-width:760px){
      #slCommunication .sc-head{align-items:center}
      #slCommunication .sc-head .sc-muted{max-width:34ch}
      #slCommunication .sc-layout{display:block;min-height:0;height:auto}
      #slCommunication .sc-side{min-height:60vh}
      #slCommunication.sc-active .sc-side{display:none}
      #slCommunication .sc-thread{height:calc(100dvh - 190px);min-height:420px}
      #slCommunication .sc-messages{padding:14px 10px}
      #slCommunication .sc-message{max-width:88%}
      #slCommunication .sc-thread-top{padding:10px}
      #slCommunication .sc-compose{padding:9px}
      #slCommunication .sc-compose>small{font-size:.72rem}
      #slCommunication .sc-form{align-items:center}
    }
    @media(max-width:420px){
      #slCommunication .sc-message{max-width:92%}
      #slCommunication .sc-side-top{padding:10px}
      #slCommunication .sc-side-top .sc-toolbar{flex-wrap:nowrap}
      #slCommunication .sc-side-top select{min-width:0;flex:1}
      #slCommunication .sc-messages{gap:7px}
    }
    </style>
    <div id="slCommunication" class="<?=$room?'sc-active':''?>">
      <div class="sc-head"><div><div class="eyebrow"><?=h(sl_t("communication.kicker"))?></div><h1><?=h(sl_t("communication.page_title"))?></h1><p class="sc-muted"><?=h(sl_t("communication.subtitle"))?></p></div><span class="sc-badge"><?=$unreadCount?> unread</span></div>
      <?php if(!empty($_SESSION['notice'])):?><div class="notice success-notice"><?=h($_SESSION['notice'])?></div><?php unset($_SESSION['notice']);endif;?>
      <?php if(!empty($_SESSION['err'])):?><div class="notice"><?=h($_SESSION['err'])?></div><?php unset($_SESSION['err']);endif;?>
      <div class="sc-layout">
        <aside class="sc-panel sc-side"><div class="sc-side-top">
          <form method="post" class="sc-toolbar"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="communication_start_direct"><label class="sr-only" for="scRecipient">Message a student</label><select id="scRecipient" name="recipient_id" required><option value=""><?=h(sl_t("communication.new_chat"))?></option><?php foreach($studentList as $student):?><option value="<?=(int)$student['id']?>"><?=h($student['name'])?></option><?php endforeach;?></select><button class="sc-btn primary"><?=h(sl_t("communication.open"))?></button></form>
          <p class="sc-muted"><a href="?page=study_groups"><?=h(sl_t("communication.groups_link"))?></a></p>
          <form class="sc-search" method="get"><input type="hidden" name="page" value="communication"><label class="sr-only" for="scSearch">Search this conversation</label><input id="scSearch" type="search" name="q" value="<?=h($query)?>" placeholder="<?=h(sl_t("communication.search_placeholder"))?>"><input type="hidden" name="conversation_id" value="<?=$conversationId?>"><button class="sc-btn"><?=h(sl_t("communication.search"))?></button></form>
        </div><nav class="sc-room-list" aria-label="<?=h(sl_t("communication.conversations"))?>">
          <?php if(!$rooms):?><div class="sc-empty"><?=h(sl_t("communication.no_chats"))?></div><?php endif;?>
          <?php foreach($rooms as $item):?><a class="sc-room" href="?page=communication&conversation_id=<?=(int)$item['id']?>" <?=$conversationId===(int)$item['id']?'aria-current="page"':''?>><b><?=h($item['title'])?> <?php if((int)$item['unread']):?><span class="sc-badge"><?=(int)$item['unread']?></span><?php endif;?></b><small><?=h(ucfirst($item['room_type']))?> · <?=h(mb_strimwidth((string)($item['last_message']??'No messages yet'),0,65,'…'))?></small></a><?php endforeach;?>
        </nav></aside>
        <section class="sc-panel sc-thread" aria-label="Active conversation">
          <?php if(!$room):?><div class="sc-empty"><h2><?=h(sl_t("communication.choose_chat"))?></h2><p><?=h(sl_t("communication.choose_chat_help"))?></p></div>
          <?php else:?><div class="sc-thread-top"><div class="sc-conversation-title"><a class="sc-btn" href="?page=communication" aria-label="<?=h(sl_t("communication.conversations"))?>"><?=h(sl_t("communication.back"))?></a><div class="sc-room-avatar" aria-hidden="true"><?=h(mb_strtoupper(mb_substr((string)$room['title'],0,1)))?></div><div class="sc-room-name"><strong><?=h($room['title'])?></strong><small><?=h(ucfirst($room['room_type']))?> chat</small></div><form method="post" class="sc-header-actions"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="communication_mute"><input type="hidden" name="conversation_id" value="<?=$conversationId?>"><?php if($room['muted_at']):?><button class="sc-btn" name="unmute" value="1"><?=h(sl_t("communication.unmute"))?></button><?php else:?><button class="sc-btn" name="mute" value="1"><?=h(sl_t("communication.mute"))?></button><?php endif;?></form></div>
          <?php if($query!==''):?><p class="sc-muted">Search results for “<?=h($query)?>” · <?=count($messages)?> shown</p><?php endif;?>
          </div>
          <?php if($messages&&count($messages)>=50):?><div class="sc-older"><a href="?page=communication&conversation_id=<?=$conversationId?>&before=<?=(int)$messages[0]['id']?>&q=<?=urlencode($query)?>"><?=h(sl_t("communication.earlier"))?></a></div><?php endif;?>
          <div class="sc-messages" id="scMessages" role="log" aria-live="polite" aria-label="Chat messages"><?php if(!$messages):?><div class="sc-empty"><?=$query?sl_t($query?'communication.no_matches':'communication.start')?></div><?php endif;?>
            <?php foreach($messages as $message):?>
              <article class="sc-message <?=(int)$message['sender_id']===$userId?'sc-own':''?>" id="msg-<?=(int)$message['id']?>">
                <div class="sc-message-meta"><?php if((int)$message['sender_id']!==$userId):?><b><?=h($message['sender'])?></b><?php endif;?><small><?=h($message['created_at'])?><?=!empty($message['edited_at'])?' · edited':''?></small></div>
                <?php if($message['deleted_at']):?><p class="sc-muted"><em><?=h(sl_t("communication.removed"))?></em></p><?php else:?><p class="sc-message-body"><?=nl2br(h($message['body']))?></p>
                  <?php $aq=$db->prepare("SELECT id,original_name,file_size FROM sl_message_attachments WHERE message_id=?");$aq->execute([(int)$message['id']]);foreach($aq as $att):?><a class="sc-attachment" href="?page=communication&comms_attachment=<?=(int)$att['id']?>">📎 <?=h($att['original_name'])?> · <?=number_format((int)$att['file_size']/1024,0)?> KB</a><?php endforeach;?>
                  <details class="sc-message-options"><summary aria-label="Message options">⋯</summary><div class="sc-options-popover">
                    <div class="sc-reactions">
                      <?php foreach(['like'=>'👍','love'=>'❤️','helpful'=>'✅','celebrate'=>'🎉','laugh'=>'😂'] as $reactionKey=>$emoji):?><form method="post"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="communication_react"><input type="hidden" name="conversation_id" value="<?=$conversationId?>"><input type="hidden" name="message_id" value="<?=(int)$message['id']?>"><input type="hidden" name="reaction" value="<?=h($reactionKey)?>"><button class="sc-btn" title="Toggle <?=$reactionKey?> reaction"><?=$emoji?> <span><?= (int)$message[$reactionKey.'_count']?></span></button></form><?php endforeach;?>
                    </div>
                    <form method="post" class="sc-actions"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="communication_report"><input type="hidden" name="conversation_id" value="<?=$conversationId?>"><input type="hidden" name="message_id" value="<?=(int)$message['id']?>"><select name="reason" aria-label="Report reason"><option value="harassment">Harassment</option><option value="spam">Spam</option><option value="threat">Threat</option><option value="private_information">Private information</option><option value="other">Other</option></select><button class="sc-btn"><?=h(sl_t("communication.report"))?></button></form>
                    <?php if((int)$message['sender_id']===$userId):?><form method="post" class="sc-actions"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="communication_edit"><input type="hidden" name="conversation_id" value="<?=$conversationId?>"><input type="hidden" name="message_id" value="<?=(int)$message['id']?>"><input name="body" value="<?=h($message['body'])?>" maxlength="4000" aria-label="Edit message"><button class="sc-btn"><?=h(sl_t("communication.edit"))?></button></form><form method="post"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="communication_delete"><input type="hidden" name="conversation_id" value="<?=$conversationId?>"><input type="hidden" name="message_id" value="<?=(int)$message['id']?>"><button class="sc-btn"><?=h(sl_t("communication.remove"))?></button></form><?php endif;?>
                  </div></details>
                <?php endif;?>
              </article>
            <?php endforeach;?>
          </div>
          <form method="post" enctype="multipart/form-data" class="sc-compose"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="communication_send"><input type="hidden" name="conversation_id" value="<?=$conversationId?>"><input type="hidden" name="parent_message_id" value="0"><input type="hidden" name="client_nonce" value="<?=h(bin2hex(random_bytes(16)))?>"><div class="sc-form"><label class="sc-attach" for="scAttachment" title="<?=h(sl_t("communication.attach"))?>" aria-label="<?=h(sl_t("communication.attach"))?>">＋</label><label class="sr-only" for="scBody">Message</label><textarea id="scBody" name="body" rows="1" maxlength="4000" placeholder="<?=h(sl_t("communication.type_message"))?>"></textarea><label class="sr-only" for="scAttachment">Attach an academic file</label><input id="scAttachment" type="file" name="attachment" accept=".pdf,.txt,.docx,.pptx,.png,.jpg,.jpeg,.webp"><button class="sc-btn primary icon" aria-label="Send message" title="Send">➤</button></div><small class="sc-muted"><?=h(sl_t("communication.attach_help"))?></small></form>
          <?php endif;?>
        </section>
      </div>
    </div>
    <script>document.addEventListener("DOMContentLoaded",function(){var box=document.getElementById("scMessages");if(box)box.scrollTop=box.scrollHeight;});</script>
    <?php
}
