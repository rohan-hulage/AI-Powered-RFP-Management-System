import { useEffect, useState } from 'react';
import api from '../api/client';

export const VendorList = () => {
    const [vendors, setVendors] = useState<any[]>([]);

    useEffect(() => {
        api.get('/vendors').then(res => setVendors(res.data));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {vendors.map((vendor) => (
                        <li key={vendor.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-indigo-600">{vendor.name}</p>
                                    <p className="text-sm text-gray-500">{vendor.email}</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {vendor.phone || 'No phone'}
                                </div>
                            </div>
                        </li>
                    ))}
                    {vendors.length === 0 && <li className="px-6 py-4 text-gray-500">No vendors found.</li>}
                </ul>
            </div>
        </div>
    );
};
