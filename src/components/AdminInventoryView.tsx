import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Store, 
  Pill, 
  TrendingUp, 
  Filter,
  Save,
  X,
  ShieldCheck,
  Building2,
  RefreshCw
} from 'lucide-react';
import { InventoryItem, Medicine, Pharmacy } from '../types';
import { StatusBadge } from './StatusBadge';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

interface AdminInventoryViewProps {
  currentUserRole?: string;
}

export const AdminInventoryView: React.FC<AdminInventoryViewProps> = ({
  currentUserRole = 'admin'
}) => {
  const { formatPrice, currencyConfig } = useCurrency();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // New stock form state
  const [newStock, setNewStock] = useState({
    pharmacy_id: '',
    medicine_id: '',
    stock_quantity: 50,
    price: 5.00,
    batch_number: 'BATCH-2026-X',
    expiry_date: '2027-12'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [inv, meds, pharms] = await Promise.all([
        api.getInventory(),
        api.getMedicines(),
        api.getPharmacies()
      ]);
      setInventory(inv);
      setMedicines(meds);
      setPharmacies(pharms);
      if (pharms.length > 0 && !newStock.pharmacy_id) {
        setNewStock(prev => ({
          ...prev,
          pharmacy_id: pharms[0].id,
          medicine_id: meds[0]?.id || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const updated = await api.updateInventoryItem(editingItem.id, {
        stock_quantity: editingItem.stock_quantity,
        price: editingItem.price,
        batch_number: editingItem.batch_number,
        expiry_date: editingItem.expiry_date
      });

      setInventory(prev => prev.map(item => item.id === updated.id ? updated : item));
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to update inventory:', err);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStock.pharmacy_id || !newStock.medicine_id) return;

    try {
      const created = await api.addInventoryItem({
        pharmacy_id: newStock.pharmacy_id,
        medicine_id: newStock.medicine_id,
        stock_quantity: Number(newStock.stock_quantity),
        price: Number(newStock.price),
        status: newStock.stock_quantity === 0 ? 'unavailable' : newStock.stock_quantity <= 10 ? 'low_stock' : 'available',
        batch_number: newStock.batch_number,
        expiry_date: newStock.expiry_date
      });

      setInventory(prev => [created, ...prev]);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add inventory record:', err);
    }
  };

  // Filtered inventory
  const filteredInventory = inventory.filter(item => {
    const matchesPharmacy = selectedPharmacyId === 'all' || item.pharmacy_id === selectedPharmacyId;
    const matchesSearch = (item.medicine_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.pharmacy_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.batch_number || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPharmacy && matchesSearch;
  });

  const lowStockCount = inventory.filter(i => i.status === 'low_stock').length;
  const outOfStockCount = inventory.filter(i => i.status === 'unavailable').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DDE8D2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8D2] text-[#173B2B] text-xs font-bold mb-2">
            <ShieldCheck size={14} className="text-[#6B9B63]" />
            <span>Admin & Pharmacist Console</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#17231D]">
            Pharmacy Inventory Management
          </h2>
          <p className="text-xs sm:text-sm text-[#69736D] mt-1">
            Real-time stock synchronization across registered pharmacy outlets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 rounded-2xl bg-[#F7F9F4] hover:bg-[#DDE8D2] text-[#173B2B] border border-[#DDE8D2] transition-colors"
            title="Refresh database"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            id="btn-add-stock"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#173B2B] hover:bg-[#173B2B]/90 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus size={16} className="text-[#DDE8D2]" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DDE8D2] shadow-2xs">
          <span className="text-xs text-[#69736D] font-semibold">Total Medicines</span>
          <p className="text-2xl font-bold font-heading text-[#17231D] mt-1">{medicines.length}</p>
          <span className="text-[11px] text-[#6B9B63] font-medium">Catalog items</span>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DDE8D2] shadow-2xs">
          <span className="text-xs text-[#69736D] font-semibold">Partner Stores</span>
          <p className="text-2xl font-bold font-heading text-[#173B2B] mt-1">{pharmacies.length}</p>
          <span className="text-[11px] text-[#69736D]">Verified pharmacies</span>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DDE8D2] shadow-2xs">
          <span className="text-xs text-[#69736D] font-semibold">Low Stock Warnings</span>
          <p className="text-2xl font-bold font-heading text-[#E7A23B] mt-1">{lowStockCount}</p>
          <span className="text-[11px] text-[#E7A23B] font-medium">≤ 10 units remaining</span>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DDE8D2] shadow-2xs">
          <span className="text-xs text-[#69736D] font-semibold">Out of Stock</span>
          <p className="text-2xl font-bold font-heading text-[#D95C5C] mt-1">{outOfStockCount}</p>
          <span className="text-[11px] text-[#D95C5C] font-medium">Urgent restock needed</span>
        </div>
      </div>

      {/* Table & Filter Controls */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#DDE8D2] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[#DDE8D2] flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69736D]" />
            <input
              type="text"
              placeholder="Search inventory, drug, batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
            />
          </div>

          {/* Pharmacy Store Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Store size={15} className="text-[#69736D]" />
            <select
              value={selectedPharmacyId}
              onChange={(e) => setSelectedPharmacyId(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs font-semibold text-[#17231D] focus:outline-none focus:border-[#173B2B]"
            >
              <option value="all">All Pharmacy Outlets</option>
              {pharmacies.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F4] text-[#69736D] font-bold uppercase tracking-wider border-b border-[#DDE8D2]">
              <tr>
                <th className="py-3.5 px-5">Medicine</th>
                <th className="py-3.5 px-4">Pharmacy Store</th>
                <th className="py-3.5 px-4">Stock Qty</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Batch / Expiry</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE8D2]/60">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-[#69736D]">
                    No inventory records match your criteria.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F9F4]/70 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-[#17231D] text-sm">{item.medicine_name}</div>
                      <div className="text-[11px] text-[#69736D]">{item.form || 'Tablet'} • {item.strength || 'Standard'}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-[#17231D]">
                      {item.pharmacy_name}
                    </td>
                    <td className="py-4 px-4 font-bold text-sm text-[#17231D]">
                      {item.stock_quantity} units
                    </td>
                    <td className="py-4 px-4 font-bold text-[#173B2B] text-sm">
                      {formatPrice(item.price)}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-[#69736D]">
                      <div className="font-mono text-[11px] text-[#17231D]">{item.batch_number || 'N/A'}</div>
                      <div className="text-[10px]">Exp: {item.expiry_date || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 rounded-xl bg-white hover:bg-[#DDE8D2] text-[#173B2B] border border-[#DDE8D2] transition-colors inline-flex items-center gap-1 font-bold text-xs shadow-2xs"
                      >
                        <Edit2 size={13} />
                        <span>Update Stock</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17231D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] w-full max-w-md rounded-3xl shadow-2xl border border-[#DDE8D2] p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDE8D2] mb-4">
              <div>
                <h3 className="text-base font-bold font-heading text-[#17231D]">
                  Update Inventory Record
                </h3>
                <p className="text-xs text-[#69736D]">{editingItem.medicine_name} @ {editingItem.pharmacy_name}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full hover:bg-[#F7F9F4] text-[#69736D]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#17231D] block mb-1">Available Quantity (Units) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingItem.stock_quantity}
                  onChange={(e) => setEditingItem({ ...editingItem, stock_quantity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-sm text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                />
              </div>

              <div>
                <label className="font-bold text-[#17231D] block mb-1">Base Price (USD $) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-sm text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                />
                <p className="text-[11px] text-[#69736D] mt-1">Converts to: {formatPrice(editingItem.price)} ({currencyConfig.code})</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#17231D] block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={editingItem.batch_number || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, batch_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#17231D] block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM"
                    value={editingItem.expiry_date || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, expiry_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DDE8D2]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#69736D] hover:bg-[#F7F9F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#173B2B] text-white text-xs font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17231D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] w-full max-w-md rounded-3xl shadow-2xl border border-[#DDE8D2] p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDE8D2] mb-4">
              <h3 className="text-base font-bold font-heading text-[#17231D]">
                Add Pharmacy Stock Record
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F7F9F4] text-[#69736D]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStock} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#17231D] block mb-1">Select Pharmacy Outlet *</label>
                <select
                  required
                  value={newStock.pharmacy_id}
                  onChange={(e) => setNewStock({ ...newStock, pharmacy_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                >
                  {pharmacies.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#17231D] block mb-1">Select Medicine *</label>
                <select
                  required
                  value={newStock.medicine_id}
                  onChange={(e) => setNewStock({ ...newStock, medicine_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                >
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.generic_name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#17231D] block mb-1">Initial Stock Units *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newStock.stock_quantity}
                    onChange={(e) => setNewStock({ ...newStock, stock_quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#17231D] block mb-1">Unit Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newStock.price}
                    onChange={(e) => setNewStock({ ...newStock, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#17231D] block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={newStock.batch_number}
                    onChange={(e) => setNewStock({ ...newStock, batch_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#17231D] block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM"
                    value={newStock.expiry_date}
                    onChange={(e) => setNewStock({ ...newStock, expiry_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DDE8D2]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#69736D] hover:bg-[#F7F9F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#173B2B] text-white text-xs font-bold shadow-xs"
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
