import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Edit2, Mail, Phone, MapPin } from "lucide-react";
import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";

import Modal from "../components/common/Modal";

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  mapUrl: string; // URL for Google Maps iframe
}

// Updated with your specific details (stripped of Tel/Email since they have their own cards)
const defaultContact: ContactInfo = {
  email: "aryabhattajmi@gmail.com",
  phone: "+91 935-456-1191",
  address: "2255 Sector 17, HUDA\nJagadhri, Yamunanagar\n135003\nHaryana (India)",
  // Generic map embed centered roughly on Yamunanagar
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110190.17088151433!2d77.19965380590492!3d30.132306283731113!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ef99b8b19aed5%3A0x6b107b311758c0b!2sJagadhri%2C%20Haryana!5e0!3m2!1sen!2sin!4v1716120000000!5m2!1sen!2sin",
};

export default function Contact() {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContact);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ContactInfo>(defaultContact);

  const loadContactInfo = useCallback(async () => {
    try {
      const docRef = doc(db, "pages", "contact");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data()) {
        return docSnap.data() as ContactInfo;
      }
      return defaultContact;
    } catch (error) {
      console.error("Error fetching contact info:", error);
      return defaultContact;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function initFetch() {
      const data = await loadContactInfo();
      if (isMounted) {
        setContactInfo(data);
        setIsLoading(false);
      }
    }
    
    initFetch();
    
    return () => {
      isMounted = false;
    };
  }, [loadContactInfo]);

  const openEditModal = () => {
    setFormData(contactInfo);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const docRef = doc(db, "pages", "contact");
      await setDoc(docRef, formData, { merge: true });
      
      const updatedInfo = await loadContactInfo();
      setContactInfo(updatedInfo);
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save contact info. Check console.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-stone-50">
        <div className="text-sm font-semibold tracking-widest text-stone-400 animate-pulse uppercase">
          Loading Contact Information...
        </div>
      </div>
    );
  }

  return (
    // REDUCED: Changed padding-y from py-16 lg:py-24 down to py-8 lg:py-12
    <div className="min-h-screen bg-stone-50 py-8 lg:py-12 relative overflow-hidden">
      
      {/* Optional decorative background blob - reduced height */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-stone-200/50 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Header Section - REDUCED bottom margin from mb-16 to mb-10 */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-red-950 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
            Get in Touch
          </h1>
          <div className="mx-auto mt-4 mb-6 h-1 w-20 rounded-full bg-amber-500" />
          <p className="text-lg text-stone-600 leading-relaxed">
            Have questions about submissions, publications, or our current issues? Reach out to our editorial team below.
          </p>

          {isAdmin && (
            <button 
              onClick={openEditModal}
              className="mx-auto mt-6 flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-red-950 shadow-sm ring-1 ring-stone-200 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-red-950"
            >
              <Edit2 size={16} />
              Edit Contact Details
            </button>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          
          {/* Left Column: Contact Details Cards (Takes up 5 columns on large screens) */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            
            {/* Email Card */}
            <div className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-red-950/20">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-950 transition-colors duration-300 group-hover:bg-red-950 group-hover:text-white">
                <Mail size={22} />
              </div>
              <div>
                <h3 className="mb-1 text-base font-bold text-neutral-900">Email Address</h3>
                <a href={`mailto:${contactInfo.email}`} className="text-stone-500 transition-colors hover:text-red-950 font-medium text-sm">
                  {contactInfo.email}
                </a>
              </div>
            </div>

            {/* Phone Card */}
            <div className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-red-950/20">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-950 transition-colors duration-300 group-hover:bg-red-950 group-hover:text-white">
                <Phone size={22} />
              </div>
              <div>
                <h3 className="mb-1 text-base font-bold text-neutral-900">Phone Number</h3>
                <a href={`tel:${contactInfo.phone}`} className="text-stone-500 transition-colors hover:text-red-950 font-medium text-sm">
                  {contactInfo.phone}
                </a>
              </div>
            </div>

            {/* Address Card */}
            <div className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-red-950/20">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-950 transition-colors duration-300 group-hover:bg-red-950 group-hover:text-white">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="mb-1 text-base font-bold text-neutral-900">Office Address</h3>
                <p className="whitespace-pre-line text-stone-500 leading-relaxed font-medium text-sm">
                  {contactInfo.address}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Map (Takes up 7 columns on large screens) */}
          <div className="lg:col-span-7 h-[350px] lg:h-full min-h-[450px] rounded-[2rem] bg-white p-2.5 border border-stone-200 shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-stone-100 animate-pulse -z-10 rounded-[1.5rem]" />
            {contactInfo.mapUrl ? (
              <iframe 
                src={contactInfo.mapUrl} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location Map"
                className="h-full w-full object-cover rounded-[1.5rem] bg-stone-100"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-[1.5rem] bg-stone-50 text-stone-400">
                <MapPin size={48} className="mb-4 opacity-20" />
                <p className="font-medium">Map location not provided.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Admin Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Edit Contact Information"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-stone-700">Official Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950 transition-all"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-stone-700">Phone Number</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-stone-700">Office Address</label>
            <textarea 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              rows={4}
              className="w-full resize-none rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950 transition-all"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-stone-700">Google Maps Embed URL</label>
            <input 
              type="text" 
              value={formData.mapUrl}
              onChange={(e) => setFormData({...formData, mapUrl: e.target.value})}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full rounded-lg border border-stone-300 p-3 text-sm font-mono outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950 transition-all"
            />
            <p className="mt-2 text-xs font-medium text-stone-500">
              Go to Google Maps &gt; Share &gt; Embed a map. Copy only the link inside the <code className="bg-stone-100 px-1 rounded text-red-950">src="..."</code> attribute.
            </p>
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-stone-100 pt-6">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-stone-600 transition-colors hover:bg-stone-100"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex min-w-[140px] items-center justify-center rounded-lg bg-red-950 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-red-900 disabled:opacity-70"
            >
              {isSaving ? "Saving Details..." : "Save Details"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}