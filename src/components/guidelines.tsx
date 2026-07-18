import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Edit2 } from "lucide-react";
import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";

import Modal from "../components/common/Modal";
import RichTextEditor from "../components/common/RichTextEditor";

const defaultContent = `
  <h2>Author Guidelines for Manuscript Submission</h2>
  <ol>
    <li>The authors have to send the copy of manuscript through e-mail <strong>aryabhattajmi@gmail.com</strong> OR <strong>tpsingh78@yahoo.com</strong> and are expected to submit one hardcopy of the paper in MS-Word. Chart, Graph and Diagram should be in MS-Excel.</li>
    <li>The author's have to provide one email id for communication purpose and postal address with contact number.</li>
    <li>A brief abstract, free from formulae's should be included at the beginning of the paper. Figures should be drawn in black ink so that they come good when printed by a Laser Printer.</li>
    <li>In general, there is no page limit for the paper. However, the authors are requested that manuscript should not exceed beyond 15 pages on A-4 sizes paper in double line spacing and single column with 1" margin, Title Font - Times New Roman (14 Point Size), Author's Name (11 Point Size), Designation (8 Point Size), Abstract (10 Point Size Italic) and rest matter is 11 Point Size, in accordance with the format mark of standard journals.</li>
    <li>It is a pre-condition of publication in AJMI that the research paper should not have already been published or submitted elsewhere for possible publication. A certificate in this regard is to be submitted by authors while submitting the paper.</li>
    <li>References should be listed in the increasing order of the publication year. All references should quote the complete title of journals and books with page numbers. The name of the country publishing the journal should also be mentioned.</li>
    <li>The publication of the paper is the entire responsibility of the author(s) for its originality though opinion of referees/experts' is sought by the Editorial office. The authors are required to make self plagiarism <em>(not exceeding 20%)</em> and avoid copying.</li>
    <li>The Editorial Board reserves the right to condense or make necessary alterations in the typed script and may not necessary agree with the views expressed by the authors.</li>
    <li>No paper of the journal will be reprinted without the prior permission of the Chief Editor. Page Charges: After a manuscript has been accepted for publication the author (s) shall be required to pay charges for the total pages of the typed paper in order to meet partially the cost of publication Including reprints, preparation of figures, blocks, subscription cost, postage charges etc.</li>
  </ol>

  <h3>Ethical / Legal Consideration</h3>
  <p>A Submitted manuscript must be an original contribution not previously published, must not be under consideration for publication elsewhere in similar form. Although the editors and referees make every effort to ensure the validity of published manuscripts, the final responsibility rests with the authors, not with the journal, its editor, or the publisher. All disputes are subject to Jagadhri/Yamunanagar (Haryana) Jurisdiction only.</p>
`;

export default function Guidelines() {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editContent, setEditContent] = useState("");

  const loadGuidelines = useCallback(async () => {
    try {
      const docRef = doc(db, "pages", "guidelines");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().content) {
        return docSnap.data().content;
      }
      return defaultContent;
    } catch (error) {
      console.error("Error fetching guidelines:", error);
      return defaultContent;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function initFetch() {
      const data = await loadGuidelines();
      if (isMounted) {
        setContent(data);
        setIsLoading(false);
      }
    }
    initFetch();
    return () => {
      isMounted = false;
    };
  }, [loadGuidelines]);

  const openEditModal = () => {
    setEditContent(content);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const docRef = doc(db, "pages", "guidelines");
      await setDoc(docRef, { content: editContent }, { merge: true });
      const updatedContent = await loadGuidelines();
      setContent(updatedContent);
      setIsModalOpen(false);
    } catch (error) {
      alert(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-stone-50">
        <div className="text-sm font-semibold tracking-widest text-stone-400 animate-pulse uppercase">
          Loading Guidelines...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 md:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold text-red-950 md:text-4xl" style={{ fontFamily: "'Cinzel', serif" }}>
              Author Guidelines
            </h1>
            <div className="mt-3 h-1 w-20 rounded-full bg-amber-500" />
          </div>

          {isAdmin && (
            <button 
              onClick={openEditModal}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-red-950 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-amber-400"
            >
              <Edit2 size={18} />
              Edit Content
            </button>
          )}
        </div>

        {/* Content Section with explicit styling selectors to bypass missing Prose configuration */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm md:p-10">
          <div 
            className="
              [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-red-950 [&>h2]:mb-6 [&>h2]:font-['Cinzel',serif]
              [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-red-950 [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:font-['Cinzel',serif]
              [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-4 [&>ol]:mb-8
              [&>ol>li]:text-stone-700 [&>ol>li]:leading-relaxed [&>ol>li]:pl-2
              [&>ol>li::marker]:text-amber-500 [&>ol>li::marker]:font-bold [&>ol>li::marker]:text-lg
              [&>p]:text-stone-700 [&>p]:leading-relaxed
              [&_strong]:font-semibold [&_strong]:text-red-950
              [&_em]:italic [&_em]:text-stone-500
            "
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      {/* Admin Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Edit Guidelines"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-5 text-left">
          
          <div>
            <label className="mb-2 block text-sm font-bold text-stone-700">
              Page Content
            </label>
            <div className="overflow-hidden rounded-lg border border-stone-200">
              <RichTextEditor 
                value={editContent} 
                onChange={setEditContent} 
              />
            </div>
            <p className="mt-2 text-xs text-stone-500">
              Use the toolbar to format your text, add lists, or insert links to external templates.
            </p>
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
              {isSaving ? "Saving..." : "Save Guidelines"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}