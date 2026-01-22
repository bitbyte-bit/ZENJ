
import React, { useState } from 'react';
import { Sparkles, Loader2, Image as ImageIcon, Download, RefreshCw } from 'lucide-react';
import { generateImage } from '../services/gemini';

const ImageGenView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setResult(null);
    try {
      const imageUrl = await generateImage(prompt);
      setResult(imageUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar">
      <div className="max-w-5xl mx-auto w-full p-6 md:p-12">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
              <Sparkles size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-outfit text-slate-50">Zen Space</h1>
              <p className="text-slate-400">Transform your inner visions into high-quality digital art.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Controls */}
          <div className="space-y-8">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Describe your vision</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A tranquil floating garden in the clouds, cyberpunk aesthetic, soft emerald lighting, 8k resolution..."
                  className="w-full h-40 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all resize-none text-lg leading-relaxed"
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button 
                  type="submit"
                  disabled={!prompt.trim() || isGenerating}
                  className="flex-1 flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      <span>Manifesting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      <span>Generate Art</span>
                    </>
                  )}
                </button>
                {result && (
                  <button 
                    type="button"
                    onClick={() => handleGenerate()}
                    className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all"
                  >
                    <RefreshCw size={24} />
                  </button>
                )}
              </div>
            </form>

            <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-800/50">
              <h4 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <ImageIcon size={16} />
                Inspiration Gallery
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map(i => (
                  <button 
                    key={i}
                    onClick={() => setPrompt(`Minimalist landscape ${i}, ethereal lighting, zen aesthetic`)}
                    className="aspect-square rounded-xl overflow-hidden grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100 border border-slate-800"
                  >
                    <img src={`https://picsum.photos/seed/${i+40}/200`} alt="Insp" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Area */}
          <div className="aspect-square w-full relative group">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-[40px] blur-3xl group-hover:bg-emerald-500/10 transition-all duration-1000"></div>
            <div className="relative h-full w-full rounded-[40px] border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden bg-slate-900/20 backdrop-blur-sm shadow-2xl">
              {result ? (
                <>
                  <img src={result} alt="Generated result" className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <a 
                      href={result} 
                      download="zenj-art.png"
                      className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-xl"
                    >
                      <Download size={24} />
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center px-8">
                  <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                    <ImageIcon size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Ready to create?</h3>
                  <p className="text-slate-600">Enter a prompt and watch your ideas come to life.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenView;
