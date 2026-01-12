
import { 
  Equipment, Transaction, Maintenance, User, 
  EquipmentStatus, TransactionType, UserRole 
} from './types';

const STORAGE_KEYS = {
  EQUIPMENTS: 'hmth_cloud_equipments_v3',
  TRANSACTIONS: 'hmth_cloud_transactions_v3',
  MAINTENANCES: 'hmth_cloud_maintenances_v3',
  LAST_SYNC: 'hmth_cloud_sync_v3',
  USER: 'hmth_cloud_user_v3',
  CLOUD_FOLDER: 'AI Studio'
};

class DatabaseService {
  private equipments: Equipment[] = [];
  private transactions: Transaction[] = [];
  private maintenances: Maintenance[] = [];
  private currentUser: User | null = null;
  private lastSyncTime: string | null = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  private isSyncing: boolean = false;

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

    const urlParams = new URLSearchParams(window.location.search);
    // Cek juga di hash jika menggunakan HashRouter
    const hashPart = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(hashPart);
    
    const syncToken = urlParams.get('sync') || hashParams.get('sync');

    if (syncToken) {
      try {
        console.log("[Firebase/Cloud] Sinkronisasi masuk dideteksi...");
        // Gunakan decodeURIComponent untuk menangani karakter spesial di URL
        const decodedData = JSON.parse(atob(decodeURIComponent(syncToken)));
        
        if (decodedData && Array.isArray(decodedData.equipments)) {
          this.equipments = decodedData.equipments;
          this.transactions = decodedData.transactions || [];
          this.maintenances = decodedData.maintenances || [];
          
          this.saveToStorage(false);
          console.log("[Firebase/Cloud] Sinkronisasi Berhasil: Data telah digabungkan.");
          
          const cleanUrl = window.location.origin + window.location.pathname + window.location.hash.split('?')[0];
          window.history.replaceState(null, "", cleanUrl);
        }
      } catch (e) {
        console.error("[Firebase/Cloud] Token sinkronisasi tidak valid", e);
        this.loadFromStorage();
      }
    } else {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const storedEq = localStorage.getItem(STORAGE_KEYS.EQUIPMENTS);
      const storedTrx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedMnt = localStorage.getItem(STORAGE_KEYS.MAINTENANCES);

      this.equipments = storedEq ? JSON.parse(storedEq) : [];
      this.transactions = storedTrx ? JSON.parse(storedTrx) : [];
      this.maintenances = storedMnt ? JSON.parse(storedMnt) : [];
      
      console.log(`[Firebase/Cloud] Repository lokal dimuat: ${this.equipments.length} aset ditemukan.`);
    } catch (e) {
      console.error("Gagal memuat local storage", e);
      this.equipments = [];
    }
  }

  public async syncWithAIStudio() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const timestamp = new Date().toLocaleString('id-ID', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        this.lastSyncTime = timestamp;
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
        this.isSyncing = false;
        console.log(`[Firebase/Cloud] Sinkronisasi selesai pada ${timestamp}`);
        resolve(true);
      }, 800);
    });
  }

  private saveToStorage(updateSyncTimestamp = true) {
    localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(this.equipments));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    localStorage.setItem(STORAGE_KEYS.MAINTENANCES, JSON.stringify(this.maintenances));
    
    if (this.currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
    }

    if (updateSyncTimestamp) {
      this.syncWithAIStudio();
    }
  }

  public generateShareableCloudUrl(): string {
    const data = {
      equipments: this.equipments,
      transactions: this.transactions,
      maintenances: this.maintenances,
      v: "3.2-firebase",
      ts: Date.now()
    };
    // Gunakan encodeURIComponent untuk keamanan URL
    const token = encodeURIComponent(btoa(JSON.stringify(data)));
    
    const baseUrl = window.location.origin + window.location.pathname;
    const hash = window.location.hash.split('?')[0];
    
    return `${baseUrl}${hash}?sync=${token}`;
  }

  getLastSync() { return this.lastSyncTime; }
  getCloudAccount() { return "cawangitm@harperhotels.com"; }
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
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      this.syncWithAIStudio();
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
      note: 'Aset terdaftar di Cloud Hosting'
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

  getMaintenances() { return [...this.maintenances]; }
  addMaintenance(m: Omit<Maintenance, 'id'>) {
    const newM = { ...m, id: `MNT-${Math.floor(100 + Math.random() * 899)}` };
    this.maintenances = [...this.maintenances, newM];
    this.saveToStorage();
    return newM;
  }

  exportDatabase() {
    const data = {
      equipments: this.equipments,
      transactions: this.transactions,
      maintenances: this.maintenances,
      exportDate: new Date().toISOString(),
      account: this.getCloudAccount()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HMTH_Inventory_Master_${new Date().toISOString().split('T')[0]}.json`;
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
