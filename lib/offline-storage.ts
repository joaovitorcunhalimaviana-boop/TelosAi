/**
 * Offline Storage Library
 * Uses IndexedDB for storing patient data while offline
 */

const DB_NAME = 'pos-op-db';
const DB_VERSION = 1;
const PENDING_PATIENTS_STORE = 'pending-patients';
const OFFLINE_QUEUE_STORE = 'offline-queue';

export interface PendingPatient {
  id?: number;
  nome: string;
  telefone: string;
  cirurgia: string;
  dataCirurgia: string;
  horaCirurgia?: string;
  observacoes?: string;
  timestamp: number;
  synced: boolean;
}

export interface OfflineRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
}

/**
 * Opens IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create pending patients store
      if (!db.objectStoreNames.contains(PENDING_PATIENTS_STORE)) {
        const store = db.createObjectStore(PENDING_PATIENTS_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
      }

      // Create offline queue store
      if (!db.objectStoreNames.contains(OFFLINE_QUEUE_STORE)) {
        const queueStore = db.createObjectStore(OFFLINE_QUEUE_STORE, {
          keyPath: 'timestamp',
        });
        queueStore.createIndex('url', 'url', { unique: false });
      }
    };
  });
}

/**
 * Save pending patient registration for offline use
 */
export async function savePendingPatient(
  patientData: Omit<PendingPatient, 'id' | 'timestamp' | 'synced'>
): Promise<number> {
  const db = await openDB();

  const patient: Omit<PendingPatient, 'id'> = {
    ...patientData,
    timestamp: Date.now(),
    synced: false,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_PATIENTS_STORE], 'readwrite');
    const store = transaction.objectStore(PENDING_PATIENTS_STORE);
    const request = store.add(patient);

    request.onsuccess = () => {
      console.log('Patient saved offline with ID:', request.result);
      resolve(request.result as number);
    };

    request.onerror = () => {
      console.error('Error saving patient offline:', request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all pending patients (not yet synced)
 */
export async function getPendingPatients(): Promise<PendingPatient[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_PATIENTS_STORE], 'readonly');
    const store = transaction.objectStore(PENDING_PATIENTS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      // Filter only unsynced patients
      const allPatients = request.result as PendingPatient[];
      const unsyncedPatients = allPatients.filter(patient => !patient.synced);
      resolve(unsyncedPatients);
    };

    request.onerror = () => {
      console.error('Error getting pending patients:', request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all patients (synced and unsynced)
 */
export async function getAllOfflinePatients(): Promise<PendingPatient[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_PATIENTS_STORE], 'readonly');
    const store = transaction.objectStore(PENDING_PATIENTS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Error getting all offline patients:', request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Mark patient as synced
 */
export async function markPatientAsSynced(id: number): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_PATIENTS_STORE], 'readwrite');
    const store = transaction.objectStore(PENDING_PATIENTS_STORE);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const patient = getRequest.result;
      if (patient) {
        patient.synced = true;
        const updateRequest = store.put(patient);

        updateRequest.onsuccess = () => {
          console.log('Patient marked as synced:', id);
          resolve();
        };

        updateRequest.onerror = () => {
          reject(updateRequest.error);
        };
      } else {
        reject(new Error('Patient not found'));
      }
    };

    getRequest.onerror = () => {
      reject(getRequest.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Delete pending patient
 */
export async function deletePendingPatient(id: number): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_PATIENTS_STORE], 'readwrite');
    const store = transaction.objectStore(PENDING_PATIENTS_STORE);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log('Patient deleted:', id);
      resolve();
    };

    request.onerror = () => {
      console.error('Error deleting patient:', request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Sync pending patients to server
 */
export async function syncPendingPatients(): Promise<{
  success: number;
  failed: number;
  errors: Array<{ id: number; error: string }>;
}> {
  const pendingPatients = await getPendingPatients();
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ id: number; error: string }>,
  };

  for (const patient of pendingPatients) {
    try {
      // Send to API
      const response = await fetch('/api/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: patient.nome,
          telefone: patient.telefone,
          cirurgia: patient.cirurgia,
          dataCirurgia: patient.dataCirurgia,
          horaCirurgia: patient.horaCirurgia,
          observacoes: patient.observacoes,
        }),
      });

      if (response.ok) {
        await markPatientAsSynced(patient.id!);
        results.success++;
      } else {
        const errorData = await response.json().catch(() => ({}));
        results.failed++;
        results.errors.push({
          id: patient.id!,
          error: errorData.message || 'Erro desconhecido',
        });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        id: patient.id!,
        error: error instanceof Error ? error.message : 'Erro de rede',
      });
    }
  }

  return results;
}

/**
 * Clear all synced patients from storage
 */
export async function clearSyncedPatients(): Promise<number> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_PATIENTS_STORE], 'readwrite');
    const store = transaction.objectStore(PENDING_PATIENTS_STORE);
    const index = store.index('synced');
    const request = index.openCursor(IDBKeyRange.only(true));

    let deletedCount = 0;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        deletedCount++;
        cursor.continue();
      }
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      console.log('Cleared synced patients:', deletedCount);
      db.close();
      resolve(deletedCount);
    };
  });
}

/**
 * Check if browser supports IndexedDB
 */
export function isOfflineStorageSupported(): boolean {
  return 'indexedDB' in window;
}

/**
 * Get storage usage estimate
 */
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  percentage: number;
} | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;

    return {
      usage,
      quota,
      percentage,
    };
  }
  return null;
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
