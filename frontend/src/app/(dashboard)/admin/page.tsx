'use client';

import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { MessageReport, ReportStatus, ReportReason } from '@/types';
import { format } from 'date-fns';

export default function AdminPage() {
  const [reports, setReports] = useState<MessageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReportStatus | 'all'>('all');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await api.getReports();
      setReports(response.reports || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewReport = async (
    reportId: string,
    status: ReportStatus,
    reviewComment?: string
  ) => {
    try {
      await api.reviewReport(reportId, { status, reviewComment });
      await loadReports();
    } catch (error) {
      console.error('Failed to review report:', error);
    }
  };

  const handleSuspendUser = async (userId: string, reason: string) => {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // 7 days suspension
      await api.suspendUser(userId, { endDate, reason });
      alert('User suspended successfully');
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case ReportStatus.REVIEWING:
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case ReportStatus.RESOLVED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case ReportStatus.DISMISSED:
        return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getReasonLabel = (reason: ReportReason) => {
    return reason.replace(/_/g, ' ').toUpperCase();
  };

  const filteredReports = reports.filter(
    (report) => filter === 'all' || report.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage reported messages and moderate users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter((r) => r.status === ReportStatus.PENDING).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reviewing</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reports.filter((r) => r.status === ReportStatus.REVIEWING).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter((r) => r.status === ReportStatus.RESOLVED).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dismissed</p>
                <p className="text-2xl font-bold text-gray-600">
                  {reports.filter((r) => r.status === ReportStatus.DISMISSED).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === ReportStatus.PENDING ? 'primary' : 'secondary'}
            onClick={() => setFilter(ReportStatus.PENDING)}
            size="sm"
          >
            Pending
          </Button>
          <Button
            variant={filter === ReportStatus.REVIEWING ? 'primary' : 'secondary'}
            onClick={() => setFilter(ReportStatus.REVIEWING)}
            size="sm"
          >
            Reviewing
          </Button>
          <Button
            variant={filter === ReportStatus.RESOLVED ? 'primary' : 'secondary'}
            onClick={() => setFilter(ReportStatus.RESOLVED)}
            size="sm"
          >
            Resolved
          </Button>
          <Button
            variant={filter === ReportStatus.DISMISSED ? 'primary' : 'secondary'}
            onClick={() => setFilter(ReportStatus.DISMISSED)}
            size="sm"
          >
            Dismissed
          </Button>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No reports found</p>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Card key={report.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(report.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getReasonLabel(report.reason)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Reported by {report.reporter.username} •{' '}
                        {format(new Date(report.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      report.status === ReportStatus.PENDING
                        ? 'bg-yellow-100 text-yellow-800'
                        : report.status === ReportStatus.REVIEWING
                        ? 'bg-orange-100 text-orange-800'
                        : report.status === ReportStatus.RESOLVED
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                {/* Reported Message */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-1">Reported Message:</p>
                  <p className="text-gray-900">{report.message.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    From: {report.message.sender.username}
                  </p>
                </div>

                {/* Report Comment */}
                {report.comment && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Reporter's Comment:</p>
                    <p className="text-gray-700">{report.comment}</p>
                  </div>
                )}

                {/* Actions */}
                {report.status === ReportStatus.PENDING && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        handleReviewReport(report.id, ReportStatus.RESOLVED)
                      }
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (
                          confirm(
                            `Suspend user ${report.message.sender.username}?`
                          )
                        ) {
                          handleSuspendUser(
                            report.message.sender.id,
                            `Reported for: ${report.reason}`
                          );
                          handleReviewReport(
                            report.id,
                            ReportStatus.RESOLVED,
                            'User suspended'
                          );
                        }
                      }}
                    >
                      Suspend User
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        handleReviewReport(report.id, ReportStatus.DISMISSED)
                      }
                    >
                      Dismiss
                    </Button>
                  </div>
                )}

                {/* Review Info */}
                {report.reviewedAt && report.reviewer && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Reviewed by {report.reviewer.username} on{' '}
                      {format(new Date(report.reviewedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                    {report.reviewComment && (
                      <p className="text-sm text-gray-700 mt-1">
                        {report.reviewComment}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}