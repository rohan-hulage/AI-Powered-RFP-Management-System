import { useState } from 'react';
import { Send, Loader2, Wand2, Sparkles, CheckCircle } from 'lucide-react';
import api from '../api/client';
import clsx from 'clsx';

export const CreateRFP = () => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedRFP, setGeneratedRFP] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        try {
            const res = await api.post('/rfps/generate', { requirements: input });
            setGeneratedRFP(res.data);
            setInput('');
        } catch (error) {
            console.error("Failed to generate RFP", error);
            alert("Failed to generate RFP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center py-10">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-indigo-100 rounded-full text-primary">
                        <Wand2 className="w-8 h-8" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI RFP Generator</h1>
                <p className="mt-2 text-lg text-slate-500 max-w-2xl mx-auto">
                    Describe your procurement needs in natural language, and our AI will instantly structure a professional Request for Proposal for you.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="relative group">
                <div className={clsx(
                    "bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border transition-all duration-300",
                    loading ? "border-indigo-400 ring-2 ring-indigo-100" : "border-slate-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
                )}>
                    <textarea
                        rows={6}
                        name="requirements"
                        className="block w-full resize-none border-0 py-6 px-6 text-lg text-slate-800 placeholder:text-slate-300 focus:ring-0"
                        placeholder="e.g., I need to procure 50 high-performance laptops for our engineering team. The budget is around $100k, and we need delivery within 4 weeks. Key specs: 32GB RAM, 1TB SSD..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <div className="flex items-center justify-between py-4 px-6 bg-slate-50 border-t border-slate-100">
                        <div className="flex items-center text-xs text-slate-500 font-medium">
                            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                            Powered by Gemini AI
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Generate Draft
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {generatedRFP && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-center mb-6">
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <span className="px-4 text-sm font-medium text-slate-400 uppercase tracking-wider">Result</span>
                        <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                                RFP Draft Created
                            </h2>
                            <span className="text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded border">ID: {generatedRFP.id?.slice(0, 8)}</span>
                        </div>

                        <div className="p-8 grid gap-8 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                                <div className="text-xl font-medium text-slate-900">{generatedRFP.title}</div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">{generatedRFP.description}</div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Budget</label>
                                <div className="font-mono text-slate-900">{generatedRFP.budget || 'N/A'}</div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Timeline</label>
                                <div className="font-mono text-slate-900">{generatedRFP.timeline || 'N/A'}</div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Structure Preview</label>
                                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-xs text-emerald-400 font-mono">
                                        {JSON.stringify(JSON.parse(generatedRFP.structuredData), null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
