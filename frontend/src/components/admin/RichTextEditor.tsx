'use client';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex gap-2">
        <button type="button" onClick={() => onChange(value + '<b></b>')} className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded">B</button>
        <button type="button" onClick={() => onChange(value + '<i></i>')} className="px-2 py-1 text-sm italic hover:bg-gray-200 rounded">I</button>
        <button type="button" onClick={() => onChange(value + '<h2></h2>')} className="px-2 py-1 text-sm hover:bg-gray-200 rounded">H2</button>
        <button type="button" onClick={() => onChange(value + '<h3></h3>')} className="px-2 py-1 text-sm hover:bg-gray-200 rounded">H3</button>
        <button type="button" onClick={() => onChange(value + '<p></p>')} className="px-2 py-1 text-sm hover:bg-gray-200 rounded">P</button>
        <button type="button" onClick={() => onChange(value + '<img src="" alt=""/>')} className="px-2 py-1 text-sm hover:bg-gray-200 rounded">📷</button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '输入文章内容...'}
        className="w-full min-h-[400px] p-4 text-sm focus:outline-none resize-y"
      />
    </div>
  );
}
