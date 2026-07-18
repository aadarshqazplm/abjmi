import { useState, useEffect, useCallback, type FormEvent, type ChangeEvent } from "react";
import { Download, FileText, Mail, ArrowRight, ExternalLink } from "lucide-react";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../hooks/useAuth";

import EditButton from "./EditButton";
import Modal from "./Modal";
import PDFUploader from "../common/PDFUploader"; // Adjust this path if needed

// Added JournalIssue interface to match the data structure from the database
interface JournalIssue {
  id: string;
  volume: string;
  issueNumber: string;
  date: string;
  description: string;
  pdfUrl: string;
  isVisible: boolean;
}

interface LatestIssuesContent {
  announcementTitle: string;
  announcementText: string;
  conferenceLinkText: string;
  conferencePdfUrl: string;
  archiveNote: string;
  archiveEmail: string;
}

const defaultContent: LatestIssuesContent = {
  announcementTitle: "Dear Researchers, Authors & Academicians",
  announcementText: "Congratulations to respective researchers, authors & academicians for their contributions to Vol #13 Issue #1 of ABJMI. It has been published and a pdf file has been sent. Feel free to reach out to Chief Editor for any questions/clarifications.\n\nPlease also note updates to ABJMI's publication ethics and malpractice statement.",
  conferenceLinkText: "Proceedings of International Conference Inside Pages",
  conferencePdfUrl: "#",
  archiveNote: "To get older volumes (1 to 9, all issues), please email the chief editor",
  archiveEmail: "aryabhattajmi@gmail.com",
};

export default function LatestIssues() {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [content, setContent] = useState<LatestIssuesContent>(defaultContent);
  const [issues, setIssues] = useState<JournalIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<LatestIssuesContent>(defaultContent);

  // Fetch Announcement Data
  const loadData = useCallback(async () => {
    try {
      const docRef = doc(db, "components", "latestIssues");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data()) {
        return docSnap.data() as LatestIssuesContent;
      }
      return defaultContent;
    } catch (error) {
      console.error("Error fetching Latest Issues data:", error);
      return defaultContent;
    }
  }, []);

  // Fetch Journal Issues Data
  const loadIssues = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "journalIssues"));
      
      if (querySnapshot.empty) return [];

      const fetchedIssues = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as JournalIssue[];
      
      fetchedIssues.sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return timeB - timeA;
      });

      return fetchedIssues;
    } catch (error) {
      console.error("Error fetching issues from database:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function initFetch() {
      // Fetch both content and issues in parallel
      const [contentData, issuesData] = await Promise.all([loadData(), loadIssues()]);
      
      if (isMounted) {
        setContent(contentData);
        setIssues(issuesData);
        setIsLoading(false);
      }
    }
    initFetch();
    return () => { isMounted = false; };
  }, [loadData, loadIssues]);

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
      const docRef = doc(db, "components", "latestIssues");
      await setDoc(docRef, formData, { merge: true });
      
      const updatedContent = await loadData();
      setContent(updatedContent);
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save. Check console.");
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

  // Filter issues depending on role
  const displayIssues = issues.filter(issue => isAdmin || issue.isVisible);

  return (
    <section className="relative bg-red-950 py-8">
      {/* Admin Edit Control */}
      {isAdmin && (
        <div className="absolute right-6 top-6 z-20">
          <EditButton onClick={openEditModal} label="Edit Info" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6">
        
        {/* Header */}
        <div className="mb-12 border-b border-neutral-200 pb-6">
          <h2 className="text-3xl font-bold text-neutral-100 tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
            Publications & Announcements
          </h2>
          <div className="mt-4 h-1 w-24 rounded-full bg-neutral-100" />
        </div>

        {/* Announcement Block */}
        <div className="mb-12 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm lg:p-10">
          <h3 className="mb-4 text-xl font-bold text-neutral-900" style={{ fontFamily: "'Cinzel', serif" }}>
            {content.announcementTitle}
          </h3>
          <div className="whitespace-pre-wrap text-base leading-relaxed text-neutral-600">
            {content.announcementText}
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <span className="text-sm font-medium text-neutral-700">Authors, you can download the .pdf version here:</span>
            {content.conferencePdfUrl && content.conferencePdfUrl !== "#" ? (
              <a 
                href={content.conferencePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-red-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                <Download size={16} />
                {content.conferenceLinkText}
              </a>
            ) : (
              <button 
                disabled
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-500 cursor-not-allowed"
              >
                <Download size={16} />
                Link Unavailable
              </button>
            )}
          </div>
        </div>

        {/* Issues Grid */}
        <div className="mb-12">
          <h3 className="mb-6 text-xl font-bold text-neutral-100" style={{ fontFamily: "'Cinzel', serif" }}>
            Latest Issues
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
            
            {displayIssues.length === 0 ? (
               <div className="col-span-full py-10 text-center text-sm font-medium text-neutral-400">
                 No issues have been published yet.
               </div>
            ) : (
              displayIssues.slice(0, 4).map((issue) => (
                <div 
                  key={issue.id} 
                  className={`group flex flex-col justify-between overflow-hidden rounded-xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${!issue.isVisible ? 'border-dashed border-neutral-400 opacity-75' : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <div className="mb-4">
                    <div className="mb-2 text-neutral-400 flex justify-between">
                      <FileText size={24} strokeWidth={1.5} />
                      {!issue.isVisible && <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded">Hidden</span>}
                    </div>
                    <h4 className="text-lg font-bold text-neutral-900">
                      Volume {issue.volume}
                    </h4>
                    <p className="text-sm font-medium text-neutral-500">
                      Issue {issue.issueNumber}
                    </p>
                  </div>
                  
                  {issue.pdfUrl && issue.pdfUrl !== "#" ? (
                    <a 
                      href={issue.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-100 px-4 py-2.5 text-xs font-semibold text-neutral-700 transition-colors group-hover:bg-red-950 group-hover:text-white"
                    >
                      <Download size={14} />
                      Download PDF
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-50 px-4 py-2.5 text-xs font-semibold text-neutral-400 cursor-not-allowed border border-neutral-100"
                    >
                      <Download size={14} />
                      Unavailable
                    </button>
                  )}
                </div>
              ))
            )}

            {/* 5th Card: View All Issues Link (only renders if there are more than 4 issues) */}
            {displayIssues.length > 4 && (
              <a 
                href="/issues"
                className="group flex min-h-[160px] flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-200 bg-transparent p-5 text-center transition-all hover:border-neutral-900 hover:bg-neutral-900"
              >
                <div className="mb-3 rounded-full bg-neutral-100 p-3 transition-colors group-hover:bg-neutral-800">
                  <ArrowRight size={24} className="text-neutral-600 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 group-hover:text-neutral-100">
                  View All Archives
                </span>
              </a>
            )}

          </div>
        </div>

        {/* Archives Notice */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 rounded-xl bg-neutral-100 p-6 text-center sm:text-left">
          <p className="text-sm font-medium text-neutral-700">
            {content.archiveNote}
          </p>
          <a 
            href={`mailto:${content.archiveEmail}`} 
            className="inline-flex items-center gap-1.5 font-bold text-neutral-900 hover:underline"
          >
            <Mail size={16} />
            {content.archiveEmail}
          </a>
        </div>

      </div>

      {/* Admin Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Edit Announcements"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6 text-left">
          
          <div className="max-h-[65vh] overflow-y-auto pr-2 flex flex-col gap-8">
            
            {/* Announcements Section */}
            <div className="space-y-4">
              <h4 className="border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wider text-neutral-500">
                Announcement Section
              </h4>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">Announcement Title</label>
                <input 
                  type="text" name="announcementTitle" value={formData.announcementTitle} onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 p-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">Announcement Message</label>
                <textarea 
                  name="announcementText" value={formData.announcementText} onChange={handleChange} rows={4}
                  className="w-full resize-none rounded-lg border border-neutral-300 p-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Conference Link Text</label>
                  <input 
                    type="text" name="conferenceLinkText" value={formData.conferenceLinkText} onChange={handleChange}
                    className="w-full rounded-lg border border-neutral-300 p-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                
                {/* Replaced Text Input with PDF Uploader */}
                <div className="sm:col-span-2">
                  <PDFUploader 
                    currentPdfUrl={formData.conferencePdfUrl} 
                    onUploadSuccess={(url) => setFormData({...formData, conferencePdfUrl: url})} 
                    folder="conference"
                  />
                </div>
              </div>
            </div>

            {/* Archives Section */}
            <div className="space-y-4">
              <h4 className="border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wider text-neutral-500">
                Archives Notice
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Note Text</label>
                  <input 
                    type="text" name="archiveNote" value={formData.archiveNote} onChange={handleChange}
                    className="w-full rounded-lg border border-neutral-300 p-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Email Address</label>
                  <input 
                    type="text" name="archiveEmail" value={formData.archiveEmail} onChange={handleChange}
                    className="w-full rounded-lg border border-neutral-300 p-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>
            </div>

            {/* Notice about moving Issues */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <ExternalLink className="mt-0.5 text-blue-500" size={18} />
                <div>
                  <h5 className="text-sm font-bold text-blue-900">Issue Management Moved</h5>
                  <p className="mt-1 text-xs text-blue-700 leading-relaxed">
                    You no longer need to manage issues manually in this modal. All issues are automatically synced from the main <strong>Issues</strong> page. Go there to upload PDFs, manage visibility, or delete older issues.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4">
            <button 
              type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={isSaving}
              className="flex min-w-[120px] items-center justify-center rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-neutral-800 disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}