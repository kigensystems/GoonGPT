import React, { useState } from 'react';

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    // TODO: Implement actual image generation
    setTimeout(() => {
      setGeneratedImages([...generatedImages, `https://via.placeholder.com/512x512?text=${encodeURIComponent(prompt)}`]);
      setIsGenerating(false);
      setPrompt('');
    }, 2000);
  };

  return (
    <>
      {/* Image Generation Container */}
      <div className="bg-surface rounded-2xl border border-surface shadow-2xl flex-1 flex flex-col overflow-hidden max-h-[600px] transition-all duration-150 ease-in-out hover:border-accent/20">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-muted font-mono text-sm">xposed@ai ~ image-gen</span>
          </div>
          <div className="text-accent font-code text-xs opacity-60">READY</div>
        </div>

        {/* Gallery */}
        <div className="flex-1 p-6 overflow-y-auto">
          {generatedImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-accent text-6xl mb-4">🎨</div>
              <h3 className="text-text-primary font-mono text-lg mb-2">No images yet</h3>
              <p className="text-muted font-sans">Generate your first uncensored image below</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Generated ${index + 1}`}
                    className="w-full h-auto rounded-lg border border-accent/20 transition-all duration-150 group-hover:border-accent/50"
                  />
                  <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-bg-default/80 backdrop-blur p-2 rounded-lg border border-accent/30 hover:border-accent/50">
                    <span className="text-accent text-xs font-mono">DOWNLOAD</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-surface">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create... (no restrictions)"
                className="w-full bg-bg-default border border-accent/30 rounded-lg px-4 py-3 text-text-primary placeholder-muted font-sans focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all duration-150 resize-none h-20"
                disabled={isGenerating}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-3 bg-accent text-bg-default font-mono font-semibold rounded-lg hover:bg-accent/90 transition-all duration-150 ease-in-out transform hover:-translate-y-0.5 hover:drop-shadow-[0_0_8px_rgba(255,45,149,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isGenerating ? 'CREATING...' : '> GENERATE'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {['Cyberpunk city', 'Abstract art', 'Fantasy creature', 'Surreal landscape'].map((idea) => (
          <button
            key={idea}
            onClick={() => setPrompt(idea)}
            className="px-4 py-2 bg-surface border border-accent/20 text-text-primary font-mono text-sm rounded-lg hover:border-accent/50 hover:bg-accent/5 transition-all duration-150"
          >
            {idea}
          </button>
        ))}
      </div>
    </>
  );
}