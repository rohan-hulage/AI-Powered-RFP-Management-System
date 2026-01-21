import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PlusCircle, Settings, FileText } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Vendors', path: '/vendors', icon: Users },
        { name: 'Create RFP', path: '/create-rfp', icon: PlusCircle },
    ];

    const bottomItems = [
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col z-50 transition-all duration-300">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <FileText className="w-6 h-6 text-primary mr-2" />
                <span className="text-xl font-bold tracking-tight">AutoRFP</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                isActive
                                    ? 'bg-slate-800 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors'
                            )}
                        >
                            <Icon className={clsx(
                                isActive ? 'text-primary' : 'text-slate-500 group-hover:text-white',
                                "w-5 h-5 mr-3 transition-colors"
                            )} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-800">
                {bottomItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center px-3 py-2 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            <Icon className="w-5 h-5 mr-3 text-slate-500" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>
        </aside>
    );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                {/* Header (Optional, for now just padding/structure) */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
                    <h1 className="text-xl font-semibold text-slate-800">Overview</h1>
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            AH
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
