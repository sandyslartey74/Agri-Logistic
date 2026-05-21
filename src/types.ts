export interface Driver {
  id: string;
  name: string;
  vehicle: string;
  avatarUrl?: string;
}

export interface LocationHub {
  id: string;
  name: string;
  type: 'plantation' | 'mill';
  coords: { lat: number; lng: number };
}

export interface Waybill {
  id: string;
  waybillNumber: string;
  productType: string;
  quantity: number;
  originId: string;
  destinationId: string;
  driverId: string;
  status: 'draft' | 'generated' | 'in_transit' | 'delivered';
  createdAt: string;
  estimatedDistanceKm: number;
  notes?: string;
  qrCodeValue?: string;
  etaHours?: number;
  currentStep?: number;
}

export interface InventoryLevel {
  productId: string;
  productName: string;
  currentTons: number;
  maxCapacityTons: number;
  locationName: string;
}
