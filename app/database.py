import json
import os
import sqlite3
from datetime import UTC, datetime
from typing import Any

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "coolerbox.db")


def get_db_connection() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_db_connection()
    cursor = conn.cursor()

    # Orders table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        total_cents INTEGER,
        customer_json TEXT NOT NULL,
        details_json TEXT NOT NULL,
        items_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    # Order updates / milestones
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_reference TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL,
        read_at TEXT,
        FOREIGN KEY (order_reference) REFERENCES orders(reference)
    );
    """)

    # Customer reviews
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        rating INTEGER NOT NULL,
        title TEXT NOT NULL,
        comment TEXT NOT NULL,
        name TEXT NOT NULL,
        anonymous INTEGER NOT NULL DEFAULT 0,
        reference TEXT,
        permission INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'published',
        created_at TEXT NOT NULL
    );
    """)

    # News / Noticeboard posts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        body TEXT NOT NULL,
        location TEXT,
        link TEXT,
        image TEXT,
        event_date TEXT,
        status TEXT NOT NULL DEFAULT 'published',
        created_at TEXT NOT NULL
    );
    """)

    # Catalogue products
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS catalogue (
        id TEXT PRIMARY KEY,
        data_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    # Settings and business config
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL
    );
    """)

    # FAQs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS faqs (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        keywords TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'static'
    );
    """)

    conn.commit()
    conn.close()


# Database helper functions
def get_catalogue_items() -> list[dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data_json FROM catalogue")
    rows = cursor.fetchall()
    conn.close()
    return [json.loads(row["data_json"]) for row in rows]


def get_business_settings() -> dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value_json FROM settings WHERE key = 'business'")
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row["value_json"])
    return {}


def get_site_settings() -> dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value_json FROM settings WHERE key = 'settings'")
    row = cursor.fetchone()
    conn.close()
    if row:
        data = json.loads(row["value_json"])
        if "phone" not in data or not data["phone"]:
            data["phone"] = "+264 85 248 5426"
        return data
    return {
        "email": "sebiuerasmus@gmail.com",
        "phone": "+264 85 248 5426",
        "whatsapp": "264852485426",
        "socials": {
            "facebook": "https://facebook.com/coolerboxicehub",
            "instagram": "https://instagram.com/coolerboxicehub",
            "tiktok": "",
            "linkedin": "",
            "youtube": "",
        },
    }


def get_all_faqs() -> list[dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, category, question, answer, keywords, source FROM faqs")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_all_posts() -> list[dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "title": r["title"],
            "category": r["category"],
            "body": r["body"],
            "location": r["location"] or "",
            "link": r["link"] or "",
            "image": r["image"] or "",
            "eventDate": r["event_date"] or "",
            "status": r["status"],
            "createdAt": r["created_at"],
        }
        for r in rows
    ]


def get_showcase_items() -> list[dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    # Get approved reviews formatted for showcase
    cursor.execute("SELECT * FROM reviews WHERE status = 'published' ORDER BY created_at DESC")
    reviews = cursor.fetchall()
    conn.close()

    items = []
    for r in reviews:
        items.append({
            "type": "review",
            "id": r["id"],
            "rating": r["rating"],
            "title": r["title"],
            "body": r["comment"],
            "author": r["name"] if not r["anonymous"] else "Anonymous customer",
            "status": r["status"],
            "createdAt": r["created_at"],
        })
    return items


def create_order(
    reference: str,
    total_cents: int | None,
    customer: dict[str, Any],
    details: dict[str, Any],
    items: list[dict[str, Any]],
    created_at: str,
) -> dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO orders (reference, status, total_cents, customer_json, details_json, items_json, created_at, updated_at)
        VALUES (?, 'new', ?, ?, ?, ?, ?, ?)
        """,
        (
            reference,
            total_cents,
            json.dumps(customer),
            json.dumps(details),
            json.dumps(items),
            created_at,
            created_at,
        ),
    )
    # Add initial update notification
    initial_msg = f"Enquiry {reference} received. The team will review your quantities and reach out on WhatsApp."
    cursor.execute(
        "INSERT INTO updates (order_reference, message, created_at) VALUES (?, ?, ?)",
        (reference, initial_msg, created_at),
    )
    conn.commit()
    conn.close()
    return {
        "reference": reference,
        "status": "new",
        "totalCents": total_cents,
        "customer": customer,
        "details": details,
        "items": items,
        "createdAt": created_at,
    }


def get_orders_by_reference_or_customer(reference: str | None = None) -> dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    if reference and isinstance(reference, str) and reference.strip():
        cursor.execute("SELECT * FROM orders WHERE reference = ? ORDER BY created_at DESC", (reference.strip(),))
    else:
        cursor.execute("SELECT * FROM orders ORDER BY created_at DESC LIMIT 20")
    order_rows = cursor.fetchall()

    orders = []
    order_refs = []
    for r in order_rows:
        order_refs.append(r["reference"])
        orders.append({
            "reference": r["reference"],
            "status": r["status"],
            "totalCents": r["total_cents"],
            "customer": json.loads(r["customer_json"]),
            "details": json.loads(r["details_json"]),
            "items": json.loads(r["items_json"]),
            "createdAt": r["created_at"],
            "updatedAt": r["updated_at"],
        })

    updates = []
    if order_refs:
        placeholders = ",".join("?" for _ in order_refs)
        cursor.execute(
            f"SELECT * FROM updates WHERE order_reference IN ({placeholders}) ORDER BY created_at DESC",
            order_refs,
        )
        for u in cursor.fetchall():
            updates.append({
                "id": u["id"],
                "orderReference": u["order_reference"],
                "message": u["message"],
                "createdAt": u["created_at"],
                "readAt": u["read_at"],
            })

    conn.close()
    return {"orders": orders, "updates": updates}


def mark_updates_read() -> None:
    conn = get_db_connection()
    cursor = conn.cursor()
    from datetime import datetime
    now = datetime.now(UTC).isoformat()
    cursor.execute("UPDATE updates SET read_at = ? WHERE read_at IS NULL", (now,))
    conn.commit()
    conn.close()


def update_order_milestone(
    reference: str,
    status: str | None = None,
    approval_updates: dict[str, bool] | None = None,
    admin_note: str | None = None,
) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders WHERE reference = ?", (reference,))
    order = cursor.fetchone()
    if not order:
        conn.close()
        return False

    from datetime import datetime
    now = datetime.now(UTC).isoformat()

    details = json.loads(order["details_json"])
    if "approval" not in details:
        details["approval"] = {}

    if approval_updates:
        for k, v in approval_updates.items():
            details["approval"][k] = v

    new_status = status or order["status"]

    cursor.execute(
        "UPDATE orders SET status = ?, details_json = ?, updated_at = ? WHERE reference = ?",
        (new_status, json.dumps(details), now, reference),
    )

    if admin_note:
        cursor.execute(
            "INSERT INTO updates (order_reference, message, created_at) VALUES (?, ?, ?)",
            (reference, admin_note, now),
        )

    conn.commit()
    conn.close()
    return True


def insert_review(review_data: dict[str, Any]) -> None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT OR REPLACE INTO reviews (id, rating, title, comment, name, anonymous, reference, permission, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)
        """,
        (
            review_data["id"],
            review_data["rating"],
            review_data["title"],
            review_data["comment"],
            review_data["name"],
            1 if review_data.get("anonymous") else 0,
            review_data.get("reference", ""),
            1 if review_data.get("permission", True) else 0,
            review_data["createdAt"],
        ),
    )
    conn.commit()
    conn.close()


def save_catalogue_item(item: dict[str, Any]) -> dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.now(UTC).isoformat()
    product_id = item["id"]
    cursor.execute(
        "INSERT OR REPLACE INTO catalogue (id, data_json, updated_at) VALUES (?, ?, ?)",
        (product_id, json.dumps(item), now),
    )
    conn.commit()
    conn.close()
    return item


def delete_catalogue_item(product_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM catalogue WHERE id = ?", (product_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


def update_site_settings(new_settings: dict[str, Any]) -> dict[str, Any]:
    current = get_site_settings()
    for k, v in new_settings.items():
        if v is not None:
            if k == "socials" and isinstance(v, dict):
                current["socials"] = current.get("socials", {})
                current["socials"].update(v)
            else:
                current[k] = v

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO settings (key, value_json) VALUES ('settings', ?)",
        (json.dumps(current),),
    )
    conn.commit()
    conn.close()
    return current


def update_business_settings(new_business: dict[str, Any]) -> dict[str, Any]:
    current = get_business_settings()
    for k, v in new_business.items():
        if v is not None:
            current[k] = v

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO settings (key, value_json) VALUES ('business', ?)",
        (json.dumps(current),),
    )
    conn.commit()
    conn.close()
    return current


def delete_review(review_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


def delete_post(post_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM posts WHERE id = ?", (post_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

