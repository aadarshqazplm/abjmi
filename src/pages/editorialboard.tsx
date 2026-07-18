// import { useState, useEffect, useCallback } from "react";
// import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
// import { Plus, Edit2, Trash2, User } from "lucide-react";
// import { db } from "../firebase/firebase";
// import { useAuth } from "../hooks/useAuth";

// import Modal from "../components/common/Modal";
// import ImageUploader from "../components/common/ImageUploader";
// import RichTextEditor from "../components/common/RichTextEditor";

// interface BoardMember {
//   id?: string;
//   name: string;
//   role: string;
//   affiliation: string;
//   image: string;
//   bio: string;
//   order: number;
// }

// const emptyMember: BoardMember = {
//   name: "",
//   role: "",
//   affiliation: "",
//   image: "",
//   bio: "",
//   order: 99,
// };

// export default function EditorialBoard() {
//   const { role: userRole } = useAuth();
//   const isAdmin = userRole === "admin";

//   const [members, setMembers] = useState<BoardMember[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
  
//   // Admin Form Modal State
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [formData, setFormData] = useState<BoardMember>(emptyMember);

//   // View Profile Modal State
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);

//   const loadDatabaseMembers = useCallback(async () => {
//     try {
//       const querySnapshot = await getDocs(collection(db, "editorialBoard"));
//       const fetchedMembers = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       })) as BoardMember[];
      
//       fetchedMembers.sort((a, b) => a.order - b.order);
//       return fetchedMembers;
//     } catch (error) {
//       console.error("Error fetching board members:", error);
//       return [];
//     }
//   }, []);

//   useEffect(() => {
//     let isMounted = true;
    
//     async function initFetch() {
//       const data = await loadDatabaseMembers();
//       if (isMounted) {
//         setMembers(data);
//         setIsLoading(false);
//       }
//     }
    
//     initFetch();
    
//     return () => {
//       isMounted = false;
//     };
//   }, [loadDatabaseMembers]);

//   const openAddModal = () => {
//     setFormData(emptyMember);
//     setIsModalOpen(true);
//   };

//   const openEditModal = (member: BoardMember, e: React.MouseEvent) => {
//     e.stopPropagation(); // Prevent opening the view modal
//     setFormData(member);
//     setIsModalOpen(true);
//   };

//   const handleDelete = async (id: string, e: React.MouseEvent) => {
//     e.stopPropagation(); // Prevent opening the view modal
//     if (!window.confirm("Are you sure you want to remove this member?")) return;
    
//     try {
//       await deleteDoc(doc(db, "editorialBoard", id));
//       setMembers(members.filter((m) => m.id !== id));
//     } catch (error) {
//       alert("Failed to delete.");
//       console.error(error);
//     }
//   };

//   const openViewModal = (member: BoardMember) => {
//     setSelectedMember(member);
//     setIsViewModalOpen(true);
//   };

//   const handleSave = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSaving(true);
    
//     try {
//       if (formData.id) {
//         const docRef = doc(db, "editorialBoard", formData.id);
//         await updateDoc(docRef, { ...formData });
//       } else {
//         await addDoc(collection(db, "editorialBoard"), formData);
//       }
      
//       const updatedMembers = await loadDatabaseMembers();
//       setMembers(updatedMembers);
      
//       setIsModalOpen(false);
//     } catch (error) {
//       alert("Failed to save board member. Check console.");
//       console.error(error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex min-h-[60vh] items-center justify-center bg-stone-50">
//         <div className="text-sm font-semibold tracking-widest text-stone-400 animate-pulse uppercase">
//           Loading Editorial Board...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-stone-50 py-10 md:py-16">
//       <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
//         {/* Header Section */}
//         <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end">
//           <div>
//             <h1 className="text-3xl font-bold text-red-950 md:text-4xl" style={{ fontFamily: "'Cinzel', serif" }}>
//               Editorial Board
//             </h1>
//             <div className="mt-3 h-1 w-20 rounded-full bg-amber-500" />
//           </div>

//           {isAdmin && (
//             <button 
//               onClick={openAddModal}
//               className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-red-950 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-amber-400"
//             >
//               <Plus size={18} />
//               Add Member
//             </button>
//           )}
//         </div>

//         {/* Board Members Grid */}
//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {members.map((member) => (
//             <div 
//               key={member.id} 
//               onClick={() => openViewModal(member)}
//               className="group relative flex cursor-pointer flex-col items-center overflow-hidden rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md hover:border-red-950/30"
//             >
//               {/* Admin Controls Overlay */}
//               {isAdmin && (
//                 <div className="absolute right-2 top-2 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
//                   <button 
//                     onClick={(e) => openEditModal(member, e)}
//                     className="rounded bg-stone-100 p-1.5 text-stone-600 transition-colors hover:bg-amber-100 hover:text-amber-600 focus:opacity-100"
//                   >
//                     <Edit2 size={14} />
//                   </button>
//                   <button 
//                     onClick={(e) => member.id && handleDelete(member.id, e)}
//                     className="rounded bg-stone-100 p-1.5 text-stone-600 transition-colors hover:bg-red-100 hover:text-red-600 focus:opacity-100"
//                   >
//                     <Trash2 size={14} />
//                   </button>
//                 </div>
//               )}

//               {/* Profile Image */}
//               <div className="mb-4 h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-stone-50 bg-stone-100 shadow-sm ring-1 ring-stone-200">
//                 {member.image ? (
//                   <img 
//                     src={member.image} 
//                     alt={member.name}
//                     className="h-full w-full object-cover"
//                   />
//                 ) : (
//                   <div className="flex h-full w-full items-center justify-center text-stone-300">
//                     <User size={40} strokeWidth={1.5} />
//                   </div>
//                 )}
//               </div>

//               {/* Info */}
//               <h3 className="mb-1 text-lg font-bold text-red-950 group-hover:text-amber-600 transition-colors">{member.name}</h3>
//               <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-600">
//                 {member.role}
//               </p>
//               <p className="mb-4 w-full border-b border-stone-100 pb-4 text-sm font-medium leading-relaxed text-stone-600">
//                 {member.affiliation}
//               </p>

//               {/* Truncated Bio Preview */}
//               {member.bio && (
//                 <div className="w-full text-left">
//                   <div 
//                     className="prose prose-sm prose-stone max-w-none text-stone-500 prose-p:my-1 line-clamp-3"
//                     dangerouslySetInnerHTML={{ __html: member.bio }} 
//                   />
//                   <span className="mt-2 block text-xs font-bold uppercase tracking-wider text-red-950 opacity-0 transition-opacity group-hover:opacity-100">
//                     Click to view profile &rarr;
//                   </span>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
        
//         {!isLoading && members.length === 0 && (
//           <div className="py-20 text-center text-sm font-medium text-stone-400">
//             No board members have been added yet.
//           </div>
//         )}
//       </div>

//       {/* View Profile Modal */}
//       {selectedMember && (
//         <Modal 
//           isOpen={isViewModalOpen} 
//           onClose={() => setIsViewModalOpen(false)} 
//           title="Member Profile"
//         >
//           <div className="flex flex-col items-center text-center">
//             <div className="mb-5 h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-stone-50 bg-stone-100 shadow-sm ring-1 ring-stone-200">
//               {selectedMember.image ? (
//                 <img 
//                   src={selectedMember.image} 
//                   alt={selectedMember.name}
//                   className="h-full w-full object-cover"
//                 />
//               ) : (
//                 <div className="flex h-full w-full items-center justify-center text-stone-300">
//                   <User size={48} strokeWidth={1.5} />
//                 </div>
//               )}
//             </div>
            
//             <h3 className="mb-1 text-2xl font-bold text-red-950">{selectedMember.name}</h3>
//             <p className="mb-4 text-sm font-bold uppercase tracking-wider text-amber-600">
//               {selectedMember.role}
//             </p>
//             <p className="mb-6 font-medium text-stone-600">
//               {selectedMember.affiliation}
//             </p>
//           </div>

//           {selectedMember.bio && (
//             <div className="max-h-[40vh] overflow-y-auto border-t border-stone-200 pt-6 text-left pr-2">
//               <div 
//                 className="prose prose-stone max-w-none text-stone-700 prose-p:my-2 prose-p:leading-relaxed"
//                 dangerouslySetInnerHTML={{ __html: selectedMember.bio }} 
//               />
//             </div>
//           )}

//           <div className="mt-8 flex justify-center border-t border-stone-100 pt-4">
//             <button 
//               onClick={() => setIsViewModalOpen(false)}
//               className="rounded-lg bg-stone-100 px-6 py-2.5 text-sm font-bold text-stone-600 transition-colors hover:bg-stone-200"
//             >
//               Close
//             </button>
//           </div>
//         </Modal>
//       )}

//       {/* Admin Add/Edit Modal */}
//       <Modal 
//         isOpen={isModalOpen} 
//         onClose={() => setIsModalOpen(false)} 
//         title={formData.id ? "Edit Board Member" : "Add Board Member"}
//       >
//         <form onSubmit={handleSave} className="flex flex-col gap-5 text-left">
          
//           <div className="flex justify-center">
//             <div className="w-full max-w-[200px]">
//               <ImageUploader 
//                 currentImageUrl={formData.image} 
//                 onUploadSuccess={(url) => setFormData({...formData, image: url})} 
//                 folder="profiles"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="mb-1 block text-sm font-bold text-stone-700">Full Name (with titles)</label>
//             <input 
//               type="text" 
//               value={formData.name}
//               onChange={(e) => setFormData({...formData, name: e.target.value})}
//               placeholder="e.g., Dr. Jane Doe"
//               className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
//               required
//             />
//           </div>

//           <div className="grid gap-5 sm:grid-cols-2">
//             <div>
//               <label className="mb-1 block text-sm font-bold text-stone-700">Role</label>
//               <input 
//                 type="text" 
//                 value={formData.role}
//                 onChange={(e) => setFormData({...formData, role: e.target.value})}
//                 placeholder="e.g., Editor-in-Chief"
//                 className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
//                 required
//               />
//             </div>
//             <div>
//               <label className="mb-1 block text-sm font-bold text-stone-700">Display Order</label>
//               <input 
//                 type="number" 
//                 value={formData.order}
//                 onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
//                 placeholder="e.g., 1"
//                 className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
//                 required
//               />
//               <p className="mt-1 text-xs text-stone-500">Lower numbers appear first.</p>
//             </div>
//           </div>

//           <div>
//             <label className="mb-1 block text-sm font-bold text-stone-700">University / Affiliation</label>
//             <textarea 
//               value={formData.affiliation}
//               onChange={(e) => setFormData({...formData, affiliation: e.target.value})}
//               placeholder="e.g., Department of Mathematics, University of Excellence, Country"
//               rows={2}
//               className="w-full resize-none rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
//               required
//             />
//           </div>

//           <div>
//             <label className="mb-2 block text-sm font-bold text-stone-700">Biography</label>
//             <div className="overflow-hidden rounded-lg border border-stone-200">
//               <RichTextEditor 
//                 value={formData.bio} 
//                 onChange={(val) => setFormData({...formData, bio: val})} 
//               />
//             </div>
//           </div>

//           <div className="mt-2 flex justify-end gap-3 border-t border-stone-200 pt-4">
//             <button 
//               type="button" 
//               onClick={() => setIsModalOpen(false)}
//               className="rounded-lg px-4 py-2.5 text-sm font-bold text-stone-600 transition-colors hover:bg-stone-200"
//               disabled={isSaving}
//             >
//               Cancel
//             </button>
//             <button 
//               type="submit" 
//               disabled={isSaving}
//               className="flex min-w-[120px] items-center justify-center rounded-lg bg-red-950 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-red-900 disabled:opacity-70"
//             >
//               {isSaving ? "Saving..." : "Save Member"}
//             </button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { Plus, Edit2, Trash2, User, Database } from "lucide-react";
import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";

import Modal from "../components/common/Modal";
import ImageUploader from "../components/common/ImageUploader";
import RichTextEditor from "../components/common/RichTextEditor";

interface BoardMember {
  id?: string;
  name: string;
  role: string;
  affiliation: string;
  image: string;
  bio: string;
  order: number;
}

const emptyMember: BoardMember = {
  name: "",
  role: "",
  affiliation: "",
  image: "",
  bio: "",
  order: 99,
};

// Extracted from image_8b6e1e.jpg to save you from manual data entry
const initialBoardMembers: BoardMember[] = [
  { name: "Dr. S.M. Rizwan", role: "Prof. & Head", affiliation: "Deptt. of Maths & Statistics, Caledonian University College of Engg., Sultanate of Oman", image: "", bio: "", order: 1 },
  { name: "Dr. Madhu Jain", role: "Prof.", affiliation: "Dept. of Mathematics, IIT Roorkee (Uttrakhand).", image: "", bio: "", order: 2 },
  { name: "Prof. (Dr.) Shakti Kumar", role: "Prof. & Director", affiliation: "Panipat Institute of Engineering & Technology, Samlakha, Panipat", image: "", bio: "", order: 3 },
  { name: "Er. Abhishek Pratap Singh", role: "Sr. Manager", affiliation: "Deloitte Co. Mclean Virginia (U.S.A.) 22101.", image: "", bio: "", order: 4 },
  { name: "Dr. O.P. Vinocha", role: "Principal - Director", affiliation: "Ferozpur College of Engg., Ferozshah (Punjab).", image: "", bio: "", order: 5 },
  { name: "Dr. Sanjay Jain", role: "Associate Professor", affiliation: "Deptt. of Mathematical Sciences, Govt. P.G. College, Ajmer. (Rajasthan)", image: "", bio: "", order: 6 },
  { name: "Dr. Gulshan Taneja", role: "Professor (Mathematics) & Registrar", affiliation: "M.D. University, Rohtak (Haryana)", image: "", bio: "", order: 7 },
  { name: "Dr. D.S. Hooda", role: "Visiting Professor", affiliation: "GJ University of Science & Technology, Hisar.", image: "", bio: "", order: 8 },
  { name: "Dr. Om Parkash", role: "Professor", affiliation: "Guru Nanak Dev University, Amritsar (Punjab).", image: "", bio: "", order: 9 },
  { name: "Dr. Rajender Kumar", role: "Ex. Principal", affiliation: "S.S.V. (P.G.) College, Hapur (U.P.).", image: "", bio: "", order: 10 },
  { name: "Er. Dilip Aditya", role: "Asstt. Vice. President", affiliation: "Deutshe Bank Banglore (Karnataka).", image: "", bio: "", order: 11 },
  { name: "Dr. Sanjay Sharma", role: "Prof. & Registrar", affiliation: "YMCA University of Science & Technology, Faridabad (Haryana)", image: "", bio: "", order: 12 },
  { name: "Dr. U.S. Negi", role: "Editorial Board Member", affiliation: "Deptt. of Mathematics, H.N.B., Garhwal Central University, Tehri Garhwal, (Uttarakhand)", image: "", bio: "", order: 13 },
  { name: "Dr. S. Lakshmi", role: "Research Advisor Ex. Principal", affiliation: "Govt. Arts and Science College, Peravurani, Thanjavur (Tamilnadu)", image: "", bio: "", order: 14 },
  { name: "Dr. Rajiv Khanduja", role: "Prof. (M.E.) & Principal", affiliation: "Yagyavalkya Instt. of Technology, Sitapura, Jaipur (Rajasthan)", image: "", bio: "", order: 15 },
  { name: "Dr. Deepak Gupta", role: "Prof. & Head", affiliation: "Deptt. of Maths, MM University, Mullana (Ambala).", image: "", bio: "", order: 16 },
  { name: "Dr. J. Paul Raj Joseph", role: "Prof. & Head, Programme Co-ordinator (DST-FIST)", affiliation: "Dept. of Maths, Manonmanium Sundaranar University Tirunelveli 62-7012 Tamilnadu.", image: "", bio: "", order: 17 },
  { name: "Dr. Anil Kumar", role: "Prof.", affiliation: "Applied Science & Humanities (Mathematics), Swami Vivekanand Subharti University, Meerut (U.P.)", image: "", bio: "", order: 18 },
];

export default function EditorialBoard() {
  const { role: userRole } = useAuth();
  const isAdmin = userRole === "admin";

  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Admin Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<BoardMember>(emptyMember);

  // View Profile Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);

  const loadDatabaseMembers = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "editorialBoard"));
      const fetchedMembers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BoardMember[];
      
      fetchedMembers.sort((a, b) => a.order - b.order);
      return fetchedMembers;
    } catch (error) {
      console.error("Error fetching board members:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function initFetch() {
      const data = await loadDatabaseMembers();
      if (isMounted) {
        setMembers(data);
        setIsLoading(false);
      }
    }
    
    initFetch();
    
    return () => {
      isMounted = false;
    };
  }, [loadDatabaseMembers]);

  const openAddModal = () => {
    setFormData(emptyMember);
    setIsModalOpen(true);
  };

  const openEditModal = (member: BoardMember, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the view modal
    setFormData(member);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the view modal
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    
    try {
      await deleteDoc(doc(db, "editorialBoard", id));
      setMembers(members.filter((m) => m.id !== id));
    } catch (error) {
      alert("Failed to delete.");
      console.error(error);
    }
  };

  const openViewModal = (member: BoardMember) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (formData.id) {
        const docRef = doc(db, "editorialBoard", formData.id);
        await updateDoc(docRef, { ...formData });
      } else {
        await addDoc(collection(db, "editorialBoard"), formData);
      }
      
      const updatedMembers = await loadDatabaseMembers();
      setMembers(updatedMembers);
      
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save board member. Check console.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to upload the extracted list to Firestore in one go
  const handleSeedDatabase = async () => {
    if (!window.confirm("This will add all 18 members from the list to the database. Proceed?")) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      initialBoardMembers.forEach((member) => {
        const docRef = doc(collection(db, "editorialBoard"));
        batch.set(docRef, member);
      });
      await batch.commit();
      
      const updatedMembers = await loadDatabaseMembers();
      setMembers(updatedMembers);
    } catch (error) {
      console.error("Error seeding database:", error);
      alert("Failed to seed database.");
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-stone-50">
        <div className="text-sm font-semibold tracking-widest text-stone-400 animate-pulse uppercase">
          Loading Editorial Board...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold text-red-950 md:text-4xl" style={{ fontFamily: "'Cinzel', serif" }}>
              Editorial Board
            </h1>
            <div className="mt-3 h-1 w-20 rounded-full bg-amber-500" />
          </div>

          {isAdmin && (
            <div className="flex gap-3">
              {members.length === 0 && (
                <button 
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="flex items-center gap-2 rounded-lg bg-stone-200 px-5 py-2.5 text-sm font-bold text-stone-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-stone-300 disabled:opacity-50"
                >
                  <Database size={18} />
                  {isSeeding ? "Seeding..." : "Seed Initial Data"}
                </button>
              )}
              <button 
                onClick={openAddModal}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-red-950 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-amber-400"
              >
                <Plus size={18} />
                Add Member
              </button>
            </div>
          )}
        </div>

        {/* Board Members Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div 
              key={member.id} 
              onClick={() => openViewModal(member)}
              className="group relative flex cursor-pointer flex-col items-center overflow-hidden rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md hover:border-red-950/30"
            >
              {/* Admin Controls Overlay */}
              {isAdmin && (
                <div className="absolute right-2 top-2 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <button 
                    onClick={(e) => openEditModal(member, e)}
                    className="rounded bg-stone-100 p-1.5 text-stone-600 transition-colors hover:bg-amber-100 hover:text-amber-600 focus:opacity-100"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => member.id && handleDelete(member.id, e)}
                    className="rounded bg-stone-100 p-1.5 text-stone-600 transition-colors hover:bg-red-100 hover:text-red-600 focus:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {/* Profile Image */}
              <div className="mb-4 h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-stone-50 bg-stone-100 shadow-sm ring-1 ring-stone-200">
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-stone-300">
                    <User size={40} strokeWidth={1.5} />
                  </div>
                )}
              </div>

              {/* Info */}
              <h3 className="mb-1 text-lg font-bold text-red-950 group-hover:text-amber-600 transition-colors">{member.name}</h3>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-600">
                {member.role}
              </p>
              <p className="mb-4 w-full border-b border-stone-100 pb-4 text-sm font-medium leading-relaxed text-stone-600">
                {member.affiliation}
              </p>

              {/* Truncated Bio Preview */}
              {member.bio && (
                <div className="w-full text-left">
                  <div 
                    className="prose prose-sm prose-stone max-w-none text-stone-500 prose-p:my-1 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: member.bio }} 
                  />
                  <span className="mt-2 block text-xs font-bold uppercase tracking-wider text-red-950 opacity-0 transition-opacity group-hover:opacity-100">
                    Click to view profile &rarr;
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {!isLoading && members.length === 0 && (
          <div className="py-20 text-center text-sm font-medium text-stone-400">
            No board members have been added yet. 
            {isAdmin && " Click 'Seed Initial Data' to populate the list."}
          </div>
        )}
      </div>

      {/* View Profile Modal */}
      {selectedMember && (
        <Modal 
          isOpen={isViewModalOpen} 
          onClose={() => setIsViewModalOpen(false)} 
          title="Member Profile"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-stone-50 bg-stone-100 shadow-sm ring-1 ring-stone-200">
              {selectedMember.image ? (
                <img 
                  src={selectedMember.image} 
                  alt={selectedMember.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stone-300">
                  <User size={48} strokeWidth={1.5} />
                </div>
              )}
            </div>
            
            <h3 className="mb-1 text-2xl font-bold text-red-950">{selectedMember.name}</h3>
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-amber-600">
              {selectedMember.role}
            </p>
            <p className="mb-6 font-medium text-stone-600">
              {selectedMember.affiliation}
            </p>
          </div>

          {selectedMember.bio && (
            <div className="max-h-[40vh] overflow-y-auto border-t border-stone-200 pt-6 text-left pr-2">
              <div 
                className="prose prose-stone max-w-none text-stone-700 prose-p:my-2 prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selectedMember.bio }} 
              />
            </div>
          )}

          <div className="mt-8 flex justify-center border-t border-stone-100 pt-4">
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="rounded-lg bg-stone-100 px-6 py-2.5 text-sm font-bold text-stone-600 transition-colors hover:bg-stone-200"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Admin Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={formData.id ? "Edit Board Member" : "Add Board Member"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-5 text-left">
          
          <div className="flex justify-center">
            <div className="w-full max-w-[200px]">
              <ImageUploader 
                currentImageUrl={formData.image} 
                onUploadSuccess={(url) => setFormData({...formData, image: url})} 
                folder="profiles"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-stone-700">Full Name (with titles)</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Dr. Jane Doe"
              className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-stone-700">Role</label>
              <input 
                type="text" 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                placeholder="e.g., Editor-in-Chief"
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-stone-700">Display Order</label>
              <input 
                type="number" 
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                placeholder="e.g., 1"
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
                required
              />
              <p className="mt-1 text-xs text-stone-500">Lower numbers appear first.</p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-stone-700">University / Affiliation</label>
            <textarea 
              value={formData.affiliation}
              onChange={(e) => setFormData({...formData, affiliation: e.target.value})}
              placeholder="e.g., Department of Mathematics, University of Excellence, Country"
              rows={2}
              className="w-full resize-none rounded-lg border border-stone-300 p-2.5 text-sm outline-none focus:border-red-950 focus:ring-1 focus:ring-red-950"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-stone-700">Biography</label>
            <div className="overflow-hidden rounded-lg border border-stone-200">
              <RichTextEditor 
                value={formData.bio} 
                onChange={(val) => setFormData({...formData, bio: val})} 
              />
            </div>
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
              className="flex min-w-[120px] items-center justify-center rounded-lg bg-red-950 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-red-900 disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save Member"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}