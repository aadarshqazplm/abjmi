import { useState, useEffect, useCallback, type FormEvent} from "react";
import { 
  Calculator, 
  LineChart, 
  Terminal, 
  Atom, 
  Dna, 
  Cpu,
  Trash2,
  Plus
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../hooks/useAuth";

import EditButton from "./EditButton";
import Modal from "./Modal";

// Map string names from the database to actual Lucide components
const iconMap: Record<string, React.ElementType> = {
  Calculator,
  LineChart,
  Terminal,
  Atom,
  Dna,
  Cpu,
};

interface ResearchArea {
  name: string;
  iconName: string;
  desc: string;
}

const defaultAreas: ResearchArea[] = [
  { 
    name: "Mathematical & Statistical Sciences", 
    iconName: "Calculator",
    desc: "Pure and applied mathematics, probability, and advanced statistical modeling."
  },
  { 
    name: "IT, Management & Economics", 
    iconName: "LineChart",
    desc: "Intersections of technology management, economic theory, and digital business."
  },
  { 
    name: "Computer Science", 
    iconName: "Terminal",
    desc: "Algorithms, artificial intelligence, software engineering, and computation."
  },
  { 
    name: "Engineering Physics", 
    iconName: "Atom",
    desc: "Applied physics, materials science, and engineering principles."
  },
  { 
    name: "Bio-Mathematics", 
    iconName: "Dna",
    desc: "Mathematical biology, bioinformatics, and computational genomics."
  },
  { 
    name: "Information Technology", 
    iconName: "Cpu",
    desc: "Networks, cybersecurity, data science, and modern computing infrastructure."
  }
];

export default function ResearchAreas() {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [areas, setAreas] = useState<ResearchArea[]>(defaultAreas);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ResearchArea[]>(defaultAreas);

  const loadAreasData = useCallback(async () => {
    try {
      const docRef = doc(db, "components", "researchAreas");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().areas) {
        return docSnap.data().areas as ResearchArea[];
      }
      return defaultAreas;
    } catch (error) {
      console.error("Error fetching Research Areas data:", error);
      return defaultAreas;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function initFetch() {
      const data = await loadAreasData();
      if (isMounted) {
        setAreas(data);
        setIsLoading(false);
      }
    }
    
    initFetch();
    
    return () => {
      isMounted = false;
    };
  }, [loadAreasData]);

  const openEditModal = () => {
    setFormData(areas);
    setIsModalOpen(true);
  };

  // Handle changes for arrays inside the form
  const handleAreaChange = (index: number, field: keyof ResearchArea, value: string) => {
    const newFormData = [...formData];
    newFormData[index] = { ...newFormData[index], [field]: value };
    setFormData(newFormData);
  };

  const addArea = () => {
    setFormData([
      ...formData, 
      { name: "New Area", iconName: "Terminal", desc: "Description..." }
    ]);
  };

  const removeArea = (index: number) => {
    const newFormData = formData.filter((_, i) => i !== index);
    setFormData(newFormData);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const docRef = doc(db, "components", "researchAreas");
      await setDoc(docRef, { areas: formData }, { merge: true });
      
      const updatedAreas = await loadAreasData();
      setAreas(updatedAreas);
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save Research Areas. Check console.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="flex min-h-100 w-full items-center justify-center bg-white border-y border-neutral-200">
        <div className="flex items-center gap-3 text-sm font-semibold tracking-widest text-neutral-400 uppercase">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-white py-8">
      {/* Admin Edit Control */}
      {isAdmin && (
        <div className="absolute right-6 top-6 z-20">
          <EditButton onClick={openEditModal} label="Edit Areas" />
        </div>
      )}
      
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            Interdisciplinary Scope
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl" style={{ fontFamily: "'Cinzel', serif" }}>
            Areas of Research
          </h2>
          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-neutral-900" />
          <p className="mt-6 text-sm leading-relaxed text-neutral-500 max-w-2xl mx-auto">
            ABJMI is an international journal devoted to research and educational advances across multiple interconnected scientific and technical domains.
          </p>
        </div>

        {/* Upgraded Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, idx) => {
            // Map the string name back to the component, fallback to Terminal if not found
            const Icon = iconMap[area.iconName] || Terminal; 
            
            return (
              <div 
                key={idx}
                className="group relative flex flex-col items-start overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:bg-white hover:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)]"
              >
                {/* Decorative background accent that slides up on hover */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-red-800 via-red-900 to-yellow-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                {/* Icon Container */}
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 transition-colors duration-300 group-hover:bg-red-950 group-hover:ring-red-950">
                  <Icon className="text-neutral-700 transition-colors duration-300 group-hover:text-white" size={26} strokeWidth={1.5} />
                </div>
                
                {/* Text Content */}
                <h3 className="mb-3 text-lg font-bold leading-tight text-neutral-900 transition-colors duration-300 group-hover:text-neutral-900">
                  {area.name}
                </h3>
                
                <p className="text-sm leading-relaxed text-neutral-500">
                  {area.desc}
                </p>
              </div>
            );
          })}
        </div>
        
      </div>

      {/* Admin Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Edit Research Areas"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6 text-left">
          
          <div className="max-h-[60vh] overflow-y-auto pr-2 flex flex-col gap-4">
            {formData.map((area, index) => (
              <div key={index} className="relative rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                
                <button 
                  type="button"
                  onClick={() => removeArea(index)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-red-600 transition-colors"
                  title="Remove Area"
                >
                  <Trash2 size={18} />
                </button>

                <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 pr-8">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-700">Area Name</label>
                    <input 
                      type="text" 
                      value={area.name} 
                      onChange={(e) => handleAreaChange(index, "name", e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 p-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-700">Icon Name</label>
                    <select
                      value={area.iconName}
                      onChange={(e) => handleAreaChange(index, "iconName", e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 p-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                    >
                      {Object.keys(iconMap).map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Description</label>
                  <textarea 
                    value={area.desc}
                    onChange={(e) => handleAreaChange(index, "desc", e.target.value)}
                    className="w-full resize-none rounded-lg border border-neutral-300 p-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                    rows={2}
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addArea}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
          >
            <Plus size={16} /> Add Research Area
          </button>

          <div className="mt-2 flex justify-end gap-3 border-t border-neutral-100 pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex min-w-30 items-center justify-center rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-neutral-800 disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}