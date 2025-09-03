<?php
$visitor_ip = $_SERVER['REMOTE_ADDR'];
$user_agent = $_SERVER['HTTP_USER_AGENT'];
$visitor_id = md5($visitor_ip . $user_agent);

$json_dir = __DIR__ . '/json/b6cc0e64362e8606bb1a8d25e7d6ad5507634c04896d02c93b69d0edcc9ce41e/';
$visitors_file = $json_dir . 'visitors.json';
$likes_file = $json_dir . 'likes.json';
$stats_file = $json_dir . 'stats.json';
$comments_file = $json_dir . 'comments.json';
$visitor_ips_file = $json_dir . 'visitor_ips.json';
$content_file = $json_dir . 'content.json';

if (!is_dir($json_dir)) {
    mkdir($json_dir, 0755, true);
}

if (!file_exists($visitors_file)) {
    file_put_contents($visitors_file, json_encode([]));
}
if (!file_exists($likes_file)) {
    file_put_contents($likes_file, json_encode([]));
}
if (!file_exists($stats_file)) {
    file_put_contents($stats_file, json_encode(['visitors' => 0, 'likes' => 0]));
}
if (!file_exists($comments_file)) {
    file_put_contents($comments_file, json_encode([
        'metadata' => [
            'total_comments' => 0,
            'created_at' => date('Y-m-d H:i:s'),
            'last_updated' => date('Y-m-d H:i:s')
        ],
        'comments' => []
    ]));
}
if (!file_exists($visitor_ips_file)) {
    file_put_contents($visitor_ips_file, json_encode([
        'metadata' => [
            'total_unique_ips' => 0,
            'total_visits' => 0,
            'created_at' => date('Y-m-d H:i:s'),
            'last_updated' => date('Y-m-d H:i:s')
        ],
        'visitor_ips' => []
    ]));
}

$visitors = json_decode(file_get_contents($visitors_file), true) ?: [];
$likes = json_decode(file_get_contents($likes_file), true) ?: [];
$stats = json_decode(file_get_contents($stats_file), true) ?: ['visitors' => 0, 'likes' => 0];
$comments_data = json_decode(file_get_contents($comments_file), true) ?: ['metadata' => ['total_comments' => 0], 'comments' => []];
$visitor_ips_data = json_decode(file_get_contents($visitor_ips_file), true) ?: ['metadata' => ['total_unique_ips' => 0, 'total_visits' => 0], 'visitor_ips' => []];

$comments = $comments_data['comments'];
$visitor_ips = $visitor_ips_data['visitor_ips'];

if (!in_array($visitor_id, $visitors)) {
    $visitors[] = $visitor_id;
    $stats['visitors'] = count($visitors);
    file_put_contents($visitors_file, json_encode($visitors));
    file_put_contents($stats_file, json_encode($stats));
}

$ip_found = false;
foreach ($visitor_ips as &$ip_data) {
    if ($ip_data['ip'] === $visitor_ip) {
        $ip_data['visit_count']++;
        $ip_data['last_visit'] = date('Y-m-d H:i:s');
        $ip_data['user_agents'][] = $user_agent;
        $ip_data['user_agents'] = array_unique($ip_data['user_agents']);
        $ip_found = true;
        break;
    }
}

if (!$ip_found) {
    $visitor_ips[] = [
        'ip' => $visitor_ip,
        'visit_count' => 1,
        'first_visit' => date('Y-m-d H:i:s'),
        'last_visit' => date('Y-m-d H:i:s'),
        'user_agents' => [$user_agent]
    ];
    $visitor_ips_data['metadata']['total_unique_ips']++;
}

$visitor_ips_data['metadata']['total_visits']++;
$visitor_ips_data['metadata']['last_updated'] = date('Y-m-d H:i:s');
$visitor_ips_data['visitor_ips'] = $visitor_ips;
file_put_contents($visitor_ips_file, json_encode($visitor_ips_data, JSON_PRETTY_PRINT));

$has_liked = in_array($visitor_id, $likes);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    $action = $_POST['action'] ?? '';
    
    if ($action === 'like' && !$has_liked) {
        $likes[] = $visitor_id;
        $stats['likes'] = count($likes);
        file_put_contents($likes_file, json_encode($likes));
        file_put_contents($stats_file, json_encode($stats));
        
        echo json_encode([
            'success' => true,
            'likes' => $stats['likes'],
            'has_liked' => true
        ]);
        exit;
    } elseif ($action === 'get_stats') {
        echo json_encode([
            'visitors' => $stats['visitors'],
            'likes' => $stats['likes'],
            'has_liked' => $has_liked
        ]);
        exit;
    } elseif ($action === 'add_comment') {
        $name = trim($_POST['name'] ?? '');
        $message = trim($_POST['message'] ?? '');
        $rating = intval($_POST['rating'] ?? 0);
        
        if (empty($name)) {
            $name = 'Anonymous';
        }
        
        if (!empty($message) && $rating >= 1 && $rating <= 5) {
            $visitor_ip_info = null;
            foreach ($visitor_ips as $ip_data) {
                if ($ip_data['ip'] === $visitor_ip) {
                    $visitor_ip_info = $ip_data;
                    break;
                }
            }
            
            $comment = [
                'id' => uniqid(),
                'visitor_info' => [
                    'visitor_id' => $visitor_id,
                    'ip_address' => $visitor_ip,
                    'visit_count' => $visitor_ip_info ? $visitor_ip_info['visit_count'] : 1,
                    'user_agent' => $user_agent
                ],
                'comment_data' => [
                    'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                    'message' => htmlspecialchars($message, ENT_QUOTES, 'UTF-8'),
                    'rating' => $rating
                ],
                'timestamps' => [
                    'created_at' => date('Y-m-d H:i:s'),
                    'timestamp' => time()
                ]
            ];
            
            $comments[] = $comment;
            $comments_data['comments'] = $comments;
            $comments_data['metadata']['total_comments'] = count($comments);
            $comments_data['metadata']['last_updated'] = date('Y-m-d H:i:s');
            
            file_put_contents($comments_file, json_encode($comments_data, JSON_PRETTY_PRINT));
            
            echo json_encode([
                'success' => true,
                'comment' => [
                    'id' => $comment['id'],
                    'name' => $comment['comment_data']['name'],
                    'message' => $comment['comment_data']['message'],
                    'rating' => $comment['comment_data']['rating'],
                    'timestamp' => $comment['timestamps']['timestamp']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Invalid comment data']);
        }
        exit;
    } elseif ($action === 'get_comments') {
        $display_comments = array_map(function($comment) {
            return [
                'id' => $comment['id'],
                'name' => $comment['comment_data']['name'],
                'message' => $comment['comment_data']['message'],
                'rating' => $comment['comment_data']['rating'],
                'timestamp' => $comment['timestamps']['timestamp']
            ];
        }, array_reverse($comments));
        
        echo json_encode([
            'success' => true,
            'comments' => $display_comments,
            'total' => count($comments),
            'metadata' => $comments_data['metadata']
        ]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['api']) && $_GET['api'] === 'content') {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: Content-Type');
    
    if (file_exists($content_file)) {
        $content = file_get_contents($content_file);
        echo $content;
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Content not found']);
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title id="pageTitle">Portfolio</title>
    <link rel="stylesheet" href="./assets/css/main.css">
    <link rel="stylesheet" href="./assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="dark-theme">
    <div class="container">
        <button class="sidebar-toggle desktop-toggle" id="sidebarToggle" aria-label="Toggle sidebar">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" style="transform: rotate(180deg);">
                <path d="M15 18l-6-6 6-6" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        </button>

        <button class="sidebar-toggle mobile-toggle" id="sidebarToggleMobile" aria-label="Toggle sidebar">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none">
                <line x1="4" x2="20" y1="6" y2="6"/>
                <line x1="4" x2="20" y1="12" y2="12"/>
                <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
        </button>

        <div class="top-right-container">
            <div class="stats-container">
                <div class="stat-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="m22 21-3-3m0 0a6 6 0 1 0-6-6 6 6 0 0 0 6 6z"/>
                    </svg>
                    <span id="visitorCount"><?php echo $stats['visitors']; ?></span>
                </div>
                <div class="stat-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span id="likeCount"><?php echo $stats['likes']; ?></span>
                </div>
            </div>
            <div class="resume-container">
                <button class="resume-btn" id="resumeBtn" title="View Resume">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                    </svg>
                </button>
            </div>
        </div>

        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="profile-section">
                    <div class="profile-image-container">
                        <img id="profileLogo"  class="profile-image">
                        <div class="status-indicator"></div>
                    </div>
                    <div class="profile-info">
                        <h2 class="profile-name" id="profileName"></h2>
                        <p class="profile-title" id="profileTitle"></p>
                        <div class="profile-status">
                            <span class="status-text">Available for hire</span>
                        </div>
                    </div>
                </div>
                
                <div class="social-section">
                    <div class="social-links" id="socialLinks"></div>
                </div>
            </div>
            <nav class="sidebar-nav">
                <ul class="nav-list" id="navList"></ul>
            </nav>
        </aside>

        <main class="main-content" id="mainContent">
            <div class="cyber-grid"></div>
            <div class="matrix-rain"></div>
            <div class="floating-code"></div>
            <div class="cyber-particles"></div>
            <div class="content-wrapper" id="contentWrapper"></div>
        </main>
        
        <div class="modal" id="commentModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Leave a Comment</h3>
                    <button class="modal-close" id="modalClose">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                
                <form class="comment-form" id="commentForm">
                    <div class="form-group">
                        <input type="text" id="commentName" placeholder="Your Name (leave empty for Anonymous)">
                    </div>
                    
                    <div class="form-group">
                        <div class="rating-input">
                            <span class="rating-label">Rating:</span>
                            <div class="stars" id="starRating">
                                <span class="star" data-rating="1">★</span>
                                <span class="star" data-rating="2">★</span>
                                <span class="star" data-rating="3">★</span>
                                <span class="star" data-rating="4">★</span>
                                <span class="star" data-rating="5">★</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <textarea id="commentMessage" placeholder="Share your thoughts..." required></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" id="cancelBtn">Cancel</button>
                        <button type="submit" class="btn-submit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                            </svg>
                            Submit Comment
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <div class="modal-backdrop" id="modalBackdrop"></div>
    </div>

    <script src="./assets/js/content.js"></script>
    <script src="./assets/js/main.js"></script>
    <script src="./assets/js/cursor.js"></script>
</body>
</html>