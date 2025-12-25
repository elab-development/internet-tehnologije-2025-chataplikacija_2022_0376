'use client';

 

import React, { useState } from 'react';

import Modal from '../components/Modal';

import Button from '../components/Button';

import { Message } from '../types';

import api from '../lib/api';

import toast from 'react-hot-toast';

 

interface ReportMessageModalProps {

  isOpen: boolean;

  onClose: () => void;

  message: Message | null;

}

 

const reportReasons = [

  { value: 'spam', label: 'Spam' },

  { value: 'harassment', label: 'Uznemiravanje' },

  { value: 'hate_speech', label: 'Govor mržnje' },

  { value: 'inappropriate_content', label: 'Neprimeran sadržaj' },

  { value: 'other', label: 'Ostalo' },

];

 

const ReportMessageModal: React.FC<ReportMessageModalProps> = ({

  isOpen,

  onClose,

  message,

}) => {

  const [selectedReason, setSelectedReason] = useState('');

  const [additionalComment, setAdditionalComment] = useState('');

  const [loading, setLoading] = useState(false);

 

  const handleSubmit = async () => {

    if (!selectedReason) {

      toast.error('Izaberite razlog prijave');

      return;

    }

 

    if (!message) return;

 

    setLoading(true);

    try {

      await api.post('/reports', {

        messageId: message.id,

        reason: selectedReason,

        additionalComment: additionalComment.trim() || undefined,

      });

 

      toast.success('Poruka uspešno prijavljena');

      handleClose();

    } catch (error: any) {

      toast.error(error.response?.data?.message || 'Greška pri prijavljivanju poruke');

    } finally {

      setLoading(false);

    }

  };

 

  const handleClose = () => {

    setSelectedReason('');

    setAdditionalComment('');

    onClose();

  };

 

  return (

    <Modal isOpen={isOpen} onClose={handleClose} title="Prijavi poruku">

      <div className="space-y-4">

        {/* Prikaz poruke koja se prijavljuje */}

        {message && (

          <div className="bg-gray-100 p-3 rounded-lg">

            <p className="text-sm text-gray-700 font-medium mb-1">Poruka:</p>

            <p className="text-sm text-gray-900">{message.content}</p>

            <p className="text-xs text-gray-500 mt-1">

              Poslao: {message.sender.firstName} {message.sender.lastName}

            </p>

          </div>

        )}

 

        {/* Izbor razloga */}

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">

            Razlog prijave *

          </label>

          <div className="space-y-2">

            {reportReasons.map((reason) => (

              <label

                key={reason.value}

                className="flex items-center space-x-2 cursor-pointer"

              >

                <input

                  type="radio"

                  name="reason"

                  value={reason.value}

                  checked={selectedReason === reason.value}

                  onChange={(e) => setSelectedReason(e.target.value)}

                  className="text-blue-600 focus:ring-blue-500"

                />

                <span className="text-sm text-gray-700">{reason.label}</span>

              </label>

            ))}

          </div>

        </div>

 

        {/* Dodatni komentar */}

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">

            Dodatni komentar (opciono)

          </label>

          <textarea

            value={additionalComment}

            onChange={(e) => setAdditionalComment(e.target.value)}

            placeholder="Unesite dodatne informacije..."

            rows={4}

            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

          />

        </div>

 

        {/* Dugmad */}

        <div className="flex space-x-2 pt-4">

          <Button variant="secondary" onClick={handleClose} className="flex-1">

            Otkaži

          </Button>

          <Button

            onClick={handleSubmit}

            disabled={loading || !selectedReason}

            variant="danger"

            className="flex-1"

          >

            {loading ? 'Prijavljivanje...' : 'Prijavi'}

          </Button>

        </div>

      </div>

    </Modal>

  );

};

 

export default ReportMessageModal;