import { Driver, LocationHub, Waybill, InventoryLevel } from './types';

export const INITIAL_DRIVERS: Driver[] = [
  { id: 'drv-1', name: 'Arif Mansur', vehicle: 'Truck #422' },
  { id: 'drv-2', name: 'Siti Rahayu', vehicle: 'Trailer #08' },
  { id: 'drv-3', name: 'Budi Santoso', vehicle: 'Pickup #91' },
  { id: 'drv-4', name: 'Hendra Wijaya', vehicle: 'Container #150' },
  { id: 'drv-5', name: 'Amira Sari', vehicle: 'Flatbed #64' },
];

export const PLANTATIONS: LocationHub[] = [
  { id: 'pl-1', name: 'Sukabumi Palm Estate', type: 'plantation', coords: { lat: -6.9184, lng: 106.9261 } },
  { id: 'pl-2', name: 'Merauke Agri Plantation', type: 'plantation', coords: { lat: -8.4991, lng: 140.4046 } },
  { id: 'pl-3', name: 'Kalimantan Jati Farm', type: 'plantation', coords: { lat: -1.2654, lng: 115.2441 } },
  { id: 'pl-4', name: 'Riau Sawit Utama', type: 'plantation', coords: { lat: 0.5071, lng: 101.4478 } },
  { id: 'pl-5', name: 'Sumatera Highlands', type: 'plantation', coords: { lat: -2.3114, lng: 101.4169 } },
];

export const MILLS: LocationHub[] = [
  { id: 'ml-1', name: 'Cilegon Biodiesel Refinery', type: 'mill', coords: { lat: -6.0125, lng: 106.0247 } },
  { id: 'ml-2', name: 'Belawan Milling Hub', type: 'mill', coords: { lat: 3.7842, lng: 98.6908 } },
  { id: 'ml-3', name: 'Dumai Processing Facility', type: 'mill', coords: { lat: 1.6667, lng: 101.4500 } },
  { id: 'ml-4', name: 'Pontianak Refining Plant', type: 'mill', coords: { lat: -0.0263, lng: 109.3425 } },
  { id: 'ml-5', name: 'Surabaya Grain & Oils', type: 'mill', coords: { lat: -7.2575, lng: 112.7521 } },
];

export const PRODUCT_TYPES = [
  'Palm Oil',
  'Shell',
  'Kernel Chunk',
  'Fruit Bunches',
  'Biomass',
  'Vegetables'
];

export const INITIAL_WAYBILLS: Waybill[] = [
  {
    id: 'wb-1001',
    waybillNumber: 'AGL-2026-0549',
    productType: 'Palm Oil',
    quantity: 45.5,
    originId: 'pl-1',
    destinationId: 'ml-1',
    driverId: 'drv-1',
    status: 'in_transit',
    createdAt: '2026-05-21T08:30:00Z',
    estimatedDistanceKm: 124,
    notes: 'Premium grade crude palm oil. Secure tanker seals are locked.',
    qrCodeValue: 'AGRILOG-MANIFEST-2026-0549-SECURE-SEAL-889BQC',
    etaHours: 3.5,
    currentStep: 2,
  },
  {
    id: 'wb-1002',
    waybillNumber: 'AGL-2026-0548',
    productType: 'Kernel Chunk',
    quantity: 12.0,
    originId: 'pl-3',
    destinationId: 'ml-4',
    driverId: 'drv-2',
    status: 'delivered',
    createdAt: '2026-05-20T11:15:00Z',
    estimatedDistanceKm: 185,
    notes: 'Secondary feed standard. Keep dry during transport.',
    qrCodeValue: 'AGRILOG-MANIFEST-2026-0548-SECURE-DRY-314TYC',
    etaHours: 0,
    currentStep: 4,
  },
  {
    id: 'wb-1003',
    waybillNumber: 'AGL-2026-0547',
    productType: 'Fruit Bunches',
    quantity: 28.3,
    originId: 'pl-4',
    destinationId: 'ml-3',
    driverId: 'drv-3',
    status: 'draft',
    createdAt: '2026-05-21T14:20:00Z',
    estimatedDistanceKm: 98,
    notes: 'Fresh harvest. Priority processing requested within 24h.',
    qrCodeValue: 'AGRILOG-MANIFEST-2026-0547-TEMP-DRAFT',
    etaHours: 2.0,
    currentStep: 0,
  },
  {
    id: 'wb-1004',
    waybillNumber: 'AGL-2026-0546',
    productType: 'Biomass',
    quantity: 50.0,
    originId: 'pl-5',
    destinationId: 'ml-2',
    driverId: 'drv-4',
    status: 'in_transit',
    createdAt: '2026-05-21T06:45:00Z',
    estimatedDistanceKm: 420,
    notes: 'Organic materials for biofuel converter.',
    qrCodeValue: 'AGRILOG-MANIFEST-2026-0546-BIOM-9922',
    etaHours: 8.0,
    currentStep: 1,
  }
];

export const INITIAL_INVENTORY: InventoryLevel[] = [
  { productId: 'p1', productName: 'Palm Oil', currentTons: 1120, maxCapacityTons: 2000, locationName: 'Belawan Milling Hub' },
  { productId: 'p2', productName: 'Shell', currentTons: 480, maxCapacityTons: 1200, locationName: 'Cilegon Biodiesel Refinery' },
  { productId: 'p3', productName: 'Kernel Chunk', currentTons: 890, maxCapacityTons: 1000, locationName: 'Dumai Processing Facility' },
  { productId: 'p4', productName: 'Fruit Bunches', currentTons: 1450, maxCapacityTons: 1500, locationName: 'Pontianak Refining Plant' },
  { productId: 'p5', productName: 'Biomass', currentTons: 150, maxCapacityTons: 800, locationName: 'Surabaya Grain & Oils' },
  { productId: 'p6', productName: 'Vegetables', currentTons: 42, maxCapacityTons: 200, locationName: 'Cilegon Biodiesel Refinery' },
];

export const getDistance = (originId: string, destinationId: string): number => {
  if (originId === 'pl-1' && destinationId === 'ml-1') return 124;
  if (originId === 'pl-3' && destinationId === 'ml-4') return 185;
  if (originId === 'pl-4' && destinationId === 'ml-3') return 98;
  
  // Deterministic calculation based on string sums for other pairs
  let sum = 0;
  for (let i = 0; i < originId.length; i++) sum += originId.charCodeAt(i);
  for (let i = 0; i < destinationId.length; i++) sum += destinationId.charCodeAt(i);
  
  return 100 + (sum % 25) * 15;
};
