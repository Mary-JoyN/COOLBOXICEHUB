# CoolerBox Ice Hub — Hostinger Premium Web Hosting Deployment Guide

This package migrates **The CoolerBox Ice Hub** web application from Python (FastAPI + Uvicorn + SQLite) to **PHP 8.x + MySQL/MariaDB + Apache/LiteSpeed `.htaccess`**, ready for **Hostinger Premium Web Hosting** (`coolerboxicehub.com`) with **no VPS** and **no additional paid backend services**.

> The original Python application in `app/`, `templates/`, `static/`, and `data/coolerbox.db` remains untouched as a complete backup.

---

## 1. Updated Project Folder Structure

```text
hostinger/
├── HOSTINGER_DEPLOYMENT.md          # This deployment & configuration guide
├── database/
│   └── coolerbox_mysql.sql          # Full MySQL/MariaDB schema + migrated data (309 lines)
└── public_html/                     # Upload contents of this folder into Hostinger's public_html/
    ├── .htaccess                    # HTTPS redirect, security blocks, static asset mapping, front controller
    ├── index.php                    # Front controller (public pages, /admin, /admin/login, /api/*)
    ├── config/
    │   ├── config.example.php       # Template configuration file
    │   └── config.php               # Active database, mail & security config (edit before upload)
    ├── includes/
    │   ├── db.php                   # PDO connection with prepared statements (MySQL in prod)
    │   ├── security.php             # Sessions, bcrypt auth, CSRF tokens, input sanitisation
    │   └── api_router.php           # All /api/* REST endpoints (products, services, orders, contact, etc.)
    ├── views/
    │   ├── admin-login.php          # Branded Admin Login page (CSRF + password_verify)
    │   ├── admin.html               # Admin Dashboard (Products, Services, Orders, Enquiries, Reviews, News)
    │   ├── index.html               # Homepage
    │   ├── shop.html                # Products page
    │   ├── services.html            # Business & Events page
    │   ├── order.html               # Order / Quote builder
    │   ├── contact.html             # Contact & Enquiry form
    │   ├── track.html               # Order tracking
    │   ├── reviews.html             # Customer reviews
    │   ├── news.html                # Noticeboard & News
    │   ├── questions.html           # Q&A / Ask CoolerBox
    │   └── privacy.html             # Privacy policy
    ├── static/                      # CSS, JS, images, videos (copied intact from original static/)
    └── uploads/                     # Runtime uploads (product images & customer label artwork)
```

---

## 2. Database Setup & Migration (Hostinger hPanel + phpMyAdmin)

1. Log in to **Hostinger hPanel** -> **Databases** -> **Management**.
2. Create a new MySQL database and user (e.g., `u123456789_coolerbox` and `u123456789_cbxadmin`) with a strong password. Note the **MySQL Hostname** (usually `localhost` on Hostinger).
3. Open **phpMyAdmin** for the newly created database.
4. Click **Import**, choose `hostinger/database/coolerbox_mysql.sql`, and click **Go**.
5. Verify that all **10 tables** and migrated records were imported:
   - `orders` (33 rows)
   - `updates` (58 rows)
   - `catalogue` (11 products)
   - `settings` (2 rows: `business_info`, `site_settings`)
   - `faqs` (40 rows)
   - `posts` (3 rows)
   - `contact_messages` (2 rows)
   - `reviews` (0 rows)
   - `services` (4 seeded Business & Events services)
   - `admin_users` (1 default admin user)

---

## 3. Configuration & Environment Variables

Before uploading `hostinger/public_html/` to Hostinger, edit `hostinger/public_html/config/config.php` (or configure environment variables in hPanel / `.htaccess` `SetEnv`):

| Key / Env Var | Purpose | Production Value / Example |
|---|---|---|
| `APP_ENV` | Runtime mode | `production` |
| `APP_URL` | Canonical HTTPS URL | `https://coolerboxicehub.com` |
| `DB_DRIVER` | PDO driver | `mysql` |
| `DB_HOST` | Hostinger MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Hostinger database name | `u123456789_coolerbox` |
| `DB_USER` | Hostinger database user | `u123456789_cbxadmin` |
| `DB_PASS` | Hostinger database password | *(your strong MySQL password)* |
| `MAIL_FROM_EMAIL` | Sender address for contact emails | `info@coolerboxicehub.com` |
| `CONTACT_TO_EMAIL` | Recipient address for enquiries | `info@coolerboxicehub.com` |

> **Security:** `public_html/.htaccess` blocks all direct HTTP requests to `config/`, `includes/`, `views/`, `database/`, and `*.sql`, `*.db`, `*.env` files (`403 Forbidden`).

---

## 4. Uploading to Hostinger File Manager & Enabling HTTPS

1. Open **Hostinger hPanel** -> **Files** -> **File Manager** -> navigate into `domains/coolerboxicehub.com/public_html/`.
2. If you want a clean deploy, back up any existing files and upload the **contents** of `hostinger/public_html/` directly into `public_html/` (so `index.php` and `.htaccess` sit in `public_html/`).
3. Ensure `public_html/uploads/` has write permissions (`755`).
4. In **Hostinger hPanel** -> **Security** -> **SSL**, confirm that SSL is **Active** for `coolerboxicehub.com` and `www.coolerboxicehub.com`. `.htaccess` automatically redirects HTTP traffic to `https://`.
5. In **Hostinger hPanel** -> **Advanced** -> **PHP Configuration**, select **PHP 8.2** or **PHP 8.3** (compatible with all syntax in `hostinger/public_html/`).

---

## 5. Default Admin Access (Change Password Immediately)

- **Admin URL:** `https://coolerboxicehub.com/admin` (redirects to `/admin/login` when signed out)
- **Default Username:** `admin`
- **Default Password:** `CoolerBoxAdmin2026!`
- **Action Required:** After first login, generate a new bcrypt hash via PHP `password_hash('YOUR_NEW_PASSWORD', PASSWORD_BCRYPT)` and update `admin_users.password_hash` in phpMyAdmin.

---

## 6. Local Verification & Test Results

All PHP files passed `php -l` syntax checks, and an automated 12-part HTTP test suite was executed against PHP `8.4.16` (`php -S 127.0.0.1:8099 index.php`) using a temporary SQLite copy of `data/coolerbox.db`:

1. Public website loading (all 12 routes: `/`, `/products`, `/shop`, `/services`, `/business`, `/order`, `/contact`, `/track`, `/reviews`, `/news`, `/questions`, `/privacy`) — **PASS (200 OK)**
2. Redirect `/calculator` -> `/products` — **PASS (302)**
3. Static assets (`/ice-company.css`, `/assets/logo-primary.jpeg`, `/static/admin.js`, `/static/admin.css`) — **PASS (200 OK)**
4. Public API (`/api/catalogue` 11 items, `/api/services`, `/api/business`, `/api/settings`, `/api/faqs` 40 items) — **PASS**
5. Customer enquiry (`POST /api/contact` -> `CBX-MSG-*`) & order submission (`POST /api/orders` -> `CBX-*`) + `/api/my-orders` tracking — **PASS (201 / 200)**
6. Unauthenticated `/admin` & `/api/orders` / `POST /api/catalogue` blocked — **PASS (302 / 401)**
7. Admin login (`POST /api/admin/login` with CSRF + `password_verify`) & `/admin` HTML CSRF meta injection — **PASS (200)**
8. CSRF rejection on missing token (`POST /api/catalogue`) — **PASS (403)**
9. Product CRUD (`POST` -> `PATCH` -> `DELETE /api/catalogue`) — **PASS**
10. Service CRUD (`POST` -> `PATCH` -> `DELETE /api/services`) — **PASS**
11. Admin enquiries viewer (`GET /api/contact`) & order milestone update (`PATCH /api/orders/{ref}`) — **PASS**
12. Admin logout (`POST /api/admin/logout` invalidates session, subsequent `/api/orders` returns `401`) — **PASS**

---

## 7. Notes & Preserved Features

- **All existing pages, branding, CSS, JS, images, and videos** are preserved 1:1.
- **Admin security upgraded:** The original Python app had an unauthenticated `/admin` portal; the PHP version protects `/admin` and all mutating/admin `/api/*` endpoints with session auth, bcrypt password hashing, and CSRF tokens.
- **Email delivery:** `cbx_send_contact_email()` uses PHP `mail()` on Hostinger (which routes through Hostinger's local MTA when `From:` matches your domain email `info@coolerboxicehub.com`) and always persists every enquiry in `contact_messages` so zero enquiries are lost even if mail delivery is delayed.

