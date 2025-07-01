import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    bio: user?.profile?.bio || '',
    specialties: user?.profile?.specialties || []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Update profile
    setEditing(false);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card-mystical">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-alex-brush text-4xl text-mystical-pink">
              Profile Settings
            </h1>
            <button
              onClick={() => setEditing(!editing)}
              className="btn-mystical"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <img
                src={user?.profile?.avatar || '/default-avatar.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full mx-auto border-4 border-mystical-pink mb-4"
              />
              <button className="btn-mystical">
                Change Photo
              </button>
            </div>

            <div className="md:col-span-2">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="font-playfair text-white text-sm font-medium mb-2 block">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input-mystical w-full"
                    />
                  </div>

                  <div>
                    <label className="font-playfair text-white text-sm font-medium mb-2 block">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="input-mystical w-full h-32"
                      rows={4}
                    />
                  </div>

                  <button type="submit" className="btn-mystical">
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-playfair text-mystical-pink text-lg font-semibold mb-2">
                      Name
                    </h3>
                    <p className="font-playfair text-white">
                      {user?.profile?.name || 'Not set'}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-playfair text-mystical-pink text-lg font-semibold mb-2">
                      Email
                    </h3>
                    <p className="font-playfair text-white">
                      {user?.email}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-playfair text-mystical-pink text-lg font-semibold mb-2">
                      Role
                    </h3>
                    <p className="font-playfair text-white capitalize">
                      {user?.role}
                    </p>
                  </div>

                  {user?.profile?.bio && (
                    <div>
                      <h3 className="font-playfair text-mystical-pink text-lg font-semibold mb-2">
                        Bio
                      </h3>
                      <p className="font-playfair text-white">
                        {user.profile.bio}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;