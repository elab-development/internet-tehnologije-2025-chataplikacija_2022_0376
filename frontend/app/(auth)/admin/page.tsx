'use client';

import React, { useState } from 'react';
import axios from 'lib/axios';
import Button from 'components/ui/Button';
import toast from 'react-hot-toast';
import { Mail, Lock, ShieldCheck, Users, RefreshCw, UserX, CheckCircle } from 'lucide-react';
import Input from 'components/ui/Input';

export default function AdminPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (credentials.email === 'admin@gmail.com' && credentials.password === 'adminadmin') {
            toast.success('Admin panel otključan');
            setIsAdminAuthenticated(true);
            fetchUsers();
        } else {
            toast.error('Neispravni admin podaci');
        }
        setLoading(false);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/auth/admin/users');
            setUsers(res.data);
        } catch (err) {
            toast.error('Učitavanje nije uspelo.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSuspend = async (user: any) => {
        try {
            const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
            await axios.patch(`/auth/admin/users/${user.id}/status`, {
                status: newStatus,
                suspendedUntil: newStatus === 'suspended' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
                suspensionReason: newStatus === 'suspended' ? 'Administrativna suspenzija' : null,
            });
            toast.success(`Status ažuriran za ${user.firstName}`);
            fetchUsers();
        } catch (err) {
            toast.error('Greška pri promeni statusa');
        }
    };

    if (!isAdminAuthenticated) {
        return (
            <div className="fixed inset-0 z-[999] bg-slate-100 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-10 border border-white">
                    <div className="text-center mb-8">
                        <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
                            <ShieldCheck className="text-white" size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">Admin Panel</h2>
                    </div>
                    <form onSubmit={handleAdminLogin} className="space-y-6">
                        <Input label="Email" type="email" value={credentials.email} onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} required />
                        <Input label="Lozinka" type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} required />
                        <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all">
                            {loading ? 'PRIJAVA...' : 'PRISTUPI'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#F8FAFC] overflow-auto">
            <div className="min-w-full inline-block align-middle p-6 md:p-12">
                <div className="max-w-[1600px] mx-auto">
                    
                    {/* Header sekcija */}
                    <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex items-center gap-6">
                            <div className="bg-blue-600 p-4 rounded-2xl text-white">
                                <Users size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 uppercase">Kontrolna Tabla</h1>
                                <p className="text-slate-500 font-bold tracking-widest text-sm">UKUPNO KORISNIKA: {users.length}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button onClick={fetchUsers} className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all">
                                <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <Button variant="primary" onClick={() => setIsAdminAuthenticated(false)} className="rounded-2xl px-10 py-4 font-black bg-slate-900 text-white">
                                ODJAVA
                            </Button>
                        </div>
                    </header>

                    {/* Tabela - sada je raširena */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-10 py-7 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Korisnik</th>
                                    <th className="px-10 py-7 text-center text-xs font-black text-slate-400 uppercase tracking-widest italic">Email adresa</th>
                                    <th className="px-10 py-7 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Trenutni Status</th>
                                    <th className="px-10 py-7 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Akcije</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-10 py-20 text-center text-slate-300 font-bold text-xl uppercase tracking-widest">Nema registrovanih korisnika</td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-blue-50/20 transition-all">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                                    </div>
                                                    <div className="font-black text-slate-900 text-lg uppercase tracking-tight">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-center text-slate-500 font-medium">
                                                {user.email}
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.1em] ${
                                                    user.status === 'active' 
                                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                                    : 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                                                }`}>
                                                    ● {user.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                {user.role !== 'admin' ? (
                                                    <button
                                                        onClick={() => toggleSuspend(user)}
                                                        className={`font-black py-4 px-8 rounded-2xl transition-all shadow-sm text-sm ${
                                                            user.status === 'suspended'
                                                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                            : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-100'
                                                        }`}
                                                    >
                                                        {user.status === 'suspended' ? 'ODBLOKIRAJ' : 'SUSPENDUJ'}
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase bg-slate-50 px-4 py-2 rounded-lg">Administrator</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}