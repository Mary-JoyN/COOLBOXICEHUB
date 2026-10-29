import os
import random
import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, HTTPException, Request

from app.database import (
    create_order,
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
    update_order_milestone,
)
from app.models import (
    MilestoneUpdateRequest,
    OrderCreateRequest,
    PostCreateRequest,
    ProductUpdateRequest,
    ReviewCreateRequest,
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

    allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".svg", ".pdf"}
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


@router.patch("/catalogue/{product_id}")
def update_product_endpoint(product_id: str, req: ProductUpdateRequest) -> dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data_json FROM catalogue WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    import json
    data = json.loads(row["data_json"])
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

    from datetime import datetime
    now = datetime.now(UTC).isoformat()
    cursor.execute("UPDATE catalogue SET data_json = ?, updated_at = ? WHERE id = ?", (json.dumps(data), now, product_id))
    conn.commit()
    conn.close()
    return {"status": "updated", "product": data}
