import os

from fastapi import APIRouter
from fastapi.responses import HTMLResponse, RedirectResponse

router = APIRouter(tags=["Pages"])

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "templates")


def _read_template(filename: str) -> str:
    with open(os.path.join(TEMPLATES_DIR, filename), encoding="utf-8") as f:
        return f.read()


@router.get("/", response_class=HTMLResponse)
def home_page() -> HTMLResponse:
    return HTMLResponse(content=_read_template("index.html"))


@router.get("/order", response_class=HTMLResponse)
def order_page() -> HTMLResponse:
    return HTMLResponse(content=_read_template("order.html"))


@router.get("/supplier", response_class=HTMLResponse)
def supplier_page() -> HTMLResponse:
    return HTMLResponse(content=_read_template("supplier.html"))


@router.get("/shop")
def shop_redirect() -> RedirectResponse:
    return RedirectResponse(url="/products", status_code=302)


@router.get("/products", response_class=HTMLResponse)
def shop_page() -> HTMLResponse:
    return HTMLResponse(content=_read_template("shop.html"))


@router.get("/about")
def about_redirect() -> RedirectResponse:
    return RedirectResponse(url="/#about", status_code=302)


@router.get("/services", response_class=HTMLResponse)
@router.get("/hire", response_class=HTMLResponse)
@router.get("/business", response_class=HTMLResponse)
@router.get("/events", response_class=HTMLResponse)
def services_page() -> HTMLResponse:
    return HTMLResponse(content=_read_template("services.html"))


@router.get("/calculator")
@router.get("/estimator")
def calculator_page() -> RedirectResponse:
    return RedirectResponse(url="/products", status_code=302)


@router.get("/contact", response_class=HTMLResponse)
def contact_page() -> HTMLResponse:
    return HTMLResponse(content=_read_template("contact.html"))


@router.get("/track", response_class=HTMLResponse)
def track_page() -> HTMLResponse:
    return HTMLResponse(content=_read_template("track.html"))


@router.get("/reviews", response_class=HTMLResponse)
def reviews_page() -> HTMLResponse:
    return HTMLResponse(content=_read_template("reviews.html"))


@router.get("/news", response_class=HTMLResponse)
def news_page() -> HTMLResponse:
    return HTMLResponse(content=_read_template("news.html"))


@router.get("/questions", response_class=HTMLResponse)
def questions_page() -> HTMLResponse:
    return HTMLResponse(content=_read_template("questions.html"))


@router.get("/privacy", response_class=HTMLResponse)
def privacy_page() -> HTMLResponse:
    return HTMLResponse(content=_read_template("privacy.html"))


@router.get("/admin", response_class=HTMLResponse)
@router.get("/dashboard", response_class=HTMLResponse)
def admin_page() -> HTMLResponse:
    if os.path.exists(os.path.join(TEMPLATES_DIR, "admin.html")):
        return HTMLResponse(content=_read_template("admin.html"))
    return HTMLResponse(content=_read_template("dashboard.html"))


def dashboard_page() -> HTMLResponse:
    return admin_page()

