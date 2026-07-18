import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../hooks/useAuth";

import EditButton from "./EditButton";
import Modal from "./Modal";
import RichTextEditor from "./RichTextEditor";

interface IndexingContent {
  metrics: string;
  indexers: string[];
}

const defaultContent: IndexingContent = {
  metrics: `
    <p><strong>Thomson Reuters Researcher ID:</strong> H-4637-2016 | <strong>Scopus ID:</strong> AJMI C73 6081431192E4BF</p>
    <p><strong>UGC Approved Journal</strong> for Research advancement (Sr. No 3853)</p>
    <p><strong>Scientific Journal Impact Factor SJIF (2016):</strong> 5.856</p>
  `,
  indexers: [
    "Thomson Reuters",
    "Scopus",
    "Copernicus",
    "Indian Science Abstract (ISA)",
    "Govt. of India",
    "ICI Cite Factor",
    "indianjournals.com"
  ]
};

export default function Indexing() {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [content, setContent] = useState<IndexingContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<IndexingContent>(defaultContent);
  const [indexersInput, setIndexersInput] = useState("");

  const loadIndexingData = useCallback(async () => {
    try {
      const docRef = doc(db, "components", "indexing");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data()) {
        return docSnap.data() as IndexingContent;
      }
      return defaultContent;
    } catch (error) {
      console.error("Error fetching indexing data:", error);
      return defaultContent;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function initFetch() {
      const data = await loadIndexingData();
      if (isMounted) {
        setContent(data);
        setIsLoading(false);
      }
    }
    
    initFetch();
    
    return () => {
      isMounted = false;
    };
  }, [loadIndexingData]);

  const openEditModal = () => {
    setFormData(content);
    setIndexersInput(content.indexers.join(", "));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const cleanedIndexers = indexersInput
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const dataToSave = {
        ...formData,
        indexers: cleanedIndexers,
      };

      const docRef = doc(db, "components", "indexing");
      await setDoc(docRef, dataToSave, { merge: true });
      
      const updatedContent = await loadIndexingData();
      setContent(updatedContent);
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save indexing section. Check console.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="flex min-h-[400px] w-full items-center justify-center bg-stone-50 border-y border-stone-200">
        <div className="flex items-center gap-3 text-sm font-semibold tracking-widest text-stone-400 uppercase">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-red-900" />
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section className="relative border-y border-stone-200 bg-stone-50 py-16 md:py-12 overflow-hidden">
      {isAdmin && (
        <EditButton onClick={openEditModal} label="Edit Indexing" className="absolute top-6 right-6 z-20" />
      )}
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-900/80">
            Global Recognition
          </p>
          <h2 
            className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl" 
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Indexed & Abstracted In
          </h2>
          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-amber-500" />
        </div>
        
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Metrics Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl shadow-stone-200/50 border border-stone-100 flex-grow">
              {/* Decorative watermark icon */}
              <div className="absolute -right-6 -top-6 opacity-[0.03] text-stone-900">
                <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>

              <h3 className="mb-6 pb-4 text-xl font-bold text-stone-800 border-b border-stone-100" style={{ fontFamily: "'Cinzel', serif" }}>
                Journal Metrics
              </h3>
              
              <div 
                className="relative z-10 text-stone-600 space-y-4 [&>p]:leading-relaxed [&>p>strong]:font-semibold [&>p>strong]:text-red-950"
                dangerouslySetInnerHTML={{ __html: content.metrics }}
              />
            </div>
          </div>

          {/* Right Column: Indexers Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {content.indexers.map((indexer, idx) => (
                <div 
                  key={idx} 
                  className="group relative flex flex-col items-center justify-center rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-stone-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-200/50 hover:ring-amber-400"
                >
                  {/* Small decorative icon for each badge */}
                  <div className="mb-3 rounded-full bg-stone-50 p-2 text-red-950/40 transition-colors duration-300 group-hover:bg-amber-50 group-hover:text-amber-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  
                  <span 
                    className="text-sm font-semibold tracking-wide text-stone-700 transition-colors duration-300 group-hover:text-red-950"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {indexer}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Admin Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Edit Indexing & Recognition"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6 text-left">
          
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Metrics & Impact Factors</label>
            <div className="overflow-hidden rounded-lg border border-stone-300">
              <RichTextEditor 
                value={formData.metrics} 
                onChange={(val) => setFormData({...formData, metrics: val})} 
              />
            </div>
            <p className="mt-1 text-xs text-stone-500">Add Scopus IDs, UGC numbers, and SJIF scores here.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Indexing Badges (Comma Separated)</label>
            <textarea 
              value={indexersInput}
              onChange={(e) => setIndexersInput(e.target.value)}
              className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
              rows={3}
              placeholder="e.g., Scopus, Web of Science, UGC Care"
              required
            />
            <p className="mt-1 text-xs text-stone-500">Separate each platform with a comma to generate the badges.</p>
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
              {isSaving ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}