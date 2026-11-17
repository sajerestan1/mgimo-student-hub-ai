<?php
declare(strict_types=1);
session_start();
$cf=__DIR__.'/config.php';
if(!is_file($cf)){header('Location: install.php');exit;}
$c=require $cf;
try{$db=new PDO("mysql:host={$c['db_host']};dbname={$c['db_name']};charset=utf8mb4",$c['db_user'],$c['db_pass'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);}
catch(Throwable $e){http_response_code(503);exit('Database connection failed. Check your cPanel database settings.');}
// Safe schema upgrades: add account roles, account status and an audit trail without changing academic records.
try {
 $cols=$db->query("SHOW COLUMNS FROM users LIKE 'role'")->fetch();
 if(!$cols){
  $db->exec("ALTER TABLE users ADD COLUMN role VARCHAR(24) NOT NULL DEFAULT 'student'");
  $db->exec("UPDATE users SET role='administrator' WHERE id=(SELECT first_id FROM (SELECT MIN(id) AS first_id FROM users) AS first_user)");
 }
 $status=$db->query("SHOW COLUMNS FROM users LIKE 'account_status'")->fetch();
 if(!$status)$db->exec("ALTER TABLE users ADD COLUMN account_status VARCHAR(16) NOT NULL DEFAULT 'active'");
 $db->exec("CREATE TABLE IF NOT EXISTS admin_audit (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, actor_id INT UNSIGNED NOT NULL, action VARCHAR(60) NOT NULL, target_user_id INT UNSIGNED NULL, details VARCHAR(500) NOT NULL DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(actor_id), INDEX(target_user_id), INDEX(created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch(Throwable $e){http_response_code(503);exit('Account security setup failed. Please contact the site administrator.');}
function h($s){return htmlspecialchars((string)$s,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
function token(){return $_SESSION['csrf']??=bin2hex(random_bytes(32));}
function verify(){if(!hash_equals($_SESSION['csrf']??'',$_POST['csrf']??'')){http_response_code(419);exit('Session expired. Refresh and try again.');}}
function jump($p='dashboard'){header('Location: ?page='.$p);exit;}
if(isset($_GET['logout'])){$_SESSION=[];session_destroy();header('Location: ./');exit;}
// Re-check account status on every request so a suspended account cannot keep using an old session.
if(!empty($_SESSION['user']['id'])){
 $statusQuery=$db->prepare('SELECT account_status FROM users WHERE id=?');
 $statusQuery->execute([(int)$_SESSION['user']['id']]);
 if($statusQuery->fetchColumn()!=='active'){$_SESSION=[];session_destroy();header('Location: ./?page=login');exit;}
}
if($_SERVER['REQUEST_METHOD']==='POST'){verify();$a=$_POST['action']??'';
 if($a==='login'){$requestedRole=$_POST['role']??'student';if(!in_array($requestedRole,['student','lecturer','administrator'],true)){$requestedRole='student';}$q=$db->prepare('SELECT id,name,email,password_hash,role,account_status FROM users WHERE email=?');$q->execute([strtolower(trim($_POST['email']??''))]);$u=$q->fetch();if($u&&$u['account_status']==='active'&&$u['role']===$requestedRole&&password_verify($_POST['password']??'',$u['password_hash'])){session_regenerate_id(true);unset($u['password_hash']);$_SESSION['user']=$u;jump();}$_SESSION['err']='The email, password or selected account type is incorrect.';jump('login');}
 if(empty($_SESSION['user']))jump('login');$uid=(int)$_SESSION['user']['id'];
 if($a==='update_user'){
  if(($_SESSION['user']['role']??'')!=='administrator'){http_response_code(403);exit('Administrator access required.');}
  $targetId=(int)($_POST['user_id']??0);
  $newRole=$_POST['role']??'student';
  $newStatus=$_POST['account_status']??'active';
  $newPassword=$_POST['reset_password']??'';
  if($targetId<1||!in_array($newRole,['student','lecturer','administrator'],true)||!in_array($newStatus,['active','suspended','deactivated'],true)||($newPassword!==''&&strlen($newPassword)<12)){
    $_SESSION['err']='Check the selected role, account status and password (12 characters minimum).';jump('users');
  }
  $lookup=$db->prepare('SELECT id,role,account_status FROM users WHERE id=?');$lookup->execute([$targetId]);$target=$lookup->fetch();
  if(!$target){$_SESSION['err']='The selected account could not be found.';jump('users');}
  if($targetId===$uid&&($newRole!==$target['role']||$newStatus!==$target['account_status'])){
    $_SESSION['err']='You cannot change your own role or account status.';jump('users');
  }
  if($target['role']==='administrator'&&($newRole!=='administrator'||$newStatus!=='active')&&$target['account_status']==='active'){
    $activeAdmins=(int)$db->query("SELECT COUNT(*) FROM users WHERE role='administrator' AND account_status='active'")->fetchColumn();
    if($activeAdmins<=1){$_SESSION['err']='The last active administrator cannot be demoted or suspended.';jump('users');}
  }
  try{
    $db->beginTransaction();
    $save=$db->prepare('UPDATE users SET role=?,account_status=? WHERE id=?');$save->execute([$newRole,$newStatus,$targetId]);
    if($newPassword!==''){$pw=$db->prepare('UPDATE users SET password_hash=? WHERE id=?');$pw->execute([password_hash($newPassword,PASSWORD_DEFAULT),$targetId]);}
    $details='Role: '.$target['role'].' → '.$newRole.'; status: '.$target['account_status'].' → '.$newStatus.($newPassword!==''?'; password reset by administrator':'');
    $audit=$db->prepare('INSERT INTO admin_audit(actor_id,action,target_user_id,details) VALUES(?,?,?,?)');$audit->execute([$uid,'account_updated',$targetId,$details]);
    $db->commit();$_SESSION['notice']='Account updated successfully.'.($newPassword!==''?' Password reset saved.':'');
  }catch(Throwable $ex){if($db->inTransaction())$db->rollBack();$_SESSION['err']='The account could not be updated. No changes were saved.';}
  jump('users');
 }
 if($a==='create_user'){if(($_SESSION['user']['role']??'')!=='administrator'){http_response_code(403);exit('Administrator access required.');}$name=trim($_POST['name']??'');$email=strtolower(trim($_POST['email']??''));$role=$_POST['role']??'student';$password=$_POST['new_password']??'';if($name!==''&&filter_var($email,FILTER_VALIDATE_EMAIL)&&in_array($role,['student','lecturer','administrator'],true)&&strlen($password)>=12){try{$q=$db->prepare('INSERT INTO users(name,email,password_hash,role,account_status) VALUES(?,?,?,?,?)');$q->execute([$name,$email,password_hash($password,PASSWORD_DEFAULT),$role,'active']);$audit=$db->prepare('INSERT INTO admin_audit(actor_id,action,target_user_id,details) VALUES(?,?,?,?)');$audit->execute([$uid,'account_created',(int)$db->lastInsertId(),'Created '.$role.' account for '.$email]);$_SESSION['notice']='Account created successfully.';}catch(PDOException $ex){$_SESSION['err']='Could not create account. Check whether the email address is already registered.';}}else{$_SESSION['err']='Enter a name, valid email, supported role and password of at least 12 characters.';}jump('users');}
 if($a==='task'){$title=trim($_POST['title']??'');if($title!==''){$q=$db->prepare('INSERT INTO tasks(user_id,title,course,due_date,priority) VALUES(?,?,?,?,?)');$q->execute([$uid,$title,trim($_POST['course']??''),$_POST['due_date']?:null,($_POST['priority']??'')==='high'?'high':'normal']);}jump('tasks');}
 if($a==='toggle'){$q=$db->prepare("UPDATE tasks SET status=? WHERE id=? AND user_id=?");$q->execute([($_POST['status']??'')==='done'?'done':'todo',(int)$_POST['id'],$uid]);jump('tasks');}
 if($a==='del'){$q=$db->prepare('DELETE FROM tasks WHERE id=? AND user_id=?');$q->execute([(int)$_POST['id'],$uid]);jump('tasks');}
 if($a==='course'){$q=$db->prepare('INSERT INTO courses(user_id,code,name,credits) VALUES(?,?,?,?)');$q->execute([$uid,strtoupper(trim($_POST['code']??'')),trim($_POST['name']??''),max(1,(int)($_POST['credits']??3))]);jump('courses');}
 if($a==='grade'){$q=$db->prepare('INSERT INTO grades(user_id,course_id,assessment,score) SELECT ?,id,?,? FROM courses WHERE id=? AND user_id=?');$score=(float)($_POST['score']??-1);if($score>=0&&$score<=100)$q->execute([$uid,trim($_POST['assessment']??'Assessment'),$score,(int)$_POST['course_id'],$uid]);jump('grades');}
 if($a==='event'){$q=$db->prepare('INSERT INTO events(user_id,title,event_date,start_time,location) VALUES(?,?,?,?,?)');$q->execute([$uid,trim($_POST['title']??''),$_POST['event_date'],$_POST['start_time']?:null,trim($_POST['location']??'')]);jump('timetable');}
 jump();
}
if(isset($_GET['lang'])&&in_array($_GET['lang'],['en','ru'],true)){$_SESSION['lang']=$_GET['lang'];} $language=$_SESSION['lang']??'en';
$user=$_SESSION['user']??null;$page=$_GET['page']??'dashboard';if(!$user)$page='login';$uid=(int)($user['id']??0);$isAdmin=($user['role']??'')==='administrator';$adminPages=['users','academic','announcements','documents','reports','settings'];if($user&&in_array($page,$adminPages,true)&&!$isAdmin){http_response_code(403);$page='dashboard';}$err=$_SESSION['err']??'';unset($_SESSION['err']);
function field($name,$label,$type='text',$extra=''){return '<label>'.$label.'<input name="'.$name.'" type="'.$type.'" '.$extra.'></label>';}
function nav($p,$label,$icon,$current){return '<a class="nav '.($p===$current?'sel':'').'" href="?page='.$p.'">'.$icon.' &nbsp;'.$label.'</a>';}
$stats=['open'=>0,'tasks'=>0,'courses'=>0,'avg'=>null];if($user){$q=$db->prepare("SELECT COUNT(*) n,SUM(status='todo') o FROM tasks WHERE user_id=?");$q->execute([$uid]);$r=$q->fetch();$stats['tasks']=(int)$r['n'];$stats['open']=(int)$r['o'];$q=$db->prepare('SELECT COUNT(*) FROM courses WHERE user_id=?');$q->execute([$uid]);$stats['courses']=(int)$q->fetchColumn();$q=$db->prepare('SELECT AVG(score) FROM grades WHERE user_id=?');$q->execute([$uid]);$v=$q->fetchColumn();$stats['avg']=$v===null?'—':number_format((float)$v,1).'%';}
?><!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f4f6fb"><title>StudentLife · Academic Companion</title><style>
*{box-sizing:border-box}body{margin:0;background:#f4f6fb;color:#17243a;font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}a{text-decoration:none;color:inherit}.layout{display:flex;min-height:100vh}.side{width:235px;background:#142238;color:#dce5f3;padding:22px 15px;display:flex;flex-direction:column;flex-shrink:0}.brand{display:flex;align-items:center;gap:10px;margin:0 8px 30px}.logo{width:38px;height:38px;border-radius:12px;background:#637cf6;display:grid;place-items:center;color:white;font-size:20px;font-weight:800}.brand b{display:block;color:white;font-size:17px}.brand small{font-size:10px;letter-spacing:1.6px;color:#9aabc5}.caption{font-size:10px;letter-spacing:1.5px;color:#8294b0;margin:16px 10px 7px}.nav{display:block;padding:10px 12px;border-radius:9px;color:#bdc9dc;font-size:13px;margin:2px 0}.nav:hover,.nav.sel{background:#30476a;color:white}.foot{margin-top:auto;border-top:1px solid #30405a;padding:16px 8px 0;font-size:12px;color:#afbdd0}.main{flex:1;min-width:0}.top{height:70px;background:#fff;border-bottom:1px solid #e5eaf1;display:flex;justify-content:space-between;align-items:center;padding:0 32px}.top small,.eyebrow{font-size:10px;letter-spacing:1.5px;color:#74839a}.top b{display:block}.content{max-width:1180px;margin:auto;padding:30px 32px}.eyebrow{text-transform:uppercase;font-weight:700}.h1{font-size:29px;letter-spacing:-.8px;margin:5px 0}.sub{color:#758399;margin:0 0 23px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.card{background:white;border:1px solid #e6ebf2;border-radius:14px;padding:18px;box-shadow:0 2px 7px #18263b08}.metriclabel{font-size:12px;color:#718096}.metric{font-size:29px;font-weight:750;margin:6px 0}.muted{color:#718096;font-size:12px}.section{margin-top:18px}.head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.head h2,.card h2{font-size:16px;margin:0}.btn{border:0;border-radius:9px;background:#315efb;color:#fff;padding:10px 14px;font-weight:650;font-size:13px;cursor:pointer}.soft{background:#edf1ff;color:#3154c9}.danger{background:#fff0f0;color:#bd4545}.small{padding:7px 10px;font-size:12px}.table{width:100%;border-collapse:collapse}.table th,.table td{text-align:left;padding:11px 8px;border-bottom:1px solid #edf0f5;font-size:13px}.table th{font-size:10px;letter-spacing:1px;color:#7a8799;text-transform:uppercase}.pill{display:inline-block;background:#edf1ff;color:#3456c7;border-radius:20px;padding:4px 9px;font-size:11px}.green{background:#e8f7f1;color:#16815f}.amber{background:#fff3dc;color:#9c6b16}.form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.form label{display:grid;gap:6px;color:#58677d;font-size:12px;font-weight:650}.form input,.form select{width:100%;padding:11px;border:1px solid #dce3ed;border-radius:8px;font:inherit;font-size:13px}.wide{grid-column:1/-1}.notice{padding:12px;background:#fff0f0;color:#b43e3e;border-radius:9px;margin-bottom:15px;font-size:13px}.empty{text-align:center;color:#8491a3;padding:28px}.login{min-height:100vh;display:grid;place-items:center;padding:20px;background:radial-gradient(circle at 15% 10%,#e4ebff,transparent 35%),#f4f6fb}.box{background:white;padding:32px;border:1px solid #e5eaf1;border-radius:17px;width:min(420px,100%);box-shadow:0 18px 50px #18263b10}.box form{display:grid;gap:13px}.box h1{font-size:25px;margin:0}.footer{font-size:11px;color:#8b98aa;margin-top:30px}@media(max-width:850px){.side{width:195px}.grid{grid-template-columns:repeat(2,1fr)}.content{padding:24px 18px}}@media(max-width:620px){.layout{display:block}.side{width:100%;display:block;padding:12px}.brand{margin:0 5px 9px}.side nav{display:flex;overflow:auto;gap:4px}.caption,.foot{display:none}.nav{white-space:nowrap;padding:8px 10px}.top{height:58px;padding:0 15px}.content{padding:20px 13px}.h1{font-size:25px}.card{padding:13px}.grid{gap:9px}.metric{font-size:24px}.form{grid-template-columns:1fr}.wide{grid-column:auto}.table th,.table td{padding:9px 5px;font-size:11px}}

/* Neutral student dashboard visual refresh */
:root{--navy:#10284b;--navy2:#17365f;--gold:#c99a35;--gold2:#e8c36d;--ink:#142b4d;--muted:#71819a;--line:#e7eaf0;--canvas:#f5f6f8}
body{background:var(--canvas);color:var(--ink);font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
.side{width:252px;background:linear-gradient(180deg,#0d2343 0%,#142f55 100%);color:#eaf0f8;padding:25px 17px}
.brand{margin:0 8px 30px;gap:12px}.logo{width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,#f3d48b,#c99a35);color:#10284b;font-size:18px;box-shadow:0 5px 16px #0002}.brand b{font-size:18px;letter-spacing:.1px}.brand small{color:#c4d0e0}
.caption{color:#b9c6d8;margin:20px 10px 9px;letter-spacing:1.7px}
.nav{padding:12px 13px;border-radius:10px;color:#e0e8f2;font-size:13px;margin:4px 0;transition:.18s}
.nav:hover{background:#ffffff16;color:white}.nav.sel{background:linear-gradient(100deg,#f1d28a,#d6a844);color:#172b49;font-weight:750;box-shadow:0 5px 14px #0002}
.foot{border-color:#ffffff2a;color:#d2dceb}.foot b{color:white}.foot a{color:#f0d18b}
.top{height:76px;padding:0 34px;background:#fff;border-bottom:1px solid #e7eaf0}.top small,.eyebrow{color:#8a7448;letter-spacing:1.6px}.top b{color:var(--navy);font-size:15px}.top .muted{font-size:13px}
.content{max-width:1440px;padding:28px 34px 38px}
.hero{position:relative;overflow:hidden;min-height:158px;border-radius:17px;padding:27px 30px;margin-bottom:17px;background:linear-gradient(105deg,#fff 0%,#fff 50%,#edf3f9 100%);border:1px solid #e5eaf1;box-shadow:0 4px 15px #142b4d08;display:flex;align-items:center;justify-content:space-between}
.hero:after{content:"";position:absolute;right:-50px;top:-100px;width:470px;height:350px;border-radius:50%;background:radial-gradient(ellipse at center,#dce7f3 0%,#edf2f7 48%,transparent 70%);opacity:.95}
.hero-copy{position:relative;z-index:1}.hero .eyebrow{font-size:10px;font-weight:800}.hero h1{font-size:30px;letter-spacing:-.8px;margin:8px 0 4px;color:#11294c}.hero h1 span{font-size:25px}.hero p{margin:0;color:#64758e;font-size:14px}

.semester-strip{display:flex;align-items:center;gap:14px;background:#10284b;color:white;padding:14px 19px;border-radius:13px;margin-bottom:16px;box-shadow:0 5px 15px #10284b18}
.semester-icon{width:39px;height:39px;border-radius:11px;background:#ffffff16;color:#f0cd7e;display:grid;place-items:center;font-size:22px}
.semester-strip .metriclabel{display:block;color:#d7c28f;font-size:9px;letter-spacing:1.4px}.semester-strip strong{display:block;font-size:14px}.semester-strip small{display:block;color:#c1cede;font-size:11px}.semester-date{margin-left:auto;color:#e8d6aa;font-size:12px}
.grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.card{border:1px solid #e4e8ef;border-radius:14px;padding:18px;background:#fff;box-shadow:0 3px 12px #142b4d08}
.stat-card{position:relative;min-height:138px;padding:18px 18px 16px 66px}.stat-icon{position:absolute;left:18px;top:19px;width:35px;height:35px;border-radius:10px;background:#edf2f8;color:#24466e;display:grid;place-items:center;font-size:21px}.gold-icon{background:#fbf3e3;color:#b58629}.metriclabel{font-size:11px;color:#71819a}.metric{font-size:28px;color:#10284b;margin:5px 0;font-weight:760;letter-spacing:-.5px}.muted{color:#78869b;font-size:11px}
.section{margin-top:16px}.dashboard-columns{display:grid;grid-template-columns:1fr 1fr;gap:16px}.lower-columns{grid-template-columns:1.1fr .9fr}
.feature-card{min-height:230px;padding:19px 20px}.head{margin-bottom:13px}.head h2,.card h2{font-size:17px;color:#142e52;letter-spacing:-.2px}.section-kicker{font-size:9px;letter-spacing:1.5px;color:#a17a2d;font-weight:800;margin-bottom:3px}.text-link{font-size:11px;color:#986e1d;font-weight:750}.text-link:hover{text-decoration:underline}
.assignment-row,.schedule-row{display:flex;align-items:center;gap:11px;padding:11px 0;border-top:1px solid #edf0f4}.row-symbol{width:34px;height:34px;border-radius:10px;background:#f2f5f9;color:#24476e;display:grid;place-items:center;font-size:17px;flex-shrink:0}.row-main{min-width:0;flex:1}.row-main b{display:block;color:#213653;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.row-main small{display:block;color:#8390a2;font-size:10px;margin-top:2px}
.due-chip,.time-chip{font-size:10px;font-weight:700;color:#82601e;background:#fbf4e6;border-radius:20px;padding:6px 9px;white-space:nowrap}.due-chip.urgent{background:#fff0ed;color:#b74e3c}.date-block{width:38px;height:42px;border-radius:9px;background:#f7f1e5;color:#9b762c;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}.date-block b{font-size:15px;line-height:1}.date-block small{font-size:9px;text-transform:uppercase}.time-chip{background:#edf2f8;color:#294b70}
.compact-empty{padding:24px 10px;text-align:center;color:#8793a4;font-size:11px}.compact-empty b{color:#40536d;font-size:12px}.empty-symbol{width:36px;height:36px;border-radius:50%;background:#f8f2e6;color:#ae842e;display:grid;place-items:center;margin:0 auto 8px;font-size:17px}
.table th,.table td{padding:10px 8px;border-bottom:1px solid #edf0f4;font-size:11px}.table th{color:#8a7448;font-size:9px;letter-spacing:1px}.grade-chip{display:inline-block;background:#eaf5ee;color:#27734b;border-radius:20px;padding:5px 9px;font-size:10px;font-weight:750}
.progress-card{background:linear-gradient(145deg,#fff,#fbf8f0);display:flex;flex-direction:column}.progress-card h2{font-size:19px;margin:5px 0 7px}.progress-card p{font-size:12px;line-height:1.7;color:#71819a;margin:0 0 15px}.quick-links{display:flex;flex-wrap:wrap;gap:7px}.quick-links a{font-size:10px;font-weight:700;color:#7b5a1e;background:#f7edd8;border:1px solid #efdfbd;padding:8px 9px;border-radius:8px}.progress-note{margin-top:auto;padding-top:18px;display:flex;justify-content:space-between;gap:8px;color:#8792a2;font-size:9px}.progress-note b{color:#18365d}
.btn{background:#17385f;border-radius:8px}.soft{background:#f8f1e3;color:#8c671e}.danger{background:#fff0f0;color:#bd4545}.pill{background:#edf2f8;color:#315276}
.form input,.form select{border-color:#dfe5ed;border-radius:8px}
.login{background:radial-gradient(circle at 15% 10%,#e9eef5,transparent 35%),#f5f6f8}.box{border-radius:15px;box-shadow:0 15px 40px #10284b12}.box .logo{background:linear-gradient(135deg,#f3d48b,#c99a35);color:#10284b}
@media(max-width:1050px){.side{width:220px}.content{padding:22px}.dashboard-columns,.lower-columns{grid-template-columns:1fr}}
@media(max-width:720px){.side{width:100%;padding:12px}.brand{margin:0 5px 9px}.hero{padding:20px;min-height:130px}.hero h1{font-size:24px}.semester-date{display:none}.content{padding:16px 12px}.dashboard-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.stat-card{padding:14px 10px 13px 52px;min-height:112px}.stat-icon{left:11px;top:15px;width:30px;height:30px}.metric{font-size:24px}.feature-card{padding:15px}.assignment-row,.schedule-row{gap:8px}.due-chip{font-size:9px;padding:5px 7px}}

/* Header search and language controls */
.top{gap:20px}.top-tools{display:flex;align-items:center;gap:15px;min-width:0}.top-search{display:flex;align-items:center;gap:0;width:min(390px,34vw);border:1px solid #dfe5ed;border-radius:9px;background:#fff;overflow:hidden}.top-search input{min-width:0;flex:1;border:0;outline:0;padding:10px 12px;font:inherit;font-size:12px;color:#1b3150}.top-search input::placeholder{color:#98a2b1}.top-search .search-btn{border-radius:0;padding:10px 14px;height:100%;background:#b8892d;color:#fff}.language-control{display:flex;align-items:center;gap:7px;color:#78869a;font-size:11px;white-space:nowrap}.language-control select{border:1px solid #e0e5ed;border-radius:8px;padding:8px 9px;background:#fff;color:#243b59;font:inherit;font-size:11px;cursor:pointer}.top-user{white-space:nowrap}
@media(max-width:1000px){.top-tools{gap:9px}.top-search{width:min(300px,29vw)}.top-user{display:none}}
@media(max-width:720px){.top{height:auto;min-height:68px;align-items:flex-start;flex-direction:column;padding:10px 13px;gap:8px}.top-tools{width:100%;flex-wrap:wrap}.top-search{width:100%;order:1}.language-control{order:2}.top-user{display:none}}

/* Dashboard reference layout and sidebar */
.side{width:264px;padding:25px 17px}.brand{margin-bottom:34px}.brand .logo{display:none}.brand b{font-size:24px}.brand small{font-size:13px;letter-spacing:.4px;display:block;margin-top:2px}.brand:after{content:"";display:block;position:absolute;top:112px;left:35px;width:98px;height:3px;background:#d7a83f;border-radius:3px}
.caption{margin-top:32px}.nav{font-size:14px;padding:12px 13px;margin:4px 0}.content{max-width:none;padding:26px 28px 38px}.hero{margin-bottom:16px}.hero h1{font-size:31px}
.dashboard-top-grid{display:grid;grid-template-columns:1.65fr repeat(4,minmax(130px,1fr));gap:14px}.semester-card{position:relative;overflow:hidden;min-height:136px;padding:20px 23px;border-radius:15px;background:linear-gradient(110deg,#10284b,#173d6a);color:#fff;box-shadow:0 5px 16px #10284b18}.semester-card:after{content:"";position:absolute;right:-30px;bottom:-68px;width:230px;height:105px;border-top:7px solid #d5a039;transform:rotate(-12deg);border-radius:50%}.semester-label{font-size:10px;letter-spacing:1.4px;color:#e5ca8e}.semester-card h2{font-size:22px;margin:10px 0 4px;color:#fff}.semester-card p{font-size:11px;color:#d4deeb;margin:0;max-width:75%}.semester-symbol{position:absolute;right:22px;top:35px;font-size:43px;color:#e7b84c}
.dashboard-top-grid .stat-card{min-height:136px;padding:55px 14px 13px}.dashboard-top-grid .stat-icon{left:15px;top:14px;background:transparent;color:#c18b24;font-size:25px}.dashboard-top-grid .metric{font-size:27px}
.dashboard-columns{display:grid;grid-template-columns:1fr 1fr;gap:16px}.lower-columns{grid-template-columns:1fr 1fr}.feature-card{min-height:245px;padding:19px 20px}.gpa-card .head{align-items:flex-start}.gpa-value{text-align:right}.gpa-value small{display:block;color:#71819a;font-size:10px}.gpa-value b{font-size:25px;color:#10284b}.progress-track{height:13px;background:#e9edf3;border-radius:20px;overflow:hidden;margin:12px 0 18px}.progress-track span{height:100%;display:block;background:linear-gradient(90deg,#f4c44e,#c58b19);border-radius:20px}.gpa-foot{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.gpa-foot div{border-right:1px solid #e3e8ef;padding-right:8px}.gpa-foot div:last-child{border:0}.gpa-foot small{display:block;color:#71819a;font-size:10px}.gpa-foot b{font-size:19px;color:#10284b}.gpa-note{margin-top:13px;font-size:9px}
.coming-card{max-width:650px;padding:30px}.coming-icon{width:46px;height:46px;border-radius:13px;background:#fbf3e3;color:#b58629;display:grid;place-items:center;font-size:24px}.coming-card h2{margin:14px 0 5px}.coming-card p{color:#71819a;font-size:13px;line-height:1.7}
@media(max-width:1100px){.dashboard-top-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.semester-card{grid-column:span 4}.side{width:230px}}
@media(max-width:850px){.dashboard-columns,.lower-columns{grid-template-columns:1fr}.dashboard-top-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.semester-card{grid-column:span 2}}
@media(max-width:620px){.side{width:100%}.brand:after{display:none}.brand{margin-bottom:10px}.dashboard-top-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.semester-card{grid-column:span 2}.dashboard-top-grid .stat-card{min-height:110px}.content{padding:16px 12px}.hero h1{font-size:24px}.feature-card{padding:15px}}

/* Responsive, role-aware StudentLife sign-in */
.login-shell{min-height:100vh;display:grid;grid-template-columns:minmax(300px,.92fr) minmax(460px,1.08fr);background:#f7f7f5}
.login-visual{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:54px;background:radial-gradient(ellipse at 75% 20%,#31547c 0%,transparent 38%),linear-gradient(145deg,#0b1e39 0%,#10284b 60%,#17395f 100%);color:#fff;overflow:hidden}
.login-visual:before,.login-visual:after{content:"";position:absolute;border:1px solid #d7a84455;border-radius:50%;width:560px;height:560px;right:-270px;bottom:-310px}
.login-visual:after{width:430px;height:430px;right:-205px;bottom:-250px;border-color:#ffffff20}
.visual-brand{position:relative;z-index:1;max-width:430px;text-align:center}.visual-cap{font-size:68px;line-height:1;color:#e8b84d;margin-bottom:18px}.visual-name{font-size:clamp(38px,4.2vw,62px);font-weight:780;letter-spacing:-2px}.visual-subtitle{font-size:13px;letter-spacing:3px;color:#d5dfeb;margin-top:5px}.gold-rule{height:3px;width:86px;background:#d9a83e;border-radius:5px;margin:24px auto}.visual-brand p{font-size:17px;line-height:1.8;color:#dce5ef;max-width:390px;margin:auto}.visual-footer{position:absolute;bottom:34px;left:0;right:0;text-align:center;color:#c6d1df;font-size:11px;letter-spacing:2px}
.login-panel{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:44px 34px;min-width:0}.login-card{width:min(540px,100%);background:#fff;border:1px solid #e7e8e9;border-radius:22px;padding:38px 42px;box-shadow:0 18px 55px #142b4d12}
.login-brand{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:30px}.login-mark{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(140deg,#f2d58e,#c9952e);color:#10284b;font-size:23px;font-weight:800}.login-brand b{display:block;font-size:21px;color:#10284b}.login-brand small{display:block;color:#71819a;font-size:11px;letter-spacing:.6px}
.login-heading{text-align:center;margin-bottom:26px}.login-heading .eyebrow{font-size:9px}.login-heading h1{font-size:31px;letter-spacing:-.8px;margin:7px 0 2px;color:#10284b}.login-heading p{color:#71819a;margin:0;font-size:13px}
.login-form{display:grid;gap:17px}.role-fieldset{border:0;padding:0;margin:0;min-width:0}.role-fieldset legend{font-size:12px;font-weight:750;color:#253b5b;margin-bottom:9px}.role-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.role-option{position:relative;min-height:96px;border:1px solid #dfe5ed;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:10px 6px;color:#344963;cursor:pointer;text-align:center;transition:.18s;background:#fff}.role-option input{position:absolute;opacity:0;inset:0;cursor:pointer}.role-option:has(input:checked){border:1.5px solid #c99631;background:#fff9eb;box-shadow:0 0 0 2px #c9963118}.role-option:focus-within{outline:2px solid #9db7db;outline-offset:2px}.role-icon{font-size:25px;color:#17365f}.role-option b{font-size:11px;line-height:1.25}
.login-label{display:grid;gap:7px;font-size:11px;font-weight:700;color:#52647c}.login-input{height:51px;display:flex;align-items:center;gap:11px;padding:0 14px;border:1px solid #dce3ed;border-radius:10px;background:#fff;box-shadow:0 2px 4px #142b4d05}.login-input:focus-within{border-color:#c99a35;box-shadow:0 0 0 3px #c99a351c}.login-input>span{font-size:18px;color:#18365d}.login-input input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:13px;color:#1a2e4b}.login-input input::placeholder{color:#9aa5b4}.password-toggle{border:0;background:transparent;color:#8a6a2b;font-size:11px;font-weight:750;cursor:pointer}
.login-options{display:flex;justify-content:space-between;align-items:center;gap:10px}.remember-option{display:flex;align-items:center;gap:7px;font-size:11px;color:#52647c}.remember-option input{accent-color:#c79632;width:15px;height:15px}.forgot-note{font-size:10px;color:#8793a4;text-align:right}
.login-submit{height:51px;border:0;border-radius:10px;background:linear-gradient(100deg,#e7b746,#bd831c);color:#fff;font-size:14px;font-weight:800;letter-spacing:.2px;cursor:pointer;box-shadow:0 6px 14px #c18d2b30;transition:transform .15s,filter .15s}.login-submit:hover{filter:brightness(1.04);transform:translateY(-1px)}.login-submit span{font-size:19px;margin-left:8px}
.login-security{text-align:center;color:#96a0ad;font-size:10px;margin-top:22px}.login-language{display:flex;gap:10px;align-items:center;margin-top:18px;font-size:11px;color:#8994a3}.login-language a{color:#8a6828;font-weight:700}.login-language a:hover{text-decoration:underline}
@media(max-width:980px){.login-shell{grid-template-columns:minmax(260px,.75fr) minmax(430px,1.25fr)}.login-visual{padding:30px}.login-card{padding:32px 28px}}
@media(max-width:720px){.login-shell{grid-template-columns:1fr}.login-visual{min-height:210px;padding:28px 18px}.visual-cap{font-size:35px;margin-bottom:5px}.visual-name{font-size:32px;letter-spacing:-1px}.visual-subtitle{font-size:10px;letter-spacing:2px}.gold-rule{margin:12px auto;width:58px}.visual-brand p{font-size:12px;line-height:1.5;max-width:310px}.visual-footer{display:none}.login-panel{padding:24px 14px 30px}.login-card{padding:27px 20px;border-radius:17px}.login-brand{margin-bottom:20px}.login-heading h1{font-size:27px}}
@media(max-width:380px){.login-visual{min-height:175px}.visual-brand p{display:none}.role-options{gap:5px}.role-option{min-height:88px;padding:7px 3px}.role-option b{font-size:10px}.login-card{padding:23px 15px}.login-options{align-items:flex-start;flex-direction:column}.forgot-note{text-align:left}}

/* Administrator workspace navigation and dashboard */
.nav-group-label{padding:13px 10px 4px;color:#a9bad0;font-size:9px;letter-spacing:1.25px;font-weight:800}
.admin-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.admin-stat{position:relative;min-height:116px;padding:17px 16px 14px 60px}
.admin-stat .metric{font-size:27px;margin:3px 0}.admin-stat small{font-size:9px;color:#8491a3;line-height:1.4}.admin-stat-icon{position:absolute;left:16px;top:17px;width:32px;height:32px;border-radius:9px;background:#fbf3e3;color:#b58629;display:grid;place-items:center;font-size:19px}
.admin-module-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.admin-module-grid>div{display:grid;gap:6px;padding:13px;border:1px solid #edf0f4;border-radius:10px}.admin-module-grid b{font-size:12px;color:#253b5b}.admin-module-grid small{font-size:10px;color:#8491a3}.admin-role-list{display:grid;gap:0}.admin-role-list div{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid #edf0f4;font-size:12px;color:#586b84}.admin-role-list div:last-child{border:0}.admin-role-list b{font-size:17px;color:#10284b}
.admin-shortcuts{display:grid;gap:4px}.admin-shortcuts a{display:flex;align-items:center;gap:11px;padding:10px 8px;border-bottom:1px solid #edf0f4;color:#b58629;font-size:17px}.admin-shortcuts a:last-child{border:0}.admin-shortcuts a span{flex:1}.admin-shortcuts b{display:block;color:#263c5a;font-size:11px}.admin-shortcuts small{display:block;color:#8491a3;font-size:9px}.success-notice{background:#e9f7ef;color:#20724b}.table-wrap{overflow-x:auto}.admin-user-form{min-width:245px;grid-template-columns:repeat(2,minmax(110px,1fr));gap:7px}.admin-user-form label{font-size:10px}.admin-user-form input,.admin-user-form select{padding:8px;font-size:11px}.admin-user-form .wide{grid-column:1/-1}
@media(max-width:1050px){.admin-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.side{width:245px}}
@media(max-width:720px){.admin-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.side nav{align-items:flex-start}.nav-group-label{display:none}.admin-stat{padding-left:52px}}
@media(max-width:380px){.admin-summary-grid{grid-template-columns:1fr 1fr;gap:8px}.admin-stat{padding:12px;min-height:100px}.admin-stat-icon{position:static;margin-bottom:6px}.admin-stat .metric{font-size:22px}}

/* Sign-in page: single-brand, viewport-fit layout. Authentication markup and behavior remain unchanged. */
body:has(.login-shell){overflow:hidden}
.login-shell{min-height:100vh;min-height:100svh;height:100vh;height:100svh;grid-template-columns:minmax(280px,.82fr) minmax(440px,1.18fr);overflow:hidden}
.login-visual{min-height:0;height:100%;padding:28px 36px}
.visual-cap{font-size:54px;margin-bottom:10px}
.visual-name{font-size:clamp(34px,3.6vw,52px)}
.visual-subtitle{font-size:12px;letter-spacing:2.6px}
.gold-rule{margin:17px auto;width:78px}
.visual-brand p,.visual-footer{display:none}
.login-panel{height:100%;min-height:0;padding:16px 28px;overflow-y:auto}
.login-card{width:min(540px,100%);padding:24px 34px;border-radius:18px}
.login-heading{margin:0 0 15px}
.login-heading h1{font-size:30px;margin:3px 0}
.login-heading p{font-size:12px}
.login-form{gap:11px}
.role-fieldset legend{margin-bottom:7px}
.role-options{gap:8px}
.role-option{min-height:78px;padding:7px 5px;gap:5px}
.role-icon{font-size:22px}
.login-label{gap:5px}
.login-input{height:45px}
.login-submit{height:46px}
.login-security{margin-top:12px}
.login-language{margin-top:9px}
@media(max-width:980px) and (min-width:721px){
 .login-shell{grid-template-columns:minmax(240px,.7fr) minmax(420px,1.3fr)}
 .login-panel{padding:14px 18px}
 .login-card{padding:22px 25px}
}
@media(max-width:720px){
 body:has(.login-shell){overflow:hidden}
 .login-shell{height:100vh;height:100svh;min-height:0;grid-template-columns:1fr;grid-template-rows:clamp(142px,22svh,190px) minmax(0,1fr)}
 .login-visual{height:auto;min-height:0;padding:13px 18px}
 .visual-cap{font-size:34px;line-height:1;margin-bottom:4px}
 .visual-name{font-size:32px;letter-spacing:-1px}
 .visual-subtitle{font-size:10px;letter-spacing:2px}
 .gold-rule{width:58px;margin:9px auto 0;height:3px}
 .login-panel{height:auto;min-height:0;padding:10px 12px 12px;justify-content:center;overflow-y:auto}
 .login-card{width:min(540px,100%);padding:15px 18px;border-radius:15px}
 .login-heading{margin-bottom:10px}
 .login-heading .eyebrow{font-size:8px}
 .login-heading h1{font-size:25px;margin:2px 0}
 .login-heading p{font-size:11px}
 .login-form{gap:9px}
 .role-fieldset legend{font-size:11px;margin-bottom:5px}
 .role-options{gap:6px}
 .role-option{min-height:70px;padding:6px 3px;gap:4px;border-radius:10px}
 .role-icon{font-size:20px}
 .role-option b{font-size:10px}
 .login-label{font-size:10px;gap:4px}
 .login-input{height:42px;padding:0 11px;gap:8px}
 .login-input>span{font-size:16px}
 .login-input input{font-size:12px}
 .login-options{font-size:10px}
 .remember-option{font-size:10px}
 .forgot-note{font-size:9px}
 .login-submit{height:43px;font-size:13px}
 .login-security{font-size:9px;margin-top:8px}
 .login-language{margin-top:6px;font-size:10px}
}
@media(max-width:380px){
 .login-shell{grid-template-rows:clamp(132px,19svh,160px) minmax(0,1fr)}
 .login-panel{padding:7px 9px}
 .login-card{padding:12px 13px}
 .login-form{gap:7px}
 .role-option{min-height:64px}
 .login-input{height:39px}
 .login-submit{height:40px}
 .login-security{margin-top:6px}
 .login-language{margin-top:4px}
}
@media(max-height:700px){
 .login-visual{padding-top:10px;padding-bottom:10px}
 .visual-cap{font-size:30px;margin-bottom:2px}
 .visual-name{font-size:30px}
 .gold-rule{margin-top:7px}
 .login-card{padding-top:12px;padding-bottom:12px}
 .login-heading{margin-bottom:7px}
 .login-form{gap:7px}
 .role-option{min-height:60px}
 .login-input{height:38px}
 .login-submit{height:39px}
 .login-security{display:none}
}

/* Visual polish inspired by the supplied reference; preserve the compact viewport layout. */
.login-shell{
  grid-template-columns:minmax(300px,.88fr) minmax(440px,1.12fr);
  background:linear-gradient(120deg,#edf2f7 0%,#f8f8f6 52%,#f4f5f7 100%);
}
.login-visual{
  isolation:isolate;
  background:
    radial-gradient(ellipse at 78% 17%,#315b86 0%,#1a3c65 28%,transparent 54%),
    radial-gradient(ellipse at 15% 85%,#244b77 0%,transparent 43%),
    linear-gradient(145deg,#0a1d38 0%,#102b50 58%,#183d67 100%);
}
.login-visual:before{
  content:"";
  position:absolute;
  z-index:-1;
  width:560px;height:560px;
  right:-270px;top:-235px;
  border:1px solid #e6bd6540;border-radius:50%;
  box-shadow:0 0 0 42px #ffffff08,0 0 0 88px #ffffff06;
}
.login-visual:after{
  content:"";
  position:absolute;z-index:-1;
  left:-8%;right:-8%;bottom:-1px;height:86px;
  background:linear-gradient(165deg,#d9a83e 0 12%,#10284b 13% 100%);
  clip-path:polygon(0 30%,20% 9%,42% 49%,66% 76%,100% 45%,100% 100%,0 100%);
  opacity:.96;
}
.visual-brand{max-width:440px;transform:translateY(-5px)}
.visual-cap{
  display:inline-grid;place-items:center;
  width:74px;height:74px;margin:0 auto 17px;
  border:1px solid #e8bd62;border-radius:22px;
  background:linear-gradient(145deg,#ffffff12,#ffffff04);
  color:#f0c45e;font-size:42px;line-height:1;
  text-shadow:0 5px 20px #0004;
}
.visual-name{
  color:#fff;font-family:Georgia,"Times New Roman",serif;
  font-weight:700;letter-spacing:-1.3px;
  text-shadow:0 4px 18px #0003;
}
.visual-subtitle{color:#e0e8f2;font-size:13px;letter-spacing:2.8px}
.gold-rule{height:4px;background:linear-gradient(90deg,#f4d27c,#c58b27);box-shadow:0 2px 12px #d6a33d45}
.visual-brand p{
  display:block;color:#e0e8f2;font-size:15px;line-height:1.75;
  max-width:360px;margin:0 auto;
}
.visual-footer{
  display:block;bottom:25px;color:#d8e1ec;
  font-size:10px;letter-spacing:2.2px;
}
.login-panel{background:linear-gradient(135deg,#f8f8f6,#eef2f6)}
.login-card{
  background:linear-gradient(145deg,#fff 0%,#fff 68%,#fbfaf7 100%);
  border:1px solid #e4e7eb;
  border-radius:21px;
  box-shadow:0 22px 60px #10284b14,0 3px 10px #10284b06;
  position:relative;
}
.login-card:before{
  content:"";position:absolute;left:34px;right:34px;top:0;height:3px;
  background:linear-gradient(90deg,transparent,#d7a13b 22%,#f0d18a 50%,#d7a13b 78%,transparent);
  border-radius:0 0 5px 5px;
}
.login-heading .eyebrow{color:#a27a31;font-weight:800;letter-spacing:2px}
.login-heading h1{color:#10284b;font-size:31px;letter-spacing:-1px}
.login-heading p{color:#71819a}
.role-option{
  border-color:#e0e5ec;
  background:linear-gradient(180deg,#fff,#fcfcfb);
  box-shadow:0 2px 6px #10284b05;
}
.role-option:has(input:checked){
  border:1.5px solid #c99a35;
  background:linear-gradient(145deg,#fffaf0,#fff5df);
  box-shadow:0 0 0 2px #c9963118,0 5px 13px #c9963110;
}
.role-icon{color:#17365f}
.login-input{
  border-color:#dce3ed;
  box-shadow:0 2px 6px #10284b07;
}
.login-input:focus-within{
  border-color:#c99a35;
  box-shadow:0 0 0 3px #c99a351c,0 3px 9px #10284b08;
}
.login-submit{
  background:linear-gradient(100deg,#edbd4e 0%,#d59c2e 54%,#b77b19 100%);
  box-shadow:0 7px 17px #bd8b2b30,inset 0 1px #ffffff55;
}
.login-submit:hover{filter:brightness(1.04);transform:translateY(-1px)}
.login-language a{color:#956c22}
@media(max-width:980px) and (min-width:721px){
 .login-shell{grid-template-columns:minmax(240px,.78fr) minmax(420px,1.22fr)}
 .visual-brand p{font-size:13px}
 .visual-cap{width:62px;height:62px;font-size:34px;margin-bottom:12px}
}
@media(max-width:720px){
 .login-shell{grid-template-rows:clamp(142px,22svh,190px) minmax(0,1fr)}
 .login-visual:after{height:34px}
 .visual-brand{transform:none}
 .visual-cap{width:37px;height:37px;border-radius:11px;font-size:22px;margin-bottom:3px}
 .visual-brand p,.visual-footer{display:none}
 .visual-name{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:32px}
 .visual-subtitle{font-size:10px;letter-spacing:2px}
 .gold-rule{width:58px;margin:8px auto 0;height:3px}
 .login-card{border-radius:15px}
 .login-card:before{left:20px;right:20px}
 .login-heading h1{font-size:25px}
}
</style></head><body>
<?php if(!$user):?><div class="login-shell"><section class="login-visual"><div class="visual-brand"><div class="visual-cap">⌂</div><div class="visual-name">StudentLife</div><div class="visual-subtitle">ACADEMIC COMPANION</div><div class="gold-rule"></div><p>Your all-in-one academic space for learning, teaching and academic management.</p></div><div class="visual-footer">Learn · Teach · Achieve</div></section><section class="login-panel"><div class="login-card"><div class="login-heading"><div class="eyebrow">YOUR ACADEMIC SPACE</div><h1>Sign In</h1><p>Sign in to continue to your workspace.</p></div><?php if($err):?><div class="notice"><?=h($err)?></div><?php endif;?><form method="post" class="login-form"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="login"><fieldset class="role-fieldset"><legend>Access as</legend><div class="role-options"><label class="role-option"><input type="radio" name="role" value="student" checked><span class="role-icon">♙</span><b>Student</b></label><label class="role-option"><input type="radio" name="role" value="lecturer"><span class="role-icon">▤</span><b>Lecturer / Professor</b></label><label class="role-option"><input type="radio" name="role" value="administrator"><span class="role-icon">⚙</span><b>Administrator</b></label></div></fieldset><label class="login-label">Email address<div class="login-input"><span>✉</span><input name="email" type="email" placeholder="Enter your email address" required autocomplete="username"></div></label><label class="login-label">Password<div class="login-input"><span>▣</span><input id="login-password" name="password" type="password" placeholder="Enter your password" required autocomplete="current-password"><button class="password-toggle" type="button" aria-label="Show password" onclick="const p=document.getElementById('login-password');p.type=p.type==='password'?'text':'password';this.textContent=p.type==='password'?'Show':'Hide'">Show</button></div></label><div class="login-options"><label class="remember-option"><input type="checkbox" name="remember" value="1"> Remember me</label><span class="forgot-note">Forgot password? Contact your administrator.</span></div><button class="login-submit" type="submit">Sign In <span>→</span></button></form><div class="login-security"><span>▣</span> Secure access to your academic workspace</div></div><div class="login-language"><span>Language</span><a href="?lang=en">English</a><span>·</span><a href="?lang=ru">Русский</a></div></section></div>
<?php else:?><div class="layout"><aside class="side"><div class="brand"><div class="logo">S</div><div><b>StudentLife</b><small>ACADEMIC COMPANION</small></div></div><?php if($isAdmin):?><div class="caption">ADMINISTRATION</div><nav><?=nav('dashboard','Dashboard','⌂',$page)?><?=nav('users','User & Role Management','♙',$page)?><div class="nav-group-label">ACADEMIC MANAGEMENT</div><?=nav('academic','Academic Management','▦',$page)?><div class="nav-group-label">COMMUNICATION & RESOURCES</div><?=nav('announcements','Announcements','♧',$page)?><?=nav('documents','Documents','▣',$page)?><div class="nav-group-label">INSIGHTS & CONTROL</div><?=nav('reports','Reports & Analytics','↗',$page)?><?=nav('settings','System Settings','⚙',$page)?></nav><?php else:?><div class="caption">YOUR WORKSPACE</div><nav><?=nav('dashboard','Dashboard','⌂',$page)?><?=nav('profile','My Profile','♙',$page)?><?=nav('courses','My Courses','▱',$page)?><?=nav('tasks','Assignments & Tasks','✓',$page)?><?=nav('timetable','Timetable','▦',$page)?><?=nav('grades','Grades & GPA','▥',$page)?><?=nav('progress','Academic Progress','↗',$page)?><?=nav('documents','Documents','▣',$page)?><?=nav('announcements','Announcements','♧',$page)?><?=nav('settings','Settings','⚙',$page)?></nav><?php endif;?><div class="foot">Signed in as<br><b><?=h($user['name'])?></b><br><a href="?logout=1">Sign out ↗</a></div></aside><main class="main"><header class="top"><div class="top-title"><small><?=$isAdmin?'ADMINISTRATOR WORKSPACE':'STUDENT WORKSPACE'?></small><b><?=h(['users'=>'User & Role Management','academic'=>'Academic Management','announcements'=>'Announcements','documents'=>'Documents & Resources','reports'=>'Reports & Analytics','settings'=>'System Settings','tasks'=>'Assignments & Tasks','courses'=>'My Courses','grades'=>'Grades & GPA','timetable'=>'Timetable','profile'=>'My Profile','progress'=>'Academic Progress'][$page]??ucfirst($page))?></b></div><div class="top-tools"><form class="top-search" method="get" action=""><input type="hidden" name="page" value="search"><input type="search" name="q" value="<?=h($_GET['q']??'')?>" placeholder="Search courses, assignments, tasks..." aria-label="Search StudentLife"><button class="btn search-btn" type="submit">Search</button></form><label class="language-control"><span>Language</span><select aria-label="Choose language" onchange="window.location.href='?page=<?=h($page)?>&lang='+this.value"><option value="en" <?=$language==='en'?'selected':''?>>English</option><option value="ru" <?=$language==='ru'?'selected':''?>>Русский</option></select></label><span class="muted top-user"><?=h($user['name'])?> · <?=date('D, M j')?></span></div></header><div class="content">
<?php if($page==='dashboard'&&$isAdmin):?>
<div class="hero"><div class="hero-copy"><div class="eyebrow">ADMINISTRATOR WORKSPACE</div><h1>Welcome, <?=h(explode(' ',$user['name'])[0])?> <span>👋</span></h1><p>Manage users, academic activity and the StudentLife platform.</p></div></div>
<?php $totalUsers=(int)$db->query('SELECT COUNT(*) FROM users')->fetchColumn();$students=(int)$db->query("SELECT COUNT(*) FROM users WHERE role='student'")->fetchColumn();$lecturers=(int)$db->query("SELECT COUNT(*) FROM users WHERE role='lecturer'")->fetchColumn();$admins=(int)$db->query("SELECT COUNT(*) FROM users WHERE role='administrator'")->fetchColumn();$totalCourses=(int)$db->query('SELECT COUNT(*) FROM courses')->fetchColumn();$totalTasks=(int)$db->query('SELECT COUNT(*) FROM tasks')->fetchColumn();$totalEvents=(int)$db->query('SELECT COUNT(*) FROM events')->fetchColumn();$totalGrades=(int)$db->query('SELECT COUNT(*) FROM grades')->fetchColumn();$pendingTasks=(int)$db->query("SELECT COUNT(*) FROM tasks WHERE status='todo'")->fetchColumn();?>
<div class="admin-summary-grid">
<div class="card admin-stat"><span class="admin-stat-icon">♙</span><div class="metriclabel">Total Users</div><div class="metric"><?=$totalUsers?></div><small><?=$students?> students · <?=$lecturers?> lecturers · <?=$admins?> admins</small></div>
<div class="card admin-stat"><span class="admin-stat-icon">▱</span><div class="metriclabel">Courses</div><div class="metric"><?=$totalCourses?></div><small>Across all accounts</small></div>
<div class="card admin-stat"><span class="admin-stat-icon">✓</span><div class="metriclabel">Assignments & Tasks</div><div class="metric"><?=$totalTasks?></div><small><?=$pendingTasks?> currently pending</small></div>
<div class="card admin-stat"><span class="admin-stat-icon">▦</span><div class="metriclabel">Scheduled Classes</div><div class="metric"><?=$totalEvents?></div><small>Timetable entries</small></div>
</div>
<div class="dashboard-columns section">
<section class="card feature-card"><div class="head"><div><div class="section-kicker">PLATFORM CONTROL</div><h2>User & Role Management</h2></div><a class="text-link" href="?page=users">Manage Users →</a></div><div class="admin-role-list"><div><span>Students</span><b><?=$students?></b></div><div><span>Lecturers / Professors</span><b><?=$lecturers?></b></div><div><span>Administrators</span><b><?=$admins?></b></div></div><p class="muted">Create accounts and assign access roles. Public registration remains disabled.</p></section>
<section class="card feature-card"><div class="head"><div><div class="section-kicker">ACADEMIC OVERSIGHT</div><h2>Academic Activity</h2></div><a class="text-link" href="?page=academic">Manage Academics →</a></div><div class="admin-role-list"><div><span>Recorded grades</span><b><?=$totalGrades?></b></div><div><span>Timetable entries</span><b><?=$totalEvents?></b></div><div><span>Pending tasks</span><b><?=$pendingTasks?></b></div></div><p class="muted">Monitor the activity currently recorded in StudentLife.</p></section>
</div>
<div class="dashboard-columns section lower-columns">
<section class="card feature-card"><div class="head"><div><div class="section-kicker">RECENT REGISTRATIONS</div><h2>Recently Created Accounts</h2></div><a class="text-link" href="?page=users">View All →</a></div><?php $recentUsers=$db->query('SELECT name,email,role,created_at FROM users ORDER BY id DESC LIMIT 5')->fetchAll();?><table class="table"><tr><th>Name</th><th>Role</th><th>Created</th></tr><?php foreach($recentUsers as $ru):?><tr><td><b><?=h($ru['name'])?></b><br><span class="muted"><?=h($ru['email'])?></span></td><td><span class="pill"><?=h(ucfirst($ru['role']))?></span></td><td><?=h(date('M j, Y',strtotime($ru['created_at'])))?></td></tr><?php endforeach;?></table></section>
<section class="card feature-card"><div class="head"><div><div class="section-kicker">PROJECT MODULES</div><h2>Administration Shortcuts</h2></div></div><div class="admin-shortcuts"><a href="?page=users">♙ <span><b>User & Role Management</b><small>Create student, lecturer and admin accounts</small></span> →</a><a href="?page=academic">▦ <span><b>Academic Overview</b><small>Review courses, tasks, timetable and grades</small></span> →</a><a href="?page=announcements">♧ <span><b>Announcements</b><small>Plan notices for the community</small></span> →</a><a href="?page=reports">↗ <span><b>Reports & Analytics</b><small>Review platform activity</small></span> →</a></div></section>
</div>
<?php elseif($page==='dashboard'):?>
<?php elseif($page==='search'):?><div class="eyebrow">FIND WHAT YOU NEED</div><h1 class="h1">Search StudentLife</h1><p class="sub">Search your courses, assignments and timetable events.</p><?php $term=trim($_GET['q']??'');if($term===''):?><div class="card empty">Enter a keyword in the search bar above.</div><?php else:$like='%'.$term.'%';?><div class="card"><h2>Search results for “<?=h($term)?>”</h2><?php $q=$db->prepare('SELECT id,name AS title,code AS detail,"Course" AS kind FROM courses WHERE user_id=? AND (name LIKE ? OR code LIKE ?) LIMIT 20');$q->execute([$uid,$like,$like]);$results=$q->fetchAll();$q=$db->prepare('SELECT id,title,course AS detail,"Task" AS kind FROM tasks WHERE user_id=? AND (title LIKE ? OR course LIKE ?) LIMIT 20');$q->execute([$uid,$like,$like]);$results=array_merge($results,$q->fetchAll());$q=$db->prepare('SELECT id,title,location AS detail,"Timetable" AS kind FROM events WHERE user_id=? AND (title LIKE ? OR location LIKE ?) LIMIT 20');$q->execute([$uid,$like,$like]);$results=array_merge($results,$q->fetchAll());if(!$results):?><div class="empty">No matching courses, assignments or timetable events were found.</div><?php else:?><table class="table"><tr><th>Type</th><th>Result</th><th>Details</th></tr><?php foreach($results as $result):?><tr><td><span class="pill"><?=h($result['kind'])?></span></td><td><b><?=h($result['title'])?></b></td><td><?=h($result['detail']?:'—')?></td></tr><?php endforeach;?></table><?php endif;?></div><?php endif;?>
<?php elseif($page==='users'&&$isAdmin):?>
<div class="eyebrow">ADMINISTRATION · ACCESS CONTROL</div><h1 class="h1">User & Role Management</h1><p class="sub">Create accounts and assign the correct workspace. Only administrators can manage accounts.</p><?php if(!empty($_SESSION['notice'])):?><div class="notice success-notice"><?=h($_SESSION['notice'])?></div><?php unset($_SESSION['notice']);endif;?><?php if($err):?><div class="notice"><?=h($err)?></div><?php endif;?>
<div class="card"><div class="head"><h2>Create a new account</h2><span class="pill">Admin only</span></div><form method="post" class="form"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="create_user"><?=field('name','Full name','text','required maxlength="120" placeholder="Enter full name"')?><?=field('email','Email address','email','required maxlength="190" placeholder="name@example.com"')?><label>Workspace role<select name="role" required><option value="student">Student</option><option value="lecturer">Lecturer / Professor</option><option value="administrator">Administrator</option></select></label><?=field('new_password','Temporary password (12+ characters)','password','required minlength="12" autocomplete="new-password"')?><div class="wide"><button class="btn">Create account</button></div></form></div>
<div class="section card"><div class="head"><h2>All registered accounts</h2><span class="pill"><?= (int)$db->query('SELECT COUNT(*) FROM users')->fetchColumn()?> accounts</span></div><?php $allUsers=$db->query('SELECT id,name,email,role,account_status,created_at FROM users ORDER BY id DESC')->fetchAll();?><div class="table-wrap"><table class="table"><tr><th>Account</th><th>Role & status</th><th>Administrator actions</th></tr><?php foreach($allUsers as $au):?><tr><td><b><?=h($au['name'])?></b><br><span class="muted"><?=h($au['email'])?></span><br><span class="muted">Created <?=h(date('M j, Y',strtotime($au['created_at'])))?></span></td><td><span class="pill"><?=h(ucfirst($au['role']))?></span><br><span class="pill <?=$au['account_status']==='active'?'green':($au['account_status']==='suspended'?'amber':'')?>"><?=h(ucfirst($au['account_status']))?></span></td><td><form method="post" class="form admin-user-form"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="update_user"><input type="hidden" name="user_id" value="<?=$au['id']?>"><label>Workspace role<select name="role"><option value="student" <?=$au['role']==='student'?'selected':''?>>Student</option><option value="lecturer" <?=$au['role']==='lecturer'?'selected':''?>>Lecturer / Professor</option><option value="administrator" <?=$au['role']==='administrator'?'selected':''?>>Administrator</option></select></label><label>Account status<select name="account_status"><option value="active" <?=$au['account_status']==='active'?'selected':''?>>Active</option><option value="suspended" <?=$au['account_status']==='suspended'?'selected':''?>>Suspended</option><option value="deactivated" <?=$au['account_status']==='deactivated'?'selected':''?>>Deactivated</option></select></label><label class="wide">Optional password reset<input type="password" name="reset_password" minlength="12" autocomplete="new-password" placeholder="Leave blank to keep current password"></label><div class="wide"><button class="btn soft small" type="submit" <?=$au['id']===$uid?'disabled title="You cannot change your own role or status"':''?>>Save account changes</button></div></form></td></tr><?php endforeach;?></table></div></div>
<div class="section card"><div class="head"><h2>Administrator audit trail</h2><span class="pill">Latest 15 actions</span></div><?php $auditRows=$db->query('SELECT a.action,a.details,a.created_at,u.name AS actor FROM admin_audit a LEFT JOIN users u ON u.id=a.actor_id ORDER BY a.id DESC LIMIT 15')->fetchAll();if(!$auditRows):?><div class="empty">No administrator actions recorded yet.</div><?php else:?><div class="table-wrap"><table class="table"><tr><th>Administrator</th><th>Action</th><th>Details</th><th>Date</th></tr><?php foreach($auditRows as $ar):?><tr><td><?=h($ar['actor']?:'Former account')?></td><td><?=h(str_replace('_',' ',$ar['action']))?></td><td><?=h($ar['details'])?></td><td><?=h(date('M j, Y H:i',strtotime($ar['created_at'])))?></td></tr><?php endforeach;?></table></div><?php endif;?></div>
<?php elseif($page==='academic'&&$isAdmin):?>
<div class="eyebrow">ADMINISTRATION · ACADEMIC OVERSIGHT</div><h1 class="h1">Academic Management</h1><p class="sub">A central view of courses, classes, assignments and grades recorded across StudentLife.</p><?php $academicStats=[['Courses',(int)$db->query('SELECT COUNT(*) FROM courses')->fetchColumn()],['Assignments & Tasks',(int)$db->query('SELECT COUNT(*) FROM tasks')->fetchColumn()],['Timetable Entries',(int)$db->query('SELECT COUNT(*) FROM events')->fetchColumn()],['Recorded Grades',(int)$db->query('SELECT COUNT(*) FROM grades')->fetchColumn()]];?><div class="grid"><?php foreach($academicStats as $as):?><div class="card admin-stat"><div class="metriclabel"><?=h($as[0])?></div><div class="metric"><?=$as[1]?></div></div><?php endforeach;?></div><div class="section card"><h2>Academic management areas</h2><div class="admin-module-grid"><div><b>Course Catalogue</b><small>Course records and academic subjects</small><span class="pill">Data summary available</span></div><div><b>Classes & Timetable</b><small>Lectures, seminars and scheduled sessions</small><span class="pill">Data summary available</span></div><div><b>Assignments & Tasks</b><small>Deadlines and completion monitoring</small><span class="pill">Data summary available</span></div><div><b>Grades & GPA</b><small>Recorded assessments and performance overview</small><span class="pill">Data summary available</span></div></div><p class="muted">The current version provides aggregate counts. Cross-account record editing, course allocation, class rosters and official GPA calculations are future development items.</p></div>
<?php elseif(in_array($page,['announcements','documents','reports','settings'],true)&&$isAdmin):?><div class="eyebrow">ADMINISTRATION</div><h1 class="h1"><?=h(['announcements'=>'Announcements','documents'=>'Documents & Resources','reports'=>'Reports & Analytics','settings'=>'System Settings'][$page])?></h1><p class="sub"><?=h(['announcements'=>'Prepare notices and important updates for the StudentLife community.','documents'=>'Plan shared academic documents and resource management.','reports'=>'Review participation and academic activity using platform data.','settings'=>'Manage platform configuration, security and language preferences.'][$page])?></p><div class="card coming-card"><div class="coming-icon">✦</div><h2><?=h(['announcements'=>'Community announcements','documents'=>'Shared academic resources','reports'=>'Platform reporting','settings'=>'Platform configuration'][$page])?></h2><p>This module is listed in the administrator workspace roadmap. It is not yet active. We will build it with the existing PHP/MySQL hosting and free development tools, without introducing paid dependencies.</p><span class="pill">Planned module</span></div>
<?php elseif($page==='tasks'):?><div class="eyebrow">STAY ON TOP OF DEADLINES</div><h1 class="h1">Assignments & tasks</h1><p class="sub">Capture every piece of work and know what needs attention.</p><div class="card"><div class="head"><h2>Add a task</h2></div><form method="post" class="form"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="task"><label class="wide">Assignment or task<input name="title" required maxlength="180" placeholder="Prepare international relations essay"></label><label>Course<input name="course" maxlength="100" placeholder="International Relations"></label><label>Due date<input type="date" name="due_date"></label><label>Priority<select name="priority"><option value="normal">Normal</option><option value="high">High</option></select></label><div style="align-self:end"><button class="btn">Add task</button></div></form></div><div class="section card"><h2>Your task list</h2><?php $q=$db->prepare('SELECT * FROM tasks WHERE user_id=? ORDER BY status,due_date IS NULL,due_date,created_at DESC');$q->execute([$uid]);$rows=$q->fetchAll();if(!$rows):?><div class="empty">No tasks yet. Add your first assignment above.</div><?php else:?><table class="table"><tr><th>Task</th><th>Due</th><th>Status</th><th>Action</th></tr><?php foreach($rows as $t):?><tr><td><b><?=h($t['title'])?></b><br><span class="muted"><?=h($t['course'])?></span></td><td><?=h($t['due_date']?:'—')?></td><td><span class="pill <?=$t['status']==='done'?'green':''?>"><?=h($t['status'])?></span></td><td><form method="post" style="display:inline"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="toggle"><input type="hidden" name="id" value="<?=$t['id']?>"><input type="hidden" name="status" value="<?=$t['status']==='done'?'todo':'done'?>"><button class="btn soft small"><?=$t['status']==='done'?'Reopen':'Complete'?></button></form> <form method="post" style="display:inline"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="del"><input type="hidden" name="id" value="<?=$t['id']?>"><button class="btn danger small">Delete</button></form></td></tr><?php endforeach;?></table><?php endif;?></div>
<?php elseif($page==='courses'):?><div class="eyebrow">YOUR STUDY PLAN</div><h1 class="h1">My courses</h1><p class="sub">Keep your current subjects and credit load organised.</p><div class="card"><h2>Add a course</h2><form method="post" class="form" style="margin-top:14px"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="course"><?=field('code','Course code','text','maxlength="30" placeholder="IR-101"')?><?=field('name','Course name','text','required maxlength="150" placeholder="International Relations"')?><?=field('credits','Credits','number','min="1" max="30" value="3"')?><div style="align-self:end"><button class="btn">Add course</button></div></form></div><div class="section card"><table class="table"><tr><th>Code</th><th>Course</th><th>Credits</th></tr><?php $q=$db->prepare('SELECT * FROM courses WHERE user_id=? ORDER BY code');$q->execute([$uid]);$rows=$q->fetchAll();foreach($rows as $r):?><tr><td><span class="pill"><?=h($r['code'])?></span></td><td><?=h($r['name'])?></td><td><?=h((string)$r['credits'])?></td></tr><?php endforeach;?></table><?php if(!$rows):?><div class="empty">No courses added yet.</div><?php endif;?></div>
<?php elseif($page==='grades'):?><div class="eyebrow">MEASURE YOUR PROGRESS</div><h1 class="h1">Grades & results</h1><p class="sub">Record assessments and follow your academic progress.</p><div class="card"><h2>Record an assessment</h2><form method="post" class="form" style="margin-top:14px"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="grade"><label class="wide">Course<select name="course_id" required><?php $q=$db->prepare('SELECT * FROM courses WHERE user_id=? ORDER BY name');$q->execute([$uid]);$courses=$q->fetchAll();foreach($courses as $r):?><option value="<?=$r['id']?>"><?=h($r['code'].' — '.$r['name'])?></option><?php endforeach;?></select></label><?=field('assessment','Assessment name','text','required placeholder="Midterm examination"')?><?=field('score','Score (out of 100)','number','min="0" max="100" step="0.1" required placeholder="85"')?><div style="align-self:end"><button class="btn" <?=$courses?'':'disabled'?>>Save grade</button></div></form><?php if(!$courses):?><p class="muted">Add a course first.</p><?php endif;?></div><div class="section card"><div class="head"><h2>Assessment record</h2><span class="pill">Average: <?=h($stats['avg'])?></span></div><?php $q=$db->prepare('SELECT g.*,c.code,c.name FROM grades g JOIN courses c ON c.id=g.course_id WHERE g.user_id=? ORDER BY g.created_at DESC');$q->execute([$uid]);$rows=$q->fetchAll();if(!$rows):?><div class="empty">No grades recorded yet.</div><?php else:?><table class="table"><tr><th>Course</th><th>Assessment</th><th>Score</th></tr><?php foreach($rows as $r):?><tr><td><?=h($r['code'].' · '.$r['name'])?></td><td><?=h($r['assessment'])?></td><td><b><?=h((string)$r['score'])?>%</b></td></tr><?php endforeach;?></table><?php endif;?></div>
<?php elseif($page==='timetable'):?><div class="eyebrow">MAKE TIME FOR WHAT MATTERS</div><h1 class="h1">Timetable</h1><p class="sub">Add lectures, seminars, study blocks and exam dates.</p><div class="card"><h2>Add a class or event</h2><form method="post" class="form" style="margin-top:14px"><input type="hidden" name="csrf" value="<?=h(token())?>"><input type="hidden" name="action" value="event"><?=field('title','Event title','text','required placeholder="International Law lecture"')?><?=field('event_date','Date','date','required')?><?=field('start_time','Start time','time')?><?=field('location','Room or location','text','placeholder="Room 302 / Online"')?><div style="align-self:end"><button class="btn">Add to timetable</button></div></form></div><div class="section card"><h2>Upcoming schedule</h2><?php $q=$db->prepare('SELECT * FROM events WHERE user_id=? AND event_date>=CURDATE() ORDER BY event_date,start_time LIMIT 50');$q->execute([$uid]);$rows=$q->fetchAll();if(!$rows):?><div class="empty">No upcoming events. Add your first class above.</div><?php else:?><table class="table"><tr><th>Date</th><th>Event</th><th>Time</th><th>Location</th></tr><?php foreach($rows as $r):?><tr><td><?=h(date('D, M j',strtotime($r['event_date'])))?></td><td><?=h($r['title'])?></td><td><?=h($r['start_time']?:'—')?></td><td><?=h($r['location']?:'—')?></td></tr><?php endforeach;?></table><?php endif;?></div>
<?php elseif(in_array($page,['profile','progress','documents','announcements','settings'],true)):?>
<div class="eyebrow">STUDENT WORKSPACE</div><h1 class="h1"><?=h(['profile'=>'My Profile','progress'=>'Academic Progress','documents'=>'Documents','announcements'=>'Announcements','settings'=>'Settings'][$page])?></h1><p class="sub">This section is part of the StudentLife workspace design.</p><div class="card coming-card"><div class="coming-icon">✦</div><h2><?=h(['profile'=>'Your student profile','progress'=>'Your academic progress','documents'=>'Your academic documents','announcements'=>'University announcements','settings'=>'Your workspace settings'][$page])?></h2><p>This section is planned for the next development phase. Your existing courses, tasks, timetable and grades are unaffected.</p><span class="pill">Coming next</span></div>
<?php else:?><div class="card"><h1>Page not found</h1><a class="btn" href="?page=dashboard">Dashboard</a></div><?php endif;?><p class="footer">StudentLife · Your academic companion · Data belongs to your account.</p></div></main></div><?php endif;?></body></html>