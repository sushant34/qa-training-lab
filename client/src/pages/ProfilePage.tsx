import React, { useState, useEffect } from 'react';
import { useEcommerceAuth } from '../hooks/useEcommerceAuth';
import { updateProfile } from '../services/api';
import toast from 'react-hot-toast';
import { User, Save, Lock } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useEcommerceAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name,
        email: user.email,
      }));
    }
  }, [user]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.new_password) {
      if (!formData.current_password) {
        newErrors.current_password = 'Current password is required';
      }
      if (formData.new_password.length < 8) {
        newErrors.new_password = 'New password must be at least 8 characters';
      }
      if (formData.new_password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
      };

      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      await updateProfile(updateData);
      setFormData(prev => ({ ...prev, current_password: '', new_password: '', confirm_password: '' }));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account settings.</p>
      </div>

      <div className="card flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xl font-bold text-white">
          {user?.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{user?.full_name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <User size={18} />
          Personal Information
        </h3>

        <div className="form-group">
          <label className="label">Full Name</label>
          <input type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className={`input-field ${errors.full_name ? 'input-error' : ''}`} />
          {errors.full_name && <p className="form-error">{errors.full_name}</p>}
        </div>

        <div className="form-group">
          <label className="label">Email</label>
          <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={`input-field ${errors.email ? 'input-error' : ''}`} />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        <div className="border-t pt-5 mt-5">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Lock size={18} />
            Change Password
          </h3>

          <div className="space-y-4">
            <div className="form-group">
              <label className="label">Current Password</label>
              <input type="password" value={formData.current_password} onChange={e => setFormData({ ...formData, current_password: e.target.value })} className={`input-field ${errors.current_password ? 'input-error' : ''}`} placeholder="Enter current password" />
              {errors.current_password && <p className="form-error">{errors.current_password}</p>}
            </div>

            <div className="form-group">
              <label className="label">New Password</label>
              <input type="password" value={formData.new_password} onChange={e => setFormData({ ...formData, new_password: e.target.value })} className={`input-field ${errors.new_password ? 'input-error' : ''}`} placeholder="Enter new password (min 8 characters)" />
              {errors.new_password && <p className="form-error">{errors.new_password}</p>}
            </div>

            <div className="form-group">
              <label className="label">Confirm New Password</label>
              <input type="password" value={formData.confirm_password} onChange={e => setFormData({ ...formData, confirm_password: e.target.value })} className={`input-field ${errors.confirm_password ? 'input-error' : ''}`} placeholder="Confirm new password" />
              {errors.confirm_password && <p className="form-error">{errors.confirm_password}</p>}
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
