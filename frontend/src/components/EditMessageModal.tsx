'use client';

 

import React, { useState, useEffect } from 'react';

import Modal from '../components/Modal';

import Button from '../components/Button';

import { Message } from '../types';

import api from '../lib/api';

import toast from 'react-hot-toast';

 

interface EditMessageModalProps {

  isOpen: boolean;

  onClose: () => void;

  message: Message | null;

  onMessageEdited: () => void;

}

 

const EditMessageModal: React.FC<EditMessageModalProps> = ({

  isOpen,

  onClose,

  message,

  onMessageEdited,

}) => {

  const [content, setContent] = useState('');

  const [loading, setLoading] = useState(false);

 

  useEffect(() => {

    if (message) {

      setContent(message.content);

    }

  }, [message]);

 

  const handleSubmit = async () => {

    if (!content.trim()) {

      toast.error('Poruka ne može biti prazna');

      return;

    }

 

    if (!message) return;

 

    setLoading(true);

    try {

      await api.put(`/messages/${message.id}`, {

        content: content.trim(),

      });

 

      toast.success('Poruka uspešno izmenjena');

      onMessageEdited();

      handleClose();

    } catch (error: any) {

      toast.error(error.response?.data?.message || 'Greška pri izmeni poruke');

    } finally {

      setLoading(false);

    }

  };

 

  const handleClose = () => {

    setContent('');

    onClose();

  };

 

  return (

    <Modal isOpen={isOpen} onClose={handleClose} title="Izmeni poruku">

      <div className="space-y-4">

        {/* Tekstualno polje za izmenu */}

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">

            Sadržaj poruke

          </label>

          <textarea

            value={content}

            onChange={(e) => setContent(e.target.value)}

            placeholder="Unesite novu poruku..."

            rows={4}

            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

            autoFocus

          />

        </div>

 

        {/* Dugmad */}

        <div className="flex space-x-2 pt-4">

          <Button variant="secondary" onClick={handleClose} className="flex-1">

            Otkaži

          </Button>

          <Button

            onClick={handleSubmit}

            disabled={loading || !content.trim()}

            className="flex-1"

          >

            {loading ? 'Čuvanje...' : 'Sačuvaj'}

          </Button>

        </div>

      </div>

    </Modal>

  );

};

 

export default EditMessageModal;