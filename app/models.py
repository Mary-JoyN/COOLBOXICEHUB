from pydantic import BaseModel, Field


class CustomerModel(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    phone: str = Field(..., min_length=4, max_length=50)
    email: str | None = Field(default="", max_length=150)
    business: str | None = Field(default="", max_length=150)


class OrderItemModel(BaseModel):
    id: str
    quantity: int = Field(..., ge=1, le=1000000)
    iceType: str | None = None
    name: str | None = None
    size: float | None = None
    sizeUnit: str | None = None
    unitPrice: float | None = None
    cents: int | None = None


class SupplierDraftModel(BaseModel):
    outlet: str | None = None
    area: str | None = None


class EventWaterDraftModel(BaseModel):
    occasion: str | None = None
    eventName: str | None = None
    eventDate: str | None = None
    guests: int | None = None
    bottleMl: int | None = None
    label: str | None = None
    venue: str | None = None
    contactName: str | None = None
    contactPhone: str | None = None


class OrderCreateRequest(BaseModel):
    customer: CustomerModel
    items: list[OrderItemModel]
    fulfilment: str = Field(default="collection")  # 'collection' or 'delivery'
    date: str
    time: str | None = ""
    distance: float | None = None
    address: str | None = ""
    notes: str | None = ""
    offerId: str | None = None
    service: str | None = ""
    supplier: SupplierDraftModel | None = None
    event: EventWaterDraftModel | None = None
    confirmationAcknowledged: bool | None = False


class ReviewCreateRequest(BaseModel):
    id: str
    rating: int = Field(..., ge=1, le=5)
    title: str = Field(..., min_length=1, max_length=150)
    comment: str = Field(..., min_length=1, max_length=2000)
    name: str = Field(default="Anonymous customer", max_length=150)
    anonymous: bool = False
    reference: str | None = ""
    permission: bool = True


class MilestoneUpdateRequest(BaseModel):
    status: str | None = None
    approval: dict[str, bool] | None = None
    note: str | None = None


class PostCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    category: str = Field(default="news")
    body: str = Field(..., min_length=1)
    location: str | None = ""
    link: str | None = ""
    image: str | None = ""
    eventDate: str | None = ""


class ProductUpdateRequest(BaseModel):
    id: str
    retailPrice: float | None = None
    bulkPrice: float | None = None
    bulkMinimum: int | None = None
    gourmetRetailPrice: float | None = None
    gourmetBulkPrice: float | None = None
    availability: str | None = None


class ContactMessageRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    email: str = Field(..., min_length=3, max_length=150)
    phone: str | None = Field(default="", max_length=50)
    subject: str = Field(default="CoolerBox Website Enquiry", max_length=200)
    message: str = Field(..., min_length=1, max_length=2000)

