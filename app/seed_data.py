import json
import os
from datetime import UTC, datetime

from app.database import get_db_connection, init_db


def seed_database() -> None:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    now = datetime.now(UTC).isoformat()

    # Seed Catalogue
    catalogue_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "scraped_site",
        "api_data_api_catalogue.json",
    )
    products = []
    if os.path.exists(catalogue_file):
        with open(catalogue_file) as f:
            products = json.load(f)

    # Ensure cold refreshment products are in catalogue
    existing_ids = {p["id"] for p in products}
    if "slushies" not in existing_ids:
        products.append({
            "id": "slushies",
            "name": "CoolerBox Slushies",
            "description": "Refreshing flavoured frozen drinks in different flavours and cup sizes for retail, events, and parties.",
            "unit": "cup",
            "size": 350,
            "sizeUnit": "ml",
            "retailPrice": 15,
            "bulkPrice": 12,
            "bulkMinimum": 30,
            "availability": "available",
            "leadDays": 1,
            "image": "/assets/blocks-product.jpg",
            "samplePrice": False,
            "salesRevision": 1,
            "minOrder": 1,
            "orderMultiple": 1,
            "maxPerOrder": None,
            "dailyCapacity": None,
        })
    if "icelollies" not in existing_ids:
        products.append({
            "id": "icelollies",
            "name": "CoolerBox Ice Lollies",
            "description": "Frozen treats and fruity iced lollies supplied to individuals, retailers, schools, events and selected vendors.",
            "unit": "unit",
            "size": 1,
            "sizeUnit": "pack",
            "retailPrice": 6,
            "bulkPrice": 5,
            "bulkMinimum": 50,
            "availability": "available",
            "leadDays": 1,
            "image": "/assets/blocks-product.jpg",
            "samplePrice": False,
            "salesRevision": 1,
            "minOrder": 10,
            "orderMultiple": 10,
            "maxPerOrder": None,
            "dailyCapacity": None,
        })
    if not products:
        products = [
            {
                "id": "ice",
                "name": "2 kg Ice Cubes",
                "description": "Regular or gourmet ice, packaged in the same 2 kg bags for households, shops, service stations, bars and events.",
                "unit": "bag",
                "size": 2,
                "sizeUnit": "kg",
                "retailPrice": 15,
                "bulkPrice": 12,
                "bulkMinimum": 20,
                "availability": "available",
                "leadDays": 1,
                "image": "/assets/ice-product.webp",
                "samplePrice": False,
                "salesRevision": 0,
                "minOrder": 1,
                "orderMultiple": 1,
                "maxPerOrder": None,
                "dailyCapacity": None,
                "gourmetRetailPrice": 18,
                "gourmetBulkPrice": 15,
            },
            {
                "id": "ice3",
                "name": "3 kg Ice Cubes",
                "description": "Regular or gourmet ice , packaged in 3 kg bags for retail customers, events and cooling.",
                "unit": "bag",
                "size": 3,
                "sizeUnit": "kg",
                "retailPrice": 22,
                "bulkPrice": 18,
                "bulkMinimum": 50,
                "availability": "advance-booking",
                "leadDays": 1,
                "image": "/assets/ice3-product.webp",
                "samplePrice": False,
                "salesRevision": 0,
                "minOrder": 1,
                "orderMultiple": 1,
                "maxPerOrder": None,
                "dailyCapacity": None,
                "gourmetRetailPrice": 25,
                "gourmetBulkPrice": 21,
            },
            {
                "id": "ice5",
                "name": "5 kg Ice Cubes",
                "description": "Regular or gourmet ice , packaged in 5 kg bags for events, businesses and hospitality.",
                "unit": "bag",
                "size": 5,
                "sizeUnit": "kg",
                "retailPrice": 35,
                "bulkPrice": 28,
                "bulkMinimum": 50,
                "availability": "advance-booking",
                "leadDays": 1,
                "image": "/assets/ice5-product.webp",
                "samplePrice": False,
                "salesRevision": 0,
                "minOrder": 1,
                "orderMultiple": 1,
                "maxPerOrder": None,
                "dailyCapacity": None,
                "gourmetRetailPrice": 40,
                "gourmetBulkPrice": 32,
            },
            {
                "id": "blocks",
                "name": "Ice blocks",
                "description": "Large commercial 30 kg ice blocks for funerals, events, fishing, vendors, businesses and bulk cooling requirements.",
                "unit": "block",
                "size": 30,
                "sizeUnit": "kg",
                "retailPrice": 45,
                "bulkPrice": 40,
                "bulkMinimum": 10,
                "availability": "advance-booking",
                "leadDays": 3,
                "image": "/assets/blocks-product.jpg",
                "samplePrice": False,
                "salesRevision": 0,
                "minOrder": 1,
                "orderMultiple": 1,
                "maxPerOrder": None,
                "dailyCapacity": None,
            },
            {
                "id": "cups",
                "name": "300 ml Ice Cups",
                "description": "Ready-to-use 300 ml cups filled with ice. N$10 per cup.",
                "unit": "cup",
                "size": 300,
                "sizeUnit": "ml",
                "retailPrice": 10,
                "bulkPrice": None,
                "bulkMinimum": 50,
                "availability": "advance-booking",
                "leadDays": 1,
                "image": "/assets/cups-product.webp",
                "samplePrice": False,
                "salesRevision": 1,
                "minOrder": 1,
                "orderMultiple": 1,
                "maxPerOrder": None,
                "dailyCapacity": None,
            },
            {
                "id": "cups500",
                "name": "500 ml Ice Cups",
                "description": "Ready-to-use 500 ml cups filled with ice. N$12 per cup.",
                "unit": "cup",
                "size": 500,
                "sizeUnit": "ml",
                "retailPrice": 12,
                "bulkPrice": None,
                "bulkMinimum": 50,
                "availability": "advance-booking",
                "leadDays": 1,
                "image": "/assets/cups-product.webp",
                "samplePrice": False,
                "salesRevision": 1,
                "minOrder": 1,
                "orderMultiple": 1,
                "maxPerOrder": None,
                "dailyCapacity": None,
            },
            {
                "id": "water",
                "name": "500 ml Bottled Water",
                "description": "Purified 500 ml water, supplied only in packs of 10. N$12 per bottle / N$120 per pack. Minimum five packs (50 bottles) per order. Personalised printing is N$4 extra per bottle.",
                "unit": "bottle",
                "size": 500,
                "sizeUnit": "ml",
                "retailPrice": 12,
                "bulkPrice": None,
                "bulkMinimum": 48,
                "availability": "available",
                "leadDays": 1,
                "image": "/assets/water-product.webp",
                "samplePrice": False,
                "salesRevision": 1,
                "minOrder": 50,
                "orderMultiple": 10,
                "maxPerOrder": None,
                "dailyCapacity": None,
            },
            {
                "id": "water330",
                "name": "330 ml Bottled Water",
                "description": "Purified 330 ml water, supplied only in packs of 10. N$9 per bottle / N$90 per pack. Minimum five packs (50 bottles) per order. Personalised printing is N$4 extra per bottle.",
                "unit": "bottle",
                "size": 330,
                "sizeUnit": "ml",
                "retailPrice": 9,
                "bulkPrice": None,
                "bulkMinimum": 48,
                "availability": "advance-booking",
                "leadDays": 1,
                "image": "/assets/water330-product.svg",
                "samplePrice": False,
                "salesRevision": 1,
                "minOrder": 50,
                "orderMultiple": 10,
                "maxPerOrder": None,
                "dailyCapacity": None,
            },
            {
                "id": "refill",
                "name": "Water refills",
                "description": "Refill your clean, suitable drinking-water containers. High-purity multi-stage filtered drinking water.",
                "unit": "container",
                "size": 25,
                "sizeUnit": "litres",
                "retailPrice": 25,
                "bulkPrice": 20,
                "bulkMinimum": 4,
                "availability": "available",
                "leadDays": 0,
                "image": "/assets/refill-product.webp",
                "samplePrice": False,
                "salesRevision": 0,
                "minOrder": 1,
                "orderMultiple": 1,
                "maxPerOrder": None,
                "dailyCapacity": None,
            },
            {
                "id": "slushies",
                "name": "CoolerBox Slushies",
                "description": "Refreshing flavoured frozen drinks in different flavours and cup sizes for retail, events, and parties.",
                "unit": "cup",
                "size": 350,
                "sizeUnit": "ml",
                "retailPrice": 15,
                "bulkPrice": 12,
                "bulkMinimum": 30,
                "availability": "available",
                "leadDays": 1,
                "image": "/assets/blocks-product.jpg",
                "samplePrice": False,
                "salesRevision": 1,
                "minOrder": 1,
                "orderMultiple": 1,
                "maxPerOrder": None,
                "dailyCapacity": None,
            },
            {
                "id": "icelollies",
                "name": "CoolerBox Ice Lollies",
                "description": "Frozen treats and fruity iced lollies supplied to individuals, retailers, schools, events and selected vendors.",
                "unit": "unit",
                "size": 1,
                "sizeUnit": "pack",
                "retailPrice": 6,
                "bulkPrice": 5,
                "bulkMinimum": 50,
                "availability": "available",
                "leadDays": 1,
                "image": "/assets/blocks-product.jpg",
                "samplePrice": False,
                "salesRevision": 1,
                "minOrder": 10,
                "orderMultiple": 10,
                "maxPerOrder": None,
                "dailyCapacity": None,
            },
        ]

    # Ensure gourmet prices are present on ice products
    for p in products:
        if p["id"] in ["ice", "ice3", "ice5"]:
            if "gourmetRetailPrice" not in p or p["gourmetRetailPrice"] is None:
                p["gourmetRetailPrice"] = 18 if p["id"] == "ice" else (26 if p["id"] == "ice3" else 42)
            if "gourmetBulkPrice" not in p or p["gourmetBulkPrice"] is None:
                p["gourmetBulkPrice"] = 14 if p["id"] == "ice" else (22 if p["id"] == "ice3" else 35)

    cursor.execute("SELECT count(*) FROM catalogue")
    cat_count = cursor.fetchone()[0]
    if cat_count == 0:
        for p in products:
            cursor.execute(
                "INSERT INTO catalogue (id, data_json, updated_at) VALUES (?, ?, ?)",
                (p["id"], json.dumps(p), now),
            )

    # Seed Business Settings
    business_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "scraped_site",
        "api_data_api_business.json",
    )
    if os.path.exists(business_file):
        with open(business_file) as f:
            business_data = json.load(f)
    else:
        business_data = {
            "about": "The CoolerBox Ice Hub is a Namibian ice and purified drinking-water business focused on making cold products readily available where and when customers need them. We serve individuals, retailers, service stations, events, funeral undertakers, hospitality businesses and commercial customers through direct sales, deliveries and long-term supply partnerships. Consistent supply, product quality and dependable distribution guide our approach.",
            "location": "Makalani Mall, Ongwediva, Namibia",
            "hours": "Monday–Thursday: 09:00–19:00. Friday–Saturday: 09:00–20:00. Sunday: 10:00–18:00.",
            "collection": "Collect at Makalani Mall, Ongwediva, during trading hours. Monday–Thursday 09:00–19:00; Friday–Saturday 09:00–20:00; Sunday 10:00–18:00. Orders and collection times require confirmation.",
            "deliveryAreas": "Free delivery within 25 km of Makalani Mall, Ongwediva, requires at least three different catalogue products, each meeting its minimum order. Regular and gourmet of the same bag size count as one product. Thursday delivery only: 08:00–10:00 or 16:00–17:00. Address and distance are confirmed by the team. Other delivery charges require a quote.",
            "deliveryFee": None,
            "quality": "Purified water treated through multi-stage filtration and UV sterilization. Ice manufactured from food-grade purified water under strict hygienic standards.",
            "logo": "/assets/logo-primary.jpeg",
            "shopImage": "",
            "salesRevision": 2,
            "bookingMinHours": 48,
            "bookingMaxHours": 72,
            "deliveryDay": 4,
            "deliveryWindows": [
                {"start": "08:00", "end": "10:00"},
                {"start": "16:00", "end": "17:00"},
            ],
            "freeDeliveryProducts": 3,
            "deliveryRadiusKm": 25,
            "taxNote": "No VAT is added to the displayed prices.",
            "refundTerms": "Payments are non-refundable.",
            "bookingTerms": "Place orders strictly 48–72 hours before scheduled collection or delivery. Delivery is Thursday only, 08:00–10:00 or 16:00–17:00, Windhoek time.",
            "paymentTerms": "Approved contract customers pay on delivery under their agreed terms. New and ordinary customers pay before delivery. Payment and order confirmation are arranged with the team on WhatsApp.",
            "cancellationTerms": "Cancel at least six hours before scheduled collection or delivery via WhatsApp, quoting your reference. Payments are non-refundable.",
            "labelTerms": "Personalised-label minimum: 50 bottles. Printing: N$4 extra per bottle. Turnaround: 48–72 hours after final artwork approval and order confirmation.",
            "weeklyHours": {
                "0": {"start": "10:00", "end": "18:00"},
                "1": {"start": "09:00", "end": "19:00"},
                "2": {"start": "09:00", "end": "19:00"},
                "3": {"start": "09:00", "end": "19:00"},
                "4": {"start": "09:00", "end": "19:00"},
                "5": {"start": "09:00", "end": "20:00"},
                "6": {"start": "09:00", "end": "20:00"},
            },
            "cutoffTime": "",
            "collectionStart": "09:00",
            "collectionEnd": "19:00",
        }

    cursor.execute("SELECT count(*) FROM settings WHERE key = 'business'")
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            "INSERT INTO settings (key, value_json) VALUES ('business', ?)",
            (json.dumps(business_data),),
        )

    # Seed Site Settings (Contacts & Socials)
    settings_data = {
        "email": "info@coolerboxicehub.com",
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
    cursor.execute("SELECT count(*) FROM settings WHERE key = 'settings'")
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            "INSERT INTO settings (key, value_json) VALUES ('settings', ?)",
            (json.dumps(settings_data),),
        )

    # Seed FAQs
    faqs_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "scraped_site",
        "api_data_api_faqs.json",
    )
    if os.path.exists(faqs_file):
        with open(faqs_file) as f:
            faqs = json.load(f)
        for faq in faqs:
            cursor.execute(
                """
                INSERT OR REPLACE INTO faqs (id, category, question, answer, keywords, source)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    faq["id"],
                    faq["category"],
                    faq["question"],
                    faq["answer"],
                    faq.get("keywords", ""),
                    faq.get("source", "static"),
                ),
            )

    # Seed Initial News / Posts
    initial_posts = [
        {
            "id": "post-welcome-ongwediva",
            "title": "Welcome to The CoolerBox Ice Hub in Ongwediva",
            "category": "news",
            "body": "The CoolerBox Ice Hub is open at Makalani Mall, Ongwediva! We provide fresh gourmet ice cubes, 30 kg commercial ice blocks, ice cups, and multi-stage purified drinking water and refills. Visit our shop or place your event and retail supply orders through our website.",
            "location": "Makalani Mall, Ongwediva",
            "link": "",
            "image": "/assets/hero-coolerbox.webp",
            "event_date": "",
            "status": "published",
            "created_at": "2026-10-20T08:00:00Z",
        },
        {
            "id": "post-supplier-program",
            "title": "Local Supplier & Retailer Partnership Programme",
            "category": "community",
            "body": "Run a cuca shop, retail outlet, bar or service station in the Oshana region? CoolerBox offers dedicated local supply partnerships with 50-pack wholesale rates, freezer placement options, and dependable Thursday delivery cycles.",
            "location": "Ongwediva & Oshakati",
            "link": "/order?supplier=1",
            "image": "/assets/ice-product.webp",
            "event_date": "",
            "status": "published",
            "created_at": "2026-10-24T10:00:00Z",
        },
        {
            "id": "post-custom-water-events",
            "title": "Personalised Bottled Water for Funerals, Weddings & Anniversaries",
            "category": "events",
            "body": "Make your special occasion memorable with customized 330 ml and 500 ml purified water bottles featuring your loved one's photo, family crest, wedding monogram, or corporate branding. Contact us 48–72 hours in advance for artwork and cooled delivery.",
            "location": "Makalani Mall Hub",
            "link": "/order?product=water&occasion=1",
            "image": "/assets/event-water.webp",
            "event_date": "2026-11-15",
            "status": "published",
            "created_at": "2026-10-27T12:00:00Z",
        },
    ]

    for p in initial_posts:
        cursor.execute(
            """
            INSERT OR REPLACE INTO posts (id, title, category, body, location, link, image, event_date, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                p["id"],
                p["title"],
                p["category"],
                p["body"],
                p["location"],
                p["link"],
                p["image"],
                p["event_date"],
                p["status"],
                p["created_at"],
            ),
        )

    # Initial reviews are left unseeded so the owner can populate them directly
    conn.commit()
    conn.close()
