import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Warehouse, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Info,
  Sliders,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { InventoryLevel } from '../types';

interface InventoryViewProps {
  inventory: InventoryLevel[];
  onTriggerDrawdown: (productId: string, amount: number) => void;
  onResetInventory: () => void;
}

export default function InventoryView({
  inventory,
  onTriggerDrawdown,
  onResetInventory
}: InventoryViewProps) {
  const [selectedHubId, setSelectedHubId] = useState<string>('all');
  const [adjustAmount, setAdjustAmount] = useState<string>('50');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Get unique location hubs for filtering
  const locations = Array.from(new Set(inventory.map(item => item.locationName)));

  // Filtered levels
  const filteredInventory = selectedHubId === 'all' 
    ? inventory 
    : inventory.filter(item => item.locationName === selectedHubId);

  const handleAdjust = (productId: string, isAddition: boolean) => {
    const val = parseFloat(adjustAmount);
    if (isNaN(val) || val <= 0) {
      alert('Please specify a positive adjustment amount.');
      return;
    }

    const directionMultiplier = isAddition ? -val : val; // Drawdown = reduces inventory (-amount) / Intake = adds (+amount)
    onTriggerDrawdown(productId, directionMultiplier);

    setFeedbackMsg(`Inventory adjusted successfully for Product!`);
    setTimeout(() => {
      setFeedbackMsg('');
    }, 1500);
  };

  return (
    <div className="space-y-6" id="inventory-view-container">
      {/* Header and Controls */}
      <section className="bg-bg-lowest border border-border-variant p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-sans text-primary">Mill &amp; Refinery Inventory</h2>
          <p className="text-sm text-text-muted">Raw material stockpile thresholds and processing capacity indicators.</p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div>
            <label className="block text-[9px] font-mono text-text-muted uppercase tracking-wider mb-1 font-bold">Facility Location</label>
            <select 
              value={selectedHubId} 
              onChange={(e) => setSelectedHubId(e.target.value)}
              className="bg-bg-lowest border border-border-outline rounded-lg px-3 py-2 text-xs font-sans focus:border-primary outline-none cursor-pointer"
            >
              <option value="all">All Facilities</option>
              {locations.map((loc, idx) => (
                <option key={idx} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => { onResetInventory(); setFeedbackMsg('Restored original capacities.'); setTimeout(() => setFeedbackMsg(''), 1000); }}
              className="px-4 py-2 text-xs font-mono font-bold uppercase transition-colors rounded-lg border border-border-variant text-primary hover:bg-bg-low flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset levels</span>
            </button>
          </div>
        </div>
      </section>

      {/* Grid of raw material levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="inventory-grid">
        {filteredInventory.map((item) => {
          const ratio = item.currentTons / item.maxCapacityTons;
          const isCritical = ratio >= 0.9;
          const isWarning = ratio >= 0.75 && ratio < 0.9;
          const percentageText = `${Math.round(ratio * 100)}%`;

          return (
            <div 
              key={`${item.productId}-${item.locationName}`} 
              className={`bg-bg-lowest border rounded-xl p-5 flex flex-col justify-between shadow-xs transition-all ${
                isCritical 
                  ? 'border-red-400 bg-red-50/10' 
                  : isWarning 
                  ? 'border-amber-400 bg-amber-50/10' 
                  : 'border-border-variant'
              }`}
            >
              <div className="space-y-3">
                {/* Location Hub tag */}
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] text-text-muted uppercase font-bold tracking-wider">{item.locationName}</span>
                  {isCritical && (
                    <span className="text-[10px] font-mono text-red-700 bg-red-100/80 px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1 select-none">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      CRITICAL
                    </span>
                  )}
                  {isWarning && (
                    <span className="text-[10px] font-mono text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1 select-none">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      WARNING
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="text-xl font-bold font-sans text-primary">{item.productName}</h3>
                  <div className="text-xs font-mono text-text-muted mt-0.5">Tonnage Level Capacity</div>
                </div>

                {/* Capacity metric stats */}
                <div className="flex items-baseline justify-between pt-1">
                  <div className="text-2xl font-bold text-primary font-mono select-all">
                    <span>{item.currentTons}</span>
                    <span className="text-xs text-text-muted font-normal ml-1">TONS</span>
                  </div>
                  <div className="text-xs font-mono text-text-muted uppercase">
                    Max: <span className="font-bold text-primary">{item.maxCapacityTons} T</span>
                  </div>
                </div>

                {/* Visual Capacity Bar */}
                <div className="space-y-1 pt-1">
                  <div className="h-3 rounded-full bg-bg-low overflow-hidden border border-border-variant/20 flex relative">
                    <div 
                      style={{ width: ratio > 1 ? '100%' : `${ratio * 100}%` }}
                      className={`h-full transition-all duration-500 rounded-full ${
                        isCritical 
                          ? 'bg-red-700' 
                          : isWarning 
                          ? 'bg-secondary-container' 
                          : 'bg-primary'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-text-muted uppercase select-none">
                    <span>Space Used</span>
                    <span className={isCritical ? 'text-red-700 font-bold' : isWarning ? 'text-secondary-container font-bold' : ''}>{percentageText}</span>
                  </div>
                </div>
              </div>

              {/* Simulation Intake controls inside card */}
              <div className="border-t border-bg-low pt-4 mt-5 space-y-3">
                <div className="flex items-center justify-between select-none">
                  <label className="text-[10px] font-mono text-text-muted uppercase font-bold flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-primary" />
                    SIMATION WORKBENCH
                  </label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className="w-14 bg-bg-lowest border border-border-outline rounded text-center py-0.5 text-xs font-mono"
                      min="1"
                    />
                    <span className="text-[10px] font-mono text-text-muted uppercase font-medium">Tns</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  {/* Drawdown */}
                  <button 
                    onClick={() => handleAdjust(item.productId, false)}
                    className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded transition-colors uppercase font-bold text-center cursor-pointer flex items-center justify-center gap-1"
                  >
                    <TrendingDown className="w-3 h-3" />
                    <span>DRAWDN (Intake)</span>
                  </button>

                  {/* Shipment Arrival intake */}
                  <button 
                    onClick={() => handleAdjust(item.productId, true)}
                    className="py-1.5 px-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 rounded transition-colors uppercase font-bold text-center cursor-pointer flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>Dischrg (Intake)</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjust Feedback Message */}
      {feedbackMsg && (
        <div className="fixed bottom-24 right-6 bg-primary text-white py-3 px-5 rounded-lg text-xs font-mono shadow-xl flex items-center gap-2 z-50 animate-bounce border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-primary-fixed" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Info Notice card */}
      <section className="bg-bg-low border border-border-variant p-5 rounded-xl flex items-start gap-4 shadow-xs">
        <Info className="w-6 h-6 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 font-sans text-primary text-xs leading-relaxed">
          <h4 className="font-mono text-[10px] uppercase tracking-wider font-bold">Mill Capacity &amp; Biofuel Intake Protocol</h4>
          <p>
            When raw material warehouses exceed 90% (marked as critical), operations automatically flags new waybills entering the cluster to reroute to adjacent refineries. Please keep levels balanced to prevent milling congestion.
          </p>
        </div>
      </section>
    </div>
  );
}
