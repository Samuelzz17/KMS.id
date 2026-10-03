/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import {
  auth,
  db,
  testConnection,
  signInWithGoogle,
  signOutApp,
  seedInitialFirestoreData,
  saveCupToFirestore,
  deleteCupFromFirestore,
  saveOrderToFirestore,
  deleteOrderFromFirestore,
  saveInvoiceToFirestore,
  deleteInvoiceFromFirestore,
  saveMovementToFirestore,
  saveTierToFirestore,
  saveCustomerToFirestore,
  saveExpenseToFirestore,
  deleteExpenseFromFirestore,
  saveAssetToFirestore,
  deleteAssetFromFirestore,
  saveConsumableToFirestore,
  deleteConsumableFromFirestore,
  saveConsumableMovementToFirestore,
  saveSettingsToFirestore,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import {
  CupProduct,
  Customer,
  CustomerOrder,
  ProductionStatus,
  SablonPricingTier,
  SablonSides,
  StockMovement,
  RecentActivityItem,
  ExpenseItem,
  WorkshopAsset,
  ConsumableItem,
  ConsumableMovement,
  WorkshopSettings,
  SalesInvoice,
} from './types';
import {
  formatNumber,
  getProductionStatusLabel,
} from './utils/formatters';
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
} from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { OrderManagement } from './components/OrderManagement';
import { StockManagement } from './components/StockManagement';
import { SablonVariants } from './components/SablonVariants';
import { CustomerManagement } from './components/CustomerManagement';
import { FinancialReports } from './components/FinancialReports';
import { ExpenseManagement } from './components/ExpenseManagement';
import { AssetManagement } from './components/AssetManagement';
import { ConsumablesInventory } from './components/ConsumablesInventory';
import { SettingsManagement } from './components/SettingsManagement';
import { CostEstimatorModal } from './components/CostEstimatorModal';
import Login from './components/Login';
import { NewOrderModal } from './components/NewOrderModal';
import { SpkModal } from './components/SpkModal';
import { PrintInvoiceModal } from './components/PrintInvoiceModal';
import { StockModal } from './components/StockModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Persistence State
  const [cups, setCups] = useState<CupProduct[]>(() => {
    const saved = localStorage.getItem('cupsablon_cups');
    return saved ? JSON.parse(saved) : INITIAL_CUPS;
  });

  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    const saved = localStorage.getItem('cupsablon_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [invoices, setInvoices] = useState<SalesInvoice[]>(() => {
    const saved = localStorage.getItem('cupsablon_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('cupsablon_movements');
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });

  const [pricingTiers, setPricingTiers] = useState<SablonPricingTier[]>(() => {
    const saved = localStorage.getItem('cupsablon_tiers');
    return saved ? JSON.parse(saved) : INITIAL_SABLON_TIERS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('cupsablon_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem('cupsablon_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [assets, setAssets] = useState<WorkshopAsset[]>(() => {
    try {
      const saved = localStorage.getItem('cupsablon_assets');
      return saved ? JSON.parse(saved) : INITIAL_ASSETS;
    } catch {
      return INITIAL_ASSETS;
    }
  });

  const [consumables, setConsumables] = useState<ConsumableItem[]>(() => {
    try {
      const saved = localStorage.getItem('cupsablon_consumables');
      return saved ? JSON.parse(saved) : INITIAL_CONSUMABLES;
    } catch {
      return INITIAL_CONSUMABLES;
    }
  });

  const [consumableMovements, setConsumableMovements] = useState<ConsumableMovement[]>(() => {
    try {
      const saved = localStorage.getItem('cupsablon_consumable_movements');
      return saved ? JSON.parse(saved) : INITIAL_CONSUMABLE_MOVEMENTS;
    } catch {
      return INITIAL_CONSUMABLE_MOVEMENTS;
    }
  });

  const [settings, setSettings] = useState<WorkshopSettings>(() => {
    try {
      const saved = localStorage.getItem('cupsablon_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Live Activities Log State
  const [customActivities, setCustomActivities] = useState<RecentActivityItem[]>(() => {
    try {
      const saved = localStorage.getItem('cupsablon_recent_activities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const logActivity = (item: RecentActivityItem) => {
    setCustomActivities((prev) => {
      const updated = [item, ...prev.filter((x) => x.id !== item.id)].slice(0, 30);
      try {
        localStorage.setItem('cupsablon_recent_activities', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save activity to localStorage', e);
      }
      return updated;
    });
  };

  // Modal States
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<CustomerOrder | null>(null);
  const [initialEstimate, setInitialEstimate] = useState<{
    cupId: string;
    quantity: number;
    sides: SablonSides;
    inkColor: string;
    filmFee: number;
    totalPrice: number;
  } | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<CustomerOrder | null>(null);
  const [prefilledCustomer, setPrefilledCustomer] = useState<Customer | null>(null);

  // SPK Creation Modal State
  const [isSpkModalOpen, setIsSpkModalOpen] = useState(false);
  const [spkModalOrder, setSpkModalOrder] = useState<CustomerOrder | null>(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalMode, setStockModalMode] = useState<'NEW_PRODUCT' | 'MUTATION'>('MUTATION');
  const [selectedStockCup, setSelectedStockCup] = useState<CupProduct | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };


  // Theme Mode State (Night Mode 'dark' vs Light Mode 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('kms_theme_mode');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('kms_theme_mode', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(nextTheme);
    showToast(`Beralih ke ${nextTheme === 'dark' ? 'Mode Gelap (Night Mode)' : 'Mode Terang (Light Mode)'}`);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);



  // Firebase Auth & Cloud Firestore State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Connection Test on Mount
  useEffect(() => {
    testConnection();
  }, []);

  // 2. Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
      if (user) {
        showToast(`Tersambung sebagai ${user.displayName || user.email}. Sinkronisasi cloud aktif.`);
        await seedInitialFirestoreData();
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Real-time Firestore Listeners (only when authenticated)
  useEffect(() => {
    if (!isAuthReady || !currentUser) return;

    const unsubCups = onSnapshot(
      collection(db, 'cups'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as CupProduct);
          setCups(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'cups')
    );

    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as CustomerOrder);
          setOrders(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'orders')
    );

    const unsubInvoices = onSnapshot(
      collection(db, 'invoices'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as SalesInvoice);
          setInvoices(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'invoices')
    );

    const unsubMovements = onSnapshot(
      collection(db, 'movements'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as StockMovement);
          setMovements(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'movements')
    );

    const unsubTiers = onSnapshot(
      collection(db, 'pricingTiers'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as SablonPricingTier);
          setPricingTiers(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'pricingTiers')
    );

    const unsubCustomers = onSnapshot(
      collection(db, 'customers'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as Customer);
          setCustomers(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'customers')
    );

    const unsubExpenses = onSnapshot(
      collection(db, 'expenses'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as ExpenseItem);
          setExpenses(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'expenses')
    );

    const unsubAssets = onSnapshot(
      collection(db, 'assets'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as WorkshopAsset);
          setAssets(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'assets')
    );

    const unsubConsumables = onSnapshot(
      collection(db, 'consumables'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as ConsumableItem);
          setConsumables(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'consumables')
    );

    const unsubConsumableMovements = onSnapshot(
      collection(db, 'consumableMovements'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as ConsumableMovement);
          setConsumableMovements(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'consumableMovements')
    );

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'general'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as WorkshopSettings);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'settings')
    );

    return () => {
      unsubCups();
      unsubOrders();
      unsubInvoices();
      unsubMovements();
      unsubTiers();
      unsubCustomers();
      unsubExpenses();
      unsubAssets();
      unsubConsumables();
      unsubConsumableMovements();
      unsubSettings();
    };
  }, [isAuthReady, currentUser]);

  // Auth Action Handlers
  const handleSignInGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      showToast('Gagal masuk dengan Google. Periksa koneksi internet.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutApp();
      showToast('Berhasil keluar dari akun Google.');
    } catch (err) {
      showToast('Gagal keluar.');
    }
  };

  // Full Firestore Sync Handler
  const handleSyncAllToFirestore = async () => {
    if (!currentUser) {
      showToast('Silakan masuk dengan Google terlebih dahulu untuk sinkronisasi cloud.');
      return;
    }
    setIsSyncing(true);
    try {
      for (const cup of cups) {
        await saveCupToFirestore(cup);
      }
      for (const order of orders) {
        await saveOrderToFirestore(order);
      }
      for (const inv of invoices) {
        await saveInvoiceToFirestore(inv);
      }
      for (const mov of movements) {
        await saveMovementToFirestore(mov);
      }
      for (const tier of pricingTiers) {
        await saveTierToFirestore(tier);
      }
      for (const cust of customers) {
        await saveCustomerToFirestore(cust);
      }
      for (const exp of expenses) {
        await saveExpenseToFirestore(exp);
      }
      for (const ast of assets) {
        await saveAssetToFirestore(ast);
      }
      for (const con of consumables) {
        await saveConsumableToFirestore(con);
      }
      for (const cmov of consumableMovements) {
        await saveConsumableMovementToFirestore(cmov);
      }
      await saveSettingsToFirestore(settings);
      showToast('Seluruh data workshop berhasil disinkronkan ke Firestore.');
    } catch (err) {
      showToast('Sebagian data gagal disinkronkan ke cloud.');
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('cupsablon_cups', JSON.stringify(cups));
  }, [cups]);

  useEffect(() => {
    localStorage.setItem('cupsablon_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cupsablon_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('cupsablon_movements', JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem('cupsablon_tiers', JSON.stringify(pricingTiers));
  }, [pricingTiers]);

  useEffect(() => {
    localStorage.setItem('cupsablon_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('cupsablon_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('cupsablon_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('cupsablon_consumables', JSON.stringify(consumables));
  }, [consumables]);

  useEffect(() => {
    localStorage.setItem('cupsablon_consumable_movements', JSON.stringify(consumableMovements));
  }, [consumableMovements]);

  useEffect(() => {
    localStorage.setItem('cupsablon_settings', JSON.stringify(settings));
  }, [settings]);

  // Order & SPK Handlers
  const handleOpenSpkModal = (order?: CustomerOrder | null) => {
    setSpkModalOrder(order || null);
    setIsSpkModalOpen(true);
  };

  const handleSaveSpk = (spkData: CustomerOrder, autoPrint?: boolean) => {
    const exists = orders.some((o) => o.id === spkData.id);
    if (exists) {
      setOrders((prev) => prev.map((o) => (o.id === spkData.id ? spkData : o)));
      if (currentUser) {
        saveOrderToFirestore(spkData).catch(console.error);
      }
    } else {
      // Direct Workshop SPK
      setOrders((prev) => [spkData, ...prev]);
      if (currentUser) {
        saveOrderToFirestore(spkData).catch(console.error);
      }
      // Deduct stock for direct workshop SPK
      setCups((prev) =>
        prev.map((c) => {
          if (c.id === spkData.cupProductId) {
            const updated = { ...c, stockPcs: Math.max(0, c.stockPcs - spkData.quantityPcs) };
            if (currentUser) saveCupToFirestore(updated).catch(console.error);
            return updated;
          }
          return c;
        })
      );
    }

    logActivity({
      id: `act-spk-${spkData.id}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'ORDER',
      title: `SPK Diterbitkan: ${spkData.orderNumber}`,
      description: `SPK untuk ${spkData.customerBrand} (${spkData.cupProductName} - ${formatNumber(spkData.quantityPcs)} pcs) ditugaskan ke operator ${spkData.operatorName || 'Produksi'}. Status: ${spkData.productionStatus}`,
      badgeLabel: 'SPK Workshop',
      referenceNo: spkData.orderNumber,
      operatorName: spkData.operatorName || 'Produksi',
      quantity: spkData.quantityPcs,
      productionStatus: spkData.productionStatus,
    });

    showToast(`SPK ${spkData.orderNumber} (${spkData.customerBrand}) berhasil diterbitkan!`);
    setIsSpkModalOpen(false);
    setSpkModalOrder(null);

    if (autoPrint) {
      setOrderToPrint(spkData);
      setIsPrintModalOpen(true);
    }
  };

  const handleUpdateOrder = (updatedOrder: CustomerOrder) => {
    const prevOrder = orders.find((o) => o.id === updatedOrder.id);
    if (prevOrder) {
      // Reconcile cup inventory if cup type or quantity was modified
      if (prevOrder.cupProductId === updatedOrder.cupProductId) {
        const qtyDiff = updatedOrder.quantityPcs - prevOrder.quantityPcs;
        if (qtyDiff !== 0) {
          setCups((prev) =>
            prev.map((c) => {
              if (c.id === updatedOrder.cupProductId) {
                const updatedCup = { ...c, stockPcs: Math.max(0, c.stockPcs - qtyDiff) };
                if (currentUser) saveCupToFirestore(updatedCup).catch(console.error);
                return updatedCup;
              }
              return c;
            })
          );
        }
      } else {
        // Cup product changed: return previous cup stock, deduct new cup stock
        setCups((prev) =>
          prev.map((c) => {
            if (c.id === prevOrder.cupProductId) {
              const updated = { ...c, stockPcs: c.stockPcs + prevOrder.quantityPcs };
              if (currentUser) saveCupToFirestore(updated).catch(console.error);
              return updated;
            }
            if (c.id === updatedOrder.cupProductId) {
              const updated = { ...c, stockPcs: Math.max(0, c.stockPcs - updatedOrder.quantityPcs) };
              if (currentUser) saveCupToFirestore(updated).catch(console.error);
              return updated;
            }
            return c;
          })
        );
      }
    }

    if (updatedOrder.totalPrice > 0 && updatedOrder.downPayment >= updatedOrder.totalPrice) {
      updatedOrder.paymentStatus = 'LUNAS';
      updatedOrder.remainingPayment = 0;
    } else {
      updatedOrder.remainingPayment = Math.max(0, updatedOrder.totalPrice - updatedOrder.downPayment);
      if (updatedOrder.downPayment > 0) {
        updatedOrder.paymentStatus = 'DP';
      } else {
        updatedOrder.paymentStatus = 'BELUM_BAYAR';
      }
    }

    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    if (currentUser) {
      saveOrderToFirestore(updatedOrder).catch(console.error);
    }

    logActivity({
      id: `act-edit-${updatedOrder.id}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'ORDER',
      title: `Order Diedit • ${updatedOrder.orderNumber}`,
      description: `Perubahan data pesanan ${updatedOrder.customerBrand} (${updatedOrder.cupProductName} - ${formatNumber(updatedOrder.quantityPcs)} pcs) berhasil disimpan.`,
      badgeLabel: 'Diedit',
      referenceNo: updatedOrder.orderNumber,
      operatorName: updatedOrder.operatorName || 'Admin',
      quantity: updatedOrder.quantityPcs,
    });

    showToast(`Pesanan ${updatedOrder.orderNumber} berhasil diperbarui.`);
    setEditingOrder(null);
    setInitialEstimate(null);
    setIsNewOrderOpen(false);
  };

  const handleSaveSalesInvoice = (newInvoice: SalesInvoice, newSpks: CustomerOrder[]) => {
    // 1. Save invoice
    setInvoices(prev => [newInvoice, ...prev]);
    if (currentUser) {
      saveInvoiceToFirestore(newInvoice).catch(console.error);
    }

    // 2. Adjust stock, record movements, save SPKs
    const newMovements: StockMovement[] = [];
    let totalCups = 0;

    newSpks.forEach(spk => {
      setCups(prev => prev.map(c => {
        if (c.id === spk.cupProductId) {
          const updatedCup = { ...c, stockPcs: Math.max(0, c.stockPcs - spk.quantityPcs) };
          if (currentUser) { saveCupToFirestore(updatedCup).catch(console.error); }
          return updatedCup;
        }
        return c;
      }));

      const mov: StockMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: new Date().toISOString(),
        cupProductId: spk.cupProductId,
        cupProductName: spk.cupProductName,
        type: 'OUT_SABLON',
        quantityPcs: spk.quantityPcs,
        notes: `Pengurangan stok otomatis untuk SPK ${spk.orderNumber} (${spk.customerBrand})`,
        referenceOrderNo: spk.orderNumber,
        operatorName: spk.operatorName || 'Admin',
      };
      newMovements.push(mov);
      totalCups += spk.quantityPcs;
    });

    setMovements(prev => [...newMovements, ...prev]);
    if (currentUser) {
      newMovements.forEach(m => saveMovementToFirestore(m).catch(console.error));
    }

    setOrders(prev => [...newSpks, ...prev]);
    if (currentUser) {
      newSpks.forEach(spk => saveOrderToFirestore(spk).catch(console.error));
    }

    // 3. Customer Data
    setCustomers((prev) => {
      const existingIdx = prev.findIndex(
        (c) =>
          c.brand.toLowerCase() === newInvoice.customerBrand.toLowerCase() ||
          c.name.toLowerCase() === newInvoice.customerName.toLowerCase()
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const updatedCustomer: Customer = {
          ...updated[existingIdx],
          lastOrderDate: new Date().toISOString().slice(0, 10),
          totalOrdersCount: updated[existingIdx].totalOrdersCount + 1,
          totalQuantityCups: updated[existingIdx].totalQuantityCups + totalCups,
          phone: newInvoice.customerPhone || updated[existingIdx].phone,
        };
        updated[existingIdx] = updatedCustomer;
        if (currentUser) {
          saveCustomerToFirestore(updatedCustomer).catch(console.error);
        }
        return updated;
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: newInvoice.customerName,
          brand: newInvoice.customerBrand,
          phone: newInvoice.customerPhone,
          address: newInvoice.customerAddress,
          firstOrderDate: new Date().toISOString().slice(0, 10),
          lastOrderDate: new Date().toISOString().slice(0, 10),
          totalOrdersCount: 1,
          totalQuantityCups: totalCups,
        };
        if (currentUser) {
          saveCustomerToFirestore(newCust).catch(console.error);
        }
        return [newCust, ...prev];
      }
    });

    // 4. Log activity
    logActivity({
      id: `act-inv-${newInvoice.id}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'ORDER',
      title: `Invoice Baru • ${newInvoice.invoiceNumber}`,
      description: `${newInvoice.customerBrand} — ${newSpks.length} Jenis Cup (${formatNumber(totalCups)} pcs)`,
      badgeLabel: 'Sales Baru',
      referenceNo: newInvoice.invoiceNumber,
      operatorName: 'Admin Sales',
      quantity: totalCups,
    });

    showToast(`Invoice ${newInvoice.invoiceNumber} berhasil diterbitkan dengan ${newSpks.length} SPK.`);
    setEditingOrder(null);
    setInitialEstimate(null);
    setIsNewOrderOpen(false);
  };

  const handleDeleteOrder = (orderId: string, restoreStock: boolean = true) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    // Restore stock if requested and status is not yet BATAL
    if (restoreStock && target.productionStatus !== 'BATAL') {
      setCups((prev) =>
        prev.map((c) => {
          if (c.id === target.cupProductId) {
            const updated = { ...c, stockPcs: c.stockPcs + target.quantityPcs };
            if (currentUser) saveCupToFirestore(updated).catch(console.error);
            return updated;
          }
          return c;
        })
      );

      // Record cancellation movement
      const mov: StockMovement = {
        id: `mov-ret-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: new Date().toISOString(),
        cupProductId: target.cupProductId,
        cupProductName: target.cupProductName,
        type: 'IN',
        quantityPcs: target.quantityPcs,
        notes: `Pengembalian stok (Batal / Hapus Order: ${target.orderNumber})`,
        referenceOrderNo: target.orderNumber,
        operatorName: 'Sistem',
      };
      setMovements((prev) => [mov, ...prev]);
      if (currentUser) saveMovementToFirestore(mov).catch(console.error);
    }

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (currentUser) {
      deleteOrderFromFirestore(orderId).catch(console.error);
    }

    logActivity({
      id: `act-del-${orderId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'ORDER',
      title: `Order Dihapus • ${target.orderNumber}`,
      description: `Pesanan ${target.customerBrand} (${formatNumber(target.quantityPcs)} pcs) telah dihapus dari sistem.${restoreStock ? ' Stok cup dikembalikan ke gudang.' : ''}`,
      badgeLabel: 'Dihapus',
      badgeVariant: 'danger',
      referenceNo: target.orderNumber,
      operatorName: 'Admin',
      quantity: target.quantityPcs,
    });

    showToast(`Pesanan ${target.orderNumber} berhasil dihapus.${restoreStock ? ' Stok cup telah dikembalikan.' : ''}`);
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: ProductionStatus) => {
    const target = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, productionStatus: nextStatus };
          if (currentUser) {
            saveOrderToFirestore(updated).catch(console.error);
          }
          return updated;
        }
        return o;
      })
    );

    if (target) {
      logActivity({
        id: `act-status-${orderId}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: 'ORDER',
        title: `Pembaruan SPK • ${target.orderNumber}`,
        description: `${target.customerBrand} — ${getProductionStatusLabel(target.productionStatus).label} → ${getProductionStatusLabel(nextStatus).label}`,
        badgeLabel: getProductionStatusLabel(nextStatus).label,
        referenceNo: target.orderNumber,
        operatorName: target.operatorName || 'Operator Cetak',
        productionStatus: nextStatus,
        quantity: target.quantityPcs,
      });
    }

    showToast(`Status SPK berhasil diubah.`);
  };

  const handleAdvanceOrderStatus = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    const orderFlow: ProductionStatus[] = [
      'MENUNGGU_SPK',
      'ANTREAN',
      'SETTING_FILM',
      'PROSES_SABLON',
      'FINISHING',
      'SIAP_AMBIL',
      'SELESAI',
    ];
    const idx = orderFlow.indexOf(target.productionStatus);
    if (idx >= 0 && idx < orderFlow.length - 1) {
      handleUpdateOrderStatus(orderId, orderFlow[idx + 1]);
    }
  };

  // Stock Handlers
  const handleSaveNewProduct = (newCup: CupProduct) => {
    setCups((prev) => [...prev, newCup]);
    if (currentUser) {
      saveCupToFirestore(newCup).catch(console.error);
    }
    showToast(`Varian cup "${newCup.name}" berhasil ditambahkan.`);
  };

  const handleSaveMutation = (mutation: StockMovement) => {
    setMovements((prev) => [mutation, ...prev]);
    if (currentUser) {
      saveMovementToFirestore(mutation).catch(console.error);
    }

    const typeLabel =
      mutation.type === 'IN'
        ? 'Stok Masuk (Restock)'
        : mutation.type === 'OUT_SABLON'
        ? 'Stok Keluar Sablon'
        : mutation.type === 'OUT_REJECT'
        ? 'Cup Reject'
        : 'Penjualan Polos';

    logActivity({
      id: `act-mov-${mutation.id}-${Date.now()}`,
      timestamp: mutation.date || new Date().toISOString(),
      category: 'STOCK',
      title: `Mutasi Stok: ${typeLabel}`,
      description: `${mutation.cupProductName} • ${mutation.type === 'IN' ? '+' : '-'}${formatNumber(mutation.quantityPcs)} pcs${mutation.notes ? ` (${mutation.notes})` : ''}`,
      badgeLabel: `${mutation.type === 'IN' ? '+' : '-'}${formatNumber(mutation.quantityPcs)} pcs`,
      referenceNo: mutation.referenceOrderNo,
      operatorName: mutation.operatorName || 'Gudang Utama',
      movementType: mutation.type,
      quantity: mutation.quantityPcs,
    });

    setCups((prev) =>
      prev.map((c) => {
        if (c.id === mutation.cupProductId) {
          let updatedStock = c.stockPcs;
          if (mutation.type === 'IN') {
            updatedStock += mutation.quantityPcs;
          } else {
            updatedStock = Math.max(0, updatedStock - mutation.quantityPcs);
          }
          const updatedCup = { ...c, stockPcs: updatedStock };
          if (currentUser) {
            saveCupToFirestore(updatedCup).catch(console.error);
          }
          return updatedCup;
        }
        return c;
      })
    );

    showToast(`Mutasi stok ${mutation.cupProductName} berhasil dicatat.`);
  };

  // Pricing Handlers
  const handleUpdateTier = (updatedTier: SablonPricingTier) => {
    setPricingTiers((prev) =>
      prev.map((t) => {
        if (t.id === updatedTier.id) {
          if (currentUser) {
            saveTierToFirestore(updatedTier).catch(console.error);
          }
          return updatedTier;
        }
        return t;
      })
    );
    showToast('Tier harga sablon berhasil diperbarui.');
  };

  // Expense Handlers
  const handleSaveExpense = (newExpense: ExpenseItem) => {
    setExpenses((prev) => {
      const exists = prev.some((e) => e.id === newExpense.id);
      if (exists) {
        return prev.map((e) => (e.id === newExpense.id ? newExpense : e));
      }
      return [newExpense, ...prev];
    });
    if (currentUser) {
      saveExpenseToFirestore(newExpense).catch(console.error);
    }
    showToast(`Pengeluaran "${newExpense.title}" berhasil dicatat.`);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (currentUser) {
      deleteExpenseFromFirestore(id).catch(console.error);
    }
    showToast('Catatan pengeluaran berhasil dihapus.');
  };

  // Asset Handlers
  const handleSaveAsset = (newAsset: WorkshopAsset) => {
    setAssets((prev) => {
      const exists = prev.some((a) => a.id === newAsset.id);
      if (exists) {
        return prev.map((a) => (a.id === newAsset.id ? newAsset : a));
      }
      return [newAsset, ...prev];
    });
    if (currentUser) {
      saveAssetToFirestore(newAsset).catch(console.error);
    }
    showToast(`Aset "${newAsset.name}" berhasil disimpan.`);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (currentUser) {
      deleteAssetFromFirestore(id).catch(console.error);
    }
    showToast('Aset berhasil dihapus dari inventaris.');
  };

  // Consumables Handlers
  const handleSaveConsumable = (newItem: ConsumableItem) => {
    setConsumables((prev) => {
      const exists = prev.some((c) => c.id === newItem.id);
      if (exists) {
        return prev.map((c) => (c.id === newItem.id ? newItem : c));
      }
      return [...prev, newItem];
    });
    if (currentUser) {
      saveConsumableToFirestore(newItem).catch(console.error);
    }
    showToast(`Katalog bahan "${newItem.name}" berhasil disimpan.`);
  };

  const handleDeleteConsumable = (id: string) => {
    setConsumables((prev) => prev.filter((c) => c.id !== id));
    if (currentUser) {
      deleteConsumableFromFirestore(id).catch(console.error);
    }
    showToast('Katalog bahan berhasil dihapus.');
  };

  const handleSaveConsumableMovement = (movement: ConsumableMovement, newStock: number) => {
    setConsumableMovements((prev) => [movement, ...prev]);
    setConsumables((prev) =>
      prev.map((c) => (c.id === movement.consumableId ? { ...c, stock: newStock } : c))
    );
    if (currentUser) {
      saveConsumableMovementToFirestore(movement).catch(console.error);
      const target = consumables.find((c) => c.id === movement.consumableId);
      if (target) {
        saveConsumableToFirestore({ ...target, stock: newStock }).catch(console.error);
      }
    }
    showToast(`Mutasi bahan "${movement.consumableName}" berhasil dicatat.`);
  };

  // Settings Handlers
  const handleSaveSettings = (newSettings: WorkshopSettings) => {
    setSettings(newSettings);
    if (currentUser) {
      saveSettingsToFirestore(newSettings).catch(console.error);
    }
    showToast('Pengaturan workshop & faktur berhasil diperbarui.');
  };

  const handleResetSettings = () => {
    setSettings(INITIAL_SETTINGS);
    if (currentUser) {
      saveSettingsToFirestore(INITIAL_SETTINGS).catch(console.error);
    }
    showToast('Pengaturan workshop dikembalikan ke bawaan.');
  };

  // Backup & Restore
  const handleExportData = () => {
    const data = {
      cups,
      orders,
      invoices,
      movements,
      pricingTiers,
      customers,
      expenses,
      assets,
      consumables,
      consumableMovements,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-cupsablon-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File cadangan JSON berhasil diunduh.');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.cups && parsed.orders) {
          setCups(parsed.cups);
          setOrders(parsed.orders);
          if (parsed.invoices) setInvoices(parsed.invoices);
          if (parsed.movements) setMovements(parsed.movements);
          if (parsed.pricingTiers) setPricingTiers(parsed.pricingTiers);
          if (parsed.customers) setCustomers(parsed.customers);
          if (parsed.expenses) setExpenses(parsed.expenses);
          if (parsed.assets) setAssets(parsed.assets);
          if (parsed.consumables) setConsumables(parsed.consumables);
          if (parsed.consumableMovements) setConsumableMovements(parsed.consumableMovements);
          if (parsed.settings) setSettings(parsed.settings);
          showToast('Data workshop berhasil dipulihkan dari file!');
        } else {
          alert('Format file JSON tidak sesuai struktur data sistem.');
        }
      } catch {
        alert('Gagal membaca file JSON cadangan.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    setCups(INITIAL_CUPS);
    setOrders(INITIAL_ORDERS);
    setInvoices(INITIAL_INVOICES);
    setMovements(INITIAL_MOVEMENTS);
    setPricingTiers(INITIAL_SABLON_TIERS);
    setCustomers(INITIAL_CUSTOMERS);
    setExpenses(INITIAL_EXPENSES);
    setAssets(INITIAL_ASSETS);
    setConsumables(INITIAL_CONSUMABLES);
    setConsumableMovements(INITIAL_CONSUMABLE_MOVEMENTS);
    setSettings(INITIAL_SETTINGS);
    localStorage.clear();
    showToast('Data workshop telah direset ke data contoh awal.');
  };

  // Metrik alert
  const lowStockCount = cups.filter((c) => c.stockPcs <= c.minStockAlert).length;
  const activeOrdersCount = orders.filter(
    (o) => o.productionStatus !== 'SELESAI' && o.productionStatus !== 'BATAL'
  ).length;
  const pendingSpkCount = orders.filter((o) => o.productionStatus === 'MENUNGGU_SPK').length;

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-inter animate-pulse">Memuat...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={() => showToast('Login berhasil')} />;
  }

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row font-inter transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-[#f4f5f8] text-zinc-900 selection:bg-black selection:text-white'
          : 'bg-black text-zinc-100 selection:bg-white selection:text-black'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 border shadow-xl ${
            theme === 'light'
              ? 'bg-white/95 text-zinc-900 border-zinc-200 shadow-lg'
              : 'glass-panel bg-black/90 text-white border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.8)]'
          }`}
        >
          <span className={`w-2 h-2 rounded-full animate-pulse ${theme === 'light' ? 'bg-zinc-900' : 'bg-white'}`} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewOrder={() => {
          setEditingOrder(null);
          setInitialEstimate(null);
          setIsNewOrderOpen(true);
        }}
        onOpenSpkModal={() => handleOpenSpkModal()}
        onOpenEstimator={() => setIsEstimatorOpen(true)}
        lowStockCount={lowStockCount}
        activeOrdersCount={activeOrdersCount}
        pendingSpkCount={pendingSpkCount}
        currentUser={currentUser}
        onSignInGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}

        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Right Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            orders={orders}
            cups={cups}
            movements={movements}
            customActivities={customActivities}
            onOpenNewOrder={() => {
              setEditingOrder(null);
              setInitialEstimate(null);
              setIsNewOrderOpen(true);
            }}
            onOpenSpkModal={(order) => handleOpenSpkModal(order)}
            onOpenEstimator={() => setIsEstimatorOpen(true)}
            onOpenStockModal={(cup) => {
              setSelectedStockCup(cup || null);
              setStockModalMode('MUTATION');
              setIsStockModalOpen(true);
            }}
            onSelectOrderToPrint={(order) => {
              setOrderToPrint(order);
              setIsPrintModalOpen(true);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
          />
        )}

        {activeTab === 'orders' && (
          <OrderManagement
            orders={orders}
            onOpenNewOrder={() => {
              setEditingOrder(null);
              setInitialEstimate(null);
              setIsNewOrderOpen(true);
            }}
            onOpenSpkModal={(order) => handleOpenSpkModal(order)}
            onEditOrder={(order) => {
              handleOpenSpkModal(order);
            }}
            onDeleteOrder={handleDeleteOrder}
            onPrintOrder={(order) => {
              setOrderToPrint(order);
              setIsPrintModalOpen(true);
            }}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'stock' && (
          <StockManagement
            cups={cups}
            movements={movements}
            onOpenNewProductModal={() => {
              setSelectedStockCup(null);
              setStockModalMode('NEW_PRODUCT');
              setIsStockModalOpen(true);
            }}
            onOpenMutationModal={(cup) => {
              setSelectedStockCup(cup || null);
              setStockModalMode('MUTATION');
              setIsStockModalOpen(true);
            }}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseManagement
            expenses={expenses}
            onSaveExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'assets' && (
          <AssetManagement
            assets={assets}
            onSaveAsset={handleSaveAsset}
            onDeleteAsset={handleDeleteAsset}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'consumables' && (
          <ConsumablesInventory
            consumables={consumables}
            movements={consumableMovements}
            onSaveConsumable={handleSaveConsumable}
            onDeleteConsumable={handleDeleteConsumable}
            onSaveMovement={handleSaveConsumableMovement}
            currentUser={currentUser}
            orders={orders}
          />
        )}

        {activeTab === 'sablon' && (
          <SablonVariants
            pricingTiers={pricingTiers}
            onUpdateTier={handleUpdateTier}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerManagement
            customers={customers}
            orders={orders}
            onOpenNewOrderForCustomer={(customer) => {
              setPrefilledCustomer(customer);
              setEditingOrder(null);
              setInitialEstimate(null);
              setIsNewOrderOpen(true);
            }}
          />
        )}

        {activeTab === 'reports' && (
          <FinancialReports
            orders={orders}
            cups={cups}
            movements={movements}
            expenses={expenses}
            assets={assets}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onResetData={handleResetData}
            currentUser={currentUser}
            onSyncToFirestore={handleSyncAllToFirestore}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsManagement
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onResetSettings={handleResetSettings}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 text-center text-xs font-inter transition-colors ${
          theme === 'light'
            ? 'border-zinc-200 bg-white/70 text-zinc-600'
            : 'border-white/10 glass-panel text-zinc-400'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">
            &copy; 2026 <strong className="font-montserrat font-black">KMS.id</strong> • Sistem Manajemen Stok Cup Plastik & Produksi Sablon
          </p>
          <div className="flex items-center gap-4 opacity-70">
            <span>Versi Pro Glassmorphic</span>
            <span>•</span>
            <span className="font-medium">Mode {theme === 'dark' ? 'Night (Gelap)' : 'Light (Terang)'}</span>
            <span>•</span>
            <span className="font-medium">Navigasi Kiri (Left Sidebar)</span>
          </div>
        </div>
      </footer>
      </div>

      {/* Modals */}
      {/* 1. Kalkulator Estimasi Cepat WA */}
      <CostEstimatorModal
        isOpen={isEstimatorOpen}
        onClose={() => setIsEstimatorOpen(false)}
        cups={cups}
        pricingTiers={pricingTiers}
        onCreateOrderFromEstimate={(est) => {
          setInitialEstimate(est);
          setEditingOrder(null);
          setIsNewOrderOpen(true);
        }}
      />

      {/* 2. Modal Form Sales (Invoice Penjualan) */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => {
          setIsNewOrderOpen(false);
          setEditingOrder(null);
          setInitialEstimate(null);
          setPrefilledCustomer(null);
        }}
        onUpdateOrder={handleUpdateOrder}
        onSaveSalesInvoice={handleSaveSalesInvoice}
        cups={cups}
        pricingTiers={pricingTiers}
        customers={customers}
        editingOrder={editingOrder}
        initialEstimate={initialEstimate}
        prefilledCustomer={prefilledCustomer}
      />

      {/* 3. Modal Form Pembuatan & Penerbitan SPK Produksi */}
      <SpkModal
        isOpen={isSpkModalOpen}
        onClose={() => {
          setIsSpkModalOpen(false);
          setSpkModalOrder(null);
        }}
        onSaveSpk={handleSaveSpk}
        orders={orders}
        cups={cups}
        preSelectedOrder={spkModalOrder}
      />

      {/* 3. Modal Cetak Faktur & SPK Produksi */}
      <PrintInvoiceModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setOrderToPrint(null);
        }}
        order={orderToPrint}
        settings={settings}
      />

      {/* 4. Modal Produk Cup Baru / Catat Mutasi */}
      <StockModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedStockCup(null);
        }}
        mode={stockModalMode}
        cups={cups}
        selectedCup={selectedStockCup}
        onSaveNewProduct={handleSaveNewProduct}
        onSaveMutation={handleSaveMutation}
      />
    </div>
  );
}
