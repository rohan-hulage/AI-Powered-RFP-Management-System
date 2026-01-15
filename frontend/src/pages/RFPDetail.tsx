import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, RefreshCw, BarChart2, CheckCircle, AlertCircle } from 'lucide-react';
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

    useEffect(() => {
        fetchData();
        fetchVendors();
    }, [id]);

    const fetchData = async () => {
        if (!id) return;
        api.get(\`/rfps/\${id}\`).then(res => setRfp(res.data));
        api.get(\`/proposals/\${id}\`).then(res => setProposals(res.data));
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
            setActionStatus(\`Processed \${res.data.processed.length} new emails.\`);
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
            const res = await api.get(\`/proposals/\${id}/compare\`);
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

    if (!rfp) return <div>Loading...</div>;

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="bg-white shadow sm:rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900">{rfp.title}</h1>
                <p className="mt-2 text-gray-600 whitespace-pre-wrap">{rfp.description}</p>
                <div className="mt-4 flex space-x-4 text-sm text-gray-500">
                    <span>Budget: {rfp.budget || 'N/A'}</span>
                    <span>Timeline: {rfp.timeline || 'N/A'}</span>
                    <span className={clsx(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        rfp.status === 'OPEN' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    )}>{rfp.status}</span>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="bg-white shadow sm:rounded-lg p-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">1. Send to Vendors</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-4 border p-2 rounded">
                        {vendors.map(v => (
                            <label key={v.id} className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    checked={selectedVendors.includes(v.id)}
                                    onChange={() => toggleVendor(v.id)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">{v.name} ({v.email})</span>
                            </label>
                        ))}
                    </div>
                    <button 
                        onClick={handleSendEmails}
                        disabled={loading || selectedVendors.length === 0}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                        <Mail className="w-4 h-4 mr-2" /> Send Emails
                    </button>
                </div>

                <div className="bg-white shadow sm:rounded-lg p-4 flex-1">
                     <h3 className="text-lg font-medium text-gray-900 mb-4">2. Check & Compare</h3>
                     <div className="space-y-4">
                        <button 
                            onClick={handleCheckInbox}
                            disabled={loading}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Check Inbox
                        </button>
                         <button 
                            onClick={handleCompare}
                            disabled={loading || proposals.length === 0}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                            <BarChart2 className="w-4 h-4 mr-2" /> Compare Proposals
                        </button>
                     </div>
                </div>
            </div>

            {actionStatus && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">{actionStatus}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Comparison Results */}
            {comparison && (
                <div className="bg-white shadow sm:rounded-lg p-6 border-t-4 border-indigo-500 animate-fade-in">
                    <h2 className="text-xl font-bold text-indigo-900 mb-4">AI Analysis Recommendation</h2>
                    <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                        <p className="text-lg font-semibold text-indigo-800">Recommended Vendor: {comparison.recommendation}</p>
                        <p className="mt-2 text-indigo-700">{comparison.reasoning}</p>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Comparison Table</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Vendor', 'Price', 'Timeline', 'Pros', 'Cons'].map(h => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {comparison.comparison_table?.map((row: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.Vendor}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.Price}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.Timeline}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={row.Pros}>{row.Pros}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={row.Cons}>{row.Cons}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Proposals List */}
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Received Proposals</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {proposals.map((proposal) => (
                        <li key={proposal.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-indigo-600 truncate">{proposal.vendor.name}</p>
                                <div className="ml-2 flex-shrink-0 flex">
                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Received
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                        {proposal.summary}
                                    </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <p>
                                        Raw Content Length: {proposal.content?.length || 0} chars
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                    {proposals.length === 0 && (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No proposals received yet. Check inbox or wait for vendors.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};
