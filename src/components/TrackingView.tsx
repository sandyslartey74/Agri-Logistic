import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Truck, 
  MapPin, 
  Map, 
  Clock, 
  Compass, 
  Calendar, 
  Scale, 
  CheckCircle2, 
  ChevronRight,
  User,
  ExternalLink,
  Info
} from 'lucide-react';
import { Waybill, Driver, LocationHub } from '../types';
import { PLANTATIONS, MILLS, INITIAL_DRIVERS } from '../data';

interface TrackingViewProps {
  waybills: Waybill[];
  selectedWaybillId?: string;
  onSelectWaybill: (id: string | undefined) => void;
}

export default function TrackingView({
  waybills,
  selectedWaybillId,
  onSelectWaybill
}: TrackingViewProps) {
  // Filter only waybills that can be tracked (in transit or delivered)
  const trackableWaybills = waybills.filter(wb => wb.status !== 'draft');
  
  // Set default waybill to the first in-transit or first trackable one if none matches/none selected
  const activeWaybill = trackableWaybills.find(wb => wb.id === selectedWaybillId) || trackableWaybills[0];

  // Simulation state: Truck position coordinate overlay along route
  const [simulationProgress, setSimulationProgress] = useState<number>(0.4);

  useEffect(() => {
    if (activeWaybill) {
      if (activeWaybill.status === 'delivered') {
        setSimulationProgress(1.0);
      } else {
        // Animate/jitter truck progress slightly or set standard based on currentStep
        const stepProg = activeWaybill.currentStep ? activeWaybill.currentStep / 4 : 0.4;
        setSimulationProgress(stepProg);
      }
    }
  }, [activeWaybill]);

  const getPlantation = (id: string): LocationHub | undefined => PLANTATIONS.find(p => p.id === id);
  const getMill = (id: string): LocationHub | undefined => MILLS.find(m => m.id === id);
  const getDriver = (id: string): Driver | undefined => INITIAL_DRIVERS.find(d => d.id === id);

  const origin = activeWaybill ? getPlantation(activeWaybill.originId) : undefined;
  const destination = activeWaybill ? getMill(activeWaybill.destinationId) : undefined;
  const driver = activeWaybill ? getDriver(activeWaybill.driverId) : undefined;

  const steps = [
    { label: 'Departure', desc: 'Manifest signed at plantation scalehouse' },
    { label: 'Seal Verified', desc: 'Tanker hatches locked and seals validated' },
    { label: 'In Transit', desc: 'En route via rural GIS corridor' },
    { label: 'At Destination', desc: 'Arrived at milling hub. Weight matching.' }
  ];

  return (
    <div className="space-y-6" id="tracking-view-container">
      {/* Search Header and Waybill Selector */}
      <section className="bg-bg-lowest border border-border-variant p-6 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-sans text-primary">Fleet Live-Tracking</h2>
            <p className="text-sm text-text-muted">Select an active consignment to inspect real-time satellite telemetry.</p>
          </div>
          
          <div className="w-full md:w-80">
            <label className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1.5 font-bold">ACTIVE MANIFESTS</label>
            <select 
              value={activeWaybill?.id || ''} 
              onChange={(e) => onSelectWaybill(e.target.value || undefined)}
              className="w-full bg-bg-lowest border border-border-outline rounded-lg px-3 py-2 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
            >
              {trackableWaybills.length === 0 ? (
                <option value="">No active manifests</option>
              ) : (
                trackableWaybills.map((wb) => (
                  <option key={wb.id} value={wb.id}>
                    {wb.waybillNumber} ({wb.productType} - {wb.status.replace('_', ' ')})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </section>

      {activeWaybill ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="tracking-details">
          {/* Timeline and Details column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Manifest Overview Card */}
            <div className="bg-bg-lowest border border-border-variant rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary bg-primary-fixed px-2.5 py-1 rounded-sm border border-primary/20">
                  {activeWaybill.waybillNumber}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  activeWaybill.status === 'delivered' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-primary-fixed text-on-primary-fixed text-primary border border-primary/20 animate-pulse'
                }`}>
                  ● {activeWaybill.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-mono text-text-muted uppercase">Cargo Consignment</h3>
                <p className="text-base font-bold font-sans text-primary mt-0.5">{activeWaybill.productType}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Scale className="w-4 h-4 text-text-muted" />
                  <span className="font-mono text-xs font-semibold text-primary">{activeWaybill.quantity.toFixed(1)} TONS Dispatched</span>
                </div>
              </div>

              <div className="border-t border-bg-low pt-4 grid grid-cols-2 gap-3">
                <div>
                  <h4 className="text-[10px] font-mono text-text-muted uppercase">EST. DISTANCE</h4>
                  <p className="text-sm font-bold text-primary font-mono">{activeWaybill.estimatedDistanceKm} KM</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-mono text-text-muted uppercase">REMAINING TIME</h4>
                  <p className="text-sm font-bold text-primary font-mono">
                    {activeWaybill.status === 'delivered' ? 'COMPLETED' : `${activeWaybill?.etaHours || 1.5} HOURS`}
                  </p>
                </div>
              </div>

              {/* Driver Details inside Track Overview */}
              {driver && (
                <div className="border-t border-bg-low pt-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary border border-primary/20">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-text-muted uppercase">Assigned Fleet Personnel</p>
                    <p className="text-sm font-sans font-bold text-primary leading-tight">{driver.name}</p>
                    <p className="text-[11px] font-mono text-text-muted">{driver.vehicle}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Transit Route Progress Steps */}
            <div className="bg-bg-lowest border border-border-variant rounded-xl p-5 shadow-xs">
              <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-4 font-bold flex items-center gap-2">
                <Compass className="w-4 h-4 text-secondary-container" />
                Transit Verification Log
              </h3>
              
              <div className="relative pl-6 space-y-6">
                {/* Visual timeline connector */}
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-bg-high" />

                {steps.map((step, idx) => {
                  const stepNumber = idx + 1;
                  const isCompleted = activeWaybill.status === 'delivered' || (activeWaybill.currentStep !== undefined && stepNumber <= activeWaybill.currentStep);
                  const isCurrent = activeWaybill.status !== 'delivered' && activeWaybill.currentStep === stepNumber;

                  return (
                    <div key={idx} className="relative flex gap-3">
                      {/* Circle indicator */}
                      <div className={`absolute -left-6 w-5.5 h-5.5 rounded-full flex items-center justify-center z-10 transition-colors ${
                        isCompleted ? 'bg-primary text-white' : 
                        isCurrent ? 'bg-secondary-container text-white border-2 border-primary-container' :
                        'bg-bg-normal border border-border-variant text-text-muted'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <span className="text-[10px] font-mono font-bold">{stepNumber}</span>
                        )}
                      </div>

                      {/* Step Info */}
                      <div>
                        <h4 className={`text-xs font-mono font-bold ${
                          isCompleted ? 'text-primary' : 
                          isCurrent ? 'text-secondary font-semibold' : 
                          'text-text-muted'
                        }`}>
                          {step.label}
                        </h4>
                        <p className="text-xs text-text-muted font-sans mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Map Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Visual routing simulator on satellite backdrop */}
            <div className="border border-border-variant rounded-xl bg-bg-highest overflow-hidden relative shadow-xs group flex flex-col justify-between" style={{ minHeight: '380px' }}>
              
              {/* Image backdrop (GIS style mapping) */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7L35qpme1x_5oELwCx7sLFGsnYp9bP7brbawFWaGDdthemSpokxNM7Ad44dtkdOrx17ehzXjX7hLtWr8WWZ_JfYs_fFTth8HR1PPbdoHOO2rhybt3g_At0oN7Y-DzlO4LVhuYynIqw3F47EoUZSFJ4h6B_L8Mq-ILTLC0V_t-QWZQDDD6J3Iz1MPWGyliqbgxXLndN9WaDyN7oBqR454aNsEf5Ko-H7HS0-iDr-ZEJHrPymLNjQ5njUBlP2iL8grkJFwfXr_f5VM" 
                  alt="Satellite corridor"
                  className="w-full h-full object-cover grayscale brightness-50 contrast-125"
                />
                {/* Forest-Green tint overlay */}
                <div className="absolute inset-0 bg-primary/20 mixed-blend-overlay pointer-events-none" />
              </div>

              {/* Top status bar overlay */}
              <div className="relative z-10 p-3 bg-primary/85 backdrop-blur-sm shadow-md text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-secondary-container" />
                  <span className="text-xs font-mono font-bold tracking-wider">TELEMETRY PREVIEW</span>
                </div>
                <div className="text-[11px] font-mono text-primary-fixed">
                  Est. Route Coordinates Jitter: Enabled
                </div>
              </div>

              {/* Route Map Graphic (Absolute overlays) */}
              <div className="absolute inset-x-6 top-24 bottom-16 pointer-events-none z-10">
                {/* Custom visual route vector lines */}
                <svg className="w-full h-full relative" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M 50 150 Q 150 50 250 120 T 450 100" 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeDasharray="6,4" 
                    className="opacity-40"
                  />
                  
                  <path 
                    d="M 50 150 Q 150 50 250 120 T 450 100" 
                    fill="none" 
                    stroke="#fe932c" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeDasharray="1.5 100" // Simulates path animations
                    style={{
                      strokeDasharray: '450',
                      strokeDashoffset: `${450 - (simulationProgress * 450)}`
                    }}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Origin Marker */}
                <div className="absolute left-[30px] top-[138px] flex flex-col items-center">
                  <div className="p-1.5 rounded-full bg-white shadow-md border-2 border-primary">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="mt-1 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-sm border border-border-variant/20 whitespace-nowrap">
                    {origin?.name ? origin.name.split(' ')[0] : 'Origin'}
                  </span>
                </div>

                {/* Destination Marker */}
                <div className="absolute right-[10%] top-[88px] flex flex-col items-center">
                  <div className="p-1.5 rounded-full bg-emerald-700 shadow-md border-2 border-white">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="mt-1 bg-emerald-950/90 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-sm border border-emerald-500/20 whitespace-nowrap">
                    {destination?.name ? destination.name.split(' ')[0] : 'Destination'}
                  </span>
                </div>

                {/* Moving Truck Indicator */}
                {activeWaybill.status !== 'delivered' && (
                  <div 
                    style={{
                      left: `calc(40px + ${simulationProgress * 70}%)`,
                      top: `calc(130px - ${simulationProgress * 30}px + ${Math.sin(simulationProgress * Math.PI) * 20}px)`
                    }}
                    className="absolute p-2 rounded-full bg-secondary-container border border-white text-on-secondary-container shadow-lg flex items-center justify-center transition-all duration-1000 ease-out z-20 animate-bounce"
                  >
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>

              {/* Bottom stats overlay info board */}
              <div className="relative z-10 m-4 p-4 bg-white/95 backdrop-blur shadow-md rounded-xl max-w-sm">
                <p className="font-mono text-[10px] text-primary font-bold flex items-center gap-1 mb-1 bg-primary-fixed/30 px-2 py-1 rounded w-fit uppercase">
                  <Map className="w-3 h-3 text-primary" />
                  GIS COORDINATES
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-text-muted">Origin GPS: </span>
                    <strong className="text-primary block">{origin?.coords.lat.toFixed(4)}, {origin?.coords.lng.toFixed(4)}</strong>
                  </div>
                  <div>
                    <span className="text-text-muted">Destination GPS: </span>
                    <strong className="text-primary block">{destination?.coords.lat.toFixed(4)}, {destination?.coords.lng.toFixed(4)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Informational Notice */}
            <div className="bg-bg-low border border-border-variant p-4 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs font-sans text-primary leading-relaxed space-y-1">
                <p className="font-bold uppercase tracking-wider font-mono text-[10px]">Security Notice</p>
                <p>
                  This transit link tracks active electronic manifests. In case of telemetry signal dropout, driver logs fallback automatically to the scalehouse SMS bridge.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-bg-lowest border border-border-variant p-10 rounded-xl text-center space-y-3 shadow-xs">
          <Truck className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="font-sans font-bold text-primary">No Manifests Available</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed">
            There are current no generated or in transit waybills ready for vehicle tracking. Head over to the Waybills section to initiate a digital cargo dispatch.
          </p>
        </div>
      )}
    </div>
  );
}
