import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  ArrowLeft, 
  MapPin, 
  Factory, 
  Map, 
  User, 
  Scale, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  Trash2, 
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ClipboardCheck,
  Tag
} from 'lucide-react';
import { Waybill, Driver, LocationHub } from '../types';
import { PLANTATIONS, MILLS, PRODUCT_TYPES, INITIAL_DRIVERS, getDistance } from '../data';

interface WaybillsViewProps {
  waybills: Waybill[];
  onCreateWaybill: (wb: Partial<Waybill>) => void;
  onUpdateStatus: (id: string, status: Waybill['status']) => void;
  onDeleteWaybill: (id: string) => void;
  forceShowForm?: boolean;
}

export default function WaybillsView({
  waybills,
  onCreateWaybill,
  onUpdateStatus,
  onDeleteWaybill,
  forceShowForm = false
}: WaybillsViewProps) {
  // Navigation states
  const [showForm, setShowForm] = useState<boolean>(forceShowForm);
  const [selectedWaybill, setSelectedWaybill] = useState<Waybill | null>(null);

  // Sync forced form mode trigger
  useEffect(() => {
    if (forceShowForm) {
      setShowForm(true);
    }
  }, [forceShowForm]);

  // List search & filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form Field States
  const [productType, setProductType] = useState('Palm Oil');
  const [quantity, setQuantity] = useState<string>('');
  const [originId, setOriginId] = useState('pl-1');
  const [destinationId, setDestinationId] = useState('ml-1');
  const [selectedDriverId, setSelectedDriverId] = useState('drv-1');
  const [notes, setNotes] = useState('');

  // Computed Values
  const computedDistance = getDistance(originId, destinationId);

  // Submission Submitting States
  const [submittingAction, setSubmittingAction] = useState<'generate' | 'draft' | null>(null);
  const [submitFeedback, setSubmitFeedback] = useState<string>('');

  // Filtered waybills
  const filteredWaybills = waybills.filter(wb => {
    const matchesSearch = wb.waybillNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          wb.productType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || wb.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helpers
  const getPlantationName = (id: string) => PLANTATIONS.find(p => p.id === id)?.name || 'Unknown Plantation';
  const getMillName = (id: string) => MILLS.find(m => m.id === id)?.name || 'Unknown Mill';
  const getDriverName = (id: string) => INITIAL_DRIVERS.find(d => d.id === id)?.name || 'Unknown Driver';
  const getDriverVehicle = (id: string) => INITIAL_DRIVERS.find(d => d.id === id)?.vehicle || 'Unknown Vehicle';

  // Handle Create Submit
  const handleSubmit = (e: React.FormEvent, intent: 'generate' | 'draft') => {
    e.preventDefault();
    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Please enter a valid weight quantity.');
      return;
    }

    setSubmittingAction(intent);
    setSubmitFeedback(intent === 'generate' ? 'GENERATING MANIFEST...' : 'SAVING TO WORKSPACE DRAFTS...');

    setTimeout(() => {
      const generatedNo = `AGL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newWb: Partial<Waybill> = {
        waybillNumber: generatedNo,
        productType,
        quantity: parseFloat(quantity),
        originId,
        destinationId,
        driverId: selectedDriverId,
        status: intent === 'generate' ? 'in_transit' : 'draft',
        estimatedDistanceKm: computedDistance,
        notes: notes || `Standard transport manifest for raw ${productType.toLowerCase()} cargo.`,
        qrCodeValue: `AGRILOG-MANIFEST-${generatedNo}-SECURE-${Math.floor(100 + Math.random() * 900)}`,
        etaHours: intent === 'generate' ? Math.round((computedDistance / 50) * 10) / 10 : 0,
        currentStep: intent === 'generate' ? 1 : 0
      };

      onCreateWaybill(newWb);
      setSubmitFeedback('COMPLETED successfully!');
      
      setTimeout(() => {
        // Reset states
        setQuantity('');
        setNotes('');
        setSubmittingAction(null);
        setSubmitFeedback('');
        setShowForm(false);
      }, 800);

    }, 1500);
  };

  return (
    <div className="space-y-6" id="waybills-view-container">
      
      {/* ==================== FORM CREATION MODE ==================== */}
      {showForm ? (
        <div className="space-y-6" id="new-waybill-form-page">
          {/* Breadcrumb Back Button */}
          <nav className="flex items-center gap-2 text-text-muted">
            <button 
              onClick={() => { setShowForm(false); }}
              className="flex items-center gap-1.5 hover:text-primary transition-colors text-xs font-mono font-medium uppercase tracking-wider cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Waybills</span>
            </button>
          </nav>

          {/* Description header */}
          <section className="space-y-2">
            <h2 className="text-3xl font-bold font-sans text-primary">New Waybill</h2>
            <p className="text-text-muted font-sans text-sm md:text-base">
              Fill in the transport details to generate an official digital manifest for the shipment.
            </p>
          </section>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* CARGO SPECIFICATIONS */}
            <div className="bg-bg-lowest border border-border-variant rounded-xl overflow-hidden shadow-xs">
              <div className="bg-bg-normal px-6 py-4 border-b border-border-variant">
                <h3 className="font-mono text-xs font-bold text-text-muted flex items-center gap-2 select-none">
                  <Layers className="w-4 h-4" />
                  CARGO SPECIFICATIONS
                </h3>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Type */}
                <div className="space-y-2">
                  <label className="font-mono text-xs font-medium text-text-muted select-none">PRODUCT TYPE</label>
                  <select 
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full bg-bg-lowest border border-border-outline rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm cursor-pointer"
                  >
                    {PRODUCT_TYPES.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Weight Tons */}
                <div className="space-y-2">
                  <label className="font-mono text-xs font-medium text-text-muted select-none">QUANTITY / WEIGHT (TONS)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-bg-lowest border border-border-outline rounded-lg pl-4 pr-16 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-mono"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs font-bold">TONS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TRANSIT ROUTE */}
            <div className="bg-bg-lowest border border-border-variant rounded-xl overflow-hidden shadow-xs">
              <div className="bg-bg-normal px-6 py-4 border-b border-border-variant">
                <h3 className="font-mono text-xs font-bold text-text-muted flex items-center gap-2 select-none">
                  <MapPin className="w-4 h-4" />
                  TRANSIT ROUTE
                </h3>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Origin plantation */}
                  <div className="space-y-2">
                    <label className="font-mono text-xs font-medium text-text-muted select-none">ORIGIN (PLANTATION/FARM)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <select
                        value={originId}
                        onChange={(e) => setOriginId(e.target.value)}
                        className="w-full bg-bg-lowest border border-border-outline rounded-lg pl-11 pr-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm cursor-pointer"
                      >
                        {PLANTATIONS.map((pl) => (
                          <option key={pl.id} value={pl.id}>{pl.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Destination Refinery */}
                  <div className="space-y-2">
                    <label className="font-mono text-xs font-medium text-text-muted select-none">DESTINATION (MILL/REFINERY)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                        <Factory className="w-4 h-4" />
                      </span>
                      <select
                        value={destinationId}
                        onChange={(e) => setDestinationId(e.target.value)}
                        className="w-full bg-bg-lowest border border-border-outline rounded-lg pl-11 pr-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm cursor-pointer"
                      >
                        {MILLS.map((ml) => (
                          <option key={ml.id} value={ml.id}>{ml.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Satellite Preview Box with distance overlay */}
                <div className="h-48 rounded-xl bg-bg-high relative overflow-hidden group border border-border-variant">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7L35qpme1x_5oELwCx7sLFGsnYp9bP7brbawFWaGDdthemSpokxNM7Ad44dtkdOrx17ehzXjX7hLtWr8WWZ_JfYs_fFTth8HR1PPbdoHOO2rhybt3g_At0oN7Y-DzlO4LVhuYynIqw3F47EoUZSFJ4h6B_L8Mq-ILTLC0V_t-QWZQDDD6J3Iz1MPWGyliqbgxXLndN9WaDyN7oBqR454aNsEf5Ko-H7HS0-iDr-ZEJHrPymLNjQ5njUBlP2iL8grkJFwfXr_f5VM" 
                    alt="Agricultural road map backdrop"
                    className="w-full h-full object-cover grayscale brightness-75 transition-transform duration-500 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                  
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-md border border-border-variant/40 flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5 text-primary" />
                    <p className="font-mono text-xs font-bold text-primary uppercase tracking-wide">
                      EST. DISTANCE: <span className="text-secondary-container">{computedDistance} KM</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ASSIGNMENT */}
            <div className="bg-bg-lowest border border-border-variant rounded-xl overflow-hidden shadow-xs">
              <div className="bg-bg-normal px-6 py-4 border-b border-border-variant">
                <h3 className="font-mono text-xs font-bold text-text-muted flex items-center gap-2 select-none">
                  <User className="w-4 h-4" />
                  ASSIGNMENT
                </h3>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  <label className="font-mono text-xs font-medium text-text-muted select-none">ASSIGNED RIDER/DRIVER</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {INITIAL_DRIVERS.slice(0, 3).map((driver) => {
                      const isSelected = selectedDriverId === driver.id;
                      return (
                        <div 
                          key={driver.id} 
                          onClick={() => setSelectedDriverId(driver.id)}
                          className={`p-4 border rounded-xl transition-all flex items-center gap-3 cursor-pointer ${
                            isSelected 
                              ? 'border-primary bg-primary-fixed/60 shadow-xs' 
                              : 'border-border-variant hover:bg-bg-low'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                            isSelected ? 'bg-white border-primary/20' : 'bg-bg-low border-border-variant/60'
                          }`}>
                            <User className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                          </div>
                          <div>
                            <p className="font-mono text-sm font-bold text-[#191c1e]">{driver.name}</p>
                            <p className="font-mono text-xs text-text-muted">{driver.vehicle}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional dispatch notes */}
                <div className="mt-6 space-y-2">
                  <label className="font-mono text-xs font-medium text-text-muted select-none">DISPATCH NOTES / INSTRUCTIONS (OPTIONAL)</label>
                  <textarea 
                    placeholder="Enter manifest specific routing, lock codes or handling precautions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-bg-lowest border border-border-outline rounded-lg px-4 py-2 text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Form submission feedbacks (Inline) */}
            {submittingAction && (
              <div className="bg-primary/95 text-white p-4 rounded-xl flex items-center justify-center gap-3 shadow-lg font-mono text-sm tracking-wider">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{submitFeedback}</span>
              </div>
            )}

            {/* ACTION FOOTERS */}
            <div className="flex flex-col md:flex-row items-center justify-end gap-4 pt-4">
              <button 
                type="button"
                onClick={() => { setShowForm(false); }}
                className="w-full md:w-auto px-8 py-3 rounded-full border border-border-outline text-primary font-mono text-xs font-semibold uppercase tracking-wider hover:bg-bg-normal transition-colors cursor-pointer"
              >
                Cancel &amp; return
              </button>
              
              <button 
                type="button"
                disabled={submittingAction !== null}
                onClick={(e) => handleSubmit(e, 'draft')}
                className="w-full md:w-auto px-8 py-3 rounded-full border border-primary/20 text-primary bg-primary-fixed/40 hover:bg-primary-fixed font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                SAVE AS DRAFT
              </button>

              <button 
                type="submit"
                disabled={submittingAction !== null}
                onClick={(e) => handleSubmit(e, 'generate')}
                className="w-full md:w-auto px-12 py-3 rounded-full bg-primary text-white font-mono text-xs font-semibold uppercase tracking-wider hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <FileText className="w-4 h-4" />
                <span>GENERATE WAYBILL</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ==================== LIST ARCHIVE MODE ==================== */
        <div className="space-y-6" id="waybill-list-page">
          
          {/* Controls Bar */}
          <section className="bg-bg-lowest border border-border-variant p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            {/* Left: Input searches */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-2/3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search cargo manifests, Waybill numbers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-bg-lowest border border-border-outline rounded-lg pl-9 pr-4 py-2 text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Status selectors */}
              <div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-bg-lowest border border-border-outline rounded-lg px-3 py-2 text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="all">All Manifests</option>
                  <option value="draft">Drafts Only</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            {/* Right: FAB to form */}
            <button 
              onClick={() => { setShowForm(true); }}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-primary-container transition-colors shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Waybill</span>
            </button>
          </section>

          {/* Table list */}
          <div className="bg-bg-lowest border border-border-variant rounded-xl overflow-hidden shadow-xs">
            <div className="bg-bg-normal px-6 py-4 border-b border-border-variant flex items-center justify-between">
              <h3 className="font-mono text-xs font-bold text-text-muted uppercase">Electronic Manifest Logs</h3>
              <span className="font-mono text-xs text-text-muted">{filteredWaybills.length} Records</span>
            </div>

            {filteredWaybills.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-12 h-12 text-text-muted mx-auto" />
                <h4 className="font-sans font-bold text-primary">No Manifests Found</h4>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Try adjusting the parameters or generate a new waybill using the operation creator.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-variant/60 font-mono text-[10px] text-text-muted bg-bg-low uppercase tracking-wider select-none">
                      <th className="py-3 px-6">Manifest No</th>
                      <th className="py-3 px-6">Cargo Category</th>
                      <th className="py-3 px-6">Route Details</th>
                      <th className="py-3 px-6">Assigned Fleet</th>
                      <th className="py-3 px-6">Weight</th>
                      <th className="py-3 px-6">Log Status</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bg-low text-sm">
                    {filteredWaybills.map((wb, idx) => {
                      const isDelivered = wb.status === 'delivered';
                      const isInTransit = wb.status === 'in_transit';
                      const isDraft = wb.status === 'draft';

                      return (
                        <tr key={wb.id} className="hover:bg-bg-low/70 transition-colors">
                          {/* Manifest No */}
                          <td className="py-4 px-6 font-mono font-bold text-primary">
                            <span>{wb.waybillNumber}</span>
                          </td>

                          {/* Product */}
                          <td className="py-4 px-6 font-medium text-primary">
                            <div>{wb.productType}</div>
                            <div className="text-[10px] text-text-muted font-mono uppercase bg-bg-normal px-1.5 py-0.5 rounded w-fit mt-1">
                              {wb.productType === 'Palm Oil' ? 'Liquid bulk' : 'Dry Bulk'}
                            </div>
                          </td>

                          {/* Route */}
                          <td className="py-4 px-6">
                            <div className="text-xs font-semibold text-primary">{getPlantationName(wb.originId)}</div>
                            <div className="text-xs text-text-muted mt-0.5">to {getMillName(wb.destinationId)}</div>
                          </td>

                          {/* Fleet */}
                          <td className="py-4 px-6 text-xs">
                            <div className="font-mono text-primary font-bold">{getDriverName(wb.driverId)}</div>
                            <div className="text-text-muted mt-0.5 font-mono text-[11px]">{getDriverVehicle(wb.driverId)}</div>
                          </td>

                          {/* Weight */}
                          <td className="py-4 px-6 text-xs font-mono font-bold text-primary">
                            {wb.quantity.toFixed(1)} TONS
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                              isDelivered ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
                              isInTransit ? 'bg-primary-fixed text-primary border-primary-container/20' :
                              isDraft ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                              'bg-slate-50 text-slate-800 border-slate-200'
                            }`}>
                              {wb.status.replace('_', ' ')}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => { setSelectedWaybill(wb); }}
                              className="text-xs font-mono font-semibold text-emerald-800 hover:text-emerald-950 px-2 py-1 bg-primary-fixed/30 hover:bg-primary-fixed rounded transition-colors uppercase cursor-pointer"
                            >
                              Verify
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== WAYBILL DETAILS MODAL/OVERLAY ==================== */}
      {selectedWaybill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="details-modal">
          <div className="bg-bg-lowest border border-border-variant rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border-variant/60">
            
            {/* Left Column: Official Manifest Layout */}
            <div className="md:w-3/5 p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">DIGITAL MANIFEST RECORD</h3>
                  <h4 className="text-xl font-bold font-sans text-primary tracking-tight mt-0.5">{selectedWaybill.waybillNumber}</h4>
                </div>
                
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  selectedWaybill.status === 'delivered' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                  selectedWaybill.status === 'in_transit' ? 'bg-primary-fixed text-primary border border-primary-container/20' :
                  'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {selectedWaybill.status.replace('_', ' ')}
                </span>
              </div>

              {/* Barcode/QR Mock for high rugged industrial aesthetic */}
              <div className="bg-bg-low p-4 rounded-lg flex items-center justify-between border border-border-variant/40">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-text-muted uppercase">SECURE VERIFICATION HASH</span>
                  <div className="text-xs font-mono font-bold text-primary break-all">
                    {selectedWaybill.qrCodeValue || 'AGRILOG-PREVIEW-HASH-9921'}
                  </div>
                </div>
                {/* SVG mock barcode */}
                <div className="flex flex-col items-center gap-1 shrink-0 ml-4">
                  <div className="h-10 w-16 flex gap-0.5 items-center justify-center select-none opacity-80">
                    <div className="w-1 bg-primary h-full"></div>
                    <div className="w-0.5 bg-primary h-full"></div>
                    <div className="w-1.5 bg-primary h-full"></div>
                    <div className="w-0.5 bg-primary h-full"></div>
                    <div className="w-1 bg-primary h-full"></div>
                    <div className="w-0.5 bg-primary h-full"></div>
                    <div className="w-2 bg-primary h-full"></div>
                    <div className="w-1 bg-primary h-full"></div>
                  </div>
                  <span className="text-[9px] font-mono text-text-muted">SCAN PASS</span>
                </div>
              </div>

              {/* Waybill content items */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-text-muted block font-mono uppercase text-[10px]">Material Cargo</span>
                  <strong className="text-primary text-sm font-sans">{selectedWaybill.productType}</strong>
                </div>
                <div>
                  <span className="text-text-muted block font-mono uppercase text-[10px]">Net Weight Matrix</span>
                  <strong className="text-primary text-sm font-mono">{selectedWaybill.quantity.toFixed(1)} TONS</strong>
                </div>
                <div>
                  <span className="text-text-muted block font-mono uppercase text-[10px]">Logistics Origin</span>
                  <strong className="text-primary font-sans block leading-tight">{getPlantationName(selectedWaybill.originId)}</strong>
                </div>
                <div>
                  <span className="text-text-muted block font-mono uppercase text-[10px]">Target Destination</span>
                  <strong className="text-primary font-sans block leading-tight">{getMillName(selectedWaybill.destinationId)}</strong>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-xs bg-bg-low p-3.5 rounded-lg border border-border-variant/30 font-sans text-primary">
                <span className="font-mono text-[9px] text-text-muted uppercase block font-bold mb-1">Scalehouse Log Note</span>
                <p className="leading-relaxed italic">
                  "{selectedWaybill.notes || 'No custom dispatch instruction recorded.'}"
                </p>
              </div>

              {/* Timestamps */}
              <div className="text-[11px] font-mono text-text-muted pt-2 border-t border-bg-low">
                <span>Manifest Initiated: </span>
                <strong className="text-primary">
                  {new Date(selectedWaybill.createdAt).toLocaleDateString()} {new Date(selectedWaybill.createdAt).toLocaleTimeString()}
                </strong>
              </div>
            </div>

            {/* Right Column: Manifest State Transitions */}
            <div className="md:w-2/5 p-6 bg-bg-low/50 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider font-bold">STATE CONTROL BRIDGE</h4>
                <p className="text-xs font-sans text-primary leading-relaxed">
                  Update transit manifest states, assign security clearances, or delete records from active telemetries.
                </p>

                {/* Status selector update buttons */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono text-text-muted uppercase font-bold block mb-1">Set Log Status</span>
                  
                  {/* Draft */}
                  <button 
                    onClick={() => { onUpdateStatus(selectedWaybill.id, 'draft'); setSelectedWaybill({...selectedWaybill, status: 'draft'}); }}
                    className={`w-full py-2 px-3 rounded text-left text-xs font-mono font-bold flex items-center justify-between transition-colors border ${
                      selectedWaybill.status === 'draft' 
                        ? 'bg-amber-100 text-amber-900 border-amber-300' 
                        : 'bg-white text-primary border-border-variant/40 hover:bg-bg-low'
                    }`}
                  >
                    <span>1. Saved Draft</span>
                    {selectedWaybill.status === 'draft' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-800" />}
                  </button>

                  {/* In Transit */}
                  <button 
                    onClick={() => { onUpdateStatus(selectedWaybill.id, 'in_transit'); setSelectedWaybill({...selectedWaybill, status: 'in_transit'}); }}
                    className={`w-full py-2 px-3 rounded text-left text-xs font-mono font-bold flex items-center justify-between transition-colors border ${
                      selectedWaybill.status === 'in_transit' 
                        ? 'bg-neutral-900 text-primary-fixed border-neutral-700' 
                        : 'bg-white text-primary border-border-variant/40 hover:bg-bg-low'
                    }`}
                  >
                    <span>2. Dispatch (In Transit)</span>
                    {selectedWaybill.status === 'in_transit' && <CheckCircle2 className="w-3.5 h-3.5 text-primary-fixed" />}
                  </button>

                  {/* Delivered */}
                  <button 
                    onClick={() => { onUpdateStatus(selectedWaybill.id, 'delivered'); setSelectedWaybill({...selectedWaybill, status: 'delivered'}); }}
                    className={`w-full py-2 px-3 rounded text-left text-xs font-mono font-bold flex items-center justify-between transition-colors border ${
                      selectedWaybill.status === 'delivered' 
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                        : 'bg-white text-primary border-border-variant/40 hover:bg-bg-low'
                    }`}
                  >
                    <span>3. Seal Unlocked (Delivered)</span>
                    {selectedWaybill.status === 'delivered' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />}
                  </button>
                </div>
              </div>

              {/* Modal controls */}
              <div className="space-y-2 mt-6">
                <button 
                  onClick={() => {
                    const confirmDel = window.confirm('Are you sure you want to delete this waybill? This action is irreversible.');
                    if (confirmDel) {
                      onDeleteWaybill(selectedWaybill.id);
                      setSelectedWaybill(null);
                    }
                  }}
                  className="w-full text-xs font-mono text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 py-2.5 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>DELETE WAYBILL RECORD</span>
                </button>

                <button 
                  onClick={() => { setSelectedWaybill(null); }}
                  className="w-full text-xs font-mono text-primary bg-bg-high hover:bg-bg-highest py-2.5 rounded border border-border-variant transition-colors uppercase font-bold cursor-pointer"
                >
                  Close Overlay
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
