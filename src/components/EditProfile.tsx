import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Save, AlertCircle } from 'lucide-react';

interface EditProfileProps {
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ profile, onSave, onCancel }) => {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState<number>(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [role, setRole] = useState<'Student' | 'Employed' | 'Other'>(profile.role);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("We need your name, bestie! Or a cool nickname!");
      return;
    }
    if (!age || age <= 0 || age > 120) {
      setError("Please enter a valid age, bestie!");
      return;
    }
    setError('');
    onSave({
      name: name.trim(),
      age,
      gender,
      role
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-display font-medium text-[#09090B]/80" htmlFor="edit-name">
          what should we call you? *
        </label>
        <input
          id="edit-name"
          type="text"
          placeholder="your nickname..."
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value) setError('');
          }}
          maxLength={18}
          className="w-full bg-white border-4 border-[#09090B] rounded-xl px-3 py-2 font-sans text-sm text-[#09090B] focus:outline-none focus:ring-4 focus:ring-[#FF2A85]/20 focus:border-[#FF2A85] transition-all"
        />
      </div>

      {/* Age Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-display font-medium text-[#09090B]/80" htmlFor="edit-age">
          how old are you? *
        </label>
        <input
          id="edit-age"
          type="number"
          placeholder="age..."
          value={age || ''}
          onChange={(e) => {
            const val = e.target.value === '' ? '' : parseInt(e.target.value);
            setAge(val === '' ? 0 : val);
            if (val !== '') setError('');
          }}
          min="1"
          max="120"
          className="w-full bg-white border-4 border-[#09090B] rounded-xl px-3 py-2 font-sans text-sm text-[#09090B] focus:outline-none focus:ring-4 focus:ring-[#FF2A85]/20 focus:border-[#FF2A85] transition-all"
        />
      </div>

      {/* Gender Select buttons */}
      <div className="space-y-1.5">
        <label className="block text-xs font-display font-medium text-[#09090B]/80">
          pronouns:
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'she/her', val: 'Female' },
            { label: 'he/him', val: 'Male' },
            { label: 'they/them', val: 'Nonbinary' },
            { label: 'skip this', val: 'Rather Not Say' }
          ].map((g) => (
            <button
              key={g.val}
              type="button"
              onClick={() => setGender(g.val)}
              className={`inline-flex items-center justify-center font-display text-xs font-bold border-4 border-[#09090B] rounded-full py-1.5 px-2 transition-all cursor-pointer ${
                gender === g.val
                  ? 'bg-[#FF2A85] text-white shadow-[2px_2px_0px_#09090B] translate-x-[1px] translate-y-[1px]'
                  : 'bg-white text-[#09090B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#09090B]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Role / Occupation Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-display font-medium text-[#09090B]/80">
          are you currently...
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'Student', label: 'Student 🎒' },
            { id: 'Employed', label: 'Earning 💼' },
            { id: 'Other', label: 'Other 🛸' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRole(item.id as any)}
              className={`p-2 text-center border-4 border-[#09090B] rounded-xl transition-all cursor-pointer ${
                role === item.id
                  ? 'bg-[#FEF08A] text-[#09090B] font-bold shadow-[2px_2px_0px_#09090B]'
                  : 'bg-white text-[#09090B] hover:bg-neutral-50'
              }`}
            >
              <span className="text-[11px] font-display font-bold block">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 p-2 bg-red-50 border-2 border-red-500 rounded-lg text-red-600 font-mono text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Buttons */}
      <button
        type="submit"
        className="sticker-btn w-full py-2.5 mt-2 flex items-center justify-center gap-1.5 cursor-pointer text-sm bg-[#FEF08A] hover:bg-[#FF2A85] hover:text-white transition-all text-[#09090B] font-display font-bold border-4 border-[#09090B]"
        id="save-profile-btn"
      >
        <Save className="w-4 h-4 text-inherit" />
        <span>Save Changes</span>
      </button>
    </form>
  );
};
