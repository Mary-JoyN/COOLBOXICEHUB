export interface Product {
  id: string;
  name: string;
  description: string;
  unit: string;
  size: number;
  sizeUnit: string;
  retailPrice: number | null;
  bulkPrice: number | null;
  bulkMinimum: number;
  availability: 'available' | 'advance-booking' | 'sold-out';
  leadDays: number;
  image?: string;
  samplePrice?: boolean;
  salesRevision?: number;
  minOrder?: number;
  orderMultiple?: number;
  maxPerOrder?: number | null;
  dailyCapacity?: number | null;
  gourmetRetailPrice?: number | null;
  gourmetBulkPrice?: number | null;
  baseId?: string;
  iceType?: 'regular' | 'gourmet';
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
  business?: string;
}

export interface OrderItem {
  id: string;
  name?: string;
  quantity: number;
  size?: number;
  sizeUnit?: string;
  iceType?: 'regular' | 'gourmet';
  unitPrice?: number | null;
  cents?: number | null;
}

export interface SupplierDraft {
  outlet?: string;
  area?: string;
}

export interface EventDraft {
  occasion?: string;
  eventName?: string;
  eventDate?: string;
  guests?: number;
  bottleMl?: number;
  label?: string;
  venue?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface OrderApproval {
  priceConfirmed: boolean;
  availabilityConfirmed: boolean;
  artworkApproved: boolean;
  productionAuthorised: boolean;
}

export interface OrderDetails {
  category: string;
  frequency: string;
  date: string;
  time?: string;
  fulfilment: 'collection' | 'delivery';
  address?: string;
  distance?: number | null;
  notes?: string;
  offerId?: string | null;
  service?: string;
  supplier?: SupplierDraft | null;
  event?: EventDraft | null;
  approval?: OrderApproval;
}

export interface Order {
  reference: string;
  status: 'new' | 'quoted' | 'confirmed' | 'completed' | 'cancelled';
  totalCents: number | null;
  customer: Customer;
  details: OrderDetails;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface CalculationInput {
  guests: number;
  reserve: number;
  icePerGuest: number;
  bagKg: number;
  waterPerGuest: number;
  bottleMl: number;
  icePrice: number | null;
  waterPrice: number | null;
}

export interface CalculationResult {
  iceKg: number;
  waterLitres: number;
  bags: number;
  bottles: number;
  packedIceKg: number;
  packedWaterLitres: number;
  iceCost: number | null;
  waterCost: number | null;
  total: number | null;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  status: string;
  createdAt: string;
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string;
  source: string;
}
