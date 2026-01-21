import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { FileText, ArrowRight, Plus, Calendar, Clock } from 'lucide-react';
import clsx from 'clsx';

export const Dashboard = () => {
    const [rfps, setRfps] = useState<any[]>([]);

    useEffect(() => {
        api.get('/rfps').then(res => setRfps(res.data));
    }, []);

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'OPEN': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'CLOSED': return 'bg-slate-100 text-slate-800 border-slate-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">RFP Dashboard</h1>
                    <p className="mt-1 text-slate-500">Manage and track your Request for Proposals.</p>
                </div>
                <Link
                    to="/create-rfp"
                    className="btn-primary flex items-center shadow-lg shadow-primary/30"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New RFP
                </Link>
            </div>

            {/* Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rfps.map((rfp) => (
                    <div key={rfp.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col">
                        <div className="p-6 flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 rounded-lg text-primary group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <span className={clsx(
                                    getStatusColor(rfp.status),
                                    "px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                                )}>
                                    {rfp.status || 'OPEN'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{rfp.title}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{rfp.description}</p>

                            <div className="flex items-center text-xs text-slate-400 space-x-4">
                                <span className="flex items-center">
                                    <Calendar className="w-3.5 h-3.5 mr-1" />
                                    {new Date(rfp.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                    {new Date(rfp.updatedAt).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-between items-center group-hover:bg-indigo-50/50 transition-colors">
                            <span className="text-xs font-mono text-slate-400">ID: {rfp.id.slice(0, 8)}</span>
                            <Link to={`/rfps/${rfp.id}`} className="text-sm font-semibold text-primary hover:text-indigo-700 flex items-center transition-colors">
                                View Details <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                ))}

                {rfps.length === 0 && (
                    <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No RFPs Created</h3>
                        <p className="mt-1 text-slate-500 max-w-sm mb-6">Get started by creating your first Request for Proposal to invite vendors.</p>
                        <Link to="/create-rfp" className="btn-primary flex items-center">
                            <Plus className="w-5 h-5 mr-2" />
                            Create RFP
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
