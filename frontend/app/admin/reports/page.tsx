'use client';

import React, { useState, useEffect } from 'react';
import axios from 'lib/axios';
import { Report } from 'types/types';
import Card from 'components/ui/Card';
import Button from 'components/ui/Button';
import Modal from 'components/ui/Modal';
import Input from 'components/ui/Input';
import Avatar from 'components/ui/Avatar';
import Footer from 'components/layout/Footer';
import {
  AlertTriangle,
  Check,
  X,
  Clock,
  User,
  MessageSquare,
  Calendar,
  Ban,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from 'lib/utils';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | null>(null);
  const [suspendDays, setSuspendDays] = useState('7');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Greška pri učitavanju prijava');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedReport || !actionType) return;

    try {
      if (actionType === 'suspend') {
        await axios.post(`/admin/suspend-user`, {
          userId: selectedReport.message.senderId,
          days: parseInt(suspendDays),
          reason: selectedReport.reason,
        });
        toast.success('Korisnik suspendovan');
      } else if (actionType === 'approve') {
        await axios.put(`/reports/${selectedReport.id}`, { status: 'resolved' });
        await axios.delete(`/messages/${selectedReport.messageId}`);
        toast.success('Poruka obrisana');
      } else if (actionType === 'reject') {
        await axios.put(`/reports/${selectedReport.id}`, { status: 'reviewed' });
        toast.success('Prijava odbijena');
      }

      fetchReports();
      setShowActionModal(false);
      setSelectedReport(null);
      setActionType(null);
      setSuspendDays('7');
    } catch (error: any) {
      console.error('Error handling report action:', error);
      toast.error(error.response?.data?.message || 'Greška pri obradi prijave');
    }
  };

  const openActionModal = (report: Report, action: 'approve' | 'reject' | 'suspend') => {
    setSelectedReport(report);
    setActionType(action);
    setShowActionModal(true);
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = searchQuery === '' || 
      report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.message.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const statusConfig = {
    pending: { label: 'Na čekanju', color: 'text-yellow-700 bg-yellow-100', icon: Clock },
    reviewed: { label: 'Pregledano', color: 'text-blue-700 bg-blue-100', icon: Check },
    resolved: { label: 'Rešeno', color: 'text-green-700 bg-green-100', icon: Check },
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-dark-900 flex items-center gap-3">
            <AlertTriangle className="text-red-600" />
            Prijavljene Poruke
          </h1>
          <p className="text-dark-600 mt-1">
            Pregledajte i upravljajte prijavama neprimerenih poruka
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Pretraži prijave..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search size={18} />}
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'pending', 'reviewed', 'resolved'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status === 'all' ? 'Sve' : statusConfig[status].label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="text-yellow-700" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-900">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-sm text-dark-600">Na čekanju</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Check className="text-blue-700" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-900">
                  {reports.filter(r => r.status === 'reviewed').length}
                </p>
                <p className="text-sm text-dark-600">Pregledano</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="text-green-700" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-900">
                  {reports.filter(r => r.status === 'resolved').length}
                </p>
                <p className="text-sm text-dark-600">Rešeno</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <div className="p-12 text-center text-dark-500">
              <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nema prijava</p>
              <p className="text-sm">
                {searchQuery || filterStatus !== 'all'
                  ? 'Nema prijava koje odgovaraju filterima'
                  : 'Trenutno nema prijavljenih poruka'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const StatusIcon = statusConfig[report.status].icon;

              return (
                <Card key={report.id} hover>
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left Section - Reporter Info */}
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={report.reporter.avatar}
                          firstName={report.reporter.firstName}
                          lastName={report.reporter.lastName}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-dark-900">
                              {report.reporter.firstName} {report.reporter.lastName}
                            </p>
                            <span
                              className={cn(
                                'text-xs px-2 py-1 rounded-full font-medium',
                                statusConfig[report.status].color
                              )}
                            >
                              <StatusIcon size={12} className="inline mr-1" />
                              {statusConfig[report.status].label}
                            </span>
                          </div>
                          <p className="text-sm text-dark-600 flex items-center gap-1">
                            <Calendar size={14} />
                            {format(new Date(report.createdAt), 'dd.MM.yyyy HH:mm')}
                          </p>
                        </div>
                      </div>

                      {/* Middle Section - Report Details */}
                      <div className="flex-1">
                        <div className="mb-3">
                          <p className="text-sm text-dark-500 mb-1">Razlog prijave:</p>
                          <p className="font-medium text-dark-900">{report.reason}</p>
                        </div>
                        
                        {report.comment && (
                          <div className="mb-3">
                            <p className="text-sm text-dark-500 mb-1">Komentar:</p>
                            <p className="text-dark-700">{report.comment}</p>
                          </div>
                        )}

                        <div className="bg-dark-50 rounded-lg p-4 border border-dark-200">
                          <div className="flex items-start gap-3 mb-2">
                            <Avatar
                              src={report.message.sender.avatar}
                              firstName={report.message.sender.firstName}
                              lastName={report.message.sender.lastName}
                              size="sm"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-dark-900">
                                {report.message.sender.firstName} {report.message.sender.lastName}
                              </p>
                              <p className="text-xs text-dark-500">
                                {format(new Date(report.message.createdAt), 'dd.MM.yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                          <p className="text-dark-800 whitespace-pre-wrap">
                            {report.message.content}
                          </p>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      {report.status === 'pending' && (
                        <div className="flex flex-col gap-2 lg:w-48">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => openActionModal(report, 'approve')}
                            className="w-full"
                          >
                            <Trash2 size={16} />
                            Obriši Poruku
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => openActionModal(report, 'suspend')}
                            className="w-full"
                          >
                            <Ban size={16} />
                            Suspenduj
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openActionModal(report, 'reject')}
                            className="w-full"
                          >
                            <X size={16} />
                            Odbij
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setSelectedReport(null);
          setActionType(null);
        }}
        title={
          actionType === 'suspend'
            ? 'Suspenzija Korisnika'
            : actionType === 'approve'
            ? 'Brisanje Poruke'
            : 'Odbijanje Prijave'
        }
      >
        <div className="space-y-4">
          {actionType === 'suspend' ? (
            <>
              <p className="text-dark-700">
                Da li ste sigurni da želite da suspenduete korisnika{' '}
                <strong>
                  {selectedReport?.message.sender.firstName}{' '}
                  {selectedReport?.message.sender.lastName}
                </strong>
                ?
              </p>
              <Input
                label="Broj dana suspenzije"
                type="number"
                value={suspendDays}
                onChange={(e) => setSuspendDays(e.target.value)}
                min="1"
                max="365"
              />
            </>
          ) : actionType === 'approve' ? (
            <p className="text-dark-700">
              Da li ste sigurni da želite da obrišete prijavljenu poruku i označite prijavu kao rešenu?
            </p>
          ) : (
            <p className="text-dark-700">
              Da li ste sigurni da želite da odbijete ovu prijavu? Poruka neće biti obrisana.
            </p>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowActionModal(false);
                setSelectedReport(null);
                setActionType(null);
              }}
            >
              Otkaži
            </Button>
            <Button
              variant={actionType === 'reject' ? 'secondary' : 'danger'}
              onClick={handleAction}
            >
              Potvrdi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}