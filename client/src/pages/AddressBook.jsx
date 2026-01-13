import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check,
  Search,
  Phone,
  Mail,
  Building,
  User,
  RefreshCw
} from 'lucide-react';
import { getAddresses, createAddress, updateAddress, deleteAddress as apiDeleteAddress } from '../api';

export default function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'customer',
    phone: '',
    email: '',
    notes: ''
  });
  const [error, setError] = useState(null);

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      let data;
      if (editingAddress) {
        data = await updateAddress({ ...formData, id: editingAddress.id });
      } else {
        data = await createAddress(formData);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      fetchAddresses();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const data = await apiDeleteAddress(id);
      if (data.error) throw new Error(data.error);
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const openModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        name: address.name,
        type: address.type,
        phone: address.phone || '',
        email: address.email || '',
        notes: address.notes || ''
      });
    } else {
      setEditingAddress(null);
      setFormData({
        name: '',
        type: 'customer',
        phone: '',
        email: '',
        notes: ''
      });
    }
    setShowModal(true);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    setFormData({
      name: '',
      type: 'customer',
      phone: '',
      email: '',
      notes: ''
    });
    setError(null);
  };

  const filteredAddresses = addresses.filter(addr => 
    addr.name.toLowerCase().includes(search.toLowerCase()) ||
    addr.type.toLowerCase().includes(search.toLowerCase()) ||
    addr.phone?.toLowerCase().includes(search.toLowerCase()) ||
    addr.email?.toLowerCase().includes(search.toLowerCase())
  );

  const typeColors = {
    customer: 'bg-blue-500/20 text-blue-400',
    supplier: 'bg-purple-500/20 text-purple-400',
    employee: 'bg-green-500/20 text-green-400',
    other: 'bg-slate-500/20 text-slate-400'
  };

  const typeIcons = {
    customer: User,
    supplier: Building,
    employee: Users,
    other: User
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Address Book</h1>
            <p className="text-slate-400">Manage contacts and addresses</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors"
        >
          <Plus size={18} />
          <span>Add Address</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search addresses..."
          className="w-full pl-12 pr-4 py-3 rounded-xl glass text-white placeholder-slate-500"
        />
      </div>

      {/* Address List */}
      <div className="rounded-2xl glass overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : filteredAddresses.length > 0 ? (
          <div className="divide-y divide-slate-800/50">
            {filteredAddresses.map((addr) => {
              const TypeIcon = typeIcons[addr.type] || User;
              return (
                <div 
                  key={addr.id}
                  className="p-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeColors[addr.type] || typeColors.other}`}>
                        <TypeIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">{addr.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${typeColors[addr.type] || typeColors.other}`}>
                            {addr.type}
                          </span>
                          {addr.phone && (
                            <span className="flex items-center gap-1 text-sm text-slate-400">
                              <Phone size={12} />
                              {addr.phone}
                            </span>
                          )}
                          {addr.email && (
                            <span className="flex items-center gap-1 text-sm text-slate-400">
                              <Mail size={12} />
                              {addr.email}
                            </span>
                          )}
                        </div>
                        {addr.notes && (
                          <p className="text-sm text-slate-500 mt-1">{addr.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(addr)}
                        className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No addresses found</p>
            <button
              onClick={() => openModal()}
              className="mt-4 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Add your first address
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500"
                  placeholder="Enter name..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white"
                >
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                  <option value="employee">Employee</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500"
                  placeholder="Enter phone number..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500"
                  placeholder="Enter email..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 resize-none"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  <span>{editingAddress ? 'Update' : 'Add'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
