<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/security.php';

if (cbx_is_admin()) {
    header('Location: /admin', true, 302);
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!cbx_verify_csrf($_POST)) {
        $error = 'Security token expired. Please refresh and try again.';
    } else {
        $username = cbx_clean_str($_POST['username'] ?? '', 64);
        $password = (string)($_POST['password'] ?? '');
        if (cbx_login_admin($username, $password)) {
            header('Location: /admin', true, 302);
            exit;
        }
        $error = 'Invalid username or password.';
    }
}

$csrfToken = cbx_csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login — The CoolerBox Ice Hub</title>
  <link rel="icon" type="image/jpeg" href="/assets/logo-primary.jpeg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --deep-navy: #0B3861;
      --ice-blue: #0095D9;
      --ice-blue-dark: #0077B3;
      --bg: #F4F8FB;
      --border: #D9E6F2;
      --text: #0B2545;
      --muted: #5C728A;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: linear-gradient(155deg, #072847 0%, #0B3861 55%, #006EA6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      color: var(--text);
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      background: #FFFFFF;
      border-radius: 18px;
      padding: 2.25rem 2rem;
      box-shadow: 0 24px 60px rgba(4, 24, 48, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 1.5rem;
    }
    .brand img {
      width: 52px;
      height: 52px;
      object-fit: contain;
    }
    .brand h1 {
      margin: 0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.25rem;
      color: var(--deep-navy);
      line-height: 1.2;
    }
    .brand p {
      margin: 0.2rem 0 0;
      font-size: 0.85rem;
      color: var(--muted);
    }
    .error-box {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      color: #991B1B;
      border-radius: 10px;
      padding: 0.75rem 0.9rem;
      font-size: 0.88rem;
      margin-bottom: 1rem;
    }
    label {
      display: block;
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--deep-navy);
      margin-bottom: 0.35rem;
    }
    input[type="text"], input[type="password"] {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      font-size: 0.95rem;
      font-family: inherit;
      margin-bottom: 1rem;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    input:focus {
      border-color: var(--ice-blue);
      box-shadow: 0 0 0 3px rgba(0, 149, 217, 0.16);
    }
    button {
      width: 100%;
      padding: 0.85rem 1rem;
      border: none;
      border-radius: 10px;
      background: var(--ice-blue);
      color: #FFFFFF;
      font-size: 0.96rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    button:hover {
      background: var(--ice-blue-dark);
    }
    .back-link {
      display: block;
      text-align: center;
      margin-top: 1.2rem;
      font-size: 0.86rem;
      color: var(--muted);
      text-decoration: none;
    }
    .back-link:hover {
      color: var(--ice-blue);
    }
  </style>
</head>
<body>
  <main class="login-card">
    <div class="brand">
      <img src="/assets/logo-primary.jpeg" alt="The CoolerBox Ice Hub Logo">
      <div>
        <h1>CoolerBox Admin Portal</h1>
        <p>Sign in to manage products, services &amp; enquiries</p>
      </div>
    </div>

    <?php if ($error !== ''): ?>
      <div class="error-box" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
    <?php endif; ?>

    <form method="post" action="/admin/login" autocomplete="on">
      <input type="hidden" name="_csrf" value="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8') ?>">
      <label for="username">Username</label>
      <input id="username" name="username" type="text" required autocomplete="username" autofocus>

      <label for="password">Password</label>
      <input id="password" name="password" type="password" required autocomplete="current-password">

      <button type="submit">Sign In to Console</button>
    </form>

    <a class="back-link" href="/">&larr; Return to coolerboxicehub.com</a>
  </main>
</body>
</html>
