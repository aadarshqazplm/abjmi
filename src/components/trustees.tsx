import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Plus, Edit2, Trash2, User } from "lucide-react";
import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";

import Modal from "../components/common/Modal";
import ImageUploader from "../components/common/ImageUploader";

interface Trustee {
  id?: string;
  name: string;
  role: string; // e.g., President, Secretary, Member
  description: string; // Short bio or affiliation
  image: string;
  order: number;
}

const emptyTrustee: Trustee = {
  name: "",
  role: "",
  description: "",
  image: "",
  order: 99,
};

export default function Trustees() {
  const { role: userRole } = useAuth();
  const isAdmin = userRole === "admin";

  const [trustees, setTrustees] = useState<Trustee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Trustee>(emptyTrustee);

  // ESLint-Safe Fetch Pattern
  const loadDatabaseTrustees = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "trustees"));
      const fetchedTrustees = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Trustee[];
      
      // Sort by order number (lowest number appears first)
      fetchedTrustees.sort((a, b) => a.order - b.order);
      return fetchedTrustees;
    } catch (error) {
      console.error("Error fetching trustees:", error);
      return [];
    }
  }, []);

  // Isolated Effect for initial load
  useEffect(() => {
    let isMounted = true;
    
    async function initFetch() {
      const data = await loadDatabaseTrustees();
      if (isMounted) {
        setTrustees(data);
        setIsLoading(false);
      }
    }
    
    initFetch();
    
    return () => {
      isMounted = false;
    };
  }, [loadDatabaseTrustees]);

  const openAddModal = () => {
    setFormData(emptyTrustee);
    setIsModalOpen(true);
  };

  const openEditModal = (trustee: Trustee) => {
    setFormData(trustee);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (formData.id) {
        const docRef = doc(db, "trustees", formData.id);
        await updateDoc(docRef, { ...formData });
      } else {
        await addDoc(collection(db, "trustees"), formData);
      }
      
      const updatedTrustees = await loadDatabaseTrustees();
      setTrustees(updatedTrustees);
      
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save trustee. Check console.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this trustee?")) return;
    
    try {
      await deleteDoc(doc(db, "trustees", id));
      setTrustees(trustees.filter((t) => t.id !== id));
    } catch (error) {
      alert("Failed to delete.");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-stone-50">
        <div className="text-sm font-semibold tracking-widest text-stone-400 animate-pulse uppercase">
          Loading Board of Trustees...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl" style={{ fontFamily: "'Cinzel', serif" }}>
              Board of Trustees
            </h1>
            <div className="mt-4 h-1 w-16 rounded-full bg-red-950" />
          </div>

          {isAdmin && (
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-red-950 shadow-md transition-all hover:-translate-y-0.5 hover:bg-amber-400"
            >
              <Plus size={18} />
              Add Trustee
            </button>
          )}
        </div>

        {/* Trustees Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {trustees.map((trustee) => (
            <div 
              key={trustee.id} 
              className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-xl"
            >
              {/* Admin Controls Overlay */}
              {isAdmin && (
                <div className="absolute right-3 top-3 z-20 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <button 
                    onClick={() => openEditModal(trustee)}
                    className="rounded-md bg-stone-100 p-2 text-stone-600 transition-colors hover:bg-amber-100 hover:text-amber-600 focus:opacity-100"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => trustee.id && handleDelete(trustee.id)}
                    className="rounded-md bg-stone-100 p-2 text-stone-600 transition-colors hover:bg-red-100 hover:text-red-600 focus:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              {/* Profile Image */}
              <div className="mb-5 h-32 w-32 overflow-hidden rounded-full border-4 border-stone-50 bg-stone-100 shadow-sm">
                {trustee.image ? (
                  <img 
                    src={trustee.image} 
                    alt={trustee.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-stone-300">
                    <User size={48} strokeWidth={1} />
                  </div>
                )}
              </div>

              {/* Info */}
              <h3 className="mb-1 text-xl font-bold text-red-950">{trustee.name}</h3>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-600">
                {trustee.role}
              </p>
              <p className="text-sm leading-relaxed text-stone-500">
                {trustee.description}
              </p>
            </div>
          ))}
        </div>
        
        {!isLoading && trustees.length === 0 && (
          <div className="py-20 text-center text-stone-400">
            No trustees have been added yet.
          </div>
        )}
      </div>

      {/* Admin Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={formData.id ? "Edit Trustee" : "Add Trustee"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <ImageUploader 
                currentImageUrl={formData.image} 
                onUploadSuccess={(url) => setFormData({...formData, image: url})} 
                folder="profiles"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Full Name (with titles)</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Prof. John Smith"
              className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Role</label>
              <input 
                type="text" 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                placeholder="e.g., President"
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Display Order</label>
              <input 
                type="number" 
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                placeholder="e.g., 1"
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
                required
              />
              <p className="mt-1 text-xs text-stone-500">Lower numbers appear first.</p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Short Bio / Affiliation</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="e.g., Philanthropist and academic advocate..."
              rows={3}
              className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
              required
            />
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-stone-100 pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex min-w-[120px] items-center justify-center rounded-lg bg-red-950 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-red-900 disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save Trustee"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}