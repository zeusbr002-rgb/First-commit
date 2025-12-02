import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Edit, 
  Upload, 
  Image as ImageIcon,
  Briefcase,
  LayoutGrid,
  Menu
} from 'lucide-react';
import { ServiceOrder, ScheduleItem, Role, Priority, Status } from './types';
import { Button } from './components/Button';
import { Modal } from './components/Modal';

// --- Constants & Helpers ---

const INITIAL_ORDERS: ServiceOrder[] = [
  { id: 'OS-1001', title: 'HVAC Maintenance', description: 'Routine checkup for Unit 4B', location: 'Building A, Roof', priority: 'HIGH', status: 'OPEN', deadline: '2023-11-15' },
  { id: 'OS-1002', title: 'Electrical Repair', description: 'Fix flickering lights in hallway', location: 'Building C, Floor 2', priority: 'MED', status: 'OPEN', deadline: '2023-11-16' },
  { id: 'OS-1003', title: 'Plumbing Leak', description: 'Emergency leak in restroom', location: 'Lobby', priority: 'HIGH', status: 'DONE', deadline: '2023-11-10', evidenceImage: 'https://picsum.photos/200/200' },
];

const INITIAL_SCHEDULE: ScheduleItem[] = [
  { id: 'SCH-01', title: 'Week 45 Overview', date: '2023-11-01', imageUrl: 'https://picsum.photos/800/600' }
];

const generateId = (prefix: string) => `${prefix}-${Math.floor(Math.random() * 10000)}`;

const priorityColor = (p: Priority) => {
  switch (p) {
    case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'MED': return 'text-omni-orange bg-omni-orange/10 border-omni-orange/20';
    case 'LOW': return 'text-omni-green bg-omni-green/10 border-omni-green/20';
  }
};

const statusColor = (s: Status) => {
  return s === 'DONE' 
    ? 'text-omni-green bg-omni-green/10 border-omni-green/20' 
    : 'text-blue-400 bg-blue-400/10 border-blue-400/20';
};

// --- Main App Component ---

export default function App() {
  // State
  const [role, setRole] = useState<Role>('ADMIN');
  const [orders, setOrders] = useState<ServiceOrder[]>(() => {
    const saved = localStorage.getItem('omni_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('omni_schedule');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
  });

  // Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('omni_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('omni_schedule', JSON.stringify(schedule));
  }, [schedule]);

  // Handlers
  const handleCreateOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newOrder: ServiceOrder = {
      id: editingOrder ? editingOrder.id : generateId('OS'),
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      priority: formData.get('priority') as Priority,
      status: editingOrder ? editingOrder.status : 'OPEN',
      deadline: formData.get('deadline') as string,
      evidenceImage: editingOrder?.evidenceImage
    };

    if (editingOrder) {
      setOrders(prev => prev.map(o => o.id === editingOrder.id ? newOrder : o));
    } else {
      setOrders(prev => [newOrder, ...prev]);
    }
    
    setIsOrderModalOpen(false);
    setEditingOrder(null);
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const handleUploadSchedule = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newItem: ScheduleItem = {
        id: generateId('SCH'),
        title: `Schedule - ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString().split('T')[0],
        imageUrl: reader.result as string
      };
      setSchedule(prev => [newItem, ...prev]);
    };
    reader.readAsDataURL(file);
  };

  const handleCompleteOrder = (id: string, evidenceBase64?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        return { ...o, status: 'DONE', evidenceImage: evidenceBase64 || o.evidenceImage };
      }
      return o;
    }));
  };

  return (
    <div className="min-h-screen bg-omni-navy text-slate-200 font-sans selection:bg-omni-green selection:text-omni-navy">
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-omni-navy/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-omni-green to-teal-600 flex items-center justify-center shadow-lg shadow-omni-green/20">
              <span className="font-bold text-white text-lg tracking-tighter">O</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">OMNI<span className="text-slate-400 font-light">SYSTEM</span></span>
          </div>

          <button 
            onClick={() => setRole(r => r === 'ADMIN' ? 'CONTRACTOR' : 'ADMIN')}
            className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-slate-800 p-1 font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-omni-navy"
          >
            <span className={`absolute inset-0 flex h-full w-1/2 transition-all duration-300 ease-out bg-omni-white/10 rounded-full ${role === 'ADMIN' ? 'translate-x-0' : 'translate-x-full'}`}></span>
            <span className="relative z-10 flex h-full w-full items-center justify-center px-4 text-xs uppercase tracking-wider gap-2">
              {role === 'ADMIN' ? <ShieldCheck size={14} /> : <Users size={14} />}
              {role} VIEW
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {role === 'ADMIN' ? (
          <AdminView 
            orders={orders} 
            onEdit={(o) => { setEditingOrder(o); setIsOrderModalOpen(true); }}
            onDelete={handleDeleteOrder}
            onOpenCreate={() => { setEditingOrder(null); setIsOrderModalOpen(true); }}
            onUploadSchedule={handleUploadSchedule}
            schedule={schedule}
          />
        ) : (
          <ContractorView 
            orders={orders} 
            schedule={schedule}
            onComplete={handleCompleteOrder}
          />
        )}
      </main>

      {/* Shared Modals */}
      <Modal 
        isOpen={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)} 
        title={editingOrder ? "Edit Service Order" : "Create Service Order"}
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Order Title</label>
            <input 
              name="title" 
              defaultValue={editingOrder?.title} 
              required 
              placeholder="e.g. HVAC Repair"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-omni-green focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Location</label>
              <input 
                name="location" 
                defaultValue={editingOrder?.location} 
                required 
                placeholder="e.g. Building A"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-omni-green outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Deadline</label>
              <input 
                type="date" 
                name="deadline" 
                defaultValue={editingOrder?.deadline} 
                required 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-omni-green outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Priority Level</label>
            <div className="flex gap-2">
              {['LOW', 'MED', 'HIGH'].map((p) => (
                <label key={p} className="flex-1 cursor-pointer">
                  <input type="radio" name="priority" value={p} defaultChecked={editingOrder?.priority === p || (!editingOrder && p === 'MED')} className="peer sr-only" />
                  <div className="text-center py-2 rounded-lg border border-slate-700 peer-checked:bg-omni-white peer-checked:text-omni-navy peer-checked:font-bold transition-all hover:bg-slate-800 text-sm">
                    {p}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Description</label>
            <textarea 
              name="description" 
              defaultValue={editingOrder?.description} 
              required 
              rows={3}
              placeholder="Detailed instructions..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-omni-green outline-none resize-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" fullWidth onClick={() => setIsOrderModalOpen(false)}>Cancel</Button>
            <Button type="submit" fullWidth>Save Order</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

// --- Admin View ---

const AdminView: React.FC<{
  orders: ServiceOrder[];
  onEdit: (o: ServiceOrder) => void;
  onDelete: (id: string) => void;
  onOpenCreate: () => void;
  onUploadSchedule: (e: React.ChangeEvent<HTMLInputElement>) => void;
  schedule: ScheduleItem[];
}> = ({ orders, onEdit, onDelete, onOpenCreate, onUploadSchedule, schedule }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Manage service orders and team schedules.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative overflow-hidden">
            <input type="file" onChange={onUploadSchedule} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            <Button variant="secondary">
              <Upload size={16} className="mr-2" />
              Upload Schedule
            </Button>
          </div>
          <Button onClick={onOpenCreate}>
            <Plus size={16} className="mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, color: 'text-white' },
          { label: 'Open', value: orders.filter(o => o.status === 'OPEN').length, color: 'text-blue-400' },
          { label: 'High Priority', value: orders.filter(o => o.priority === 'HIGH' && o.status === 'OPEN').length, color: 'text-red-400' },
          { label: 'Completed', value: orders.filter(o => o.status === 'DONE').length, color: 'text-omni-green' },
        ].map((stat, i) => (
          <div key={i} className="bg-omni-surface border border-slate-700/50 p-4 rounded-xl">
            <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-omni-surface border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 border-b border-slate-700 text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Priority</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No orders found. Create one to get started.</td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-mono text-slate-400">{order.id}</td>
                  <td className="p-4 font-medium text-white">{order.title}</td>
                  <td className="p-4 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-500" />
                      {order.location}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${priorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(order)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => onDelete(order.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Gallery Preview */}
      {schedule.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Latest Schedules</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {schedule.slice(0, 4).map(item => (
              <div key={item.id} className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 group">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-xs font-medium text-white">{item.title}</p>
                  <p className="text-[10px] text-slate-300">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Contractor View ---

const ContractorView: React.FC<{
  orders: ServiceOrder[];
  schedule: ScheduleItem[];
  onComplete: (id: string, evidence?: string) => void;
}> = ({ orders, schedule, onComplete }) => {
  const [activeTab, setActiveTab] = useState<'TASKS' | 'SCHEDULE'>('TASKS');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  // Evidence upload handler for the expanded card
  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>, orderId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onComplete(orderId, reader.result as string);
        setSelectedOrder(null); // Close after upload/complete
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Mobile Tab Switcher */}
      <div className="flex p-1 bg-omni-surface border border-slate-700 rounded-lg">
        <button 
          onClick={() => setActiveTab('TASKS')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'TASKS' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
          My Tasks
        </button>
        <button 
          onClick={() => setActiveTab('SCHEDULE')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'SCHEDULE' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Schedule
        </button>
      </div>

      {activeTab === 'TASKS' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.filter(o => o.status === 'OPEN').length === 0 && (
             <div className="col-span-full py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-omni-surface mb-4 text-slate-500">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-medium text-white">All Caught Up!</h3>
                <p className="text-slate-400 text-sm">No open service orders assigned.</p>
             </div>
          )}

          {orders.map((order) => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrder(order)}
              className={`bg-omni-surface border rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                order.status === 'DONE' ? 'border-slate-700 opacity-60' : 'border-slate-600 hover:border-omni-white/30 shadow-lg'
              }`}
            >
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{order.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${priorityColor(order.priority)}`}>
                    {order.priority}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-1">{order.title}</h3>
                  <div className="flex items-center text-slate-400 text-sm">
                    <MapPin size={14} className="mr-1.5" />
                    {order.location}
                  </div>
                </div>

                <div className="flex items-center text-slate-500 text-xs mt-2">
                  <Calendar size={14} className="mr-1.5" />
                  Due: {order.deadline}
                </div>
              </div>
              
              {order.status === 'DONE' && (
                <div className="bg-omni-green/10 p-2 text-center text-xs font-bold text-omni-green border-t border-omni-green/20">
                  COMPLETED
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'SCHEDULE' && (
        <div className="space-y-6">
          {schedule.map((item) => (
            <div key={item.id} className="bg-omni-surface border border-slate-700 rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400">{item.date}</p>
              </div>
              <img src={item.imageUrl} alt="Schedule" className="w-full h-auto" />
            </div>
          ))}
          {schedule.length === 0 && (
             <div className="text-center py-12 text-slate-500">No schedules uploaded by Admin yet.</div>
          )}
        </div>
      )}

      {/* Detail Modal for Contractor */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder?.id || ''}
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedOrder.title}</h2>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded text-xs font-bold border ${priorityColor(selectedOrder.priority)}`}>
                  {selectedOrder.priority}
                </span>
                <span className="text-slate-400 text-sm flex items-center">
                  <MapPin size={14} className="mr-1" /> {selectedOrder.location}
                </span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-slate-200 leading-relaxed">{selectedOrder.description}</p>
              </div>
            </div>

            {selectedOrder.status === 'OPEN' ? (
              <div className="pt-4 border-t border-slate-700 space-y-4">
                 <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex gap-3 items-start">
                    <AlertCircle className="text-omni-orange shrink-0" size={18} />
                    <p className="text-xs text-omni-orange">Please upload a photo of the completed work to close this order.</p>
                 </div>
                 
                 <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="evidence-upload"
                      className="hidden"
                      onChange={(e) => handleEvidenceUpload(e, selectedOrder.id)}
                    />
                    <label 
                      htmlFor="evidence-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg hover:border-omni-green hover:bg-slate-800/50 transition-all cursor-pointer group"
                    >
                      <ImageIcon className="text-slate-500 group-hover:text-omni-green mb-2" size={32} />
                      <span className="text-sm text-slate-400 group-hover:text-white font-medium">Tap to Upload Photo & Finish</span>
                    </label>
                 </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2 text-omni-green mb-4">
                  <CheckCircle2 size={20} />
                  <span className="font-bold">Work Completed</span>
                </div>
                {selectedOrder.evidenceImage && (
                  <div className="rounded-lg overflow-hidden border border-slate-700">
                    <img src={selectedOrder.evidenceImage} alt="Evidence" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};