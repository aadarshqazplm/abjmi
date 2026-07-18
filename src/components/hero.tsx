import { useState, useEffect, useCallback, useMemo } from "react";
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
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
  activeIndex: number;
}

const defaultContent: HeroContent = {
  journalName: "Aryabhatta Journal of Mathematics and Informatics",
  issn: "ISSN 0975-7139 & 2394-9309",
  headline: "An international journal devoted to research and education advances",
  description: "<p>The <strong>Aryan Research and Education Trust (Registration No. 2655)</strong> is an organization that promotes high academic achievement for all students at all levels, particularly in the field of Mathematics & Statistical Science, Operation Research (O.R.) Management and economics, Computer Science, Engineering Physics and Information Technology.</p><p>We were founded for one reason and one reason alone: to push and cajole our country toward educational advance.</p>",
  imageUrl1: journalCover,
  imageUrl2: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=600&auto=format&fit=crop",
  imageUrl3: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop",
  activeIndex: 0,
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
        return { ...defaultContent, ...docSnap.data() } as HeroContent;
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

  // Image alternating logic
  const images = useMemo(() => [content.imageUrl1, content.imageUrl2, content.imageUrl3], [content]);

  const handleImageClick = () => {
    setContent((prev) => ({
      ...prev,
      activeIndex: (prev.activeIndex + 1) % images.length,
    }));
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

        {/* Stacked Images Section */}
        <div 
          className="relative w-full max-w-sm mx-auto pb-16 lg:pb-0 cursor-pointer"
          onClick={handleImageClick}
        >
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-amber-500/40 to-red-600/40 opacity-50 blur-2xl"></div>
          
          {images.map((imgUrl, index) => {
            const isActive = index === content.activeIndex;
            const isNext = index === (content.activeIndex + 1) % images.length;
            const isLast = index === (content.activeIndex + 2) % images.length;

            let stackingClass = "z-10 opacity-100 scale-100";
            let transformClass = "";

            if (isNext) {
              stackingClass = "z-0 opacity-80 scale-95";
              transformClass = "translate-x-4 translate-y-4";
            } else if (isLast) {
              stackingClass = "z-[-1] opacity-60 scale-90";
              transformClass = "translate-x-8 translate-y-8";
            }

            return (
              <img
                key={index}
                src={imgUrl}
                alt={`Aryabhatta Journal Stack Image ${index + 1}`}
                className={`absolute top-0 left-0 ${isActive ? 'relative' : 'absolute'} transition-all duration-300 ease-in-out w-full aspect-[3/4] object-contain rounded-2xl border border-white/10 shadow-2xl bg-white ${stackingClass} ${transformClass}`}
              />
            );
          })}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Edit Hero Section"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6 text-left">
          
          <div>
            <h3 className="mb-3 block text-sm font-medium text-stone-700">Journal Image Stack</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-stone-500">Image 1 (Main)</label>
                  <ImageUploader 
                      currentImageUrl={formData.imageUrl1} 
                      onUploadSuccess={(url) => setFormData({ ...formData, imageUrl1: url })} 
                      folder="hero"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-stone-500">Image 2</label>
                  <ImageUploader 
                      currentImageUrl={formData.imageUrl2} 
                      onUploadSuccess={(url) => setFormData({ ...formData, imageUrl2: url })} 
                      folder="hero"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-stone-500">Image 3</label>
                  <ImageUploader 
                      currentImageUrl={formData.imageUrl3} 
                      onUploadSuccess={(url) => setFormData({ ...formData, imageUrl3: url })} 
                      folder="hero"
                  />
                </div>
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