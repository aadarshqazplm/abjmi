import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Scale, CreditCard, Target, ChevronDown, CheckCircle2, Users } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

import EditButton from "./common/EditButton";
import Modal from "./common/Modal";
import { useAuth } from "../hooks/useAuth";

// --- Types & Default Data ---
interface Trustee {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  email?: string;
  phone?: string;
}

interface JournalInfoContent {
  ethicsIntro: string;
  ethicsGuidelines: { id: string; title: string; text: string }[];
  subscriptionPaymentInfo: string;
  subscriptions: { id: string; type: string; inr: string; usd: string }[];
  goalAndMission: { trustInfo: string; journalInfo: string; publisherInfo: string };
  trustees: Trustee[];
}

const defaultContent: JournalInfoContent = {
  ethicsIntro: "The Aryabhatta Journal of Mathematics & Informatics and its Publisher, are members of the Committee on Publication Ethics (COPE). This journal follows the Code of Conduct and Best Practice Guidelines for Editors and the Code of Conduct for Publishers. It is expected of authors, reviewers and editors that they follow the best-practice guidelines on ethical behavior contained therein.",
  ethicsGuidelines: [
    { id: "1", title: "1. Confidentiality", text: "Editors and editorial staff will not disclose any information about a submitted manuscript to anyone other than the corresponding author, reviewers, potential reviewers, and the publisher, as appropriate." },
    { id: "2", title: "2. Disclosure and conflicts of interest", text: "Editors and editorial board members will not use unpublished information disclosed in a submitted manuscript for their own research purposes without the authors’ explicit written consent. Privileged information or ideas obtained by editors must be kept confidential." },
    { id: "3", title: "3. Publication decisions", text: "Manuscripts submitted are evaluated entirely on the basis of their scientific content, research methodology, and findings. Authors attest that their work is original and unpublished elsewhere. All manuscripts undergo peer-review by at least two experts." },
    { id: "4", title: "4. Duties of Reviewers & Objectivity", text: "Peer review assists editors in making editorial decisions. Reviews should be conducted objectively with clearly formulated observations and supporting arguments. Personal criticism is inappropriate." },
    { id: "5", title: "5. Duties of Authors & Reporting standards", text: "Authors of original research should present an accurate account of the work performed and an objective discussion of its significance. Fraudulent or knowingly inaccurate statements are unacceptable." },
    { id: "6", title: "6. Originality and plagiarism", text: "Authors should ensure that they have written entirely original works. Plagiarism in all its forms constitutes unethical publishing behavior and is unacceptable." },
    { id: "7", title: "7. Multiple or concurrent submission", text: "Papers describing essentially the same research should not be published in more than one journal. Concurrent submission is unethical publishing behavior." },
    { id: "8", title: "8. Acknowledgment of sources", text: "Authors should ensure that they have properly acknowledged the work of others. Information obtained privately must not be used without explicit, written permission." },
    { id: "9", title: "9. Peer review cooperation", text: "Authors are obliged to participate in the peer review process and respond promptly to editors’ requests for data, clarifications, and revisions." },
    { id: "10", title: "10. Ethical/Legal Consideration", text: "Final responsibility rests with the author, not with the journal. All disputes are subject to Jagadhri/ Yamunanagar (Haryana), India, Jurisdiction only." }
  ],
  subscriptionPaymentInfo: "Payments should be made in favour of \"ARYANS RESEARCH & EDUCATIONAL TRUST\" in the form of Bank Draft of any Nationalised Bank Payable at Jagadhri / Yamuna Nagar (Haryana) India.",
  subscriptions: [
    { id: "sub-1", type: "Subscription for individuals researchers (Per Issue)", inr: "600.00", usd: "30.00" },
    { id: "sub-2", type: "Life Subscription for individuals/ research scholar", inr: "6000.00", usd: "200.00" },
    { id: "sub-3", type: "Annual Subscription for Libraries/Institutions", inr: "1760.00", usd: "40.00" },
    { id: "sub-4", type: "Subscription for two years (4 volumes)", inr: "2700.00", usd: "60.00" },
    { id: "sub-5", type: "Life Subscription for Libraries/Institutions", inr: "8000.00", usd: "400.00" },
  ],
  goalAndMission: {
    trustInfo: "The Aryan Research and Education Trust (Registration No. 2655) is an organization that promotes high academic achievement for all students at all levels, particularly in the field of Mathematics & Statistical Science, Operation Research (O.R.) Management and economics, Computer Science, Engineering Physics and Information Technology.\n\nWe were founded for one reason and one reason alone: to push and cajole our country toward educational advance.",
    journalInfo: "Arya Bhatta Journal of Mathematics and Informatics ISSN 0975-7139 & 2394-9309 was started in 2009 on behalf of Registered Trust/Society 'Aryans Research & Education Trust'.\n\nAn international journal devoted to research and education advances in the field of Mathematics & Statistical Science, Operation Research (O.R.) Management and economics, Computer Science, Engineering Physics and Information Technology.",
    publisherInfo: "This journal is published by a group of enthusiastic lecturers, professors, managers, engineers, executives and researchers from various universities, organizations and institutions. ABJMI aims to foster a rich exchange of ideas among researchers by publishing research articles with emphasis on quantified approach and applications to various related areas. Case studies of interesting practical applications, survey and reviews of the above mentioned areas will also be published."
  },
  trustees: [
    {
      id: "t1",
      name: "Dr. T. P. Singh",
      role: "Chief Editor",
      affiliation: "Aryan Research and Educational Trust"
    },
    {
      id: "t2",
      name: "Dr. Vinod Kumar",
      role: "Asitt. Editor",
      affiliation: "Associate Professor & Registrar, SBMN Engg. College & University, Asthal Bohr, Rohtak",
      email: "kakoriavinod@rediffmail.com",
      phone: "+91 - 9812085111"
    },
    {
      id: "t3",
      name: "Mrs. Renu Singh",
      role: "MBA, Human Resource Advisor",
      affiliation: "Virginia, USA",
      email: "renusingh.malik@gmail.com",
      phone: "+1-571-286-6081"
    }
  ]
};

// --- Main Component ---
export default function JournalInformation() {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [content, setContent] = useState<JournalInfoContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ethics" | "subscription" | "mission" | "trustees">("ethics");
  const [openAccordion, setOpenAccordion] = useState<string | null>("1");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<JournalInfoContent>(defaultContent);

  const loadData = useCallback(async () => {
    try {
      const docRef = doc(db, "components", "journalInformation");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data()) {
        const dbData = docSnap.data() as Partial<JournalInfoContent>;
        // Merge with default content to ensure the new trustees array exists 
        // even if the database document is older and missing it.
        return { ...defaultContent, ...dbData };
      }
      return defaultContent;
    } catch (error) {
      console.error("Error fetching Journal Info:", error);
      return defaultContent;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function initFetch() {
      const data = await loadData();
      if (isMounted) {
        setContent(data);
        setIsLoading(false);
      }
    }
    initFetch();
    return () => { isMounted = false; };
  }, [loadData]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const docRef = doc(db, "components", "journalInformation");
      await setDoc(docRef, formData, { merge: true });
      const updatedContent = await loadData();
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
      <section className="flex min-h-[500px] w-full items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-3 text-sm font-semibold tracking-widest text-neutral-400 uppercase">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          Loading Context...
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-neutral-50 pt-12 pb-24">
      {isAdmin && (
        <div className="absolute right-6 top-6 z-20">
          <EditButton onClick={() => { setFormData(content); setIsModalOpen(true); }} label="Edit Journal Info" />
        </div>
      )}

      <div className="mx-auto max-w-5xl px-6">
        
        {/* Header */}
        <div className="mb-6 text-center mt-2">
          <h2 className="text-3xl font-bold text-red-950 md:text-4xl" style={{ fontFamily: "'Cinzel', serif" }}>
            Journal Information
          </h2>
          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-red-950" />
        </div>

        {/* Custom Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2 border-b border-neutral-200 pb-4">
          <button 
            onClick={() => setActiveTab("ethics")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-colors ${activeTab === "ethics" ? "bg-red-950 text-white" : "bg-transparent text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"}`}
          >
            <Scale size={18} /> Ethics & Malpractice
          </button>
          <button 
            onClick={() => setActiveTab("subscription")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-colors ${activeTab === "subscription" ? "bg-red-950 text-white" : "bg-transparent text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"}`}
          >
            <CreditCard size={18} /> Subscription Fees
          </button>
          <button 
            onClick={() => setActiveTab("mission")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-colors ${activeTab === "mission" ? "bg-red-950 text-white" : "bg-transparent text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"}`}
          >
            <Target size={18} /> Goal & Mission
          </button>
          <button 
            onClick={() => setActiveTab("trustees")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-colors ${activeTab === "trustees" ? "bg-red-950 text-white" : "bg-transparent text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"}`}
          >
            <Users size={18} /> Trustees
          </button>
        </div>

        {/* Tab 1: Ethics */}
        {activeTab === "ethics" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 rounded-xl bg-white p-6 text-sm leading-relaxed text-neutral-600 shadow-sm border border-neutral-200">
              {content.ethicsIntro}
            </div>
            <div className="space-y-3">
              {content.ethicsGuidelines.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                  <button 
                    onClick={() => setOpenAccordion(openAccordion === item.id ? null : item.id)}
                    className="flex w-full items-center justify-between bg-white px-6 py-4 text-left font-bold text-neutral-900 transition-colors hover:bg-neutral-50 focus:outline-none"
                  >
                    {item.title}
                    <ChevronDown size={18} className={`transition-transform duration-300 ${openAccordion === item.id ? "rotate-180 text-neutral-900" : "text-neutral-400"}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ease-in-out ${openAccordion === item.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <div className="border-t border-neutral-100 px-6 py-4 text-sm leading-relaxed text-neutral-600">
                        {item.text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Subscription */}
        {activeTab === "subscription" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="bg-neutral-100 text-xs uppercase text-neutral-900">
                  <tr>
                    <th className="px-6 py-4 font-bold rounded-tl-lg">Subscription Type</th>
                    <th className="px-6 py-4 font-bold">INR (₹)</th>
                    <th className="px-6 py-4 font-bold rounded-tr-lg">USD ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {content.subscriptions.map((sub) => (
                    <tr key={sub.id} className="transition-colors hover:bg-neutral-50">
                      <td className="px-6 py-4 font-medium text-neutral-900">{sub.type}</td>
                      <td className="px-6 py-4">{sub.inr}</td>
                      <td className="px-6 py-4">{sub.usd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8 flex items-start gap-4 rounded-xl bg-neutral-100 p-6 text-sm text-neutral-700">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-neutral-900" />
              <p className="leading-relaxed font-medium">{content.subscriptionPaymentInfo}</p>
            </div>
          </div>
        )}

        {/* Tab 3: Goal & Mission */}
        {activeTab === "mission" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm lg:p-10">
              <h3 className="text-2xl font-bold text-neutral-900 mb-8" style={{ fontFamily: "'Cinzel', serif" }}>
                Our Goal & Mission
              </h3>
              
              <div className="space-y-6 text-sm leading-relaxed text-neutral-600">
                <div className="rounded-xl bg-neutral-50 p-6 border border-neutral-100">
                  <p className="whitespace-pre-wrap">{content.goalAndMission.trustInfo}</p>
                </div>
                
                <div className="rounded-xl bg-neutral-50 p-6 border border-neutral-100">
                  <p className="whitespace-pre-wrap">{content.goalAndMission.journalInfo}</p>
                </div>

                <div className="rounded-xl bg-neutral-50 p-6 border border-neutral-100">
                  <p className="whitespace-pre-wrap">{content.goalAndMission.publisherInfo}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Trustees */}
        {activeTab === "trustees" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {content.trustees.map((trustee) => (
                <div 
                  key={trustee.id} 
                  className="flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <h3 className="mb-1 text-lg font-bold text-red-950">{trustee.name}</h3>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
                    {trustee.role}
                  </p>
                  <p className="mb-5 text-sm font-medium leading-relaxed text-neutral-700">
                    {trustee.affiliation}
                  </p>
                  
                  {/* Push contact info to the bottom of the card if heights differ */}
                  <div className="mt-auto border-t border-neutral-100 pt-4 text-sm text-neutral-600">
                    {trustee.email && (
                      <div className="mb-2 flex items-start gap-2">
                        <span className="mt-0.5 font-bold text-neutral-900">Email:</span>
                        <a href={`mailto:${trustee.email}`} className="break-all transition-colors hover:text-red-950">
                          {trustee.email}
                        </a>
                      </div>
                    )}
                    {trustee.phone && (
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-neutral-900">Phone:</span>
                        <span>{trustee.phone}</span>
                      </div>
                    )}
                    {!trustee.email && !trustee.phone && (
                      <span className="italic text-neutral-400">Contact information not available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Basic Admin Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Journal Information">
        <form onSubmit={handleSave} className="flex flex-col gap-6 text-left">
          <div className="text-sm text-neutral-500 mb-4 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            For simplicity in this unified view, editing is enabled for primary text sections. To edit detailed arrays (like the 10 point guidelines), contact developers to implement nested array builders if needed.
          </div>

          <div className="max-h-[50vh] overflow-y-auto pr-2 flex flex-col gap-6">
            <div>
              <label className="mb-1 block text-sm font-bold text-neutral-700">Ethics Introduction</label>
              <textarea 
                value={formData.ethicsIntro} onChange={(e) => setFormData({...formData, ethicsIntro: e.target.value})}
                rows={4} className="w-full rounded-lg border border-neutral-300 p-3 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-neutral-700">Payment Instructions</label>
              <textarea 
                value={formData.subscriptionPaymentInfo} onChange={(e) => setFormData({...formData, subscriptionPaymentInfo: e.target.value})}
                rows={3} className="w-full rounded-lg border border-neutral-300 p-3 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <h4 className="mb-3 font-bold text-neutral-900">Goal & Mission</h4>
              
              <label className="mb-1 block text-xs font-bold text-neutral-700">Trust Information</label>
              <textarea 
                value={formData.goalAndMission.trustInfo} 
                onChange={(e) => setFormData({...formData, goalAndMission: {...formData.goalAndMission, trustInfo: e.target.value}})}
                rows={4} className="w-full mb-3 rounded-lg border border-neutral-300 p-3 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />

              <label className="mb-1 block text-xs font-bold text-neutral-700">Journal Origins</label>
              <textarea 
                value={formData.goalAndMission.journalInfo} 
                onChange={(e) => setFormData({...formData, goalAndMission: {...formData.goalAndMission, journalInfo: e.target.value}})}
                rows={4} className="w-full mb-3 rounded-lg border border-neutral-300 p-3 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />

              <label className="mb-1 block text-xs font-bold text-neutral-700">Publisher Information</label>
              <textarea 
                value={formData.goalAndMission.publisherInfo} 
                onChange={(e) => setFormData({...formData, goalAndMission: {...formData.goalAndMission, publisherInfo: e.target.value}})}
                rows={4} className="w-full rounded-lg border border-neutral-300 p-3 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-70">
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

    </section>
  );
}