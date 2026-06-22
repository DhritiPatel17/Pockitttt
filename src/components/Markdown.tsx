import ReactMarkdown from 'react-markdown';

export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown-body prose prose-sm max-w-none text-current">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
