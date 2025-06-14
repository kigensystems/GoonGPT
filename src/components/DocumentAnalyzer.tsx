import React, { useState, useRef } from 'react';

export function DocumentAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysis('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !question.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    // TODO: Implement actual document analysis
    setTimeout(() => {
      setAnalysis(`Analysis of "${selectedFile.name}" regarding "${question}": This is a placeholder response. The actual implementation will analyze your document and answer your specific questions about it.`);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysis('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <>
      {/* Document Analysis Container */}
      <div className="bg-surface rounded-2xl border border-surface shadow-2xl flex-1 flex flex-col overflow-hidden max-h-[600px] transition-all duration-150 ease-in-out hover:border-accent/20">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-muted font-mono text-sm">xposed@ai ~ doc-analyzer</span>
          </div>
          <div className="text-accent font-code text-xs opacity-60">READY</div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-accent/30 rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 transition-all duration-150 mb-6"
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.md"
              className="hidden"
            />
            <div className="text-accent text-4xl mb-4">📄</div>
            {selectedFile ? (
              <>
                <p className="text-text-primary font-mono mb-2">{selectedFile.name}</p>
                <p className="text-muted text-sm font-sans">Click or drop another file to replace</p>
              </>
            ) : (
              <>
                <p className="text-text-primary font-mono mb-2">Drop your document here</p>
                <p className="text-muted text-sm font-sans">or click to browse (PDF, DOC, TXT, MD)</p>
              </>
            )}
          </div>

          {/* Analysis Result */}
          {analysis && (
            <div className="bg-bg-default rounded-lg p-4 border border-accent/20 mb-6">
              <h3 className="text-accent font-mono text-sm mb-2">ANALYSIS RESULT:</h3>
              <p className="text-text-primary font-sans">{analysis}</p>
            </div>
          )}
        </div>

        {/* Question Input */}
        <div className="p-4 border-t border-surface">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about your document..."
                className="w-full bg-bg-default border border-accent/30 rounded-lg px-4 py-3 text-text-primary placeholder-muted font-sans focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all duration-150"
                disabled={isAnalyzing || !selectedFile}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedFile || !question.trim()}
              className="px-6 py-3 bg-accent text-bg-default font-mono font-semibold rounded-lg hover:bg-accent/90 transition-all duration-150 ease-in-out transform hover:-translate-y-0.5 hover:drop-shadow-[0_0_8px_rgba(255,45,149,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isAnalyzing ? 'ANALYZING...' : '> ANALYZE'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {['Summarize this', 'Key points', 'Find specific info', 'Explain concepts'].map((q) => (
          <button
            key={q}
            onClick={() => setQuestion(q)}
            disabled={!selectedFile}
            className="px-4 py-2 bg-surface border border-accent/20 text-text-primary font-mono text-sm rounded-lg hover:border-accent/50 hover:bg-accent/5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>
    </>
  );
}