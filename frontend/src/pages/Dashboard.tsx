import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { FileText, ArrowRight } from 'lucide-react';

export const Dashboard = () => {
    const [rfps, setRfps] = useState<any[]>([]);

    useEffect(() => {
        api.get('/rfps').then(res => setRfps(res.data));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <Link to="/create-rfp" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    Create New RFP
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rfps.map((rfp) => (
                    <div key={rfp.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                                    <FileText className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            RFP ID: {rfp.id.slice(0, 8)}...
                                        </dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900 truncate">{rfp.title}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-4 sm:px-6">
                            <div className="text-sm">
                                <Link to={`/rfps/${rfp.id}`} className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                                    View Details <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
                {rfps.length === 0 && (
                    <div className="col-span-3 text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No RFPs</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new Request for Proposal.</p>
                        <div className="mt-6">
                            <Link to="/create-rfp" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                Create RFP
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
