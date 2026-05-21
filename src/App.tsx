/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Navigation, 
  FileText, 
  Warehouse, 
  Search, 
  User,
  Heart,
  Scale,
  Sparkles,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';

import { Waybill, InventoryLevel } from './types';
import { INITIAL_WAYBILLS, INITIAL_INVENTORY } from './data';

import DashboardView from './components/DashboardView';
import TrackingView from './components/TrackingView';
import WaybillsView from './components/WaybillsView';
import InventoryView from './components/InventoryView';

type TabType = 'dashboard' | 'tracking' | 'waybills' | 'inventory';

export default function App() {
  // --- Persistent Local States ---
  const [activeTab, setActiveTab] = useState<TabType>('waybills'); // Default to waybills tab as depicted in main screenshot!
  const [selectedWaybillId, setSelectedWaybillId] = useState<string | undefined>(undefined);
  const [forceShowForm, setForceShowForm] = useState<boolean>(false);
  
  const [waybills, setWaybills] = useState<Waybill[]>(() => {
    const saved = localStorage.getItem('agrilog_waybills');
    return saved ? JSON.parse(saved) : INITIAL_WAYBILLS;
  });

  const [inventory, setInventory] = useState<InventoryLevel[]>(() => {
    const saved = localStorage.getItem('agrilog_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  // Share global search query state
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('agrilog_waybills', JSON.stringify(waybills));
  }, [waybills]);

  useEffect(() => {
    localStorage.setItem('agrilog_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // --- Handlers ---
  const handleCreateWaybill = (newWb: Partial<Waybill>) => {
    const freshWb: Waybill = {
      id: `wb-${Date.now()}`,
      waybillNumber: newWb.waybillNumber || `AGL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      productType: newWb.productType || 'Palm Oil',
      quantity: newWb.quantity || 0,
      originId: newWb.originId || 'pl-1',
      destinationId: newWb.destinationId || 'ml-1',
      driverId: newWb.driverId || 'drv-1',
      status: newWb.status || 'draft',
      createdAt: newWb.createdAt || new Date().toISOString(),
      estimatedDistanceKm: newWb.estimatedDistanceKm || 124,
      notes: newWb.notes,
      qrCodeValue: newWb.qrCodeValue,
      etaHours: newWb.etaHours,
      currentStep: newWb.currentStep || 0
    };

    setWaybills(prev => [freshWb, ...prev]);
    setForceShowForm(false);
  };

  const handleUpdateStatus = (id: string, status: Waybill['status']) => {
    setWaybills(prev => prev.map(w => {
      if (w.id === id) {
        // Also advance visual step helper
        let step = w.currentStep || 0;
        if (status === 'draft') step = 0;
        else if (status === 'in_transit') step = 2; // Starts mid-transit
        else if (status === 'delivered') step = 4; // Finished!
        
        return { 
          ...w, 
          status, 
          currentStep: step,
          etaHours: status === 'delivered' ? 0 : (w.etaHours || 2)
        };
      }
      return w;
    }));
  };

  const handleDeleteWaybill = (id: string) => {
    setWaybills(prev => prev.filter(w => w.id !== id));
    if (selectedWaybillId === id) {
      setSelectedWaybillId(undefined);
    }
  };

  const handleTriggerDrawdown = (productId: string, amount: number) => {
    setInventory(prev => prev.map(item => {
      if (item.productId === productId) {
        // Prevent negative levels or overflow bounds
        const calc = item.currentTons + amount;
        const boundedTons = Math.max(0, Math.min(item.maxCapacityTons, calc));
        return {
          ...item,
          currentTons: Math.round(boundedTons * 10) / 10
        };
      }
      return item;
    }));
  };

  const handleResetInventory = () => {
    setInventory(INITIAL_INVENTORY);
  };

  // Helper: Redirect to Waybill and open "New form"
  const handleShortcutWaybillForm = (forceForm = false) => {
    setForceShowForm(forceForm);
    setActiveTab('waybills');
  };

  // Helper: Open specific waybill tracking
  const handleShortcutTracking = (waybillId?: string) => {
    if (waybillId) {
      setSelectedWaybillId(waybillId);
    }
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-main font-sans flex flex-col antialiased">
      
      {/* 1. Header (TopAppBar) */}
      <header className="fixed top-0 w-full z-40 bg-bg-lowest border-b border-border-variant/60 flex justify-between items-center px-6 h-16 shadow-xs select-none">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary-fixed border border-primary-container/20">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold font-sans text-primary leading-none tracking-tight">AgriLogistics</h1>
            <span className="text-[9px] font-mono text-text-muted mt-0.5 uppercase tracking-widest font-bold">Standard Operations Console</span>
          </div>
        </div>

        {/* Desktop Central Navigation Menu Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-bg-low p-1.5 rounded-lg border border-border-variant/40" id="desktop-tabs-nav">
          <button 
            onClick={() => { setActiveTab('dashboard'); setForceShowForm(false); }}
            className={`px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dashboard' 
                ? 'bg-primary text-white shadow-xs' 
                : 'text-text-muted hover:text-primary hover:bg-bg-normal'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('tracking'); setForceShowForm(false); }}
            className={`px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tracking' 
                ? 'bg-primary text-white shadow-xs' 
                : 'text-text-muted hover:text-primary hover:bg-bg-normal'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Tracking</span>
          </button>

          <button 
            onClick={() => { setActiveTab('waybills'); setForceShowForm(false); }}
            className={`px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'waybills' 
                ? 'bg-primary text-white shadow-xs' 
                : 'text-text-muted hover:text-primary hover:bg-bg-normal'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Waybills</span>
          </button>

          <button 
            onClick={() => { setActiveTab('inventory'); setForceShowForm(false); }}
            className={`px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inventory' 
                ? 'bg-primary text-white shadow-xs' 
                : 'text-text-muted hover:text-primary hover:bg-bg-normal'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>Inventory</span>
          </button>
        </nav>

        {/* Right side icon utilities */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setGlobalSearchOpen(true)}
            className="p-2 hover:bg-bg-low text-text-muted hover:text-primary rounded-full transition-colors cursor-pointer"
            title="Search logs"
          >
            <Search className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center gap-1 border-l border-border-variant/60 pl-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-text-muted block font-bold">OPERATOR ACTIVE</span>
              <span className="text-xs font-sans text-primary font-medium">think.retirement22</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Global search helper modal overlay */}
      {globalSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center p-4 pt-20" id="global-search-modal">
          <div className="bg-bg-lowest border border-border-variant rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-bg-low pb-3">
              <h3 className="font-mono text-xs text-text-muted uppercase font-bold">Manifest Quick Search</h3>
              <button 
                onClick={() => { setGlobalSearchOpen(false); setGlobalSearchQuery(''); }}
                className="p-1 hover:bg-bg-low rounded-full transition-colors cursor-pointer text-text-muted hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
              <input 
                type="text" 
                placeholder="Type manifest number or product type..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-bg-lowest border border-border-outline rounded-lg pl-10 pr-4 py-2.5 text-sm font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Quick search match results */}
            <div className="max-h-60 overflow-y-auto divide-y divide-bg-low text-xs font-mono">
              {globalSearchQuery ? (
                waybills.filter(wb => 
                  wb.waybillNumber.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
                  wb.productType.toLowerCase().includes(globalSearchQuery.toLowerCase())
                ).map((wb) => (
                  <div 
                    key={wb.id} 
                    onClick={() => {
                      setSelectedWaybillId(wb.id);
                      setGlobalSearchOpen(false);
                      setGlobalSearchQuery('');
                      setActiveTab('waybills');
                    }}
                    className="py-2.5 px-3 hover:bg-bg-low rounded-md transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="text-primary font-bold block">{wb.waybillNumber}</span>
                      <span className="text-text-muted text-[10px]">{wb.productType} — {wb.quantity} Tons</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {wb.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-text-muted py-8 font-sans text-xs">
                  Enter a keyword or complete Waybill ID to quickly jump to verification logs.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Space */}
      <main className="max-w-4xl mx-auto px-6 py-6 mt-16 flex-1 w-full pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView 
            waybills={waybills}
            inventory={inventory}
            onNavigateToWaybills={handleShortcutWaybillForm}
            onNavigateToTracking={handleShortcutTracking}
          />
        )}

        {activeTab === 'tracking' && (
          <TrackingView 
            waybills={waybills}
            selectedWaybillId={selectedWaybillId}
            onSelectWaybill={(id) => setSelectedWaybillId(id)}
          />
        )}

        {activeTab === 'waybills' && (
          <WaybillsView 
            waybills={waybills}
            onCreateWaybill={handleCreateWaybill}
            onUpdateStatus={handleUpdateStatus}
            onDeleteWaybill={handleDeleteWaybill}
            forceShowForm={forceShowForm}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView 
            inventory={inventory}
            onTriggerDrawdown={handleTriggerDrawdown}
            onResetInventory={handleResetInventory}
          />
        )}
      </main>

      {/* 4. Bottom Navigation Bar (Mobile View Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-40 rounded-t-xl border-t border-border-variant/60 bg-bg-low flex justify-around items-center h-20 shadow-lg select-none">
        
        {/* Tab 1: Dashboard */}
        <button 
          onClick={() => { setActiveTab('dashboard'); setForceShowForm(false); }}
          className={`flex flex-col items-center justify-center h-full px-4 py-1.5 transition-all outline-none rounded-lg active:scale-95 cursor-pointer ${
            activeTab === 'dashboard' ? 'text-primary scale-102 font-bold' : 'text-text-muted'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
          <span className="font-mono text-[11px] font-semibold mt-1">Dashboard</span>
        </button>

        {/* Tab 2: Tracking */}
        <button 
          onClick={() => { setActiveTab('tracking'); setForceShowForm(false); }}
          className={`flex flex-col items-center justify-center h-full px-4 py-1.5 transition-all outline-none rounded-lg active:scale-95 cursor-pointer ${
            activeTab === 'tracking' ? 'text-primary scale-102 font-bold' : 'text-text-muted'
          }`}
        >
          <Navigation className={`w-5 h-5 ${activeTab === 'tracking' ? 'stroke-[2.5]' : ''}`} />
          <span className="font-mono text-[11px] font-semibold mt-1">Tracking</span>
        </button>

        {/* Tab 3: Waybills */}
        <button 
          onClick={() => { setActiveTab('waybills'); setForceShowForm(false); }}
          className={`flex flex-col items-center justify-center transition-all outline-none active:scale-95 cursor-pointer ${
            activeTab === 'waybills' 
              ? 'bg-primary-container text-opacity-100 text-[#86af99] rounded-xl px-4 py-2.5 shadow-sm border border-emerald-950/20' 
              : 'text-text-muted py-1.5'
          }`}
        >
          <FileText className={`w-5 h-5 ${activeTab === 'waybills' ? 'text-white' : ''}`} />
          <span className={`font-mono text-[11px] font-semibold mt-1 ${activeTab === 'waybills' ? 'text-white font-bold' : ''}`}>Waybills</span>
        </button>

        {/* Tab 4: Inventory */}
        <button 
          onClick={() => { setActiveTab('inventory'); setForceShowForm(false); }}
          className={`flex flex-col items-center justify-center h-full px-4 py-1.5 transition-all outline-none rounded-lg active:scale-95 cursor-pointer ${
            activeTab === 'inventory' ? 'text-primary scale-102 font-bold' : 'text-text-muted'
          }`}
        >
          <Warehouse className={`w-5 h-5 ${activeTab === 'inventory' ? 'stroke-[2.5]' : ''}`} />
          <span className="font-mono text-[11px] font-semibold mt-1">Inventory</span>
        </button>
      </nav>

    </div>
  );
}

