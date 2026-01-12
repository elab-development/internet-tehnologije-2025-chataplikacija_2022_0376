'use client';

import React, { useState } from 'react';
import { useAuth } from 'context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'lib/axios';
import Avatar from 'components/ui/Avatar';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Card from 'components/ui/Card';
import Modal from 'components/ui/Modal';
import Navbar from 'components/layout/Navbar';
import Sidebar from 'components/layout/Sidebar';
import Footer from 'components/layout/Footer';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X,
  Camera,
  Lock,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from 'lib/utils';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  React.useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error('Sva polja su obavezna');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await axios.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(response.data);
      toast.success('Profil uspešno ažuriran');
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Greška pri ažuriranju profila');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Sva polja su obavezna');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Nove lozinke se ne poklapaju');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Lozinka mora imati najmanje 6 karaktera');
      return;
    }

    setLoading(true);

    try {
      await axios.put('/users/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success('Lozinka uspešno promenjena');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Greška pri promeni lozinke');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);

    try {
      await axios.delete('/users/account');
      toast.success('Nalog uspešno obrisan');
      router.push('/login');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Greška pri brisanju naloga');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const roleLabels = {
    USER: 'Korisnik',
    ADMIN: 'Administrator',
    MODERATOR: 'Moderator',
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} showMenuButton />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto bg-dark-50">
          <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-dark-900">Moj Profil</h1>
              <p className="text-dark-600 mt-1">Upravljajte vašim profilom i podešavanjima</p>
            </div>

            {/* Profile Card */}
            <Card className="mb-6">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Avatar
                        src={avatarPreview || user.avatar}
                        firstName={user.firstName}
                        lastName={user.lastName}
                        size="xl"
                        online
                      />
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                          <Camera size={20} className="text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    
                    {!isEditing && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit size={16} />
                        Izmeni Profil
                      </Button>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Ime"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            icon={<User size={18} />}
                          />
                          <Input
                            label="Prezime"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            icon={<User size={18} />}
                          />
                        </div>
                        <Input
                          label="Email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          icon={<Mail size={18} />}
                        />
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="primary"
                            onClick={handleSaveProfile}
                            isLoading={loading}
                          >
                            <Save size={18} />
                            Sačuvaj
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={handleCancelEdit}
                            disabled={loading}
                          >
                            <X size={18} />
                            Otkaži
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold text-dark-900">
                            {user.firstName} {user.lastName}
                          </h2>
                          <p className="text-dark-600">{user.email}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg">
                            <Shield className="text-primary-600" size={20} />
                            <div>
                              <p className="text-xs text-dark-500">Uloga</p>
                              <p className="font-medium text-dark-900">
                                {roleLabels[user.role]}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg">
                            <Calendar className="text-primary-600" size={20} />
                            <div>
                              <p className="text-xs text-dark-500">Registrovan</p>
                              <p className="font-medium text-dark-900">
                                {format(new Date(user.createdAt), 'dd.MM.yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Security Settings */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-dark-900 mb-4">
                  Bezbednost
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full justify-start"
                  >
                    <Lock size={18} />
                    Promeni Lozinku
                  </Button>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-4">
                  Opasna Zona
                </h3>
                <p className="text-sm text-dark-600 mb-4">
                  Brisanje naloga je trajno. Svi vaši podaci, poruke i konverzacije će biti obrisani.
                </p>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 size={18} />
                  Obriši Nalog
                </Button>
              </div>
            </Card>
          </div>

          <Footer />
        </main>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Promena Lozinke"
      >
        <div className="space-y-4">
          <Input
            label="Trenutna Lozinka"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            icon={<Lock size={18} />}
          />
          <Input
            label="Nova Lozinka"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={<Lock size={18} />}
          />
          <Input
            label="Potvrdi Novu Lozinku"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock size={18} />}
          />
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
            >
              Otkaži
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePassword}
              isLoading={loading}
            >
              Promeni Lozinku
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Confirmation */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Potvrda Brisanja"
      >
        <div className="space-y-4">
          <p className="text-dark-700">
            Da li ste sigurni da želite da obrišete vaš nalog? Ova akcija je trajna i ne može se poništiti.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Upozorenje:</strong> Brisanjem naloga izgubićete pristup svim vašim porukama, konverzacijama i podacima.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Otkaži
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              isLoading={loading}
            >
              Obriši Nalog
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}