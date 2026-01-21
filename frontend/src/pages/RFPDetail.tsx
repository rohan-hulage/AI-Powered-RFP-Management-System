import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, RefreshCw, BarChart2, CheckCircle, Smartphone, Calendar, DollarSign, Clock, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import api from '../api/client';
import clsx from 'clsx';

export const RFPDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [rfp, setRfp] = useState<any>(null);
    const [vendors, setVendors] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);
    const [comparison, setComparison] = useState<any>(null);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionStatus, setActionStatus] = useState<string>('');
    const [showVendors, setShowVendors] = useState(true);

    useEffect(() => {
        fetchData();
        fetchVendors();
    }, [id]);

    const fetchData = async () => {
        if (!id) return;
        api.get(`/rfps/${id}`).then(res => setRfp(res.data));
        api.get(`/proposals/${id}`).then(res => setProposals(res.data));
    };

    const fetchVendors = () => {
        api.get('/vendors').then(res => setVendors(res.data));
    };

    const handleSendEmails = async () => {
        if (selectedVendors.length === 0) return alert("Select vendors first");
        setLoading(true);
        setActionStatus('Sending emails...');
        try {
            await api.post('/emails/send', { rfpId: id, vendorIds: selectedVendors });
            setActionStatus('Emails sent successfully!');
        } catch (error) {
            console.error(error);
            setActionStatus('Failed to send emails.');
        } finally {
            setLoading(false);
            setTimeout(() => setActionStatus(''), 3000);
        }
    };

    const handleCheckInbox = async () => {
        setLoading(true);
        setActionStatus('Checking inbox for replies...');
        try {
            const res = await api.post('/emails/check');
            setActionStatus(`Processed ${res.data.processed.length} new emails.`);
            fetchData(); // Refresh proposals
        } catch (error) {
            console.error(error);
            setActionStatus('Failed to check inbox.');
        } finally {
            setLoading(false);
            setTimeout(() => setActionStatus(''), 3000);
        }
    };

    const handleCompare = async () => {
        if (proposals.length === 0) return alert("No proposals to compare");
        setLoading(true);
        setActionStatus('AI is comparing proposals...');
        try {
            const res = await api.get(`/proposals/${id}/compare`);
            setComparison(res.data);
            setActionStatus('Comparison complete.');
        } catch (error) {
            console.error(error);
            setActionStatus('Failed to compare.');
        } finally {
            setLoading(false);
        }
    };

    const toggleVendor = (vId: string) => {
        setSelectedVendors(prev =>
            prev.includes(vId) ? prev.filter(v => v !== vId) : [...prev, vId]
        );
    };

    if (!rfp) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
                <div className="h-8 w-64 bg-slate-200 rounded"></div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Smartphone className="w-32 h-32 text-indigo-900" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
                        <span className={clsx(
                            "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border",
                            rfp.status === 'OPEN' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"
                        )}>{rfp.status}</span>
                        <span className="text-sm text-slate-400 font-mono">ID: {rfp.id.slice(0, 8)}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">{rfp.title}</h1>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-3xl whitespace-pre-wrap">{rfp.description}</p>

                    <div className="mt-8 flex flex-wrap gap-6 pt-6 border-t border-slate-100 text-sm font-medium">
                        <div className="flex items-center text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <DollarSign className="w-4 h-4 mr-2 text-primary" />
                            {rfp.budget || 'N/A'}
                        </div>
                        <div className="flex items-center text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <Clock className="w-4 h-4 mr-2 text-primary" />
                            {rfp.timeline || 'N/A'}
                        </div>
                        <div className="flex items-center text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <Calendar className="w-4 h-4 mr-2 text-primary" />
                            Created: {new Date(rfp.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Vendor Management */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer" onClick={() => setShowVendors(!showVendors)}>
                            <h3 className="font-semibold text-slate-800 flex items-center">
                                <Mail className="w-4 h-4 mr-2 text-indigo-600" />
                                Invite Vendors
                            </h3>
                            {showVendors ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>

                        {showVendors && (
                            <div className="p-4 space-y-4">
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {vendors.map(v => (
                                        <label key={v.id} className="flex items-center p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedVendors.includes(v.id)}
                                                onChange={() => toggleVendor(v.id)}
                                                className="rounded text-indigo-600 focus:ring-indigo-500 mr-3 w-4 h-4 border-slate-300"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-slate-900 group-hover:text-indigo-700">{v.name}</div>
                                                <div className="text-xs text-slate-400">{v.email}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSendEmails}
                                    disabled={loading || selectedVendors.length === 0}
                                    className="w-full btn-primary flex justify-center items-center"
                                >
                                    {loading && actionStatus.includes('email') ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                                    Send Invitations
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-800 flex items-center">
                                <BarChart2 className="w-4 h-4 mr-2 text-indigo-600" />
                                Actions
                            </h3>
                        </div>
                        <div className="p-4 space-y-3">
                            <button
                                onClick={handleCheckInbox}
                                disabled={loading}
                                className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                            >
                                <RefreshCw className={clsx("w-4 h-4 mr-2", loading && actionStatus.includes('inbox') && "animate-spin")} />
                                Check for Replies
                            </button>
                            <button
                                onClick={handleCompare}
                                disabled={loading || proposals.length === 0}
                                className="w-full flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <BarChart2 className="w-4 h-4 mr-2" />
                                Compare Proposals
                            </button>
                        </div>
                    </div>

                    {actionStatus && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-start animate-fade-in">
                            <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-sm text-indigo-800 font-medium">{actionStatus}</p>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Comparison Results */}
                    {comparison && (
                        <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100 border border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center text-white">
                                <h2 className="font-bold text-lg flex items-center">
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    AI Recommendation
                                </h2>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                                    Based on {proposals.length} proposals
                                </span>
                            </div>

                            <div className="p-6 bg-indigo-50/50 border-b border-indigo-100">
                                <div className="flex items-start">
                                    <div className="bg-white p-3 rounded-full shadow-sm text-indigo-600 mr-4">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-wider mb-1">Recommended Vendor</h3>
                                        <p className="text-2xl font-bold text-slate-900 mb-2">{comparison.recommendation}</p>
                                        <p className="text-indigo-800 leading-relaxed bg-white/60 p-4 rounded-xl border border-indigo-100/50">
                                            {comparison.reasoning}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            {['Vendor', 'Price', 'Timeline', 'Pros', 'Cons'].map(h => (
                                                <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {comparison.comparison_table?.map((row: any, idx: number) => (
                                            <tr key={idx} className={clsx(
                                                "hover:bg-slate-50/80 transition-colors",
                                                row.Vendor === comparison.recommendation ? "bg-indigo-50/30" : ""
                                            )}>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{row.Vendor}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{row.Price}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{row.Timeline}</td>
                                                <td className="px-6 py-4 text-sm text-emerald-600 max-w-xs">{row.Pros}</td>
                                                <td className="px-6 py-4 text-sm text-rose-600 max-w-xs">{row.Cons}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Proposals List */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center">
                            Received Proposals
                            <span className="ml-3 bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-200">{proposals.length}</span>
                        </h2>

                        <div className="grid gap-4">
                            {proposals.map((proposal) => (
                                <div key={proposal.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold mr-3 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                {proposal.vendor.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-base font-semibold text-slate-900">{proposal.vendor.name}</h4>
                                                <span className="text-xs text-slate-400">Received {new Date(proposal.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded font-medium border border-emerald-100">
                                            Parsed by AI
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-slate-600 italic">"{proposal.summary}"</p>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <span>Raw Content: {proposal.content?.length || 0} chars</span>
                                        <button className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">View Full Content</button>
                                    </div>
                                </div>
                            ))}
                            {proposals.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Mail className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No proposals received yet.</p>
                                    <p className="text-sm text-slate-400 mt-1">Send invitations to vendors to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper for the "Sparkles" icon which was missing in imports or I can just use the existing Lucide one
const SparklesIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M9 3v4" /><path d="M5 9h4" /></svg>
);
