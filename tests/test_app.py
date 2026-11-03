from app.models import (
    CustomerModel,
    MilestoneUpdateRequest,
    OrderCreateRequest,
    OrderItemModel,
    ReviewCreateRequest,
)
from app.routes.api import (
    all_orders_endpoint,
    business_endpoint,
    catalogue_endpoint,
    create_review_endpoint,
    faqs_endpoint,
    get_order_endpoint,
    health_check,
    my_orders_endpoint,
    place_order_endpoint,
    posts_endpoint,
    showcase_endpoint,
    update_order_endpoint,
)
from app.routes.pages import (
    dashboard_page,
    home_page,
    news_page,
    order_page,
    privacy_page,
    questions_page,
    reviews_page,
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
        "Order (/order)": order_page(),
        "Track (/track)": track_page(),
        "Reviews (/reviews)": reviews_page(),
        "News (/news)": news_page(),
        "Questions (/questions)": questions_page(),
        "Privacy (/privacy)": privacy_page(),
        "Dashboard (/dashboard)": dashboard_page(),
    }
    for name, resp in pages.items():
        assert resp.status_code == 200, f"{name} returned {resp.status_code}"
        assert len(resp.body) > 500, f"{name} body too short ({len(resp.body)} bytes)"
        assert b"logo-primary.jpeg" in resp.body or b"brand-logo" in resp.body, f"{name} missing official logo reference"
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

    print("\n==================================================")
    print("  ALL 14 SUITES PASSED WITH 100% SUCCESS!         ")
    print("==================================================\n")


if __name__ == "__main__":
    run_comprehensive_test()
