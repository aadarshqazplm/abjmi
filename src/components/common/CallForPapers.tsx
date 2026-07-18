// import { useState } from "react";
// import { ArrowRight, Calendar, BookOpen } from "lucide-react";
// import EditButton from "../common/EditButton";

// export default function CallForPapers() {
//   const [details] = useState({
//     title: "Call for Papers",
//     volume: "Volume 15",
//     issue: "Issue 2",
//     deadline: "October 31, 2026",
//     description: "We are currently accepting original research articles, review papers, and short communications for our upcoming issue. All submissions undergo a rigorous double-blind peer review process."
//   });

//   const handleEdit = () => alert("Open Admin Modal: Edit Call For Papers");

//   return (
//     <section className="relative bg-stone-200 py-24">
//       <div className="mx-auto max-w-6xl px-6">
        
//         {/* Elevated Dark CTA Card */}
//         <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950 via-neutral-900 to-neutral-950 p-8 shadow-2xl md:p-14 lg:p-16">
          
//           {/* Subtle Background Accent */}
//           <div className="pointer-events-none absolute -right-20 -top-40 z-0 h-96 w-96 rounded-full bg-red-900/20 blur-[100px]" />
//           <div className="pointer-events-none absolute -bottom-40 -left-20 z-0 h-96 w-96 rounded-full bg-amber-500/10 blur-[100px]" />
          
//           <EditButton onClick={handleEdit} label="Edit CFP" />
          
//           <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            
//             {/* Left Content */}
//             <div className="lg:w-2/3">
//               <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400 backdrop-blur-sm">
//                 <span className="relative flex h-2 w-2">
//                   <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
//                   <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
//                 </span>
//                 Open For Submissions
//               </div>
              
//               <h2 
//                 className="mb-4 text-3xl font-semibold text-white md:text-4xl lg:text-5xl"
//                 style={{ fontFamily: "'Cinzel', serif" }}
//               >
//                 {details.title}: {details.volume}, {details.issue}
//               </h2>
              
//               <p className="max-w-2xl text-base leading-relaxed text-stone-300 md:text-lg">
//                 {details.description}
//               </p>
//             </div>

//             {/* Right Content (Action Area) */}
//             <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:w-1/3 lg:items-center lg:p-8">
              
//               <div className="flex flex-col items-center gap-2 text-center">
//                 <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
//                   Submission Deadline
//                 </span>
//                 <div className="flex items-center gap-2 text-lg font-semibold text-amber-400">
//                   <Calendar size={20} />
//                   {details.deadline}
//                 </div>
//               </div>
              
//               <div className="h-px w-full bg-white/10" />
              
//               <button className="group flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-4 text-sm font-bold tracking-wide text-red-950 shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]">
//                 <BookOpen size={18} />
//                 Submit Manuscript
//                 <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
//               </button>
              
//             </div>
//           </div>
//         </div>
        
//       </div>
//     </section>
//   );
// }

import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Calendar, BookOpen } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../hooks/useAuth";

import EditButton from "./EditButton";
import Modal from "./Modal";

interface CallForPapersContent {
  title: string;
  volume: string;
  issue: string;
  deadline: string;
  description: string;
}

const defaultContent: CallForPapersContent = {
  title: "Call for Papers",
  volume: "Volume 15",
  issue: "Issue 2",
  deadline: "December 2023",
  description: "We are currently accepting original research articles, review papers, and short communications for our upcoming issue. All submissions undergo a rigorous double-blind peer review process."
};

export default function CallForPapers() {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [content, setContent] = useState<CallForPapersContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CallForPapersContent>(defaultContent);

  const loadCallForPapersData = useCallback(async () => {
    try {
      const docRef = doc(db, "components", "callForPapers");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data()) {
        return docSnap.data() as CallForPapersContent;
      }
      return defaultContent;
    } catch (error) {
      console.error("Error fetching Call For Papers data:", error);
      return defaultContent;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function initFetch() {
      const data = await loadCallForPapersData();
      if (isMounted) {
        setContent(data);
        setIsLoading(false);
      }
    }
    
    initFetch();
    
    return () => {
      isMounted = false;
    };
  }, [loadCallForPapersData]);

  const openEditModal = () => {
    setFormData(content);
    setIsModalOpen(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const docRef = doc(db, "components", "callForPapers");
      await setDoc(docRef, formData, { merge: true });
      
      const updatedContent = await loadCallForPapersData();
      setContent(updatedContent);
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save Call For Papers section. Check console.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="flex min-h-[400px] w-full items-center justify-center bg-neutral-50 border-y border-neutral-200">
        <div className="flex items-center gap-3 text-sm font-semibold tracking-widest text-neutral-400 uppercase">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-red-950 py-24">
      <div className="mx-auto max-w-6xl px-6">
        
        {/* Elevated Light CTA Card with Neutral-900 styling */}
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl md:p-14 lg:p-16">
          
          {/* Admin Edit Controls */}
          {isAdmin && (
            <div className="absolute right-6 top-6 z-20">
              <EditButton onClick={openEditModal} label="Edit CFP" />
            </div>
          )}
          
          <div className="relative z-10 mt-12 flex flex-col gap-10 lg:mt-0 lg:flex-row lg:items-center lg:justify-between">
            
            {/* Left Content */}
            <div className="lg:w-2/3">
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-neutral-200 bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-neutral-900">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600"></span>
                </span>
                Open For Submissions
              </div>
              
              <h2 
                className="mb-4 text-3xl font-semibold text-neutral-900 md:text-4xl lg:text-5xl"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {content.title}: {content.volume}, {content.issue}
              </h2>
              
              <p className="max-w-2xl text-base leading-relaxed text-neutral-600 md:text-lg">
                {content.description}
              </p>
            </div>

            {/* Right Content (Action Area) */}
            <div className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 lg:w-1/3 lg:items-center lg:p-8">
              
              <div className="flex w-full flex-col items-center gap-2 text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                  Submission Deadline
                </span>
                <div className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
                  <Calendar size={20} className="text-neutral-700" />
                  {content.deadline}
                </div>
              </div>
              
              <div className="h-px w-full bg-neutral-200" />
              
              <button className="group flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-4 text-sm font-bold tracking-wide text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg">
                <BookOpen size={18} />
                <a 
                  href="mailto:aryabhattajmi@gmail.com?subject=Manuscript%20Submission%20-%20ABJMI"
                >
                  Submit manuscript
                </a>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              
            </div>
          </div>
        </div>
        
      </div>

      {/* Admin Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Edit Call For Papers"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6 text-left">
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-stone-700">Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                required
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Volume</label>
              <input 
                type="text" 
                name="volume" 
                value={formData.volume} 
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Issue</label>
              <input 
                type="text" 
                name="issue" 
                value={formData.issue} 
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                required
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-stone-700">Deadline</label>
              <input 
                type="text" 
                name="deadline" 
                value={formData.deadline} 
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full resize-none rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              rows={4}
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
              className="flex min-w-30 items-center justify-center rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-neutral-800 disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}