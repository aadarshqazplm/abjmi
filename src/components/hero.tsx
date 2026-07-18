import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";

// Import your local asset here. Adjust the path if your assets folder is located elsewhere.
import journalCover from "../assets/cp.png";

import EditButton from "./common/EditButton";
import Modal from "./common/Modal";
import RichTextEditor from "./common/RichTextEditor";
import ImageUploader from "./common/ImageUploader";

interface HeroContent {
  journalName: string;
  issn: string;
  headline: string;
  description: string;
  imageUrl: string;
}

const defaultContent: HeroContent = {
  journalName: "Aryabhatta Journal of Mathematics and Informatics",
  issn: "ISSN 0975-7139 & 2394-9309",
  headline: "An international journal devoted to research and education advances",
  description: "<p>The <strong>Aryan Research and Education Trust (Registration No. 2655)</strong> is an organization that promotes high academic achievement for all students at all levels, particularly in the field of Mathematics & Statistical Science, Operation Research (O.R.) Management and economics, Computer Science, Engineering Physics and Information Technology.</p><p>We were founded for one reason and one reason alone: to push and cajole our country toward educational advance.</p>",
  imageUrl: journalCover 
};

export default function Hero() {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [content, setContent] = useState<HeroContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<HeroContent>(defaultContent);

  const loadHeroData = useCallback(async () => {
    try {
      const docRef = doc(db, "components", "hero");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data()) {
        return docSnap.data() as HeroContent;
      }
      return defaultContent;
    } catch (error) {
      console.error("Error fetching hero data:", error);
      return defaultContent;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function initFetch() {
      const data = await loadHeroData();
      if (isMounted) {
        setContent(data);
        setIsLoading(false);
      }
    }
    
    initFetch();
    
    return () => {
      isMounted = false;
    };
  }, [loadHeroData]);

  const openEditModal = () => {
    setFormData(content);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const docRef = doc(db, "components", "hero");
      await setDoc(docRef, formData, { merge: true });
      
      const updatedContent = await loadHeroData();
      setContent(updatedContent);
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save hero section. Check console.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="flex min-h-screen w-full items-center justify-center bg-red-950">
        <div className="text-sm font-semibold tracking-widest text-amber-500 animate-pulse uppercase">
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-screen w-full items-center bg-neutral-900 px-6 py-12 lg:py-0 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop" 
          alt="Mathematics Background" 
          className="h-full w-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/50 via-red-950/70 to-neutral-950/60" />
      </div>

      {isAdmin && (
        <div className="absolute top-6 right-6 z-20">
          <EditButton onClick={openEditModal} label="Edit Hero" />
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-7xl grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
        
        <div className="border-l-4 border-amber-500 pl-6 md:pl-10 pt-16 lg:pt-0">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-900/50 px-4 py-1.5 border border-red-800/50 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
              {content.issn}
            </p>
          </div>
          
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-4xl drop-shadow-md" style={{ fontFamily: "'Cinzel', serif", lineHeight: 1.15 }}>
            {content.journalName}
          </h1>
          
          <h2 className="mb-4 text-lg font-medium text-stone-200 md:text-lg leading-relaxed">
            {content.headline}
          </h2>
          
          <div 
            className="mb-10 text-base leading-relaxed text-stone-400 prose-p:mb-4 prose-strong:text-stone-200"
            dangerouslySetInnerHTML={{ __html: content.description }}
          />
          
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              to="/issues"
              className="rounded-lg bg-amber-500 px-8 py-3.5 text-sm font-bold text-red-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:-translate-y-0.5"
            >
              Current Issue
            </Link>
            <a 
              href="mailto:aryabhattajmi@gmail.com?subject=Manuscript%20Submission%20-%20ABJMI"
              className="rounded-lg border border-stone-400 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white/10 hover:-translate-y-0.5"
            >
              Submit Paper
            </a>
          </div>
        </div>

        {/* FIXED: Changed max-w-lg to max-w-sm to drastically reduce the image size while keeping it centered */}
        <div className="relative w-full max-w-sm mx-auto pb-16 lg:pb-0">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-amber-500/40 to-red-600/40 opacity-50 blur-2xl"></div>
          <img 
            src={content.imageUrl} 
            alt="Aryabhatta Journal Concept" 
            className="relative z-10 w-full aspect-[3/4] object-contain rounded-2xl border border-white/10 shadow-2xl bg-white"
          />
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Edit Hero Section"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6 text-left">
          
          <div className="flex justify-center">
             <div className="w-full max-w-sm">
                <ImageUploader 
                  currentImageUrl={formData.imageUrl} 
                  onUploadSuccess={(url) => setFormData({...formData, imageUrl: url})} 
                  folder="hero"
                />
             </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Journal Name</label>
            <input 
              type="text" 
              value={formData.journalName}
              onChange={(e) => setFormData({...formData, journalName: e.target.value})}
              className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">ISSN & Online ID</label>
            <input 
              type="text" 
              value={formData.issn}
              onChange={(e) => setFormData({...formData, issn: e.target.value})}
              className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Headline</label>
            <input 
              type="text" 
              value={formData.headline}
              onChange={(e) => setFormData({...formData, headline: e.target.value})}
              className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Mission Description</label>
            <div className="overflow-hidden rounded-lg border border-stone-300">
              <RichTextEditor 
                value={formData.description} 
                onChange={(val) => setFormData({...formData, description: val})} 
              />
            </div>
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