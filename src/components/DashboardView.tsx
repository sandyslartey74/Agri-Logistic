import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  Clock, 
  ArrowUpRight, 
  Activity, 
  FileText, 
  Navigation, 
  UserCheck, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { Waybill, InventoryLevel } from '../types';
import { PLANTATIONS, MILLS } from '../data';

interface DashboardViewProps {
  waybills: Waybill[];
  inventory: InventoryLevel[];
  onNavigateToWaybills: (forceNewForm?: boolean) => void;
  onNavigateToTracking: (selectedWaybillId?: string) => void;
}

export default function DashboardView({
  waybills,
  inventory,
  onNavigateToWaybills,
  onNavigateToTracking
}: DashboardViewProps) {
  // Aggregate data
  const totalWaybills = waybills.length;
  const activeWaybills = waybills.filter(w => w.status === 'in_transit');
  const deliveredWaybills = waybills.filter(w => w.status === 'delivered');
  const draftWaybills = waybills.filter(w => w.status === 'draft');
  
  const totalDeliveredTons = deliveredWaybills.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalInTransitTons = activeWaybills.reduce((acc, curr) => acc + curr.quantity, 0);

  // Check inventory alerts (over 90% capacity)
  const inventoryAlertsCount = inventory.filter(inv => (inv.currentTons / inv.maxCapacityTons) >= 0.9).length;

  // Week days for custom chart
  const weeklyTonnage = [
    { day: 'Mon', tons: 45 },
    { day: 'Tue', tons: 60 },
    { day: 'Wed', tons: 32 },
    { day: 'Thu', tons: 85 },
    { day: 'Fri', tons: 72 },
    { day: 'Sat', tons: 20 },
    { day: 'Sun', tons: 15 },
  ];
  const maxWeeklyTone = Math.max(...weeklyTonnage.map(w => w.tons));

  // Get plantation name helper
  const getPlantationName = (id: string) => PLANTATIONS.find(p => p.id === id)?.name || 'Unknown Plantation';
  const getMillName = (id: string) => MILLS.find(m => m.id === id)?.name || 'Unknown Mill';

  return (
    <div className="space-y-6" id="dashboard-view-container">
      {/* Title & Stats Overview */}
      <section className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-sans text-primary tracking-tight">Logistics Dashboard</h2>
        <p className="text-text-muted font-sans text-sm md:text-base">Real-time telemetry and manifest tracking across regions.</p>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
        {/* Metric 1 */}
        <div className="bg-bg-lowest border border-border-variant p-5 rounded-xl flex items-start justify-between shadow-xs" id="metric-delivered">
          <div className="space-y-1">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Delivered Material</span>
            <div className="text-2xl font-bold text-primary font-sans flex items-baseline gap-1">
              <span>{totalDeliveredTons.toFixed(1)}</span>
              <span className="text-xs text-text-muted font-mono">TONS</span>
            </div>
            <p className="text-xs text-emerald-700 flex items-center gap-1 font-sans font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% from last week</span>
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-bg-lowest border border-border-variant p-5 rounded-xl flex items-start justify-between shadow-xs" id="metric-transit">
          <div className="space-y-1">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Active In Transit</span>
            <div className="text-2xl font-bold text-primary font-sans flex items-baseline gap-1">
              <span>{activeWaybills.length}</span>
              <span className="text-xs text-text-muted font-mono">MANIFESTS</span>
            </div>
            <p className="text-xs text-text-muted font-sans mt-1">
              Transporting <strong className="text-primary font-medium">{totalInTransitTons.toFixed(1)} tons</strong>
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-primary-fixed text-primary">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-bg-lowest border border-border-variant p-5 rounded-xl flex items-start justify-between shadow-xs" id="metric-drafts">
          <div className="space-y-1">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Pending Drafts</span>
            <div className="text-2xl font-bold text-primary font-sans flex items-baseline gap-1">
              <span>{draftWaybills.length}</span>
              <span className="text-xs text-text-muted font-mono">SAVED</span>
            </div>
            <p className="text-xs text-text-muted font-sans mt-1">
              Ready for driver assignment
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-800">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-bg-lowest border border-border-variant p-5 rounded-xl flex items-start justify-between shadow-xs" id="metric-alerts">
          <div className="space-y-1">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Capacity Alert</span>
            <div className={`text-2xl font-bold font-sans flex items-baseline gap-1 ${inventoryAlertsCount > 0 ? 'text-secondary font-bold' : 'text-primary'}`}>
              <span>{inventoryAlertsCount}</span>
              <span className="text-xs text-text-muted font-mono">{inventoryAlertsCount === 1 ? 'HUB ALERT' : 'HUB ALERTS'}</span>
            </div>
            {inventoryAlertsCount > 0 ? (
              <p className="text-xs text-secondary flex items-center gap-1 font-sans font-medium mt-1">
                <AlertTriangle className="w-3.5 h-3.5 text-secondary-container" />
                <span>One or more mills &gt;90% raw stock</span>
              </p>
            ) : (
              <p className="text-xs text-emerald-700 font-sans mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>All storage hubs clear</span>
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-lg ${inventoryAlertsCount > 0 ? 'bg-amber-100 text-secondary' : 'bg-blue-50 text-blue-800'}`}>
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Analytics Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-details">
        {/* Daily Tonnage Graph (Custom Rendered SVG for complete visual excellence and React 19 safety) */}
        <div className="lg:col-span-2 bg-bg-lowest border border-border-variant rounded-xl p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-mono text-text-muted uppercase tracking-wider">Dispatched Cargo Activity</h3>
              <p className="text-lg font-bold font-sans text-primary">Daily Tonnage Dispatches</p>
            </div>
            <span className="text-xs font-mono bg-bg-low px-2 py-1 rounded-sm text-text-muted">WEEKLY AGGREGATE</span>
          </div>

          {/* Interactive SVG Chart */}
          <div className="relative h-64 w-full flex flex-col justify-end" id="svg-chart-container">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 text-[10px] font-mono text-text-muted select-none">
              <div className="border-b border-bg-low w-full pt-1 flex justify-between"><span>100 TONS</span></div>
              <div className="border-b border-bg-low w-full pt-1 flex justify-between"><span>75 TONS</span></div>
              <div className="border-b border-bg-low w-full pt-1 flex justify-between"><span>50 TONS</span></div>
              <div className="border-b border-bg-low w-full pt-1 flex justify-between"><span>25 TONS</span></div>
              <div className="border-b border-bg-low w-full pt-1 flex justify-between"><span>0 TONS</span></div>
            </div>

            {/* Bars container */}
            <div className="h-[200px] flex items-end justify-around relative z-10 w-full px-2" id="chart-bars">
              {weeklyTonnage.map((item, idx) => {
                const heightPercent = `${(item.tons / 100) * 100}%`;
                const isMax = item.tons === maxWeeklyTone;
                return (
                  <div key={idx} className="flex flex-col items-center group relative w-1/8">
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-primary text-white text-xs py-1 px-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-50">
                      <span className="font-mono font-bold">{item.tons} Tons</span>
                    </div>

                    {/* Bar */}
                    <div 
                      style={{ height: heightPercent }} 
                      className={`w-full max-w-[28px] rounded-t-sm transition-all duration-350 cursor-pointer ${
                        isMax 
                          ? 'bg-secondary-container hover:brightness-105 shadow-sm' 
                          : 'bg-primary/90 hover:bg-primary'
                      }`}
                    />

                    {/* Label */}
                    <span className="text-[11px] font-mono text-text-muted mt-2 uppercase">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Center - Quick launch buttons */}
        <div className="bg-bg-lowest border border-border-variant rounded-xl p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-text-muted uppercase tracking-wider">Operations Control</h3>
            <h4 className="text-lg font-bold font-sans text-primary">Quick Actions</h4>
            <p className="text-sm text-text-muted leading-relaxed font-sans">
              Create electronic waybills, track field fleets, and audit warehouse capacities from a single workspace.
            </p>
          </div>

          <div className="space-y-3 mt-6">
            <button 
              onClick={() => onNavigateToWaybills(true)}
              className="w-full bg-primary text-white font-mono text-xs font-semibold uppercase tracking-wider py-3.5 px-4 rounded-lg flex items-center justify-between hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
            >
              <span>+ Create New Waybill</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigateToWaybills(false)}
              className="w-full border border-border-variant hover:bg-bg-low text-primary font-mono text-xs font-semibold uppercase tracking-wider py-3.5 px-4 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Manage Manifest Archive</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigateToTracking()}
              className="w-full hover:bg-bg-low text-primary-container font-sans text-xs font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-secondary-container" />
              <span>Launch Live Tracking Monitor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Manifest Activities */}
      <section className="bg-bg-lowest border border-border-variant rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-mono text-text-muted uppercase tracking-wider">Live Feeds</h3>
            <h4 className="text-lg font-bold font-sans text-primary">Recent Manifests &amp; Fleet Activity</h4>
          </div>
          <button 
            onClick={() => onNavigateToWaybills(false)}
            className="text-xs font-mono font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            <span>VIEW ALL</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-bg-low">
          {waybills.slice(0, 3).map((wb) => {
            const isDelivered = wb.status === 'delivered';
            const isInTransit = wb.status === 'in_transit';
            const isDraft = wb.status === 'draft';
            const isGenerated = wb.status === 'generated';

            return (
              <div key={wb.id} className="py-4 first:pt-2 last:pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-full ${
                    isDelivered ? 'bg-emerald-50 text-emerald-800' :
                    isInTransit ? 'bg-primary-fixed text-primary' :
                    isDraft ? 'bg-amber-50 text-amber-800' :
                    'bg-slate-50 text-slate-700'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">{wb.waybillNumber}</span>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isDelivered ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                        isInTransit ? 'bg-primary-fixed text-on-primary-fixed border border-primary-container/30' :
                        isDraft ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                        'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {wb.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm font-sans font-medium text-primary mt-1">
                      {wb.productType} — {wb.quantity.toFixed(1)} Tons
                    </div>
                    <p className="text-xs text-text-muted font-sans mt-0.5">
                      {getPlantationName(wb.originId)} to {getMillName(wb.destinationId)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pl-14 md:pl-0">
                  <div className="text-left md:text-right">
                    <div className="text-xs font-mono text-text-muted uppercase">Created Time</div>
                    <div className="text-xs font-mono font-medium text-primary">
                      {new Date(wb.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(wb.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {!isDraft && (
                    <button 
                      onClick={() => onNavigateToTracking(wb.id)}
                      className="text-xs font-mono flex items-center gap-1 bg-bg-low hover:bg-bg-normal text-primary-container px-3 py-1.5 rounded-md border border-border-variant/60 transition-colors uppercase font-medium cursor-pointer"
                    >
                      <span>Track</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
