'use client';

 

import React, { useState, useEffect } from 'react';

import { useAuth } from '../../../context/AuthContext';

import { useRouter } from 'next/navigation';

import NavBar from '../../../components/NavBar';

import Card from '../../../components/Card';

import Button from '../../../components/Button';

import Modal from '../../../components/Modal';

import Input from '../../../components/Input';

import { MessageReport } from '../../../types';

import api from '../../../lib/api';

import toast from 'react-hot-toast';

import { formatDistanceToNow } from 'date-fns';

import { sr } from 'date-fns/locale';

 

const AdminReportsPage: React.FC = () => {

  const { user, loading: authLoading } = useAuth();

  const router = useRouter();

 

  const [reports, setReports] = useState<MessageReport[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState<MessageReport | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

 

  // State za pregled prijave

  const [reviewStatus, setReviewStatus] = useState('');

  const [reviewNotes, setReviewNotes] = useState('');

  const [suspendUser, setSuspendUser] = useState(false);

  const [suspensionDays, setSuspensionDays] = useState(7);

  const [suspensionReason, setSuspensionReason] = useState('');

  const [submitting, setSubmitting] = useState(false);

 

  // Preusmjeravanje ako korisnik nije admin

  useEffect(() => {

    if (!authLoading && (!user || user.role !== 'admin')) {

      router.push('/');

      toast.error('Nemate pristup ovoj stranici');

    }

  }, [user, authLoading, router]);

 

  useEffect(() => {

    if (user?.role === 'admin') {

      loadReports();

    }

  }, [user]);

 

  const loadReports = async () => {

    try {

      const response = await api.get('/reports');

      setReports(response.data);

    } catch (error) {

      console.error('Error loading reports:', error);

      toast.error('Greška pri učitavanju prijava');

    } finally {

      setLoading(false);

    }

  };

 

  const handleOpenReview = (report: MessageReport) => {

    setSelectedReport(report);

    setReviewStatus('reviewed');

    setReviewNotes('');

    setSuspendUser(false);

    setSuspensionDays(7);

    setSuspensionReason('');

    setIsReviewModalOpen(true);

  };

 

  const handleSubmitReview = async () => {

    if (!selectedReport) return;

 

    if (!reviewStatus) {

      toast.error('Izaberite status prijave');

      return;

    }

 

    if (suspendUser) {

      if (suspensionDays < 1) {

        toast.error('Trajanje suspenzije mora biti najmanje 1 dan');

        return;

      }

      if (!suspensionReason.trim()) {

        toast.error('Unesite razlog suspenzije');

        return;

      }

    }

 

    setSubmitting(true);

    try {

      await api.put(`/reports/${selectedReport.id}`, {

        status: reviewStatus,

        reviewNotes: reviewNotes.trim() || undefined,

        suspendUser,

        suspensionDays: suspendUser ? suspensionDays : undefined,

        suspensionReason: suspendUser ? suspensionReason.trim() : undefined,

      });

 

      toast.success('Prijava uspešno pregledana');

      setIsReviewModalOpen(false);

      loadReports();

    } catch (error: any) {

      toast.error(error.response?.data?.message || 'Greška pri pregledu prijave');

    } finally {

      setSubmitting(false);

    }

  };

 

  const getStatusBadge = (status: string) => {

    const styles = {

      pending: 'bg-yellow-100 text-yellow-800',

      reviewed: 'bg-blue-100 text-blue-800',

      resolved: 'bg-green-100 text-green-800',

      dismissed: 'bg-gray-100 text-gray-800',

    };

    const labels = {

      pending: 'Na čekanju',

      reviewed: 'Pregledano',

      resolved: 'Rešeno',

      dismissed: 'Odbijeno',

    };

 

    return (

      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>

        {labels[status as keyof typeof labels]}

      </span>

    );

  };

 

  const getReasonLabel = (reason: string) => {

    const labels = {

      spam: 'Spam',

      harassment: 'Uznemiravanje',

      hate_speech: 'Govor mržnje',

      inappropriate_content: 'Neprimeran sadržaj',

      other: 'Ostalo',

    };

    return labels[reason as keyof typeof labels] || reason;

  };

 

  if (authLoading || loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <div className="text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>

          <p className="mt-4 text-gray-600">Učitavanje...</p>

        </div>

      </div>

    );

  }

 

  return (

    <div className="min-h-screen bg-gray-50">

      <NavBar />

 

      <div className="container mx-auto px-4 py-8">

        {/* Zaglavlje */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">Prijavljene poruke</h1>

          <p className="text-gray-600 mt-2">

            Pregled i upravljanje prijavljenim porukama

          </p>

        </div>

 

        {/* Statistika */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

          <Card>

            <div className="text-center">

              <p className="text-sm text-gray-600">Ukupno prijava</p>

              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>

            </div>

          </Card>

          <Card>

            <div className="text-center">

              <p className="text-sm text-gray-600">Na čekanju</p>

              <p className="text-2xl font-bold text-yellow-600">

                {reports.filter((r) => r.status === 'pending').length}

              </p>

            </div>

          </Card>

          <Card>

            <div className="text-center">

              <p className="text-sm text-gray-600">Pregledano</p>

              <p className="text-2xl font-bold text-blue-600">

                {reports.filter((r) => r.status === 'reviewed').length}

              </p>

            </div>

          </Card>

          <Card>

            <div className="text-center">

              <p className="text-sm text-gray-600">Rešeno</p>

              <p className="text-2xl font-bold text-green-600">

                {reports.filter((r) => r.status === 'resolved').length}

              </p>

            </div>

          </Card>

        </div>

 

        {/* Lista prijava */}

        <div className="space-y-4">

          {reports.length === 0 ? (

            <Card>

              <p className="text-center text-gray-500 py-8">Nema prijavljenih poruka</p>

            </Card>

          ) : (

            reports.map((report) => (

              <Card key={report.id}>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">

                  {/* Informacije o prijavi */}

                  <div className="flex-1">

                    <div className="flex items-center space-x-2 mb-2">

                      {getStatusBadge(report.status)}

                      <span className="text-sm text-gray-500">

                        {formatDistanceToNow(new Date(report.createdAt), {

                          addSuffix: true,

                          locale: sr,

                        })}

                      </span>

                    </div>

 

                    <div className="mb-2">

                      <p className="text-sm text-gray-600">

                        <span className="font-medium">Razlog:</span>{' '}

                        {getReasonLabel(report.reason)}

                      </p>

                      {report.additionalComment && (

                        <p className="text-sm text-gray-600">

                          <span className="font-medium">Komentar:</span>{' '}

                          {report.additionalComment}

                        </p>

                      )}

                    </div>

 

                    <div className="bg-gray-100 p-3 rounded mb-2">

                      <p className="text-sm text-gray-700 font-medium">

                        Prijavljena poruka:

                      </p>

                      <p className="text-sm text-gray-900">

                        {report.message.content}

                      </p>

                      <p className="text-xs text-gray-500 mt-1">

                        Poslao: {report.message.sender.firstName}{' '}

                        {report.message.sender.lastName}

                      </p>

                    </div>

 

                    <p className="text-sm text-gray-600">

                      <span className="font-medium">Prijavio:</span>{' '}

                      {report.reporter.firstName} {report.reporter.lastName}

                    </p>

 

                    {report.reviewedBy && (

                      <p className="text-sm text-gray-600">

                        <span className="font-medium">Pregledao:</span>{' '}

                        {report.reviewedBy.firstName} {report.reviewedBy.lastName}

                      </p>

                    )}

 

                    {report.reviewNotes && (

                      <p className="text-sm text-gray-600">

                        <span className="font-medium">Napomena:</span> {report.reviewNotes}

                      </p>

                    )}

                  </div>

 

                  {/* Akcije */}

                  <div className="flex-shrink-0">

                    {report.status === 'pending' && (

                      <Button onClick={() => handleOpenReview(report)}>

                        Pregledi

                      </Button>

                    )}

                  </div>

                </div>

              </Card>

            ))

          )}

        </div>

      </div>

 

      {/* Modal za pregled prijave */}

      <Modal

        isOpen={isReviewModalOpen}

        onClose={() => setIsReviewModalOpen(false)}

        title="Pregled prijave"

      >

        {selectedReport && (

          <div className="space-y-4">

            {/* Prikaz poruke */}

            <div className="bg-gray-100 p-3 rounded">

              <p className="text-sm text-gray-700 font-medium mb-1">

                Prijavljena poruka:

              </p>

              <p className="text-sm text-gray-900">{selectedReport.message.content}</p>

              <p className="text-xs text-gray-500 mt-1">

                Poslao: {selectedReport.message.sender.firstName}{' '}

                {selectedReport.message.sender.lastName}

              </p>

            </div>

 

            {/* Razlog prijave */}

            <div>

              <p className="text-sm font-medium text-gray-700">Razlog prijave:</p>

              <p className="text-sm text-gray-900">

                {getReasonLabel(selectedReport.reason)}

              </p>

              {selectedReport.additionalComment && (

                <p className="text-sm text-gray-600 mt-1">

                  {selectedReport.additionalComment}

                </p>

              )}

            </div>

 

            {/* Status */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">

                Status *

              </label>

              <select

                value={reviewStatus}

                onChange={(e) => setReviewStatus(e.target.value)}

                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

              >

                <option value="">Izaberite status</option>

                <option value="reviewed">Pregledano</option>

                <option value="resolved">Rešeno</option>

                <option value="dismissed">Odbijeno</option>

              </select>

            </div>

 

            {/* Napomena */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">

                Napomena

              </label>

              <textarea

                value={reviewNotes}

                onChange={(e) => setReviewNotes(e.target.value)}

                placeholder="Unesite napomenu..."

                rows={3}

                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

              />

            </div>

 

            {/* Suspenzija korisnika */}

            <div className="border-t pt-4">

              <label className="flex items-center space-x-2 cursor-pointer">

                <input

                  type="checkbox"

                  checked={suspendUser}

                  onChange={(e) => setSuspendUser(e.target.checked)}

                  className="text-blue-600 focus:ring-blue-500"

                />

                <span className="text-sm font-medium text-gray-700">

                  Suspenduj korisnika

                </span>

              </label>

 

              {suspendUser && (

                <div className="mt-4 space-y-3 pl-6">

                  <Input

                    label="Broj dana suspenzije"

                    type="number"

                    min="1"

                    value={suspensionDays}

                    onChange={(e) => setSuspensionDays(parseInt(e.target.value))}

                  />

 

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">

                      Razlog suspenzije *

                    </label>

                    <textarea

                      value={suspensionReason}

                      onChange={(e) => setSuspensionReason(e.target.value)}

                      placeholder="Unesite razlog suspenzije..."

                      rows={3}

                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                    />

                  </div>

                </div>

              )}

            </div>

 

            {/* Dugmad */}

            <div className="flex space-x-2 pt-4">

              <Button

                variant="secondary"

                onClick={() => setIsReviewModalOpen(false)}

                className="flex-1"

              >

                Otkaži

              </Button>

              <Button

                onClick={handleSubmitReview}

                disabled={submitting || !reviewStatus}

                className="flex-1"

              >

                {submitting ? 'Čuvanje...' : 'Sačuvaj'}

              </Button>

            </div>

          </div>

        )}

      </Modal>

    </div>

  );

};

 

export default AdminReportsPage;