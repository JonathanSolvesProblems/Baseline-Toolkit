import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface AIButtonProps {
  title: string;
  getPrompt: () => string;
}

export function AIButton({ title, getPrompt }: AIButtonProps) {
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: getPrompt() }),
      });
      const data = await res.json();
      setAiOutput(data.output);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setAiOutput('AI analysis failed.');
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className={`w-full px-4 py-2 rounded-lg font-medium text-white transition-colors 
                    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : title}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-3xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">{title} Results</h3>
            <div className="max-h-[60vh] overflow-y-auto prose prose-slate">
              {aiOutput && <ReactMarkdown>{aiOutput}</ReactMarkdown>}
            </div>
            <div className="mt-4 text-right">
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
