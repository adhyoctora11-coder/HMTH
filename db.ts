
import { 
  Equipment, Transaction, Maintenance, User, 
  EquipmentStatus, TransactionType, UserRole 
} from './types';

const STORAGE_KEYS = {
  EQUIPMENTS: 'hmth_cloud_equipments_v3',
  TRANSACTIONS: 'hmth_cloud_transactions_v3',
  MAINTENANCES: 'hmth_cloud_maintenances_v3',
  LAST_SYNC: 'hmth_cloud_sync_v3',
  USER: 'hmth_cloud_user_v3'
};

class DatabaseService {
  private equipments: Equipment[] = [];
  private transactions: Transaction[] = [];
  private maintenances: Maintenance[] = [];
  private currentUser: User | null = null;
  private lastSyncTime: string | null = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);

  constructor() {
    this.init();
  }

  private init() {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        console.error("Failed to restore user session");
      }
    }
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedEq = localStorage.getItem(STORAGE_KEYS.EQUIPMENTS);
      const storedTrx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedMnt = localStorage.getItem(STORAGE_KEYS.MAINTENANCES);

      this.equipments = storedEq ? JSON.parse(storedEq) : [];
      this.transactions = storedTrx ? JSON.parse(storedTrx) : [];
      this.maintenances = storedMnt ? JSON.parse(storedMnt) : [];
    } catch (e) {
      console.error("Gagal memuat local storage", e);
      this.equipments = [];
    }
  }

  private saveToStorage() {
    localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(this.equipments));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    localStorage.setItem(STORAGE_KEYS.MAINTENANCES, JSON.stringify(this.maintenances));
    
    if (this.currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
    }
    
    const timestamp = new Date().toLocaleString('id-ID');
    this.lastSyncTime = timestamp;
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  }

  getCurrentUser() { return this.currentUser; }
  
  login(email: string, pass: string): User | null {
    const lowerEmail = email.toLowerCase();
    let user: User | null = null;

    if ((lowerEmail === 'cawangitm@harperhotels.com' || lowerEmail === 'cawang') && pass === 'Harper2026') {
      user = { 
        id: 'USR-MASTER-IT', 
        name: 'IT Cawang', 
        email: 'cawangitm@harperhotels.com', 
        role: UserRole.ADMIN 
      };
    } else if ((lowerEmail === 'ayu' || lowerEmail === 'ayu@kitchen.pro') && pass === 'Harper2026') {
      user = { id: 'USR-ADMIN-AYU', name: 'Ayu', email: 'ayu@kitchen.pro', role: UserRole.ADMIN };
    } else if ((lowerEmail === 'hadhi' || lowerEmail === 'hadhi@kitchen.pro') && pass === 'Harper2026') {
      user = { id: 'USR-STAFF-HADHI', name: 'Hadhi', email: 'hadhi@kitchen.pro', role: UserRole.STAFF };
    }

    if (user) {
      this.currentUser = user;
      this.saveToStorage();
      return user;
    }
    return null;
  }
  
  logout() { 
    this.currentUser = null; 
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  getEquipments() { return [...this.equipments]; }
  getEquipmentById(id: string) { return this.equipments.find(e => e.id === id) || null; }
  
  addEquipment(eq: Omit<Equipment, 'id' | 'qrPath'>) {
    const id = `EQ-${Math.floor(100 + Math.random() * 899)}`;
    const newEq = { ...eq, id, qrPath: id };
    this.equipments = [...this.equipments, newEq];
    this.addTransaction({
      equipmentId: id,
      equipmentName: newEq.name,
      type: TransactionType.IN,
      note: 'Aset baru terdaftar'
    });
    this.saveToStorage();
    return newEq;
  }

  addBulkEquipments(items: Omit<Equipment, 'id' | 'qrPath'>[]) {
    const newItems = items.map(item => {
      const id = `EQ-${Math.floor(100 + Math.random() * 899)}`;
      return { ...item, id, qrPath: id };
    });
    this.equipments = [...this.equipments, ...newItems];
    this.saveToStorage();
    return newItems;
  }

  updateEquipment(id: string, updates: Partial<Equipment>) {
    this.equipments = this.equipments.map(e => e.id === id ? { ...e, ...updates } : e);
    this.saveToStorage();
  }

  reportEquipmentBroken(id: string, quantity: number, note: string) {
    const eq = this.equipments.find(e => e.id === id);
    if (!eq || eq.status !== EquipmentStatus.ACTIVE) return;

    const actualQty = Math.min(quantity, eq.stock);

    if (actualQty >= eq.stock) {
      this.updateEquipment(id, { status: EquipmentStatus.BROKEN });
    } else {
      this.updateEquipment(id, { stock: eq.stock - actualQty });
      const brokenId = `EQ-${Math.floor(100 + Math.random() * 899)}`;
      const brokenEq: Equipment = {
        ...eq,
        id: brokenId,
        qrPath: brokenId,
        stock: actualQty,
        status: EquipmentStatus.BROKEN
      };
      this.equipments = [...this.equipments, brokenEq];
    }

    this.addTransaction({
      equipmentId: id,
      equipmentName: eq.name,
      type: TransactionType.REPAIR,
      note: `${actualQty} Unit Rusak: ${note || 'Tanpa catatan'}`
    });
    
    this.saveToStorage();
  }

  deleteEquipment(id: string) {
    this.equipments = this.equipments.filter(e => e.id !== id);
    this.transactions = this.transactions.filter(t => t.equipmentId !== id);
    this.maintenances = this.maintenances.filter(m => m.equipmentId !== id);
    this.saveToStorage();
  }

  getTransactions() { 
    return [...this.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 
  }

  addTransaction(trx: Omit<Transaction, 'id' | 'date'>) {
    const newTrx = { 
      ...trx, 
      id: `TRX-${Math.floor(1000 + Math.random() * 8999)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    this.transactions = [newTrx, ...this.transactions];
    this.saveToStorage();
    return newTrx;
  }

  getMaintenances() { return [...this.maintenances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); }
  
  addMaintenance(m: Omit<Maintenance, 'id'>, updateStatus: boolean = true) {
    const eq = this.equipments.find(e => e.id === m.equipmentId);
    if (!eq) return null;

    const newM = { ...m, id: `MNT-${Math.floor(100 + Math.random() * 899)}` };
    this.maintenances = [newM, ...this.maintenances];
    
    // Alur: Maintenance mengurangi stok Active dan membuat stok Under Repair
    if (updateStatus) {
      const actualQty = Math.min(m.quantity, eq.stock);
      
      if (actualQty >= eq.stock && eq.status === EquipmentStatus.ACTIVE) {
        this.updateEquipment(eq.id, { status: EquipmentStatus.UNDER_REPAIR });
      } else if (eq.status === EquipmentStatus.ACTIVE) {
        this.updateEquipment(eq.id, { stock: eq.stock - actualQty });
        const repairId = `EQ-${Math.floor(100 + Math.random() * 899)}`;
        const repairEq: Equipment = {
          ...eq,
          id: repairId,
          qrPath: repairId,
          stock: actualQty,
          status: EquipmentStatus.UNDER_REPAIR
        };
        this.equipments = [...this.equipments, repairEq];
      }
    }

    this.addTransaction({
      equipmentId: m.equipmentId,
      equipmentName: m.equipmentName,
      type: TransactionType.REPAIR,
      note: `Service Log: ${m.quantity} Unit diservis (${m.technician})`
    });
    
    this.saveToStorage();
    return newM;
  }

  deleteMaintenance(id: string) {
    this.maintenances = this.maintenances.filter(m => m.id !== id);
    this.saveToStorage();
  }

  exportDatabase() {
    const data = {
      equipments: this.equipments,
      transactions: this.transactions,
      maintenances: this.maintenances,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HMTH_Inventory_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async importDatabase(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          if (data && Array.isArray(data.equipments)) {
            this.equipments = data.equipments;
            this.transactions = data.transactions || [];
            this.maintenances = data.maintenances || [];
            this.saveToStorage();
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (err) {
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }
}

export const db = new DatabaseService();
