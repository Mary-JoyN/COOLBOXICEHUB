import json
import os
import random
import re
import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, HTTPException, Request

from app.database import (
    create_order,
    delete_catalogue_item,
    delete_post,
    delete_review,
    get_all_faqs,
    get_all_posts,
    get_business_settings,
    get_catalogue_items,
    get_db_connection,
    get_orders_by_reference_or_customer,
    get_showcase_items,
    get_site_settings,
    insert_review,
    mark_updates_read,
    save_catalogue_item,
    save_contact_message,
    update_business_settings,
    update_order_milestone,
    update_site_settings,
)
from app.models import (
    BusinessSettingsUpdateRequest,
    ContactMessageRequest,
    MilestoneUpdateRequest,
    OrderCreateRequest,
    PostCreateRequest,
    ProductCreateRequest,
    ProductUpdateRequest,
    ReviewCreateRequest,
    SiteSettingsUpdateRequest,
)

router = APIRouter(prefix="/api", tags=["API"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "business": "The CoolerBox Ice Hub", "location": "Ongwediva, Namibia"}


@router.get("/catalogue")
def catalogue_endpoint() -> list[dict[str, Any]]:
    return get_catalogue_items()


@router.get("/business")
def business_endpoint() -> dict[str, Any]:
    return get_business_settings()


@router.get("/settings")
def settings_endpoint() -> dict[str, Any]:
    return get_site_settings()


@router.get("/faqs")
def faqs_endpoint() -> list[dict[str, Any]]:
    return get_all_faqs()


@router.get("/posts")
def posts_endpoint() -> list[dict[str, Any]]:
    return get_all_posts()


@router.post("/posts")
def create_post_endpoint(req: PostCreateRequest) -> dict[str, Any]:
    now = datetime.now(UTC).isoformat()
    post_id = f"post-{uuid.uuid4().hex[:8]}"
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO posts (id, title, category, body, location, link, image, event_date, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)
        """,
        (post_id, req.title, req.category, req.body, req.location, req.link, req.image, req.eventDate, now),
    )
    conn.commit()
    conn.close()
    return {"id": post_id, "title": req.title, "status": "published"}


@router.get("/showcase")
def showcase_endpoint() -> list[dict[str, Any]]:
    return get_showcase_items()


@router.get("/reviews")
def reviews_endpoint() -> list[dict[str, Any]]:
    return get_showcase_items()


@router.post("/reviews")
def create_review_endpoint(req: ReviewCreateRequest) -> dict[str, Any]:
    now = datetime.now(UTC).isoformat()
    insert_review({
        "id": req.id or str(uuid.uuid4()),
        "rating": req.rating,
        "title": req.title,
        "comment": req.comment,
        "name": req.name,
        "anonymous": req.anonymous,
        "reference": req.reference or "",
        "permission": req.permission,
        "createdAt": now,
    })
    return {"status": "success", "message": "Review submitted successfully"}


@router.get("/my-orders")
def my_orders_endpoint(reference: str | None = None) -> dict[str, Any]:
    return get_orders_by_reference_or_customer(reference)


@router.patch("/my-orders")
def mark_my_orders_read() -> dict[str, str]:
    mark_updates_read()
    return {"status": "success"}


@router.get("/orders")
def all_orders_endpoint(reference: str | None = None) -> dict[str, Any]:
    return get_orders_by_reference_or_customer(reference)


@router.get("/orders/{reference}")
def get_order_endpoint(reference: str) -> dict[str, Any]:
    res = get_orders_by_reference_or_customer(reference)
    if not res["orders"]:
        raise HTTPException(status_code=404, detail="Order not found")
    return res["orders"][0]


@router.patch("/orders/{reference}")
def update_order_endpoint(reference: str, req: MilestoneUpdateRequest) -> dict[str, Any]:
    ok = update_order_milestone(
        reference=reference,
        status=req.status,
        approval_updates=req.approval,
        admin_note=req.note,
    )
    if not ok:
        raise HTTPException(status_code=404, detail="Order reference not found")
    return {"status": "updated", "reference": reference}


@router.post("/orders")
def place_order_endpoint(req: OrderCreateRequest) -> dict[str, Any]:
    now = datetime.now(UTC)
    now_iso = now.isoformat()

    # Generate friendly reference like CBX-2610-8492
    year_month = now.strftime("%y%m")
    random_digits = random.randint(1000, 9999)
    reference = f"CBX-{year_month}-{random_digits}"

    catalogue = {p["id"]: p for p in get_catalogue_items()}

    # Calculate pricing
    total_cents = 0
    calculated_items = []
    unknown_price = False

    for item in req.items:
        base_id = item.id.replace("--gourmet", "")
        cat_item = catalogue.get(base_id)
        name = cat_item["name"] if cat_item else item.id
        size = cat_item["size"] if cat_item else 0
        size_unit = cat_item["sizeUnit"] if cat_item else "unit"

        is_gourmet = item.iceType == "gourmet" or "--gourmet" in item.id
        if is_gourmet and not name.endswith("gourmet"):
            name = f"{name} — gourmet"

        unit_price = None
        if cat_item:
            if is_gourmet:
                retail = cat_item.get("gourmetRetailPrice")
                bulk = cat_item.get("gourmetBulkPrice")
            else:
                retail = cat_item.get("retailPrice")
                bulk = cat_item.get("bulkPrice")

            bulk_min = cat_item.get("bulkMinimum") or 999999
            if item.quantity >= bulk_min and bulk is not None:
                unit_price = bulk
            else:
                unit_price = retail

        if unit_price is None:
            unknown_price = True
            cents = None
        else:
            cents = int(round(unit_price * 100)) * item.quantity
            total_cents += cents

        calculated_items.append({
            "id": item.id,
            "name": name,
            "quantity": item.quantity,
            "size": size,
            "sizeUnit": size_unit,
            "iceType": item.iceType or ("gourmet" if is_gourmet else "regular"),
            "unitPrice": unit_price,
            "cents": cents,
        })

    # Additional personalised label costs
    event_dict = req.event.model_dump() if req.event else None
    if event_dict and event_dict.get("label") == "personalised":
        # N$4 extra per bottle
        water_bottle_count = sum(
            i["quantity"] for i in calculated_items if i["id"] in ["water", "water330"]
        )
        if water_bottle_count > 0:
            total_cents += water_bottle_count * 400

    details_payload = {
        "category": "Direct Order",
        "frequency": "Once-off",
        "date": req.date,
        "time": req.time or "",
        "fulfilment": req.fulfilment,
        "address": req.address or "",
        "distance": req.distance,
        "notes": req.notes or "",
        "offerId": req.offerId,
        "service": req.service or "",
        "supplier": req.supplier.model_dump() if req.supplier else None,
        "event": event_dict,
        "approval": {
            "priceConfirmed": False,
            "availabilityConfirmed": False,
            "artworkApproved": False if (event_dict and event_dict.get("label") == "personalised") else True,
            "productionAuthorised": False,
        },
    }

    final_total_cents = None if unknown_price else total_cents

    saved = create_order(
        reference=reference,
        total_cents=final_total_cents,
        customer=req.customer.model_dump(),
        details=details_payload,
        items=calculated_items,
        created_at=now_iso,
    )
    return saved


@router.post("/images")
@router.post("/artwork")
async def upload_file_endpoint(request: Request) -> dict[str, str]:
    import email
    content_type = request.headers.get("content-type", "")
    body = await request.body()

    if not body:
        raise HTTPException(status_code=400, detail="No file uploaded")

    filename = "uploaded_file.png"
    file_content = body

    if "boundary=" in content_type:
        msg = email.message_from_bytes(b"Content-Type: " + content_type.encode() + b"\r\n\r\n" + body)
        for part in msg.walk():
            fn = part.get_filename()
            if fn:
                filename = fn
                file_content = part.get_payload(decode=True) or b""
                break

    allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".pdf", ".ai", ".eps", ".psd", ".cdr", ".tiff", ".tif", ".zip"}
    _, ext = os.path.splitext(filename.lower())
    if ext not in allowed_exts:
        ext = ".png"

    unique_name = f"upload_{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, unique_name)

    if len(file_content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (maximum 10 MB)")

    with open(filepath, "wb") as f:
        f.write(file_content)

    return {"url": f"/uploads/{unique_name}", "filename": filename}


@router.post("/catalogue")
def create_product_endpoint(req: ProductCreateRequest) -> dict[str, Any]:
    if req.id and req.id.strip():
        product_id = re.sub(r"[^a-zA-Z0-9_-]", "-", req.id.strip().lower())
    else:
        base_slug = re.sub(r"[^a-zA-Z0-9]+", "-", req.name.strip().lower()).strip("-")
        product_id = f"{base_slug}-{uuid.uuid4().hex[:4]}" if base_slug else f"prod-{uuid.uuid4().hex[:6]}"

    # Verify uniqueness
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM catalogue WHERE id = ?", (product_id,))
    if cursor.fetchone():
        product_id = f"{product_id}-{uuid.uuid4().hex[:4]}"
    conn.close()

    product_data = {
        "id": product_id,
        "name": req.name.strip(),
        "description": req.description.strip(),
        "unit": req.unit.strip(),
        "size": req.size,
        "sizeUnit": req.sizeUnit.strip(),
        "retailPrice": req.retailPrice,
        "bulkPrice": req.bulkPrice,
        "bulkMinimum": req.bulkMinimum or 1,
        "gourmetRetailPrice": req.gourmetRetailPrice,
        "gourmetBulkPrice": req.gourmetBulkPrice,
        "availability": req.availability,
        "leadDays": req.leadDays,
        "image": req.image or "/assets/ice-product.webp",
        "samplePrice": False,
        "salesRevision": 1,
        "minOrder": req.minOrder or 1,
        "orderMultiple": req.orderMultiple or 1,
        "maxPerOrder": None,
        "dailyCapacity": None,
    }
    saved = save_catalogue_item(product_data)
    return saved


@router.get("/catalogue/{product_id}")
def get_single_product_endpoint(product_id: str) -> dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data_json FROM catalogue WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return json.loads(row["data_json"])


@router.patch("/catalogue/{product_id}")
def update_product_endpoint(product_id: str, req: ProductUpdateRequest) -> dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data_json FROM catalogue WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    data = json.loads(row["data_json"])
    if req.name is not None and req.name.strip():
        data["name"] = req.name.strip()
    if req.description is not None:
        data["description"] = req.description.strip()
    if req.unit is not None:
        data["unit"] = req.unit.strip()
    if req.size is not None:
        data["size"] = req.size
    if req.sizeUnit is not None:
        data["sizeUnit"] = req.sizeUnit.strip()
    if req.retailPrice is not None:
        data["retailPrice"] = req.retailPrice
    if req.bulkPrice is not None:
        data["bulkPrice"] = req.bulkPrice
    if req.bulkMinimum is not None:
        data["bulkMinimum"] = req.bulkMinimum
    if req.gourmetRetailPrice is not None:
        data["gourmetRetailPrice"] = req.gourmetRetailPrice
    if req.gourmetBulkPrice is not None:
        data["gourmetBulkPrice"] = req.gourmetBulkPrice
    if req.availability is not None:
        data["availability"] = req.availability
    if req.leadDays is not None:
        data["leadDays"] = req.leadDays
    if req.image is not None and req.image.strip():
        data["image"] = req.image.strip()
    if req.minOrder is not None:
        data["minOrder"] = req.minOrder
    if req.orderMultiple is not None:
        data["orderMultiple"] = req.orderMultiple

    now = datetime.now(UTC).isoformat()
    cursor.execute("UPDATE catalogue SET data_json = ?, updated_at = ? WHERE id = ?", (json.dumps(data), now, product_id))
    conn.commit()
    conn.close()
    return {"status": "updated", "product": data}


@router.delete("/catalogue/{product_id}")
def delete_product_endpoint(product_id: str) -> dict[str, Any]:
    deleted = delete_catalogue_item(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "deleted", "id": product_id}


@router.patch("/settings")
def update_settings_endpoint(req: SiteSettingsUpdateRequest) -> dict[str, Any]:
    updates: dict[str, Any] = {}
    if req.email is not None and req.email.strip():
        updates["email"] = req.email.strip()
    if req.phone is not None and req.phone.strip():
        updates["phone"] = req.phone.strip()
    if req.whatsapp is not None and req.whatsapp.strip():
        clean_wa = re.sub(r"[^\d]", "", req.whatsapp.strip())
        updates["whatsapp"] = clean_wa if clean_wa else req.whatsapp.strip()
    if req.socials is not None:
        updates["socials"] = req.socials

    updated = update_site_settings(updates)
    return {"status": "success", "settings": updated}


@router.patch("/business")
def update_business_endpoint(req: BusinessSettingsUpdateRequest) -> dict[str, Any]:
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    updated = update_business_settings(updates)
    return {"status": "success", "business": updated}


@router.delete("/reviews/{review_id}")
def delete_review_endpoint(review_id: str) -> dict[str, Any]:
    deleted = delete_review(review_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"status": "deleted", "id": review_id}


@router.delete("/posts/{post_id}")
def delete_post_endpoint(post_id: str) -> dict[str, Any]:
    deleted = delete_post(post_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"status": "deleted", "id": post_id}


def _send_contact_email(
    recipient: str,
    reference: str,
    req: ContactMessageRequest,
) -> bool:
    import smtplib
    from email.message import EmailMessage

    smtp_host = os.environ.get("SMTP_HOST", "").strip()
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER", "").strip()
    smtp_pass = os.environ.get("SMTP_PASSWORD", "").strip()
    smtp_from = os.environ.get("SMTP_FROM", smtp_user or recipient).strip()

    if not smtp_host or not smtp_user or not smtp_pass:
        return False

    msg = EmailMessage()
    msg["Subject"] = f"[CoolerBox Enquiry {reference}] {req.subject}"
    msg["From"] = smtp_from
    msg["To"] = recipient
    msg["Reply-To"] = req.email.strip()
    msg.set_content(
        f"New website enquiry received ({reference})\n\n"
        f"Name: {req.name.strip()}\n"
        f"Phone / WhatsApp: {req.phone.strip()}\n"
        f"Email: {req.email.strip()}\n"
        f"Subject: {req.subject.strip()}\n\n"
        f"Message:\n{req.message.strip()}\n"
    )

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
        return True
    except Exception:
        return False


@router.post("/contact")
def submit_contact_endpoint(req: ContactMessageRequest) -> dict[str, Any]:
    now = datetime.now(UTC)
    now_iso = now.isoformat()
    ref = f"CBX-MSG-{now.strftime('%y%m')}-{random.randint(1000, 9999)}"

    site_settings = get_site_settings()
    recipient = site_settings.get("email") or "info@coolerboxicehub.com"
    email_sent = _send_contact_email(recipient, ref, req)

    save_contact_message(
        reference=ref,
        name=req.name.strip(),
        phone=req.phone.strip(),
        email_addr=req.email.strip(),
        subject=req.subject.strip(),
        message=req.message.strip(),
        email_sent=email_sent,
        created_at=now_iso,
    )

    detail_msg = (
        f"Your enquiry has been emailed to {recipient} and saved to our system."
        if email_sent
        else f"Your enquiry has been saved for {recipient}. Our team will follow up with you shortly."
    )
    return {
        "status": "success",
        "reference": ref,
        "emailSent": email_sent,
        "message": detail_msg,
    }


@router.post("/supplier-application")
def submit_supplier_application(payload: dict[str, Any]) -> dict[str, Any]:
    now = datetime.now(UTC)
    now_iso = now.isoformat()
    ref = f"CBX-SUP-{now.strftime('%y%m')}-{random.randint(1000, 9999)}"

    outlet_name = str(payload.get("outletName") or "").strip()
    outlet_type = str(payload.get("outletType") or "").strip()
    location = str(payload.get("location") or "").strip()
    contact_name = str(payload.get("contactName") or "").strip()
    phone = str(payload.get("phone") or "").strip()
    email = str(payload.get("email") or "").strip()
    freezer_capacity = str(payload.get("freezerCapacity") or "").strip()
    products = payload.get("products") or []
    weekly_volume = str(payload.get("weeklyVolume") or "").strip()
    delivery_freq = str(payload.get("deliveryFrequency") or "").strip()
    arrangement = str(payload.get("arrangement") or "").strip()
    notes = str(payload.get("notes") or "").strip()

    if not outlet_name or not location or not contact_name or not phone or not email:
        raise HTTPException(status_code=422, detail="Please complete all required business and contact fields.")

    products_str = ", ".join(str(p) for p in products) if isinstance(products, list) and products else "Not specified"
    formatted_msg = (
        f"Business Partner / Stockist Application ({ref})\n"
        f"Outlet Name: {outlet_name}\n"
        f"Outlet Type: {outlet_type or 'Not specified'}\n"
        f"Location / Trading Area: {location}\n"
        f"Contact Person: {contact_name}\n"
        f"Phone / WhatsApp: {phone}\n"
        f"Email: {email}\n"
        f"Existing Freezer Capacity: {freezer_capacity or 'Not specified'}\n"
        f"Products Requested: {products_str}\n"
        f"Expected Weekly Volume: {weekly_volume or 'Not specified'}\n"
        f"Preferred Delivery Frequency: {delivery_freq or 'Not specified'}\n"
        f"Arrangement Requested: {arrangement or 'Supply-only'}\n\n"
        f"Notes:\n{notes or 'None'}"
    )

    recipient = "sebiue@colerboxicehub.com"
    req_obj = ContactMessageRequest(
        name=f"{contact_name} ({outlet_name})",
        phone=phone,
        email=email,
        subject=f"Business Partner Application — {outlet_name}",
        message=formatted_msg,
    )
    email_sent = _send_contact_email(recipient, ref, req_obj)

    save_contact_message(
        reference=ref,
        name=f"{contact_name} ({outlet_name})",
        phone=phone,
        email_addr=email,
        subject=f"Business Partner Application — {outlet_name}",
        message=formatted_msg,
        email_sent=email_sent,
        created_at=now_iso,
    )

    return {
        "ok": True,
        "status": "success",
        "reference": ref,
        "emailSent": email_sent,
        "message": (
            f"Your Business Partner application has been emailed to {recipient} and saved."
            if email_sent
            else f"Your Business Partner application has been saved for {recipient}. Our team will review and contact you."
        ),
    }
