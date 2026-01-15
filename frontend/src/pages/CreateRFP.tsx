import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import api from '../api/client';

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
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Create New RFP</h1>
                <p className="mt-2 text-gray-600">Describe what you need, and AI will structure it for you.</p>
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                    <textarea
                        rows={4}
                        name="requirements"
                        id="requirements"
                        className="block w-full resize-none border-0 py-3 px-4 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="I need 50 laptops for our engineering team, budget is $100k..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50">
                        <span className="text-xs text-gray-500">AI-Powered Extraction</span>
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            Generate RFP
                        </button>
                    </div>
                </div>
            </form>

            {generatedRFP && (
                <div className="bg-white shadow sm:rounded-lg p-6 border border-gray-200 fade-in">
                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Generated RFP Preview</h2>
                    <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-4">
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Title</dt>
                            <dd className="mt-1 text-sm text-gray-900">{generatedRFP.title}</dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{generatedRFP.description}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Budget</dt>
                            <dd className="mt-1 text-sm text-gray-900">{generatedRFP.budget || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Timeline</dt>
                            <dd className="mt-1 text-sm text-gray-900">{generatedRFP.timeline || 'N/A'}</dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Structured Data</dt>
                            <dd className="mt-1 text-xs text-gray-500 bg-gray-50 p-2 rounded overflow-auto">
                                <pre>{JSON.stringify(JSON.parse(generatedRFP.structuredData), null, 2)}</pre>
                            </dd>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <p className="text-sm text-green-600 font-medium">Saved to Database</p>
                    </div>
                </div>
            )}
        </div>
    );
};
