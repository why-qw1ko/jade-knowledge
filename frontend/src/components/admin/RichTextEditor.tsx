'use client';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border-primary)' }}>
      <div
        className="px-3 py-2 flex gap-2"
        style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}
      >
        {[
          { label: 'B', insert: '<b></b>', className: 'font-bold' },
          { label: 'I', insert: '<i></i>', className: 'italic' },
          { label: 'H2', insert: '<h2></h2>', className: '' },
          { label: 'H3', insert: '<h3></h3>', className: '' },
          { label: 'P', insert: '<p></p>', className: '' },
          { label: '📷', insert: '<img src="" alt=""/>', className: '' },
        ].map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={() => onChange(value + btn.insert)}
            className={`px-2 py-1 text-sm rounded transition-colors ${btn.className}`}
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '输入文章内容...'}
        className="w-full min-h-[400px] p-4 text-sm focus:outline-none resize-y"
        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
      />
    </div>
  );
}
