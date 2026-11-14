# CoolerBox Ice Hub — Hostinger Premium Web Hosting Deployment Guide

This package migrates **The CoolerBox Ice Hub** web application from Python (FastAPI + Uvicorn + SQLite) to **PHP 8.x + MySQL/MariaDB + Apache/LiteSpeed `.htaccess`**, ready for **Hostinger Premium Web Hosting** (`coolerboxicehub.com`) with **no VPS** and **no additional paid backend services**.

> The original Python application in `app/`, `templates/`, `static/`, and `data/coolerbox.db` remains untouched locally as a backup. **Do not upload Python files or `requirements.txt` to Hostinger.**

---

## 1. Deployment ZIP Contents

```text
coolerbox-hostinger-php.zip
├── HOSTINGER_DEPLOYMENT.md                 # This deployment & configuration guide
├── database/
│   ├── coolerbox_mysql.sql                 # Safe schema + essential non-PII seed data
│   └── coolerbox_historical_data.sql       # Optional historical orders/updates/messages export
└── public_html/                            # Upload the CONTENTS of public_html/ into Hostinger's public_html/
    ├── .htaccess                           # HTTPS redirect, security blocks, static asset mapping, front controller
    ├── index.php                           # Front controller (public pages, /admin, /admin/login, /api/*)
    ├── config/
    │   ├── config.example.php              # Configuration template (placeholders only)
    │   └── config.php                      # Active configuration (replace placeholders before upload)
    ├── includes/
    │   ├── db.php                          # PDO connection with prepared statements (MySQL/MariaDB in prod)
    │   ├── security.php                    # Sessions, bcrypt auth, first-time setup, CSRF tokens, sanitization
    │   └── api_router.php                  # All /api/* REST endpoints
    ├── views/                              # PHP templates (index.php, shop.php, services.php, admin.php, etc.)
    ├── static/                             # CSS, JS, images, logos, videos
    └── uploads/                            # Runtime uploads (product images & customer label artwork)
```

---

## 2. Database Setup & Migration (Hostinger hPanel + phpMyAdmin)

1. Log in to **Hostinger hPanel** → **Databases** → **Management**.
2. Create a new MySQL/MariaDB database and user with a strong password. Note the **MySQL Hostname** (usually `localhost` on Hostinger).
3. Open **phpMyAdmin** for the newly created database.
4. Click **Import**, choose `database/coolerbox_mysql.sql`, and click **Go**.
   - **Safe by design:** Uses `CREATE TABLE IF NOT EXISTS` and `INSERT IGNORE INTO`. It **does not drop existing tables**, **does not include customer PII**, and **does not seed any default admin password**.
   - Imports schema for all **10 tables** plus essential non-PII seed data:
     - `catalogue` (11 products)
     - `services` (4 Business & Events services)
     - `settings` (2 public settings records)
     - `faqs` (40 FAQ entries)
     - `posts` (3 noticeboard posts)
5. *(Optional)* Only if you intentionally want to migrate historical local orders, updates, and contact messages, import `database/coolerbox_historical_data.sql` afterwards.

---

## 3. Configuration & Environment Variables

Before uploading `public_html/`, edit `public_html/config/config.php` (which ships with placeholders only) or set environment variables in Hostinger:

| Key / Env Var | Purpose | Production Value / Example |
|---|---|---|
| `APP_ENV` | Runtime mode | `production` |
| `APP_URL` | Canonical HTTPS URL | `https://coolerboxicehub.com` |
| `DB_DRIVER` | PDO driver | `mysql` |
| `DB_HOST` | Hostinger MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Hostinger database name | *(your hPanel database name)* |
| `DB_USER` | Hostinger database user | *(your hPanel database username)* |
| `DB_PASS` | Hostinger database password | *(your strong MySQL password)* |
| `MAIL_FROM_EMAIL` | Sender address for contact emails | `info@coolerboxicehub.com` |
| `CONTACT_TO_EMAIL` | Recipient address for enquiries | `info@coolerboxicehub.com` |

> **Security:** `public_html/.htaccess` blocks all direct HTTP access to `config/`, `includes/`, `views/`, `database/`, and `*.sql`, `*.db`, `*.env`, `*.md` files (`403 Forbidden`).

---

## 4. Uploading to Hostinger File Manager & Enabling HTTPS

1. Open **Hostinger hPanel** → **Files** → **File Manager** → navigate into `domains/coolerboxicehub.com/public_html/`.
2. Upload the **contents** of `public_html/` from this ZIP directly into Hostinger's `public_html/` directory (so `index.php` and `.htaccess` sit directly inside `public_html/`).
3. Ensure `public_html/uploads/` has write permissions (`755`).
4. In **Hostinger hPanel** → **Security** → **SSL**, confirm SSL is **Active** for `coolerboxicehub.com` and `www.coolerboxicehub.com` (`.htaccess` redirects HTTP to HTTPS automatically).
5. In **Hostinger hPanel** → **Advanced** → **PHP Configuration**, select **PHP 8.2** or **PHP 8.3**.

---

## 5. Secure First-Time Administrator Setup (No Default Password)

No default administrator password is shipped in SQL or PHP.

1. Immediately after importing `database/coolerbox_mysql.sql` and uploading `public_html/`, visit:
   `https://coolerboxicehub.com/admin`
2. Because `admin_users` is empty, you will be presented with the **First-Time Admin Setup** screen.
3. Enter your chosen **Administrator Username**, **Display Name**, and a strong **Password (minimum 12 characters)** twice.
4. Submitting the form hashes your password with `PASSWORD_BCRYPT` (cost 12), signs you into `/admin`, and **permanently locks** first-time setup (`POST /api/admin/setup` returns `403 Forbidden` thereafter).

---

## 6. Verification & Test Results

- **PHP syntax (`php -l`)**: Passed on all PHP files and templates.
- **Real MySQL (`mysqld` 3307) end-to-end suite**:
  - Imported `database/coolerbox_mysql.sql` cleanly (`catalogue=11`, `services=4`, `faqs=40`, `posts=3`, `settings=2`, `admin_users=0`).
  - Verified `/services` renders live `services` rows from MySQL via PDO.
  - Verified first-time admin setup (`POST /api/admin/setup` -> `201`) and permanent setup lock (`403` on second attempt).
  - Verified CSRF enforcement (`403` when missing), Product CRUD (`POST`/`PATCH`/`DELETE /api/catalogue`), Service CRUD (`POST`/`PATCH`/`DELETE /api/services`), Contact enquiry submission & admin listing (`/api/contact`), and Logout (`POST /api/admin/logout` -> `401` on `/api/orders`).
- **Apache `.htaccess` syntax**: Verified `.htaccess` rewrite rules for HTTPS redirect, `403` directory/file blocks, `/assets/*` and root static mappings, and `index.php` front-controller fallback.
