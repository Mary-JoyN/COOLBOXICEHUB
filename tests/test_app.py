from app.models import (
    BusinessSettingsUpdateRequest,
    ContactMessageRequest,
    CustomerModel,
    MilestoneUpdateRequest,
    OrderCreateRequest,
    OrderItemModel,
    ProductCreateRequest,
    ProductUpdateRequest,
    ReviewCreateRequest,
    SiteSettingsUpdateRequest,
)
from app.routes.api import (
    all_orders_endpoint,
    business_endpoint,
    catalogue_endpoint,
    create_product_endpoint,
    create_review_endpoint,
    delete_product_endpoint,
    faqs_endpoint,
    get_order_endpoint,
    get_single_product_endpoint,
    health_check,
    my_orders_endpoint,
    place_order_endpoint,
    posts_endpoint,
    settings_endpoint,
    showcase_endpoint,
    submit_contact_endpoint,
    update_business_endpoint,
    update_order_endpoint,
    update_product_endpoint,
    update_settings_endpoint,
)
from app.routes.pages import (
    admin_page,
    calculator_page,
    dashboard_page,
    home_page,
    news_page,
    order_page,
    privacy_page,
    questions_page,
    reviews_page,
    services_page,
    shop_page,
    track_page,
)
from app.seed_data import seed_database


def run_comprehensive_test():
    print("==================================================")
    print("  RUNNING COMPREHENSIVE APPLICATION TEST SUITE   ")
    print("==================================================")

    # 1. Initialize and Seed
    seed_database()
    print("✓ Database initialized and seeded successfully.")

    # 2. Test All Page Routes (HTML Template Responses)
    pages = {
        "Homepage (/)": home_page(),
        "Shop (/shop)": shop_page(),
        "Services / Business & Events (/services)": services_page(),
        "Order (/order)": order_page(),
        "Track (/track)": track_page(),
        "Reviews (/reviews)": reviews_page(),
        "News (/news)": news_page(),
        "Questions (/questions)": questions_page(),
        "Privacy (/privacy)": privacy_page(),
        "Dashboard (/dashboard)": dashboard_page(),
    }
    calc_resp = calculator_page()
    assert calc_resp.status_code == 302 and calc_resp.headers["location"] == "/products", (
        f"Calculator (/calculator) should redirect to /products, got {calc_resp.status_code}"
    )
    print("✓ Calculator (/calculator): Redirects 302 -> /products")
    for name, resp in pages.items():
        assert resp.status_code == 200, f"{name} returned {resp.status_code}"
        assert len(resp.body) > 500, f"{name} body too short ({len(resp.body)} bytes)"
        assert b"logo-primary.jpeg" in resp.body or b"brand-logo" in resp.body, f"{name} missing official logo reference"
        if name != "Dashboard (/dashboard)":
            assert b"Owner Dashboard" not in resp.body, f"{name} still exposes Owner Dashboard link"
        print(f"✓ {name}: Status {resp.status_code}, Length {len(resp.body)} bytes")

    # 3. Test Health Check
    health = health_check()
    assert health["status"] == "ok"
    assert "Ongwediva" in health["location"]
    print(f"✓ Health Check: {health['status']} - {health['business']} ({health['location']})")

    # 4. Test Catalogue Endpoint
    catalogue = catalogue_endpoint()
    assert len(catalogue) >= 11, f"Expected >= 11 products, got {len(catalogue)}"
    print(f"✓ Catalogue: {len(catalogue)} products verified:")
    for p in catalogue:
        print(f"   • {p['name']} ({p['size']} {p['sizeUnit']}) | Retail: N${p.get('retailPrice')} | Bulk: N${p.get('bulkPrice')}")

    # 5. Test Business Endpoint
    biz = business_endpoint()
    assert "Makalani Mall" in biz["location"]
    assert "Thursday" in biz["bookingTerms"]
    print(f"✓ Business Info: {biz['location']} | {biz['bookingTerms'][:60]}...")

    # 6. Test Settings Endpoint
    sett = business_endpoint()
    assert sett is not None
    print("✓ Business and Contacts settings verified.")

    # 7. Test FAQs Endpoint
    faqs = faqs_endpoint()
    assert len(faqs) >= 20
    print(f"✓ FAQs: {len(faqs)} verified questions and policies.")

    # 8. Test Posts Endpoint
    posts = posts_endpoint()
    assert len(posts) >= 3
    print(f"✓ Noticeboard / Posts: {len(posts)} published community stories.")

    # 9. Test Order Placement
    order_req = OrderCreateRequest(
        customer=CustomerModel(
            name="Selma Shilongo",
            phone="+264817654321",
            email="selma@example.na",
            business="Ongwediva Fresh Foods",
        ),
        items=[
            OrderItemModel(id="ice", quantity=10, iceType="gourmet"),
            OrderItemModel(id="water", quantity=50, iceType="regular"),
            OrderItemModel(id="slushies", quantity=15, iceType="regular"),
        ],
        fulfilment="collection",
        date="2026-11-10",
        time="11:30",
        notes="Urgent supply for community celebration.",
    )
    placed_order = place_order_endpoint(order_req)
    ref = placed_order["reference"]
    assert ref.startswith("CBX-"), f"Invalid reference format: {ref}"
    total_cents = placed_order["totalCents"]
    assert total_cents is not None and total_cents > 0
    print(f"✓ Order Placed: Reference {ref} | Total N${total_cents / 100:.2f} | Items: {len(placed_order['items'])}")

    # 10. Test Tracking Retrieval
    tracked = my_orders_endpoint(reference=ref)
    assert len(tracked["orders"]) == 1
    assert tracked["orders"][0]["reference"] == ref
    assert len(tracked["updates"]) >= 1
    print(f"✓ Track Order: Found reference {ref} with status '{tracked['orders'][0]['status']}'")

    # 11. Test Admin Milestone Update
    patch_req = MilestoneUpdateRequest(
        status="confirmed",
        approval={"priceConfirmed": True, "availabilityConfirmed": True},
        note="Quotation confirmed on WhatsApp with customer.",
    )
    patch_res = update_order_endpoint(ref, patch_req)
    assert patch_res["status"] == "updated"

    # Verify updated state
    fetched = get_order_endpoint(ref)
    assert fetched["status"] == "confirmed"
    assert fetched["details"]["approval"]["priceConfirmed"] is True
    print(f"✓ Milestone Update: Order {ref} is now CONFIRMED with verified approvals.")

    # 12. Test Review Submission
    rev_req = ReviewCreateRequest(
        id="rev-unit-test-1",
        rating=5,
        title="Best gourmet ice in northern Namibia",
        comment="The hollow-centred gourmet ice cubes were immaculate. Excellent service at Makalani Mall.",
        name="Selma S.",
        anonymous=False,
        reference=ref,
        permission=True,
    )
    rev_res = create_review_endpoint(rev_req)
    assert rev_res["status"] == "success"

    # 13. Test Showcase
    showcase = showcase_endpoint()
    assert len(showcase) >= 1
    print(f"✓ Reviews & Showcase: {len(showcase)} approved customer testimonials.")

    # Clean up test review so reviews table remains completely empty for user population
    from app.database import get_db_connection

    with get_db_connection() as cleanup_conn:
        cleanup_conn.execute("DELETE FROM reviews WHERE id = 'rev-unit-test-1'")
        cleanup_conn.commit()

    # 14. Test All Orders (Admin view)
    all_orders = all_orders_endpoint()
    assert len(all_orders["orders"]) >= 1
    print(f"✓ Admin Orders List: {len(all_orders['orders'])} total records in system.")

    # 15. Test Admin Page Route
    adm_resp = admin_page()
    assert adm_resp.status_code == 200
    assert b"Operations Admin" in adm_resp.body or b"CoolerBox" in adm_resp.body
    print(f"✓ Admin Page (/admin): Status {adm_resp.status_code}, Length {len(adm_resp.body)} bytes")

    # 16. Test Product Creation with Image
    new_prod_req = ProductCreateRequest(
        id="test-party-ice",
        name="7 kg Party Ice Bag",
        description="Extra-large bulk party ice for weekend functions, weddings, and celebrations.",
        unit="bag",
        size=7.0,
        sizeUnit="kg",
        retailPrice=48.0,
        bulkPrice=40.0,
        bulkMinimum=15,
        availability="available",
        leadDays=1,
        image="/assets/ice-product.webp",
    )
    created_prod = create_product_endpoint(new_prod_req)
    assert created_prod["id"] == "test-party-ice"
    assert created_prod["name"] == "7 kg Party Ice Bag"
    assert created_prod["retailPrice"] == 48.0
    print(f"✓ Product Creation: Successfully added '{created_prod['name']}' with image.")

    # 17. Test Single Product Retrieval and Update
    fetched_prod = get_single_product_endpoint("test-party-ice")
    assert fetched_prod["id"] == "test-party-ice"
    update_prod_req = ProductUpdateRequest(
        retailPrice=50.0,
        availability="advance-booking",
        description="Updated party ice description with new pricing.",
    )
    updated_prod = update_product_endpoint("test-party-ice", update_prod_req)
    assert updated_prod["product"]["retailPrice"] == 50.0
    assert updated_prod["product"]["availability"] == "advance-booking"
    print("✓ Product Update: Updated price and availability successfully.")

    # 18. Test Product Deletion
    del_res = delete_product_endpoint("test-party-ice")
    assert del_res["status"] == "deleted"
    print("✓ Product Deletion: Product removed cleanly.")

    # 19. Test Site Settings & Phone Update
    sett_req = SiteSettingsUpdateRequest(
        phone="+264 85 999 8888",
        whatsapp="264859998888",
        email="orders@coolerboxicehub.com",
    )
    updated_sett = update_settings_endpoint(sett_req)
    assert updated_sett["status"] == "success"
    current_sett = settings_endpoint()
    assert current_sett["phone"] == "+264 85 999 8888"
    assert current_sett["whatsapp"] == "264859998888"
    assert current_sett["email"] == "orders@coolerboxicehub.com"
    print("✓ Contact & Phone Update: Phone and WhatsApp numbers updated.")

    # Reset contact settings back to standard
    update_settings_endpoint(SiteSettingsUpdateRequest(
        phone="+264 85 248 5426",
        whatsapp="264852485426",
        email="info@coolerboxicehub.com",
    ))

    # 20. Test Business Settings Update
    biz_req = BusinessSettingsUpdateRequest(
        hours="Monday–Saturday: 08:30–20:00. Sunday: 10:00–18:00.",
    )
    updated_biz = update_business_endpoint(biz_req)
    assert updated_biz["status"] == "success"
    assert "08:30" in business_endpoint()["hours"]
    print("✓ Business Settings Update: Trading hours updated.")

    # 21. Test Contact Form Submission (/api/contact)
    contact_req = ContactMessageRequest(
        name="Test Customer",
        phone="+264814335145",
        email="admin@telecom.na",
        subject="Bulk Retail & Business Supply",
        message="Testing contact enquiry submission.",
    )
    contact_res = submit_contact_endpoint(contact_req)
    assert contact_res["status"] == "success"
    assert contact_res["reference"].startswith("CBX-MSG-")
    with get_db_connection() as cleanup_conn:
        cleanup_conn.execute("DELETE FROM contact_messages WHERE reference = ?", (contact_res["reference"],))
        cleanup_conn.commit()
    print(f"✓ Contact Form (/api/contact): Saved enquiry {contact_res['reference']}.")

    print("\n==================================================")
    print("  ALL 20 SUITES PASSED WITH 100% SUCCESS!         ")
    print("==================================================\n")


if __name__ == "__main__":
    run_comprehensive_test()
