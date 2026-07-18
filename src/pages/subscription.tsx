import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Edit2 } from "lucide-react";
import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";

import Modal from "../components/common/Modal";
import RichTextEditor from "../components/common/RichTextEditor";

const defaultContent = `
  <h2 style="color: #450a0a;">Subscription Fees</h2>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem; border: 1px solid #d6d3d1;">
    <thead>
      <tr style="background-color: #f5f5f4; text-align: left;">
        <th style="padding: 12px; border: 1px solid #d6d3d1;">Category</th>
        <th style="padding: 12px; border: 1px solid #d6d3d1;">Indian (INR)</th>
        <th style="padding: 12px; border: 1px solid #d6d3d1;">Foreign (US $)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 12px; border: 1px solid #d6d3d1;">Subscription for Individual researchers (Annual)</td>
        <td style="padding: 12px; border: 1px solid #d6d3d1;">3000.00</td>
        <td style="padding: 12px; border: 1px solid #d6d3d1;">80.00</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #d6d3d1;">Life Subscription for Individual researcher</td>
        <td style="padding: 12px; border: 1px solid #d6d3d1;">8000.00</td>
        <td style="padding: 12px; border: 1px solid #d6d3d1;">250.00</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #d6d3d1;">Annual Subscription for University/Institutions</td>
        <td style="padding: 12px; border: 1px solid #d6d3d1;">3500.00</td>
        <td style="padding: 12px; border: 1px solid #d6d3d1;">100.00</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #d6d3d1;">Life Subscription for University/Institutions</td>
        <td style="padding: 12px; border: 1px solid #d6d3d1;">9000.00</td>
        <td style="padding: 12px; border: 1px solid #d6d3d1;">300.00</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color: #450a0a;">Payments</h2>
  <p>Payments should be in favor of <strong>"ARYAN RESEARCH & EDUCATIONAL TRUST"</strong> in the form of Bank Draft of any Nationalized Bank Payable at Yamuna Nagar (Haryana) India.</p>
`;

export default function Subscription() {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editContent, setEditContent] = useState("");

  const loadSubscriptionData = useCallback(async () => {
    try {
      const docRef = doc(db, "pages", "subscription");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().content) {
        return docSnap.data().content;
      }
      return defaultContent;
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      return defaultContent;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function initFetch() {
      const data = await loadSubscriptionData();
      if (isMounted) {
        setContent(data);
        setIsLoading(false);
      }
    }
    
    initFetch();
    
    return () => {
      isMounted = false;
    };
  }, [loadSubscriptionData]);

  const openEditModal = () => {
    setEditContent(content);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const docRef = doc(db, "pages", "subscription");
      await setDoc(docRef, { content: editContent }, { merge: true });
      
      const updatedContent = await loadSubscriptionData();
      setContent(updatedContent);
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save subscription details. Check console.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-stone-50">
        <div className="text-sm font-semibold tracking-widest text-stone-400 animate-pulse uppercase">
          Loading Subscription Details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="mx-auto max-w-4xl px-6">
        
        <div className="mb-12 flex flex-col items-center justify-between gap-6 border-b border-stone-200 pb-6 md:flex-row">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl" style={{ fontFamily: "'Cinzel', serif" }}>
              Subscription & Payments
            </h1>
            <div className="mt-4 h-1 w-16 rounded-full bg-red-950" />
          </div>

          {isAdmin && (
            <button 
              onClick={openEditModal}
              className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-red-950 shadow-sm ring-1 ring-stone-200 transition-all hover:bg-stone-50 hover:ring-red-950"
            >
              <Edit2 size={18} />
              Edit Details
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
          <div 
            className="prose prose-stone max-w-none prose-headings:font-bold prose-headings:text-red-950 prose-a:text-amber-600 hover:prose-a:text-amber-500"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Edit Subscription Details"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Page Content
            </label>
            <div className="overflow-hidden rounded-lg border border-stone-300">
              <RichTextEditor 
                value={editContent} 
                onChange={(val) => setEditContent(val)} 
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
    </div>
  );
}