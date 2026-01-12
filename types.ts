
export enum EquipmentStatus {
  ACTIVE = 'Active',
  UNDER_REPAIR = 'Under Repair',
  BROKEN = 'Broken',
  SCRAPPED = 'Scrapped',
  OUT = 'Out'
}

export enum TransactionType {
  IN = 'Masuk',
  OUT = 'Keluar',
  REPAIR = 'Rusak'
}

export enum UserRole {
  ADMIN = 'Admin',
  STAFF = 'Staff'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  brand: string;
  serialNumber: string;
  status: EquipmentStatus;
  vendor: string;
  purchaseDate: string;
  warrantyUntil: string;
  qrPath: string;
  price: number;
  stock: number;
}

export interface Transaction {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: TransactionType;
  date: string;
  note: string;
}

export interface Maintenance {
  id: string;
  equipmentId: string;
  equipmentName: string;
  date: string;
  technician: string;
  cost: number;
}
