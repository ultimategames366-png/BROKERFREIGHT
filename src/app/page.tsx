'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Users, FileText, Settings, Home, Clock, Plus, Phone, MessageCircle,
  Search, AlertTriangle, CheckCircle, X, ChevronRight, MapPin, Weight,
  Currency, Calendar, Edit, Trash2, Copy, MoreVertical, ArrowLeft,
  WhatsApp, CreditCard, Download, Upload, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Types
interface Freight {
  id: string;
  truckId: string;
  truck: {
    id: string;
    truckNumber: string;
    lastFourDigits: string;
    notes?: string;
    hasProblems: boolean;
  };
  pickupLocation: string;
  dropLocation: string;
  distanceKm: number | null;
  weight: number;
  weightType: string;
  freightType: string;
  brokerFreight: number;
  driverFreight: number;
  status: string;
  createdAt: string;
  completedAt?: string;
  contacts: {
    id: string;
    role: string;
    contact: {
      id: string;
      name: string;
      phoneNumber: string;
    };
  }[];
  notes: {
    id: string;
    tag: string;
    description: string;
    createdAt: string;
  }[];
  extraCharges: {
    id: string;
    chargeType: string;
    amount: number;
  }[];
  payments: {
    id: string;
    amount: number;
    direction: string;
    status: string;
    paymentType: string;
  }[];
}

interface Truck {
  id: string;
  truckNumber: string;
  lastFourDigits: string;
  notes?: string;
  totalTrips: number;
  hasProblems: boolean;
  freights?: Freight[];
  truckNotes?: { tag: string; description: string; createdAt: string }[];
}

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  altPhone?: string;
  notes?: string;
  freights?: { freight: Freight; role: string }[];
}

interface DashboardData {
  activeCount: number;
  problemCount: number;
  completedToday: number;
  monthlyRevenue: number;
  pendingDriverPayment: number;
  problemLoads: Freight[];
  recentLoads: Freight[];
}

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-purple-600 text-white';
    case 'COMPLETED': return 'bg-green-500 text-black';
    case 'PROBLEM': return 'bg-orange-500 text-white';
    case 'CANCELLED': return 'bg-gray-600 text-white';
    default: return 'bg-gray-600 text-white';
  }
};

// API Functions
const api = {
  dashboard: {
    get: async (): Promise<DashboardData> => {
      const res = await fetch('/api/dashboard');
      return res.json();
    }
  },
  freights: {
    list: async (status?: string, search?: string): Promise<{ freights: Freight[] }> => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      const res = await fetch(`/api/freights?${params}`);
      return res.json();
    },
    get: async (id: string): Promise<{ freight: Freight }> => {
      const res = await fetch(`/api/freights/${id}`);
      return res.json();
    },
    create: async (data: Record<string, unknown>): Promise<{ freight: Freight }> => {
      const res = await fetch('/api/freights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    update: async (id: string, data: Record<string, unknown>): Promise<{ freight: Freight }> => {
      const res = await fetch(`/api/freights/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id: string): Promise<void> => {
      await fetch(`/api/freights/${id}`, { method: 'DELETE' });
    }
  },
  trucks: {
    list: async (search?: string): Promise<{ trucks: Truck[] }> => {
      const params = search ? `?search=${search}` : '';
      const res = await fetch(`/api/trucks${params}`);
      return res.json();
    },
    create: async (data: Record<string, unknown>): Promise<{ truck: Truck }> => {
      const res = await fetch('/api/trucks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  },
  contacts: {
    list: async (search?: string): Promise<{ contacts: Contact[] }> => {
      const params = search ? `?search=${search}` : '';
      const res = await fetch(`/api/contacts${params}`);
      return res.json();
    },
    create: async (data: Record<string, unknown>): Promise<{ contact: Contact }> => {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  },
  payments: {
    create: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  },
  notes: {
    create: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  }
};

// Components
const FreightCard = ({ freight, onClick, onStatusChange }: {
  freight: Freight;
  onClick: () => void;
  onStatusChange: (status: string) => void;
}) => {
  const driver = freight.contacts.find(c => c.role === 'DRIVER')?.contact;
  
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (driver?.phoneNumber) {
      window.location.href = `tel:${driver.phoneNumber}`;
    }
  };
  
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (driver?.phoneNumber) {
      const phone = driver.phoneNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[#1A1A1A] rounded-xl border border-[#333] p-4 cursor-pointer hover:border-purple-500/50 transition-all"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-white font-bold text-lg">{freight.truck.truckNumber}</h3>
          <p className="text-purple-400 font-mono text-sm">{freight.truck.lastFourDigits}</p>
        </div>
        <Badge className={getStatusColor(freight.status)}>
          {freight.status}
        </Badge>
      </div>
      
      {/* Route */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-gray-300">{freight.pickupLocation}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600" />
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-gray-300">{freight.dropLocation}</span>
        </div>
      </div>
      
      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#0B0B0B] rounded-lg p-2">
          <p className="text-gray-500 text-xs">Weight</p>
          <p className="text-white font-semibold">{freight.weight} {freight.weightType}</p>
        </div>
        <div className="bg-[#0B0B0B] rounded-lg p-2">
          <p className="text-gray-500 text-xs">My Freight</p>
          <p className="text-green-400 font-semibold">{formatCurrency(freight.brokerFreight)}</p>
        </div>
      </div>
      
      {/* Driver */}
      {driver && (
        <div className="flex items-center justify-between bg-[#0B0B0B] rounded-lg p-2 mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-white text-sm">{driver.name}</span>
          </div>
          <span className="text-purple-400 text-sm">{driver.phoneNumber}</span>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
          onClick={handleCall}
        >
          <Phone className="w-4 h-4 mr-1" /> Call
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-green-600/30 text-green-500 hover:bg-green-600/10"
          onClick={handleWhatsApp}
        >
          <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(freight.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE');
          }}
        >
          {freight.status === 'ACTIVE' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
        </Button>
      </div>
    </motion.div>
  );
};

const DashboardView = ({ onNavigate }: { onNavigate: (view: string) => void }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.get().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#1A1A1A] border-purple-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400 text-sm">Active Loads</p>
            <p className="text-4xl font-bold text-purple-400">{data?.activeCount || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] border-orange-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400 text-sm">Problems</p>
            <p className="text-4xl font-bold text-orange-500">{data?.problemCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stats */}
      <Card className="bg-[#1A1A1A] border-[#333]">
        <CardContent className="p-4">
          <h3 className="text-gray-400 text-sm mb-2">This Month Revenue</h3>
          <p className="text-4xl font-bold text-green-400">{formatCurrency(data?.monthlyRevenue || 0)}</p>
          <Separator className="my-4 bg-[#333]" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs">Driver Pending</p>
              <p className="text-white font-semibold">{formatCurrency(data?.pendingDriverPayment || 0)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Completed Today</p>
              <p className="text-white font-semibold">{data?.completedToday || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          className="bg-purple-600 hover:bg-purple-700 h-20 flex-col"
          onClick={() => onNavigate('create')}
        >
          <Plus className="w-6 h-6 mb-1" />
          <span className="text-xs">Add Load</span>
        </Button>
        <Button
          variant="outline"
          className="border-[#333] h-20 flex-col"
          onClick={() => onNavigate('loads')}
        >
          <Truck className="w-6 h-6 mb-1" />
          <span className="text-xs">Loads</span>
        </Button>
        <Button
          variant="outline"
          className="border-[#333] h-20 flex-col"
          onClick={() => onNavigate('contacts')}
        >
          <Users className="w-6 h-6 mb-1" />
          <span className="text-xs">Contacts</span>
        </Button>
      </div>

      {/* Problem Loads */}
      {data?.problemLoads && data.problemLoads.length > 0 && (
        <div>
          <h3 className="text-orange-500 font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Problem Loads
          </h3>
          <div className="space-y-3">
            {data.problemLoads.map(freight => (
              <FreightCard
                key={freight.id}
                freight={freight}
                onClick={() => {}}
                onStatusChange={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LoadsView = ({ onCreateNew, onSelectFreight }: {
  onCreateNew: () => void;
  onSelectFreight: (freight: Freight) => void;
}) => {
  const [freights, setFreights] = useState<Freight[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadFreights = async () => {
      setLoading(true);
      const status = activeTab === 'active' ? 'ACTIVE' : activeTab === 'problem' ? 'PROBLEM' : 'COMPLETED';
      const result = await api.freights.list(status, search);
      if (mounted) {
        setFreights(result.freights);
        setLoading(false);
      }
    };
    loadFreights();
    return () => { mounted = false; };
  }, [activeTab, search, refreshKey]);

  const handleStatusChange = async (freightId: string, status: string) => {
    await api.freights.update(freightId, { status });
    setRefreshKey(k => k + 1);
    toast.success(`Load marked as ${status}`);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search truck, driver, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#1A1A1A] border-[#333] pl-10 text-white"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#1A1A1A] w-full">
          <TabsTrigger value="active" className="flex-1 data-[state=active]:bg-purple-600">
            Active
          </TabsTrigger>
          <TabsTrigger value="problem" className="flex-1 data-[state=active]:bg-orange-500">
            Problems
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 data-[state=active]:bg-green-500">
            History
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Freights List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      ) : freights.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No loads found</p>
          <Button className="mt-4 bg-purple-600" onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" /> Add New Load
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3 pr-4">
            <AnimatePresence>
              {freights.map(freight => (
                <FreightCard
                  key={freight.id}
                  freight={freight}
                  onClick={() => onSelectFreight(freight)}
                  onStatusChange={(status) => handleStatusChange(freight.id, status)}
                />
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}

      {/* FAB */}
      <Button
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-purple-600 shadow-lg shadow-purple-500/30"
        onClick={onCreateNew}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

const CreateFreightView = ({ onSave, onCancel }: {
  onSave: () => void;
  onCancel: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Truck[]>([]);
  const [formData, setFormData] = useState({
    truckNumber: '',
    pickupLocation: '',
    dropLocation: '',
    weight: '',
    weightType: 'TON',
    freightType: 'FIXED',
    brokerFreight: '',
    driverFreight: '',
    driverName: '',
    driverPhone: ''
  });

  const searchTrucks = async (query: string) => {
    if (query.length >= 4) {
      const result = await api.trucks.list(query);
      setSuggestions(result.trucks);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.truckNumber || !formData.pickupLocation || !formData.dropLocation || !formData.brokerFreight) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.freights.create({
        truckNumber: formData.truckNumber.toUpperCase(),
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
        weight: parseFloat(formData.weight) || 0,
        weightType: formData.weightType,
        freightType: formData.freightType,
        brokerFreight: parseFloat(formData.brokerFreight),
        driverFreight: parseFloat(formData.driverFreight) || 0,
        contacts: formData.driverName ? [{
          name: formData.driverName,
          phone: formData.driverPhone,
          role: 'DRIVER'
        }] : []
      });
      toast.success('Load created successfully');
      onSave();
    } catch {
      toast.error('Failed to create load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold text-white">Add New Load</h2>
      </div>

      <div className="space-y-4">
        {/* Truck Number with Autocomplete */}
        <div className="relative">
          <Label className="text-gray-400">Truck Number *</Label>
          <Input
            value={formData.truckNumber}
            onChange={(e) => {
              setFormData({ ...formData, truckNumber: e.target.value });
              searchTrucks(e.target.value);
            }}
            placeholder="WB22J8937 or last 4 digits"
            className="bg-[#1A1A1A] border-[#333] text-white mt-1"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-[#1A1A1A] border border-[#333] rounded-lg overflow-hidden">
              {suggestions.map(truck => (
                <button
                  key={truck.id}
                  className="w-full px-4 py-2 text-left hover:bg-[#333] text-white"
                  onClick={() => {
                    setFormData({ ...formData, truckNumber: truck.truckNumber });
                    setSuggestions([]);
                  }}
                >
                  <span className="font-mono">{truck.truckNumber}</span>
                  <span className="text-purple-400 ml-2">({truck.lastFourDigits})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Locations */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-400">Pickup Location *</Label>
            <Input
              value={formData.pickupLocation}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              placeholder="Kolkata"
              className="bg-[#1A1A1A] border-[#333] text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-gray-400">Drop Location *</Label>
            <Input
              value={formData.dropLocation}
              onChange={(e) => setFormData({ ...formData, dropLocation: e.target.value })}
              placeholder="Mumbai"
              className="bg-[#1A1A1A] border-[#333] text-white mt-1"
            />
          </div>
        </div>

        {/* Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-400">Weight</Label>
            <Input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="25"
              className="bg-[#1A1A1A] border-[#333] text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-gray-400">Type</Label>
            <Select value={formData.weightType} onValueChange={(v) => setFormData({ ...formData, weightType: v })}>
              <SelectTrigger className="bg-[#1A1A1A] border-[#333] text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                <SelectItem value="TON">Ton</SelectItem>
                <SelectItem value="CHAKKA">Chakka</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Freight Amounts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-400">My Freight (₹) *</Label>
            <Input
              type="number"
              value={formData.brokerFreight}
              onChange={(e) => setFormData({ ...formData, brokerFreight: e.target.value })}
              placeholder="16000"
              className="bg-[#1A1A1A] border-[#333] text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-gray-400">Driver Freight (₹)</Label>
            <Input
              type="number"
              value={formData.driverFreight}
              onChange={(e) => setFormData({ ...formData, driverFreight: e.target.value })}
              placeholder="14500"
              className="bg-[#1A1A1A] border-[#333] text-white mt-1"
            />
          </div>
        </div>

        {/* Driver Info */}
        <div className="border-t border-[#333] pt-4">
          <h4 className="text-gray-400 text-sm mb-3">Driver Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400">Driver Name</Label>
              <Input
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="Raju Kumar"
                className="bg-[#1A1A1A] border-[#333] text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-gray-400">Driver Phone</Label>
              <Input
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                placeholder="9876543210"
                className="bg-[#1A1A1A] border-[#333] text-white mt-1"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Load'}
        </Button>
      </div>
    </div>
  );
};

const FreightDetailView = ({ freight, onBack, onUpdate }: {
  freight: Freight;
  onBack: () => void;
  onUpdate: () => void;
}) => {
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [noteData, setNoteData] = useState({ tag: '', description: '' });
  const [paymentData, setPaymentData] = useState({ amount: '', status: 'PENDING' });

  const driver = freight.contacts.find(c => c.role === 'DRIVER')?.contact;
  const owner = freight.contacts.find(c => c.role === 'OWNER')?.contact;

  const totalExtraCharges = freight.extraCharges.reduce((sum, c) => sum + c.amount, 0);
  const paidByBroker = freight.payments
    .filter(p => p.direction === 'INCOMING' && p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);
  const paidToDriver = freight.payments
    .filter(p => p.direction === 'OUTGOING' && p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleAddNote = async () => {
    await api.notes.create({
      freightId: freight.id,
      tag: noteData.tag,
      description: noteData.description
    });
    setShowNoteDialog(false);
    setNoteData({ tag: '', description: '' });
    onUpdate();
    toast.success('Note added');
  };

  const handleAddPayment = async () => {
    await api.payments.create({
      freightId: freight.id,
      paymentType: 'BROKER_FREIGHT',
      amount: paymentData.amount,
      direction: 'INCOMING',
      status: paymentData.status
    });
    setShowPaymentDialog(false);
    setPaymentData({ amount: '', status: 'PENDING' });
    onUpdate();
    toast.success('Payment recorded');
  };

  const handleMarkCompleted = async () => {
    await api.freights.update(freight.id, { status: 'COMPLETED' });
    onUpdate();
    toast.success('Load marked as completed');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white">{freight.truck.truckNumber}</h2>
            <p className="text-purple-400 font-mono">{freight.truck.lastFourDigits}</p>
          </div>
        </div>
        <Badge className={getStatusColor(freight.status)}>{freight.status}</Badge>
      </div>

      {/* Route */}
      <Card className="bg-[#1A1A1A] border-[#333]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div>
                <p className="text-gray-500 text-xs">Pickup</p>
                <p className="text-white font-semibold">{freight.pickupLocation}</p>
              </div>
            </div>
            <div className="flex-1 border-t border-dashed border-gray-600 mx-4" />
            <div className="flex items-center gap-2">
              <div>
                <p className="text-gray-500 text-xs text-right">Drop</p>
                <p className="text-white font-semibold">{freight.dropLocation}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-orange-500" />
            </div>
          </div>
          {freight.distanceKm && (
            <p className="text-center text-gray-400 text-sm mt-2">{freight.distanceKm} km</p>
          )}
        </CardContent>
      </Card>

      {/* Freight Details */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-[#1A1A1A] border-[#333]">
          <CardContent className="p-3">
            <p className="text-gray-500 text-xs">Weight</p>
            <p className="text-white font-semibold">{freight.weight} {freight.weightType}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] border-[#333]">
          <CardContent className="p-3">
            <p className="text-gray-500 text-xs">Freight Type</p>
            <p className="text-white font-semibold">{freight.freightType}</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="bg-[#1A1A1A] border-[#333]">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">My Freight</span>
            <span className="text-green-400 font-semibold">{formatCurrency(freight.brokerFreight)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Driver Freight</span>
            <span className="text-white">{formatCurrency(freight.driverFreight)}</span>
          </div>
          {totalExtraCharges > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Extra Charges</span>
              <span className="text-orange-400">{formatCurrency(totalExtraCharges)}</span>
            </div>
          )}
          <Separator className="bg-[#333]" />
          <div className="flex justify-between">
            <span className="text-gray-400">Received</span>
            <span className="text-green-400">{formatCurrency(paidByBroker)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Pending</span>
            <span className="text-orange-400">{formatCurrency(freight.brokerFreight - paidByBroker)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card className="bg-[#1A1A1A] border-[#333]">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg">Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {driver && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-white">{driver.name}</p>
                  <p className="text-gray-500 text-xs">Driver</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="text-green-400" onClick={() => window.location.href = `tel:${driver.phoneNumber}`}>
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-green-500" onClick={() => window.open(`https://wa.me/${driver.phoneNumber.replace(/\D/g, '')}`, '_blank')}>
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          {owner && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-green-400" />
                <div>
                  <p className="text-white">{owner.name}</p>
                  <p className="text-gray-500 text-xs">Owner</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="text-green-400" onClick={() => window.location.href = `tel:${owner.phoneNumber}`}>
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {freight.notes.length > 0 && (
        <Card className="bg-[#1A1A1A] border-[#333]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Notes & Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {freight.notes.map(note => (
              <div key={note.id} className="bg-[#0B0B0B] rounded-lg p-3">
                <Badge variant="outline" className="border-orange-500 text-orange-400 mb-2">{note.tag}</Badge>
                <p className="text-gray-300 text-sm">{note.description}</p>
                <p className="text-gray-500 text-xs mt-1">{formatDate(note.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="border-[#333]" onClick={() => setShowNoteDialog(true)}>
          <FileText className="w-4 h-4 mr-2" /> Add Note
        </Button>
        <Button variant="outline" className="border-[#333]" onClick={() => setShowPaymentDialog(true)}>
          <CreditCard className="w-4 h-4 mr-2" /> Record Payment
        </Button>
      </div>

      {freight.status !== 'COMPLETED' && (
        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleMarkCompleted}>
          <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
        </Button>
      )}

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="bg-[#1A1A1A] border-[#333]">
          <DialogHeader>
            <DialogTitle className="text-white">Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Tag</Label>
              <Select value={noteData.tag} onValueChange={(v) => setNoteData({ ...noteData, tag: v })}>
                <SelectTrigger className="bg-[#0B0B0B] border-[#333] text-white mt-1">
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  <SelectItem value="Driver Problem">Driver Problem</SelectItem>
                  <SelectItem value="Truck Problem">Truck Problem</SelectItem>
                  <SelectItem value="Payment Issue">Payment Issue</SelectItem>
                  <SelectItem value="Loading Delay">Loading Delay</SelectItem>
                  <SelectItem value="Unloading Delay">Unloading Delay</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-400">Description</Label>
              <Textarea
                value={noteData.description}
                onChange={(e) => setNoteData({ ...noteData, description: e.target.value })}
                className="bg-[#0B0B0B] border-[#333] text-white mt-1"
                placeholder="Describe the issue..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowNoteDialog(false)}>Cancel</Button>
            <Button className="bg-purple-600" onClick={handleAddNote}>Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-[#1A1A1A] border-[#333]">
          <DialogHeader>
            <DialogTitle className="text-white">Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Amount (₹)</Label>
              <Input
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                className="bg-[#0B0B0B] border-[#333] text-white mt-1"
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label className="text-gray-400">Status</Label>
              <Select value={paymentData.status} onValueChange={(v) => setPaymentData({ ...paymentData, status: v })}>
                <SelectTrigger className="bg-[#0B0B0B] border-[#333] text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button className="bg-green-600" onClick={handleAddPayment}>Save Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ContactsView = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phoneNumber: '' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadContacts = async () => {
      setLoading(true);
      const result = await api.contacts.list(search);
      if (mounted) {
        setContacts(result.contacts);
        setLoading(false);
      }
    };
    loadContacts();
    return () => { mounted = false; };
  }, [search, refreshKey]);

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phoneNumber) {
      toast.error('Please fill all fields');
      return;
    }
    await api.contacts.create(newContact);
    setShowAddDialog(false);
    setNewContact({ name: '', phoneNumber: '' });
    setRefreshKey(k => k + 1);
    toast.success('Contact added');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Contacts</h2>
        <Button className="bg-purple-600" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#1A1A1A] border-[#333] pl-10 text-white"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No contacts found</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-2 pr-4">
            {contacts.map(contact => (
              <div key={contact.id} className="bg-[#1A1A1A] rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{contact.name}</p>
                  <p className="text-purple-400">{contact.phoneNumber}</p>
                  {contact.freights && contact.freights.length > 0 && (
                    <p className="text-gray-500 text-xs mt-1">{contact.freights.length} loads</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="text-green-400" onClick={() => window.location.href = `tel:${contact.phoneNumber}`}>
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-green-500" onClick={() => window.open(`https://wa.me/${contact.phoneNumber.replace(/\D/g, '')}`, '_blank')}>
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#1A1A1A] border-[#333]">
          <DialogHeader>
            <DialogTitle className="text-white">Add Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Name</Label>
              <Input
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="bg-[#0B0B0B] border-[#333] text-white mt-1"
                placeholder="Driver name"
              />
            </div>
            <div>
              <Label className="text-gray-400">Phone Number</Label>
              <Input
                value={newContact.phoneNumber}
                onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                className="bg-[#0B0B0B] border-[#333] text-white mt-1"
                placeholder="9876543210"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button className="bg-purple-600" onClick={handleAddContact}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TrucksView = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadTrucks = async () => {
      setLoading(true);
      const result = await api.trucks.list(search);
      if (mounted) {
        setTrucks(result.trucks);
        setLoading(false);
      }
    };
    loadTrucks();
    return () => { mounted = false; };
  }, [search]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Trucks Directory</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search by truck number or last 4 digits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#1A1A1A] border-[#333] pl-10 text-white"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      ) : trucks.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No trucks found</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2 pr-4">
            {trucks.map(truck => (
              <div key={truck.id} className="bg-[#1A1A1A] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-bold font-mono">{truck.truckNumber}</p>
                    <p className="text-purple-400 text-sm">{truck.lastFourDigits}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="border-[#333]">
                      {truck.totalTrips} trips
                    </Badge>
                    {truck.hasProblems && (
                      <Badge className="bg-orange-500">Problem</Badge>
                    )}
                  </div>
                </div>
                {truck.truckNotes && truck.truckNotes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {truck.truckNotes.slice(0, 2).map((note, idx) => (
                      <div key={idx} className="text-xs text-gray-400 bg-[#0B0B0B] rounded px-2 py-1">
                        <span className="text-orange-400">[{note.tag}]</span> {note.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

const SettingsView = () => {
  const handleExport = () => {
    // Export data as JSON
    toast.info('Export feature coming soon!');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Settings</h2>

      <Card className="bg-[#1A1A1A] border-[#333]">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white">Data Backup</p>
                <p className="text-gray-500 text-xs">Export your data</p>
              </div>
            </div>
            <Button variant="outline" className="border-[#333]" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>

          <Separator className="bg-[#333]" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white">Import Data</p>
                <p className="text-gray-500 text-xs">Restore from backup</p>
              </div>
            </div>
            <Button variant="outline" className="border-[#333]">
              <Upload className="w-4 h-4 mr-2" /> Import
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1A] border-[#333]">
        <CardContent className="p-4">
          <h3 className="text-white font-semibold mb-2">About</h3>
          <p className="text-gray-400 text-sm">
            Freight Broker Management App v1.0.0
          </p>
          <p className="text-gray-500 text-xs mt-2">
            A powerful digital notebook for freight brokers to manage shipments, track payments, and maintain records.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Main App
export default function FreightBrokerApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedFreight, setSelectedFreight] = useState<Freight | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view !== 'detail') {
      setSelectedFreight(null);
    }
  };

  const handleSelectFreight = async (freight: Freight) => {
    // Fetch full details
    const result = await api.freights.get(freight.id);
    setSelectedFreight(result.freight);
    setCurrentView('detail');
  };

  const handleBackFromDetail = () => {
    setSelectedFreight(null);
    setCurrentView('loads');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={handleNavigate} />;
      case 'loads':
        return (
          <LoadsView
            onCreateNew={() => setCurrentView('create')}
            onSelectFreight={handleSelectFreight}
          />
        );
      case 'create':
        return (
          <CreateFreightView
            onSave={() => {
              setCurrentView('loads');
              toast.success('Load created successfully!');
            }}
            onCancel={() => setCurrentView('loads')}
          />
        );
      case 'detail':
        return selectedFreight ? (
          <FreightDetailView
            freight={selectedFreight}
            onBack={handleBackFromDetail}
            onUpdate={async () => {
              const result = await api.freights.get(selectedFreight.id);
              setSelectedFreight(result.freight);
            }}
          />
        ) : null;
      case 'contacts':
        return <ContactsView />;
      case 'trucks':
        return <TrucksView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/95 backdrop-blur border-b border-[#1A1A1A] px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Freight Broker
          </h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView('dashboard')}
              className="text-gray-400"
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#333] z-50">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          <Button
            variant="ghost"
            className={`flex-col h-16 w-20 ${activeTab === 'home' ? 'text-purple-400' : 'text-gray-400'}`}
            onClick={() => {
              setActiveTab('home');
              setCurrentView('dashboard');
            }}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-col h-16 w-20 ${activeTab === 'loads' ? 'text-purple-400' : 'text-gray-400'}`}
            onClick={() => {
              setActiveTab('loads');
              setCurrentView('loads');
            }}
          >
            <Truck className="w-5 h-5" />
            <span className="text-xs mt-1">Loads</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-16 w-20"
            onClick={() => setCurrentView('create')}
          >
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center -mt-4 shadow-lg shadow-purple-500/30">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </Button>
          <Button
            variant="ghost"
            className={`flex-col h-16 w-20 ${activeTab === 'contacts' ? 'text-purple-400' : 'text-gray-400'}`}
            onClick={() => {
              setActiveTab('contacts');
              setCurrentView('contacts');
            }}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs mt-1">Contacts</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-col h-16 w-20 ${activeTab === 'more' ? 'text-purple-400' : 'text-gray-400'}`}
            onClick={() => {
              setActiveTab('more');
              setCurrentView('settings');
            }}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs mt-1">More</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
