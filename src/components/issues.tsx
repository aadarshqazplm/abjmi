import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { Plus, Edit2, Trash2, Eye, EyeOff, Download, FileText, Calendar, Mail } from "lucide-react";
import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth"; 

import Modal from "../components/common/Modal";
import PDFUploader from "../components/common/PDFUploader";
import RichTextEditor from "../components/common/RichTextEditor";

interface JournalIssue {
  id?: string;
  volume: string;
  issueNumber: string;
  date: string;
  description: string;
  pdfUrl: string;
  isVisible: boolean;
}

const emptyIssue: JournalIssue = {
  volume: "",
  issueNumber: "",
  date: "",
  description: "",
  pdfUrl: "",
  isVisible: true,
};

// Define highly realistic fallback issues
const fallbackIssues: JournalIssue[] = [
  {
    id: "fallback-1",
    volume: "15",
    issueNumber: "2",
    date: "2023-12-01",
    description: "<p><strong>Focus Areas:</strong> Pure and Applied Mathematics, Statistics, Operations Research, and Reliability Technology. Featuring advanced case studies in Engineering Systems & Numerical Techniques.</p>",
    pdfUrl: "#",
    isVisible: true,
  },
  {
    id: "fallback-2",
    volume: "15",
    issueNumber: "1",
    date: "2023-06-01",
    description: "<p><strong>Focus Areas:</strong> Information Technology, Computer Science, Data Mining, Networking, Fuzzy Logic Systems, and Neural Networks.</p>",
    pdfUrl: "#",
    isVisible: true,
  }
];

export default function Issues() {
  const { role } = useAuth(); 
  const isAdmin = role === "admin";

  const [issues, setIssues] = useState<JournalIssue[]>([]);
  
  // Create a separate state for the global archive info
  const [archiveInfo, setArchiveInfo] = useState({
    archiveNote: "To get older volumes (1 to 9, all issues), please email the chief editor",
    archiveEmail: "aryabhattajmi@gmail.com"
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<JournalIssue>(emptyIssue);

  // Fetch logic serves fallbacks if empty or on error
  const loadDatabaseIssues = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "journalIssues"));
      
      if (querySnapshot.empty) {
        return fallbackIssues;
      }

      const fetchedIssues = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as JournalIssue[];
      
      // Safely sort even if some issues don't have dates (pushes dateless to bottom)
      fetchedIssues.sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return timeB - timeA;
      });

      return fetchedIssues;
    } catch (error) {
      console.error("Error fetching issues from database:", error);
      return fallbackIssues;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function initFetch() {
      // 1. Fetch Issues
      const issuesData = await loadDatabaseIssues();
      
      // 2. Fetch Archive Info from the components collection (to stay synced with home page)
      try {
        const archiveRef = doc(db, "components", "latestIssues");
        const archiveSnap = await getDoc(archiveRef);
        if (archiveSnap.exists() && archiveSnap.data() && isMounted) {
          const data = archiveSnap.data();
          setArchiveInfo({
            archiveNote: data.archiveNote || "To get older volumes (1 to 9, all issues), please email the chief editor",
            archiveEmail: data.archiveEmail || "aryabhattajmi@gmail.com"
          });
        }
      } catch (error) {
        console.error("Error fetching archive info:", error);
      }

      if (isMounted) {
        setIssues(issuesData);
        setIsLoading(false);
      }
    }
    
    initFetch();
    
    return () => {
      isMounted = false;
    };
  }, [loadDatabaseIssues]); 

  const openAddModal = () => {
    setFormData(emptyIssue);
    setIsModalOpen(true);
  };

  const openEditModal = (issue: JournalIssue) => {
    setFormData(issue);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (formData.id && !formData.id.startsWith("fallback-")) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...updateData } = formData; 
        const docRef = doc(db, "journalIssues", formData.id);
        await updateDoc(docRef, updateData);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...dataToSave } = formData; 
        await addDoc(collection(db, "journalIssues"), dataToSave);
      }
      
      const updatedIssues = await loadDatabaseIssues();
      setIssues(updatedIssues);
      
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save issue. Check console.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this issue? This cannot be undone.")) return;
    
    if (id.startsWith("fallback-")) {
      setIssues(issues.filter((issue) => issue.id !== id));
      return;
    }

    try {
      await deleteDoc(doc(db, "journalIssues", id));
      setIssues(issues.filter((issue) => issue.id !== id));
    } catch (error) {
      alert("Failed to delete.");
      console.error(error);
    }
  };

  const toggleVisibility = async (issue: JournalIssue) => {
    if (!issue.id) return;
    
    if (issue.id.startsWith("fallback-")) {
      setIssues(issues.map(i => i.id === issue.id ? { ...i, isVisible: !i.isVisible } : i));
      return;
    }

    try {
      const docRef = doc(db, "journalIssues", issue.id);
      await updateDoc(docRef, { isVisible: !issue.isVisible });
      setIssues(issues.map(i => i.id === issue.id ? { ...i, isVisible: !i.isVisible } : i));
    } catch (error) {
      console.error("Failed to toggle visibility", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-stone-50">
        <div className="text-sm font-semibold tracking-widest text-stone-400 animate-pulse uppercase">
          Loading Issues...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold text-red-950 md:text-4xl" style={{ fontFamily: "'Cinzel', serif" }}>
              Journal Issues
            </h1>
            <div className="mt-3 h-1 w-20 rounded-full bg-amber-500" />
          </div>

          {isAdmin && (
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-red-950 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-amber-400"
            >
              <Plus size={18} />
              Add New Issue
            </button>
          )}
        </div>

        {/* Tighter, wider grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => {
            if (!isAdmin && !issue.isVisible) return null;

            return (
              <div 
                key={issue.id} 
                className={`relative flex h-full flex-col justify-between overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-red-950/30 ${!issue.isVisible ? 'border-dashed border-stone-300 opacity-75' : 'border-stone-200 border-l-4 border-l-red-950'}`}
              >
                <div>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-md bg-red-950 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                        <FileText size={14} />
                      Issue {issue.issueNumber},  Vol {issue.volume}
                      </div>
                      
                      {/* Safely render the date only if it exists */}
                      {issue.date && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                          <Calendar size={12} className="text-amber-600" />
                          {new Date(issue.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>

                    {/* Admin Controls */}
                    {isAdmin && (
                      <div className="flex shrink-0 gap-1 rounded bg-stone-100 p-1">
                        <button 
                          onClick={() => toggleVisibility(issue)}
                          className={`rounded p-1.5 transition-colors ${issue.isVisible ? 'text-stone-500 hover:bg-white hover:text-stone-900' : 'bg-red-950 text-white'}`}
                          title={issue.isVisible ? "Hide from public" : "Publish to public"}
                        >
                          {issue.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button 
                          onClick={() => openEditModal(issue)}
                          className="rounded p-1.5 text-stone-500 transition-colors hover:bg-white hover:text-amber-600"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => issue.id && handleDelete(issue.id)}
                          className="rounded p-1.5 text-stone-500 transition-colors hover:bg-white hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Description - Adjusted spacing */}
                  <div 
                    className="mt-4 mb-5 line-clamp-4 text-sm leading-relaxed text-stone-700 prose-p:my-1 prose-strong:text-red-950" 
                    dangerouslySetInnerHTML={{ __html: issue.description }} 
                  />
                </div>
                
                {/* Download Button */}
                {issue.pdfUrl && issue.pdfUrl !== "#" ? (
                  <a 
                    href={issue.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={`Journal_Vol_${issue.volume}_Issue_${issue.issueNumber}.pdf`}
                    className="group flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-semibold text-red-950 transition-all hover:border-red-950 hover:bg-red-950 hover:text-white"
                  >
                    <Download size={16} className="transition-transform group-hover:-translate-y-0.5" />
                    Download PDF
                  </a>
                ) : (
                  <button 
                    disabled
                    className="group flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 bg-stone-100 px-4 py-2.5 text-sm font-semibold text-stone-400 cursor-not-allowed"
                    title="PDF not available for this issue"
                  >
                    <Download size={16} />
                    PDF Unavailable
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        {!isLoading && issues.length === 0 && (
          <div className="py-20 text-center text-sm font-medium text-stone-400">
            No issues have been published yet.
          </div>
        )}
        
        {/* Archives Notice - Now using the globally synced archiveInfo state */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 rounded-xl bg-white border border-stone-200 p-6 text-center sm:text-left shadow-sm">
          <p className="text-sm font-medium text-stone-700">
            {archiveInfo.archiveNote}
          </p>
          <a 
            href={`mailto:${archiveInfo.archiveEmail}`} 
            className="inline-flex items-center gap-1.5 font-bold text-red-950 hover:underline"
          >
            <Mail size={16} />
            {archiveInfo.archiveEmail}
          </a>
        </div>
      </div>

      {/* Admin Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={formData.id && !formData.id.startsWith("fallback-") ? "Edit Journal Issue" : "Publish New Issue"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-5 text-left">
          
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-bold text-stone-700">Volume</label>
              <input 
                type="text" 
                value={formData.volume}
                onChange={(e) => setFormData({...formData, volume: e.target.value})}
                 placeholder="e.g., 2"
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-stone-700">Issue Number</label>
              <input 
                type="text" 
                value={formData.issueNumber}
                onChange={(e) => setFormData({...formData, issueNumber: e.target.value})}
               
                placeholder="e.g., 15"
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-stone-700">Publication Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
              />
            </div>
          </div>

          <div>
            <PDFUploader 
              currentPdfUrl={formData.pdfUrl} 
              onUploadSuccess={(url) => setFormData({...formData, pdfUrl: url})} 
              folder="pdfs"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-stone-700">Brief Description / Table of Contents</label>
            <div className="rounded-lg border border-stone-200 overflow-hidden">
               <RichTextEditor 
                 value={formData.description} 
                 onChange={(val) => setFormData({...formData, description: val})} 
               />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 p-4">
            <input 
              type="checkbox" 
              id="isVisible" 
              checked={formData.isVisible}
              onChange={(e) => setFormData({...formData, isVisible: e.target.checked})}
              className="h-4 w-4 rounded border-gray-300 text-red-950 focus:ring-red-950"
            />
            <label htmlFor="isVisible" className="text-sm font-medium text-stone-700">
              Publish immediately (visible to public)
            </label>
          </div>

          <div className="mt-2 flex justify-end gap-3 border-t border-stone-200 pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-bold text-stone-600 transition-colors hover:bg-stone-200"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex min-w-30 items-center justify-center rounded-lg bg-red-950 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-red-900 disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save Issue"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}