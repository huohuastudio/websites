<?php
// 首页截图用的演示数据，由 setup.sh 调用（当前目录为副本的根目录）：php seed-demo.php <照片目录>
// 前提：已迁移、执行 InitializeSeeder、创建管理员 admin（id 1）。照片通过上传服务写入本地储存，生成缩略图和记录。
// 前台截图用 linhao@example.com / demo1234

use App\Facades\UploadService;
use App\Models\Album;
use App\Models\Coupon;
use App\Models\Driver;
use App\Models\Feedback;
use App\Models\Group;
use App\Models\Notice;
use App\Models\Order;
use App\Models\Photo;
use App\Models\Plan;
use App\Models\Report;
use App\Models\Storage;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Violation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\Hash;

require getcwd().'/vendor/autoload.php';
$app = require getcwd().'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$photoDir = realpath($argv[1]);
mt_srand(20261118);
$now = Carbon::now();

// ---- 角色组和储存 ----
$default = Group::find(1);
$local = Storage::find(1);
$local->update(['name' => '本地储存', 'intro' => '服务器本地磁盘']);
$pro = Group::create(['name' => '专业版会员', 'intro' => '单张 20 MB，可使用图片处理和 AI 功能', 'options' => array_merge(Group::getDefaultOptions(), ['max_upload_size' => 20480, 'ai_enabled' => true, 'allow_album_password' => true])]);
$team = Group::create(['name' => '团队版', 'intro' => '团队共享，单张 50 MB', 'options' => array_merge(Group::getDefaultOptions(), ['max_upload_size' => 51200, 'ai_enabled' => true, 'allow_album_password' => true])]);
$fake = fn (array $o) => array_merge(Driver::getStorageDefaultOptions(), $o);
$oss = Storage::create(['name' => '阿里云 OSS（华东）', 'intro' => '会员图片', 'prefix' => 'uploads', 'provider' => 'oss', 'options' => $fake(['public_url' => 'https://img.example.com', 'bucket' => 'photos-hz', 'endpoint' => 'oss-cn-hangzhou.aliyuncs.com', 'access_key_id' => 'LTAI5t••••••••', 'access_key_secret' => '••••••••'])]);
$r2 = Storage::create(['name' => 'Cloudflare R2', 'intro' => '海外访问', 'prefix' => 'uploads', 'provider' => 's3', 'options' => $fake(['public_url' => 'https://cdn.example.com', 'bucket' => 'photos', 'endpoint' => 'https://example.r2.cloudflarestorage.com', 'region' => 'auto', 'access_key_id' => '••••••••', 'secret_access_key' => '••••••••'])]);
$cos = Storage::create(['name' => '腾讯云 COS（广州）', 'intro' => '团队版专用', 'prefix' => 'team', 'provider' => 'cos', 'options' => $fake(['public_url' => 'https://team.example.com', 'bucket' => 'team-1250000000', 'region' => 'ap-guangzhou', 'secret_id' => '••••••••', 'secret_key' => '••••••••'])]);
$pro->storages()->attach([$local->id, $oss->id, $r2->id]);
$team->storages()->attach([$local->id, $cos->id]);

// ---- 用户 ----
$people = [
    ['linhao', '林皓'], ['chenyu', '陈雨'], ['zhouqi', '周琪'], ['sunmo', '孙墨'], ['hejia', '何嘉'], ['xuning', '许宁'],
    ['gaoyuan', '高远'], ['luochen', '罗晨'], ['songyi', '宋怡'], ['tangke', '唐可'], ['fengxiao', '冯晓'], ['hanlu', '韩露'],
    ['caoyang', '曹阳'], ['yuanfei', '袁菲'], ['dengrui', '邓睿'], ['panwei', '潘薇'], ['duyan', '杜妍'], ['jiangtao', '江涛'],
    ['weiran', '魏然'], ['qinshu', '秦舒'], ['yaoxin', '姚欣'], ['shenbo', '沈博'], ['guoliang', '郭亮'], ['huangsi', '黄思'],
];
$domains = ['example.com', 'example.net', 'example.org'];
$users = [];
foreach ($people as $i => [$username, $name]) {
    $created = $now->copy()->subDays($i === 0 ? 210 : mt_rand(3, 300))->subMinutes(mt_rand(0, 1439));
    $user = User::create([
        'username' => $username, 'name' => $name, 'email' => $username.'@'.$domains[$i % 3],
        // 手机号中间四位打星号：随机生成的完整号码可能恰好是真实号码
        'phone' => mt_rand(0, 9) < 6 ? '1'.[3, 5, 7, 8, 9][mt_rand(0, 4)].mt_rand(0, 9).'****'.str_pad((string) mt_rand(0, 9999), 4, '0', STR_PAD_LEFT) : null,
        'password' => Hash::make('demo1234'), 'email_verified_at' => $created, 'register_ip' => '192.0.2.'.mt_rand(2, 250),
    ]);
    $user->forceFill(['created_at' => $created, 'updated_at' => $created])->save();
    $group = $i === 0 || $i % 4 === 1 ? $pro : ($i % 7 === 3 ? $team : $default);
    $user->group()->create(['group_id' => $group->id, 'from' => $group === $default ? 'system' : 'subscribe', 'expired_at' => $group === $default ? null : $now->copy()->addDays(mt_rand(20, 330))]);
    $user->capacity()->create(['capacity' => $group === $team ? 104857600 : ($group === $pro ? 52428800 : 1048576), 'from' => 'system']);
    $users[] = $user;
}
$lin = $users[0];

// ---- 照片：林皓 30 张分 6 天上传并建相册，其余分给其他用户 ----
$titles = [
    '01' => '河口湖码头', '02' => '高山湖泊', '03' => '瀑布航拍', '04' => '格朗迪厄瀑布', '05' => '魁北克秋色', '06' => '五月的森林',
    '07' => '海湾日落', '08' => '里约日落', '09' => '沙丘与骆驼', '10' => '戈壁驼队', '11' => '雪后松林', '12' => '雪后谷仓',
    '13' => '蒙绍秋景', '14' => '泡泡果叶', '15' => '波斯菊', '16' => '花园一角', '19' => '草丛里的猫', '20' => '长椅上的猫',
    '22' => '海滩上的狗', '25' => '灰蝶', '26' => '斑蝶', '27' => '芳堤娜城堡夜景', '28' => '香港夜景', '29' => '克沃兹科古桥',
    '30' => '古桥侧影', '31' => '干尼亚灯塔', '32' => '海岬灯塔', '33' => '慕尼黑旧市政厅', '35' => '咖啡馆招牌',
    '36' => '海边咖啡馆', '37' => '海鲜饭', '40' => '蓝莓', '42' => '在建的铁路', '43' => '港湾小船',
    '44' => '海边渔船', '46' => '国际象棋',
];
$albums = [
    '旅行' => ['intro' => '去过的地方', 'files' => ['01', '07', '08', '27', '29', '31', '33', '36', '43'], 'tags' => ['旅行']],
    '自然风光' => ['intro' => '山、湖和森林', 'files' => ['02', '03', '04', '05', '06', '11', '12', '13'], 'tags' => ['风景']],
    '动物' => ['intro' => '', 'files' => ['09', '19', '20', '22', '25', '26'], 'tags' => ['动物']],
    '城市' => ['intro' => '街道和建筑', 'files' => ['27', '28', '30', '33'], 'tags' => ['城市']],
    '美食与咖啡' => ['intro' => '', 'files' => ['35', '36', '37', '40'], 'tags' => ['美食']],
    '雪景' => ['intro' => '冬天', 'files' => ['11', '12'], 'tags' => ['雪景']],
    '花与昆虫' => ['intro' => '微距', 'files' => ['15', '16', '25', '26'], 'tags' => ['微距']],
    '海边' => ['intro' => '', 'files' => ['07', '31', '43'], 'tags' => ['海边']],
];
$linFiles = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '11', '12', '13', '15', '19', '20', '22', '25', '26', '27', '28', '29', '30', '31', '33', '16', '35', '36', '37', '40', '43'];
$otherFiles = array_values(array_diff(array_keys($titles), $linFiles));

$upload = function (User $user, string $key, Carbon $at) use ($photoDir, $titles): Photo {
    $path = glob("$photoDir/$key-*.jpg")[0];
    $group = $user->group->group;
    Context::add('group', $group);
    $tmp = tempnam(sys_get_temp_dir(), 'ls').'.jpg';
    copy($path, $tmp);
    $photo = UploadService::uploadImage(new UploadedFile($tmp, $titles[$key].'.jpg', 'image/jpeg', null, true), $user, ['storage_id' => 1, 'is_public' => true]);
    @unlink($tmp);
    $photo->forceFill(['created_at' => $at, 'updated_at' => $at, 'ip_address' => '198.51.100.'.mt_rand(2, 250)])->save();

    return $photo;
};

// 林皓：最近 6 个拍摄日，每天 5 张，越新的日期越靠前
$byKey = [];
foreach (array_chunk($linFiles, 5) as $d => $chunk) {
    $day = $now->copy()->subDays([1, 3, 6, 11, 18, 27][$d])->setTime(mt_rand(9, 20), mt_rand(0, 59));
    foreach ($chunk as $n => $key) {
        $byKey[$key] = $upload($lin, $key, $day->copy()->addMinutes($n * 3));
    }
}
foreach ($albums as $name => $a) {
    $album = Album::create(['user_id' => $lin->id, 'name' => $name, 'intro' => $a['intro'], 'is_public' => $name !== '美食与咖啡']);
    $album->forceFill(['created_at' => $now->copy()->subDays(mt_rand(20, 200))->subMinutes(mt_rand(0, 900))])->save();
    $album->photos()->attach(array_map(fn ($k) => $byKey[$k]->id, array_filter($a['files'], fn ($k) => isset($byKey[$k]))));
}
// 其他用户
$others = [];
foreach ($otherFiles as $n => $key) {
    $others[] = $upload($users[1 + $n * 2], $key, $now->copy()->subDays(mt_rand(1, 40))->subMinutes(mt_rand(0, 900)));
}
foreach ([2, 4, 5, 8, 10] as $n => $u) {
    $k = $linFiles[($n * 7) % count($linFiles)];
    $others[] = $upload($users[$u], $k, $now->copy()->subDays(mt_rand(1, 50))->subMinutes(mt_rand(0, 900)));
}

// ---- 套餐、价格、优惠券 ----
$mk = function (string $type, string $name, string $intro, array $features, ?string $badge, int $sort, array $prices, ?Group $group, ?int $capacity) {
    $plan = Plan::create(compact('type', 'name', 'intro', 'features', 'badge', 'sort') + ['is_up' => true]);
    foreach ($prices as [$pn, $days, $price]) {
        $plan->prices()->create(['name' => $pn, 'duration' => $days, 'price' => $price]);
    }
    if ($group) {
        $plan->groups()->create(['group_id' => $group->id]);
    }
    if ($capacity) {
        $plan->capacities()->create(['capacity' => $capacity]);
    }

    return $plan;
};
$pPro = $mk('vip', '专业版会员', '适合个人博客和摄影爱好者', ['单张 20 MB', '50 GB 空间', '图片处理和 AI 功能', '相册访问密码'], '热门', 1, [['月付', 30, 15], ['年付', 365, 150]], $pro, 52428800);
$pTeam = $mk('vip', '团队版', '多人共用，独立储存', ['单张 50 MB', '100 GB 空间', '独立的对象储存', '优先处理工单'], null, 2, [['年付', 365, 980]], $team, 104857600);
$pCap50 = $mk('storage', '扩容 50 GB', '在当前角色组的基础上增加空间', ['50 GB 空间'], null, 3, [['一年', 365, 30]], null, 52428800);
$pCap200 = $mk('storage', '扩容 200 GB', '在当前角色组的基础上增加空间', ['200 GB 空间'], null, 4, [['一年', 365, 98]], null, 209715200);
Coupon::create(['type' => 'direct', 'name' => '新用户立减 5 元', 'code' => 'WELCOME5', 'value' => 5, 'usage_limit' => 500, 'expired_at' => $now->copy()->addMonths(3)]);
Coupon::create(['type' => 'percent', 'name' => '年付 8 折', 'code' => 'YEAR80', 'value' => 0.8, 'usage_limit' => 100, 'expired_at' => $now->copy()->addMonth()]);

// ---- 支付驱动 ----
$pay = fn (string $name, string $provider, string $intro) => Driver::create(['type' => 'payment', 'name' => $name, 'intro' => $intro, 'options' => ['provider' => $provider]]);
$drivers = [$pay('支付宝', 'alipay', '当面付和电脑网站支付'), $pay('微信支付', 'wechat', 'Native 扫码支付'), $pay('PayPal', 'paypal', '海外用户'), $pay('Stripe', 'stripe', '银行卡支付')];
foreach ([$default, $pro, $team] as $g) {
    $g->drivers()->attach(collect($drivers)->mapWithKeys(fn ($d) => [$d->id => ['type' => 'payment']])->all());
}

// ---- 订单：近 60 天，多数已支付 ----
$prices = collect([$pPro, $pTeam, $pCap50, $pCap200])->flatMap(fn ($p) => $p->prices()->with("plan")->get());
$t = $now->copy()->subMinutes(26);
for ($i = 0; $i < 34; $i++) {
    $price = $prices[[0, 1, 0, 2, 1, 0, 3, 4, 0, 1][$i % 10]];
    $user = $users[mt_rand(1, count($users) - 1)];
    $status = $i === 0 || $i === 5 ? 'unpaid' : ($i % 11 === 7 ? 'cancelled' : 'paid');
    $coupon = $i % 6 === 2 ? Coupon::find(1) : null;
    $amount = max(0, $price->price - ($coupon ? 5 : 0)); // 金额字段按元读写
    $order = (new Order)->forceFill([
        'plan_id' => $price->plan_id, 'user_id' => $user->id, 'coupon_id' => $coupon?->id,
        'trade_no' => $t->format('YmdHis').str_pad((string) mt_rand(1, 99999), 5, '0', STR_PAD_LEFT),
        'out_trade_no' => $t->format('YmdHis').str_pad((string) mt_rand(1, 99999), 5, '0', STR_PAD_LEFT),
        'type' => $i % 9 === 4 ? 'renew' : 'plan', 'amount' => $amount, 'deduct_amount' => $price->price - $amount,
        'snapshot' => $price->plan, 'product' => $price->withoutRelations(),
        'pay_method' => $status === 'paid' ? ['alipay', 'wechat', 'alipay', 'stripe', 'paypal'][$i % 5] : '',
        'status' => $status, 'paid_at' => $status === 'paid' ? $t->copy()->addMinutes(2) : null,
        'canceled_at' => $status === 'cancelled' ? $t->copy()->addMinutes(30) : null,
        'created_at' => $t, 'updated_at' => $t,
    ]);
    $order->save();
    $t = $t->copy()->subHours(mt_rand(5, 48))->subMinutes(mt_rand(0, 59));
}

// ---- 工单 ----
$tickets = [
    [$users[3], '自定义域名访问图片返回 403', 'high', 'in_progress', [
        [0, '您好，按文档给储存配置了自定义域名 img.example.net，浏览器打开图片地址返回 403，原来的地址可以正常访问。'],
        [1, '您好，403 一般是对象储存的防盗链设置没有放行新域名。请在储存桶的防盗链白名单中加入 img.example.net，保存后约 1 分钟生效。'],
        [0, '加上之后可以了，另外想确认一下，旧地址还能继续用吗？'],
    ]],
    [$users[7], '年付会员能否开发票', 'medium', 'completed', [
        [0, '公司报销需要发票，年付的专业版会员可以开吗？'],
        [1, '可以。请在工单中留下发票抬头、税号和接收邮箱，我们在 3 个工作日内开具电子发票并发到邮箱。'],
        [0, '已发送，谢谢。'],
    ]],
    [$users[10], '批量上传时部分图片失败', 'medium', 'in_progress', [
        [0, '一次选了 60 张照片上传，有 8 张提示失败，单独再传又能成功。'],
        [1, '您所在的角色组限制了每分钟 20 张的上传数量，超出的会被拒绝。建议分批上传，或升级到专业版会员（每分钟 60 张）。'],
    ]],
    [$users[5], '相册设置访问密码后无法分享', 'low', 'completed', [
        [0, '相册加了密码，分享给朋友后他打开提示需要密码，是正常的吗？'],
        [1, '是正常的。设置了访问密码的相册，访客需要输入密码才能查看，请把密码单独告诉对方。'],
    ]],
    [$users[12], '申请迁移到团队版', 'low', 'in_progress', [
        [0, '我们团队 5 个人想一起用，现有的图片能迁移到团队版吗？'],
    ]],
];
foreach ($tickets as $n => [$user, $title, $level, $status, $replies]) {
    // 回复在创建后 5–100 分钟内，创建时间至少在 3 小时前，免得回复时间晚于现在
    $at = $now->copy()->subDays($n * 2)->subHours(mt_rand(3, 8));
    $ticket = Ticket::create(['user_id' => $user->id, 'issue_no' => $at->format('YmdHis').str_pad((string) mt_rand(1, 99999), 5, '0', STR_PAD_LEFT), 'title' => $title, 'level' => $level, 'status' => $status]);
    $ticket->forceFill(['created_at' => $at, 'updated_at' => $at])->save();
    foreach ($replies as $k => [$isAdmin, $content]) {
        $r = $ticket->replies()->create(['user_id' => $isAdmin ? 1 : $user->id, 'content' => $content]);
        $r->forceFill(['created_at' => $at->copy()->addMinutes($k * 47 + 5), 'updated_at' => $at->copy()->addMinutes($k * 47 + 5)])->save();
    }
}

// ---- 举报、违规、公告、意见反馈 ----
foreach ([[$others[0], '图片涉嫌侵权，原作者是我', 'unhandled'], [$others[2], '内容与描述不符', 'handled'], [$byKey['28'], '重复上传', 'handled']] as $n => [$photo, $content, $status]) {
    $r = Report::create(['report_user_id' => $users[15 + $n]->id, 'reportable_type' => Photo::class, 'reportable_id' => $photo->id, 'content' => $content, 'status' => $status, 'handled_at' => $status === 'handled' ? $now->copy()->subDays($n) : null, 'ip_address' => '203.0.113.'.mt_rand(2, 250)]);
    $r->forceFill(['created_at' => $now->copy()->subDays($n + 1)->subHours(3)])->save();
}
foreach ([[$others[1], '疑似广告图片', 'unhandled'], [$others[3], '审核驱动标记：疑似违规内容', 'handled']] as $n => [$photo, $reason, $status]) {
    Violation::create(['user_id' => $photo->user_id, 'photo_id' => $photo->id, 'reason' => $reason, 'status' => $status, 'handled_at' => $status === 'handled' ? $now->copy()->subDays(2) : null]);
}
Notice::create(['title' => '专业版会员年付 8 折', 'content' => '<p>即日起至月底，专业版会员年付使用优惠码 YEAR80 可享 8 折。</p>', 'sort' => 1, 'view_count' => 1268]);
Notice::create(['title' => '海外访问节点已上线', 'content' => '<p>新增 Cloudflare R2 储存，海外访问更快。专业版会员可在上传时选择。</p>', 'sort' => 2, 'view_count' => 834]);
foreach ([['general', '建议支持按拍摄日期排序', '何嘉', '希望图片管理可以按 EXIF 中的拍摄时间排序。'], ['general', '上传页能否记住上次选的相册', '冯晓', '每次上传都要重新选相册。'], ['dmca', '版权投诉', '某摄影工作室', '贵站一张图片使用了我方作品，请处理。']] as [$type, $title, $name, $content]) {
    Feedback::create(['type' => $type, 'title' => $title, 'name' => $name, 'email' => 'feedback@example.com', 'content' => $content, 'ip_address' => '203.0.113.'.mt_rand(2, 250)]);
}

// 后台配置类的数据：创建时间错开放在一年前前后，早于订单和图片
foreach ([Group::class, Storage::class, Driver::class, Plan::class, Coupon::class, Notice::class] as $model) {
    foreach ($model::all() as $row) {
        $row->forceFill(['created_at' => $now->copy()->subDays(mt_rand(240, 380))->subMinutes(mt_rand(0, 1439))])->saveQuietly();
    }
}

echo '用户 ', User::count(), '，图片 ', Photo::count(), '，相册 ', Album::count(), '，订单 ', Order::count(), "\n";
