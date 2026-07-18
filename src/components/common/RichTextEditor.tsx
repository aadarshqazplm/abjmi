import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Start typing..." }: RichTextEditorProps) {
  return (
    <div className="prose max-w-none overflow-hidden rounded-lg border border-stone-300 bg-white focus-within:border-red-950 focus-within:ring-1 focus-within:ring-red-950">
      <CKEditor
        editor={ClassicEditor as never} // Fixed: Type cast to bypass the strict signature mismatch
        data={value}
        config={{
          placeholder: placeholder,
          toolbar: [
            "heading",
            "|",
            "bold",
            "italic",
            "link",
            "bulletedList",
            "numberedList",
            "blockQuote",
            "|",
            "undo",
            "redo",
          ],
        }}
        onChange={(_event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
      
      {/* CKEditor sets its own heights by default. 
        Adding this inline style block forces it to have a nice editing area height 
        without needing to eject or override deep CSS files.
      */}
      <style>{`
        .ck-editor__editable_inline {
          min-height: 200px;
          border-bottom-left-radius: 0.5rem !important;
          border-bottom-right-radius: 0.5rem !important;
        }
        .ck-toolbar {
          border-top-left-radius: 0.5rem !important;
          border-top-right-radius: 0.5rem !important;
          border-bottom: 1px solid #d6d3d1 !important; /* matches stone-300 */
          background-color: #fafaf9 !important; /* matches stone-50 */
        }
      `}</style>
    </div>
  );
}