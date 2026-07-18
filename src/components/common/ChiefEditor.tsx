import { useState } from "react";
import { Mail, GraduationCap } from "lucide-react";
import EditButton from "../common/EditButton";

export default function ChiefEditor() {
  const [editor] = useState({
    name: "Dr. T. P. Singh",
    qualifications: "MSC, PGDCA, Ph.D. (Maths)",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop", // Placeholder until you upload his real photo
    description: "Chief Editor of the Aryabhatta Bulletin of Mathematics & Informatics."
  });

  const handleEdit = () => alert("Open Admin Modal: Edit Chief Editor");

  return (
    <section className="relative bg-white py-24">
      <div className="mx-auto max-w-5xl px-6">
        
        <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 shadow-sm">
          <EditButton onClick={handleEdit} label="Edit Editor" />
          
          <div className="flex flex-col md:flex-row">
            {/* Photo */}
            <div className="w-full md:w-1/3 bg-stone-200">
              <img 
                src={editor.image} 
                alt={editor.name} 
                className="h-full w-full object-cover aspect-square md:aspect-auto grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center p-8 md:p-12 md:w-2/3">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-amber-500">
                Chief Editor
              </h2>
              <h3 className="mb-4 text-3xl font-bold text-red-950" style={{ fontFamily: "'Cinzel', serif" }}>
                {editor.name}
              </h3>
              
              <div className="mb-6 flex items-center gap-2 text-sm font-medium text-stone-600">
                <GraduationCap size={18} className="text-stone-400" />
                {editor.qualifications}
              </div>
              
              <p className="mb-8 text-base leading-relaxed text-stone-600">
                {editor.description}
              </p>
              
              <button className="inline-flex w-fit items-center gap-2 rounded-lg bg-stone-200 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-red-950 hover:text-white">
                <Mail size={16} />
                Contact Editor
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}