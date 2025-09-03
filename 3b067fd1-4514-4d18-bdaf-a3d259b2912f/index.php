<?php
session_start();

function encryptData($data, $key) {
    $iv = openssl_random_pseudo_bytes(16);
    $encrypted = openssl_encrypt($data, 'AES-256-CBC', $key, 0, $iv);
    return base64_encode($iv . $encrypted);
}

function decryptData($data, $key) {
    $data = base64_decode($data);
    $iv = substr($data, 0, 16);
    $encrypted = substr($data, 16);
    return openssl_decrypt($encrypted, 'AES-256-CBC', $key, 0, $iv);
}

function extractCssColors($cssContent) {
    $colors = [];
    preg_match_all('/--([^:]+):\s*([^;]+);/', $cssContent, $matches, PREG_SET_ORDER);
    
    foreach ($matches as $match) {
        $varName = trim($match[1]);
        $value = trim($match[2]);
        $colors[$varName] = $value;
    }
    
    return $colors;
}

function updateCssWithColors($originalCss, $colorsArray) {
    $updatedCss = $originalCss;
    
    foreach ($colorsArray as $varName => $value) {
        $pattern = '/--' . preg_quote($varName, '/') . ':\s*[^;]+;/';
        $replacement = '--' . $varName . ': ' . $value . ';';
        $updatedCss = preg_replace($pattern, $replacement, $updatedCss);
    }
    
    return $updatedCss;
}

function parseColorsInput($input) {
    $colors = [];
    $lines = explode("\n", $input);
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, ':') === false) continue;
        
        list($varName, $value) = explode(':', $line, 2);
        $varName = trim(str_replace('--', '', $varName));
        $value = trim($value);
        $colors[$varName] = $value;
    }
    
    return $colors;
}

function formatColorsOutput($colors) {
    $output = '';
    foreach ($colors as $varName => $value) {
        $output .= "--{$varName}: {$value}\n";
    }
    return $output;
}

$jsonDir = __DIR__ . '/../json/b6cc0e64362e8606bb1a8d25e7d6ad5507634c04896d02c93b69d0edcc9ce41e/';
$contentFile = $jsonDir . 'content.json';
$authFile = $jsonDir . 'auth.json';

$backupDir = __DIR__ . '/../temp/backup/';
$templateDir = __DIR__ . '/../temp/template/';
$backupJsonFile = $backupDir . 'json/content.json';
$templateJsonFile = $templateDir . 'json/content.json';
$backupCssFile = $backupDir . 'css/main.css';
$templateCssFile = $templateDir . 'css/main.css';
$mainCssFile = __DIR__ . '/../assets/css/main.css';

if (!is_dir($jsonDir)) {
    mkdir($jsonDir, 0755, true);
}

if (!is_dir($backupDir . 'json/')) {
    mkdir($backupDir . 'json/', 0755, true);
}

if (!is_dir($backupDir . 'css/')) {
    mkdir($backupDir . 'css/', 0755, true);
}

if (!is_dir($templateDir . 'json/')) {
    mkdir($templateDir . 'json/', 0755, true);
}

if (!is_dir($templateDir . 'css/')) {
    mkdir($templateDir . 'css/', 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    ob_clean();
    header('Content-Type: application/json');
    $action = $_POST['action'] ?? '';
    
    if ($action === 'setup') {
        if (!file_exists($authFile) || filesize($authFile) == 0) {
            $password = $_POST['password'] ?? '';
            if (strlen($password) < 8) {
                echo json_encode(['success' => false, 'error' => 'Password must be at least 8 characters long']);
                exit;
            }
            if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', $password)) {
                echo json_encode(['success' => false, 'error' => 'Password must contain at least one lowercase letter, one uppercase letter, and one number']);
                exit;
            }
            if ($password) {
                $authData = [
                    'password' => password_hash($password, PASSWORD_DEFAULT),
                    'created' => date('Y-m-d H:i:s')
                ];
                $encryptedAuth = encryptData(json_encode($authData), $password);
                file_put_contents($authFile, $encryptedAuth);
                $_SESSION['authenticated'] = true;
                $_SESSION['auth_password'] = $password;
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Password required']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Already configured']);
        }
        exit;
    }
    
    if ($action === 'auth') {
        $inputPassword = $_POST['password'] ?? '';
        if (file_exists($authFile) && filesize($authFile) > 0 && $inputPassword) {
            try {
                $encryptedAuth = file_get_contents($authFile);
                $decryptedAuth = decryptData($encryptedAuth, $inputPassword);
                $authData = json_decode($decryptedAuth, true);
                
                if ($authData && password_verify($inputPassword, $authData['password'])) {
                    $_SESSION['authenticated'] = true;
                    $_SESSION['auth_password'] = $inputPassword;
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Invalid password']);
                }
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => 'Invalid password']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Invalid password']);
        }
        exit;
    }
    
    if ($action === 'reset_password' && isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
        $newPassword = $_POST['new_password'] ?? '';
        if ($newPassword && isset($_SESSION['auth_password'])) {
            $authData = [
                'password' => password_hash($newPassword, PASSWORD_DEFAULT),
                'created' => date('Y-m-d H:i:s'),
                'updated' => date('Y-m-d H:i:s')
            ];
            $encryptedAuth = encryptData(json_encode($authData), $newPassword);
            file_put_contents($authFile, $encryptedAuth);
            $_SESSION['auth_password'] = $newPassword;
            echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
        } else {
            echo json_encode(['success' => false, 'error' => 'New password required']);
        }
        exit;
    }
    
    if ($action === 'update' && isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
        $data = $_POST['data'] ?? '';
        if ($data) {
            try {
                json_decode($data);
                if (json_last_error() === JSON_ERROR_NONE) {
                    if (file_exists($contentFile)) {
                        copy($contentFile, $backupJsonFile);
                    }
                    file_put_contents($contentFile, $data);
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Invalid JSON format']);
                }
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => 'Error saving content']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'No data provided']);
        }
        exit;
    }
    
    if ($action === 'load_backup_json' && isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
        if (file_exists($backupJsonFile)) {
            $content = file_get_contents($backupJsonFile);
            echo json_encode(['success' => true, 'content' => $content]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No backup found']);
        }
        exit;
    }
    
    if ($action === 'load_template_json' && isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
        if (file_exists($templateJsonFile)) {
            $content = file_get_contents($templateJsonFile);
            echo json_encode(['success' => true, 'content' => $content]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No template found']);
        }
        exit;
    }
    
    if ($action === 'load_current_colors' && isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
        if (file_exists($mainCssFile)) {
            $cssContent = file_get_contents($mainCssFile);
            $colors = extractCssColors($cssContent);
            $formattedColors = formatColorsOutput($colors);
            echo json_encode(['success' => true, 'content' => $formattedColors]);
        } else {
            echo json_encode(['success' => false, 'error' => 'CSS file not found']);
        }
        exit;
    }
    
    if ($action === 'update_colors' && isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
        $data = $_POST['data'] ?? '';
        if ($data) {
            try {
                if (file_exists($mainCssFile)) {
                    copy($mainCssFile, $backupCssFile);
                    
                    $originalCss = file_get_contents($mainCssFile);
                    $newColors = parseColorsInput($data);
                    $updatedCss = updateCssWithColors($originalCss, $newColors);
                    
                    file_put_contents($mainCssFile, $updatedCss);
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'CSS file not found']);
                }
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => 'Error updating colors']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'No colors data provided']);
        }
        exit;
    }
    
    if ($action === 'load_backup_colors' && isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
        if (file_exists($backupCssFile)) {
            $cssContent = file_get_contents($backupCssFile);
            $colors = extractCssColors($cssContent);
            $formattedColors = formatColorsOutput($colors);
            echo json_encode(['success' => true, 'content' => $formattedColors]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No CSS backup found']);
        }
        exit;
    }
    
    if ($action === 'load_template_colors' && isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
        if (file_exists($templateCssFile)) {
            $cssContent = file_get_contents($templateCssFile);
            $colors = extractCssColors($cssContent);
            $formattedColors = formatColorsOutput($colors);
            echo json_encode(['success' => true, 'content' => $formattedColors]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No CSS template found']);
        }
        exit;
    }
    
    if ($action === 'upload_logo' && isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
            $fileType = $_FILES['file']['type'];
            $extension = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
            
            if (!in_array($fileType, $allowedTypes) && !in_array($extension, $allowedExtensions)) {
                echo json_encode(['success' => false, 'error' => 'Invalid file type. Only images are allowed.']);
                exit;
            }
            
            if (!preg_match('/^[a-zA-Z0-9._-]+$/', $_FILES['file']['name'])) {
                echo json_encode(['success' => false, 'error' => 'Invalid file name. Only letters, numbers, dots, underscores and hyphens are allowed.']);
                exit;
            }
            
            $maxSize = 5 * 1024 * 1024;
            if ($_FILES['file']['size'] > $maxSize) {
                echo json_encode(['success' => false, 'error' => 'File too large. Maximum size is 5MB.']);
                exit;
            }
            
            $uploadDir = __DIR__ . '/../assets/img/logos/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $fileName = $_FILES['file']['name'];
            $targetPath = $uploadDir . $fileName;
            
            $oldFiles = glob($uploadDir . '*.*');
            foreach ($oldFiles as $oldFile) {
                if (is_file($oldFile)) {
                    unlink($oldFile);
                }
            }
            
            if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
                $logoPath = 'assets/img/logos/' . $fileName;
                
                if (file_exists($contentFile)) {
                    $content = json_decode(file_get_contents($contentFile), true);
                    if (!$content) $content = [];
                    
                    if (!isset($content['userData'])) $content['userData'] = [];
                    if (!isset($content['userData']['personal'])) $content['userData']['personal'] = [];
                    
                    $content['userData']['personal']['logo'] = $logoPath;
                    
                    file_put_contents($contentFile, json_encode($content, JSON_PRETTY_PRINT));
                }
                
                echo json_encode(['success' => true, 'path' => $logoPath]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Logo upload failed']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'No logo file provided or upload error']);
        }
        exit;
    }
    
    if ($action === 'upload_profile' && isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            $fileType = $_FILES['file']['type'];
            $extension = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
            
            if (!in_array($fileType, $allowedTypes) && !in_array($extension, $allowedExtensions)) {
                echo json_encode(['success' => false, 'error' => 'Invalid file type. Only images are allowed.']);
                exit;
            }
            
            if (!preg_match('/^[a-zA-Z0-9._-]+$/', $_FILES['file']['name'])) {
                echo json_encode(['success' => false, 'error' => 'Invalid file name. Only letters, numbers, dots, underscores and hyphens are allowed.']);
                exit;
            }
            
            $maxSize = 5 * 1024 * 1024;
            if ($_FILES['file']['size'] > $maxSize) {
                echo json_encode(['success' => false, 'error' => 'File too large. Maximum size is 5MB.']);
                exit;
            }
            
            $uploadDir = __DIR__ . '/../assets/img/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $fileName = $_FILES['file']['name'];
            $targetPath = $uploadDir . $fileName;
            
            $profileFiles = glob($uploadDir . '*.*');
            foreach ($profileFiles as $profileFile) {
                if (is_file($profileFile) && !strpos($profileFile, 'logos/')) {
                    $baseName = basename($profileFile);
                    if (!in_array($baseName, ['favicon.ico', 'apple-touch-icon.png'])) {
                        unlink($profileFile);
                    }
                }
            }
            
            if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
                $profilePath = 'assets/img/' . $fileName;
                
                if (file_exists($contentFile)) {
                    $content = json_decode(file_get_contents($contentFile), true);
                    if (!$content) $content = [];
                    
                    if (!isset($content['userData'])) $content['userData'] = [];
                    if (!isset($content['userData']['personal'])) $content['userData']['personal'] = [];
                    
                    $content['userData']['personal']['img'] = $profilePath;
                    
                    file_put_contents($contentFile, json_encode($content, JSON_PRETTY_PRINT));
                }
                
                echo json_encode(['success' => true, 'path' => $profilePath]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Profile image upload failed']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'No profile image provided or upload error']);
        }
        exit;
    }
    
    if ($action === 'upload' && isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $fileType = $_FILES['file']['type'];
            
            if (!in_array($fileType, $allowedTypes)) {
                echo json_encode(['success' => false, 'error' => 'Invalid file type. Only images are allowed.']);
                exit;
            }
            
            $maxSize = 5 * 1024 * 1024;
            if ($_FILES['file']['size'] > $maxSize) {
                echo json_encode(['success' => false, 'error' => 'File too large. Maximum size is 5MB.']);
                exit;
            }
            
            $uploadDir = __DIR__ . '/../assets/img/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $extension = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
            $fileName = 'uploaded_' . time() . '_' . uniqid() . '.' . $extension;
            $targetPath = $uploadDir . $fileName;
            
            if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
                echo json_encode(['success' => true, 'path' => 'assets/img/' . $fileName]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Upload failed']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'No file provided or upload error']);
        }
        exit;
    }
    
    if ($action === 'upload_cv' && isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            $fileType = $_FILES['file']['type'];
            $extension = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
            
            if (!in_array($fileType, $allowedTypes) && !in_array($extension, ['pdf', 'doc', 'docx'])) {
                echo json_encode(['success' => false, 'error' => 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.']);
                exit;
            }
            
            if (!preg_match('/^[a-zA-Z0-9._-]+$/', $_FILES['file']['name'])) {
                echo json_encode(['success' => false, 'error' => 'Invalid file name. Only letters, numbers, dots, underscores and hyphens are allowed.']);
                exit;
            }
            
            $maxSize = 10 * 1024 * 1024;
            if ($_FILES['file']['size'] > $maxSize) {
                echo json_encode(['success' => false, 'error' => 'File too large. Maximum size is 10MB.']);
                exit;
            }
            
            $uploadDir = __DIR__ . '/../CV/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $fileName = $_FILES['file']['name'];
            $targetPath = $uploadDir . $fileName;
            
            $oldFiles = glob($uploadDir . '*.*');
            foreach ($oldFiles as $oldFile) {
                if (is_file($oldFile)) {
                    unlink($oldFile);
                }
            }
            
            if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
                $cvPath = 'CV/' . $fileName;
                
                if (file_exists($contentFile)) {
                    $content = json_decode(file_get_contents($contentFile), true);
                    if (!$content) $content = [];
                    
                    if (!isset($content['userData'])) $content['userData'] = [];
                    if (!isset($content['userData']['personal'])) $content['userData']['personal'] = [];
                    
                    $content['userData']['personal']['cv'] = $cvPath;
                    
                    file_put_contents($contentFile, json_encode($content, JSON_PRETTY_PRINT));
                }
                
                echo json_encode(['success' => true, 'path' => $cvPath]);
            } else {
                echo json_encode(['success' => false, 'error' => 'CV upload failed']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'No CV file provided or upload error']);
        }
        exit;
    }
    
    if ($action === 'logout') {
        session_destroy();
        echo json_encode(['success' => true, 'redirect' => '../']);
        exit;
    }
}

$isFirstTime = !file_exists($authFile) || filesize($authFile) == 0;
$isAuthenticated = isset($_SESSION['authenticated']) && $_SESSION['authenticated'];
$currentData = '{}';
if (file_exists($contentFile)) {
    $currentData = file_get_contents($contentFile);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio CMS</title>
    <link rel="stylesheet" href="../assets/css/main.css">
    <link rel="stylesheet" href="../assets/css/platform.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="panel-container">
        <?php if ($isAuthenticated): ?>
        <div class="panel-header">
            <h1>Portfolio CMS</h1>
            <div class="panel-actions">
                <button onclick="goToPortfolio()" class="action-btn portfolio-btn">Portfolio</button>
                <button onclick="openModal('resetPassword')" class="action-btn">Reset Password</button>
                <button onclick="logout()" class="logout-btn">Logout</button>
            </div>
        </div>
        
        <div class="panel-dashboard">
            <div class="dashboard-grid">
                <div class="dashboard-card" onclick="openModal('content')">
                    <h3>Content Manager</h3>
                    <p>Update portfolio content and data</p>
                </div>
                <div class="dashboard-card" onclick="openModal('upload')">
                    <h3>Upload Logo</h3>
                    <p>Upload and manage logo</p>
                </div>
                <div class="dashboard-card" onclick="openModal('uploadProfile')">
                    <h3>Upload Profile</h3>
                    <p>Upload and manage profile image</p>
                </div>
                <div class="dashboard-card" onclick="openModal('uploadCV')">
                    <h3>Upload CV</h3>
                    <p>Upload and update CV file</p>
                </div>
                <div class="dashboard-card" onclick="loadCurrentColors(); openModal('colors');">
                    <h3>Update Colors</h3>
                    <p>Edit theme colors and variables</p>
                </div>
            </div>
        </div>
        <?php endif; ?>
    </div>

    <div id="authModal" class="modal <?php echo (!$isAuthenticated) ? 'active' : ''; ?>">
        <div class="modal-content">
            <h2><?php echo $isFirstTime ? 'Set Admin Password' : 'Enter Admin Password'; ?></h2>
            <input type="password" id="authPassword" placeholder="<?php echo $isFirstTime ? 'Create admin password' : 'Enter admin password'; ?>">
            <button onclick="authenticate()" class="modal-btn"><?php echo $isFirstTime ? 'Set Password' : 'Login'; ?></button>
            <div id="authError"></div>
        </div>
    </div>

    <div id="contentModal" class="modal">
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h2>Content Manager</h2>
                <span class="modal-close" onclick="closeModal('content')">&times;</span>
            </div>
            <div class="modal-body">
                <textarea id="contentData" placeholder="JSON content data..."><?php echo htmlspecialchars($currentData); ?></textarea>
                <div class="modal-actions">
                    <button onclick="updateContent()" class="modal-btn">Update Content</button>
                    <button onclick="loadBackupContent()" class="modal-btn secondary">Load Backup</button>
                    <button onclick="loadTemplateContent()" class="modal-btn secondary">Load Template</button>
                    <button onclick="formatJSON()" class="modal-btn secondary">Format JSON</button>
                    <button onclick="validateJSON()" class="modal-btn secondary">Validate JSON</button>
                </div>
            </div>
        </div>
    </div>

    <div id="colorsModal" class="modal">
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h2>Update Colors</h2>
                <span class="modal-close" onclick="closeModal('colors')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="theme-note">
                    <p><strong>Note:</strong> After updating colors, press <kbd>Ctrl + F5</kbd> to clear cache and see changes.</p>
                    <p><strong>Instructions:</strong> Only edit the color values on the right side. Do not change variable names.</p>
                </div>
                <div id="colorEditor" class="color-editor"></div>
                <div class="modal-actions">
                    <button onclick="updateColors()" class="modal-btn">Update Colors</button>
                    <button onclick="loadBackupColors()" class="modal-btn secondary">Load Backup</button>
                    <button onclick="loadTemplateColors()" class="modal-btn secondary">Load Template</button>
                </div>
            </div>
        </div>
    </div>

    <div id="uploadModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Upload Logo</h2>
                <span class="modal-close" onclick="closeModal('upload')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="upload-area">
                    <input type="file" id="logoFile" accept="image/*,.svg">
                    <div class="upload-info">
                        <p>Supported formats: JPEG, PNG, GIF, WebP, SVG</p>
                        <p>Maximum file size: 5MB</p>
                    </div>
                </div>
                <div class="modal-actions">
                    <button onclick="uploadLogo()" class="modal-btn">Upload Logo</button>
                </div>
            </div>
        </div>
    </div>

    <div id="uploadProfileModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Upload Profile Image</h2>
                <span class="modal-close" onclick="closeModal('uploadProfile')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="upload-area">
                    <input type="file" id="profileFile" accept="image/*">
                    <div class="upload-info">
                        <p>Supported formats: JPEG, PNG, GIF, WebP</p>
                        <p>Maximum file size: 5MB</p>
                    </div>
                </div>
                <div class="modal-actions">
                    <button onclick="uploadProfile()" class="modal-btn">Upload Profile Image</button>
                </div>
            </div>
        </div>
    </div>

    <div id="uploadCVModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Upload CV</h2>
                <span class="modal-close" onclick="closeModal('uploadCV')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="upload-area">
                    <input type="file" id="cvFile" accept=".pdf,.doc,.docx">
                    <div class="upload-info">
                        <p>Supported formats: PDF, DOC, DOCX</p>
                        <p>Maximum file size: 10MB</p>
                    </div>
                </div>
                <div class="modal-actions">
                    <button onclick="uploadCV()" class="modal-btn">Upload CV</button>
                </div>
            </div>
        </div>
    </div>

    <div id="logoutModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Confirm Logout</h2>
                <span class="modal-close" onclick="closeModal('logout')">&times;</span>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to logout?</p>
                <div class="modal-actions">
                    <button onclick="closeModal('logout')" class="modal-btn secondary">Cancel</button>
                    <button onclick="confirmLogout()" class="modal-btn">Yes, Logout</button>
                </div>
            </div>
        </div>
    </div>

    <div id="messageModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="messageModalTitle">Message</h2>
                <span class="modal-close" onclick="closeModal('message')">&times;</span>
            </div>
            <div class="modal-body">
                <p id="messageModalContent"></p>
                <div class="modal-actions">
                    <button onclick="closeModal('message')" class="modal-btn">OK</button>
                </div>
            </div>
        </div>
    </div>

    <div id="resetPasswordModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Reset Password</h2>
                <span class="modal-close" onclick="closeModal('resetPassword')">&times;</span>
            </div>
            <div class="modal-body">
                <input type="password" id="newPassword" placeholder="Enter new password">
                <input type="password" id="confirmPassword" placeholder="Confirm new password">
                <div class="modal-actions">
                    <button onclick="resetPassword()" class="modal-btn">Reset Password</button>
                </div>
                <div id="resetResult"></div>
            </div>
        </div>
    </div>


    <script src="assets/js/platform.js"></script>
    <script src="../assets/js/cursor.js"></script>
</body>
</html>