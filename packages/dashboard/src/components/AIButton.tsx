import { useState } from 'react';

interface AIButtonProps {
  title: string;
  getPrompt: () => string; // function that returns the prompt for this action
}

export function AIButton({ title, getPrompt }: AIButtonProps) {
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: getPrompt(),
        }),
      });
      const data = await res.json();
      setAiOutput(data.output);
    } catch (err) {
      console.error(err);
      setAiOutput('AI analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : title}
      </button>

      {aiOutput && (
        <div className="mt-4 p-4 border rounded bg-white shadow">
          <h3 className="font-semibold mb-2">{title} Results</h3>
          <p>{aiOutput}</p>
        </div>
      )}
    </div>
  );
}
