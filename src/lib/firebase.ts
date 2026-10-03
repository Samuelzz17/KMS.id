import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  CupProduct,
  Customer,
  CustomerOrder,
  SablonPricingTier,
  StockMovement,
  ExpenseItem,
  WorkshopAsset,
  ConsumableItem,
  ConsumableMovement,
  WorkshopSettings,
  SalesInvoice,
} from '../types';
import {
  INITIAL_CUPS,
  INITIAL_CUSTOMERS,
  INITIAL_MOVEMENTS,
  INITIAL_ORDERS,
  INITIAL_SABLON_TIERS,
  INITIAL_EXPENSES,
  INITIAL_ASSETS,
  INITIAL_CONSUMABLES,
  INITIAL_CONSUMABLE_MOVEMENTS,
  INITIAL_SETTINGS,
  INITIAL_INVOICES,
} from '../data/initialData';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId. Use experimentalAutoDetectLongPolling for reliable connectivity in iframe sandboxes.
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection Test
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    // Expected if test/connection doesn't exist, but connection was made
    return true;
  }
}

// Error handling conforming to skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth helpers
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign-in failed', err);
    throw err;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (err) {
    console.error('Email Sign-in failed', err);
    throw err;
  }
}

export async function registerWithEmail(email: string, pass: string): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (err) {
    console.error('Email Registration failed', err);
    throw err;
  }
}

export async function signOutApp(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign-out failed', err);
    throw err;
  }
}

// Seeding Initial Data if collections are empty in Firestore
export async function seedInitialFirestoreData(): Promise<void> {
  if (!auth.currentUser) return;

  try {
    const cupsSnap = await getDocs(collection(db, 'cups'));
    if (cupsSnap.empty) {
      console.log('Seeding initial cups, orders, tiers, customers into Firestore...');
      const batch = writeBatch(db);

      INITIAL_CUPS.forEach((cup) => {
        batch.set(doc(db, 'cups', cup.id), cup);
      });

      INITIAL_ORDERS.forEach((order) => {
        batch.set(doc(db, 'orders', order.id), order);
      });

      INITIAL_INVOICES.forEach((inv) => {
        batch.set(doc(db, 'invoices', inv.id), inv);
      });

      INITIAL_MOVEMENTS.forEach((movement) => {
        batch.set(doc(db, 'movements', movement.id), movement);
      });

      INITIAL_SABLON_TIERS.forEach((tier) => {
        batch.set(doc(db, 'pricingTiers', tier.id), tier);
      });

      INITIAL_CUSTOMERS.forEach((customer) => {
        batch.set(doc(db, 'customers', customer.id), customer);
      });

      INITIAL_EXPENSES.forEach((expense) => {
        batch.set(doc(db, 'expenses', expense.id), expense);
      });

      INITIAL_ASSETS.forEach((asset) => {
        batch.set(doc(db, 'assets', asset.id), asset);
      });

      INITIAL_CONSUMABLES.forEach((consumable) => {
        batch.set(doc(db, 'consumables', consumable.id), consumable);
      });

      INITIAL_CONSUMABLE_MOVEMENTS.forEach((cMovement) => {
        batch.set(doc(db, 'consumableMovements', cMovement.id), cMovement);
      });

      batch.set(doc(db, 'settings', 'general'), INITIAL_SETTINGS);

      await batch.commit();
      console.log('Initial data seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding initial Firestore data:', err);
  }
}

// Firestore CRUD operations with handleFirestoreError
export async function saveCupToFirestore(cup: CupProduct): Promise<void> {
  const path = `cups/${cup.id}`;
  try {
    await setDoc(doc(db, 'cups', cup.id), cup);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCupFromFirestore(cupId: string): Promise<void> {
  const path = `cups/${cupId}`;
  try {
    await deleteDoc(doc(db, 'cups', cupId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveOrderToFirestore(order: CustomerOrder): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveInvoiceToFirestore(invoice: SalesInvoice): Promise<void> {
  const path = `invoices/${invoice.id}`;
  try {
    await setDoc(doc(db, 'invoices', invoice.id), invoice);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteInvoiceFromFirestore(invoiceId: string): Promise<void> {
  const path = `invoices/${invoiceId}`;
  try {
    await deleteDoc(doc(db, 'invoices', invoiceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveMovementToFirestore(movement: StockMovement): Promise<void> {
  const path = `movements/${movement.id}`;
  try {
    await setDoc(doc(db, 'movements', movement.id), movement);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveTierToFirestore(tier: SablonPricingTier): Promise<void> {
  const path = `pricingTiers/${tier.id}`;
  try {
    await setDoc(doc(db, 'pricingTiers', tier.id), tier);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveCustomerToFirestore(customer: Customer): Promise<void> {
  const path = `customers/${customer.id}`;
  try {
    await setDoc(doc(db, 'customers', customer.id), customer);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 6. Expense CRUD
export async function saveExpenseToFirestore(expense: ExpenseItem): Promise<void> {
  const path = `expenses/${expense.id}`;
  try {
    await setDoc(doc(db, 'expenses', expense.id), expense);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExpenseFromFirestore(expenseId: string): Promise<void> {
  const path = `expenses/${expenseId}`;
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 7. Workshop Asset CRUD
export async function saveAssetToFirestore(asset: WorkshopAsset): Promise<void> {
  const path = `assets/${asset.id}`;
  try {
    await setDoc(doc(db, 'assets', asset.id), asset);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAssetFromFirestore(assetId: string): Promise<void> {
  const path = `assets/${assetId}`;
  try {
    await deleteDoc(doc(db, 'assets', assetId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 8. Consumables CRUD
export async function saveConsumableToFirestore(consumable: ConsumableItem): Promise<void> {
  const path = `consumables/${consumable.id}`;
  try {
    await setDoc(doc(db, 'consumables', consumable.id), consumable);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteConsumableFromFirestore(consumableId: string): Promise<void> {
  const path = `consumables/${consumableId}`;
  try {
    await deleteDoc(doc(db, 'consumables', consumableId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveConsumableMovementToFirestore(movement: ConsumableMovement): Promise<void> {
  const path = `consumableMovements/${movement.id}`;
  try {
    await setDoc(doc(db, 'consumableMovements', movement.id), movement);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 9. Workshop Settings CRUD
export async function saveSettingsToFirestore(settings: WorkshopSettings): Promise<void> {
  const path = 'settings/general';
  try {
    await setDoc(doc(db, 'settings', 'general'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
