import React, { useRef, useState } from 'react';
import { Download, ShieldCheck, Upload, User } from 'lucide-react';
import html2canvas from 'html2canvas';

export const IDCardGenerator = ({ user }) => {
  const cardRef = useRef(null);
  const [photo, setPhoto] = useState(user?.idCardUrl || '');
  const [downloading, setDownloading] = useState(false);

  if (!user) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target.result);
      // Save in local storage user profile if student
      const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
      const idx = users.findIndex(u => u.uid === user.uid);
      if (idx !== -1) {
        users[idx].idCardUrl = event.target.result;
        localStorage.setItem('acad_users', JSON.stringify(users));
        // If current user, update it
        const current = JSON.parse(localStorage.getItem('acad_current_user') || '{}');
        if (current.uid === user.uid) {
          current.idCardUrl = event.target.result;
          localStorage.setItem('acad_current_user', JSON.stringify(current));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5, // High resolution
        useCORS: true,
        backgroundColor: null
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${user.fullName.replace(/\s+/g, '_')}_ID_Card.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate card image:', error);
    } finally {
      setDownloading(false);
    }
  };

  const isStudent = user.role === 'student';

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-xl max-w-3xl mx-auto">
      
      {/* Upload & Instructions */}
      <div className="flex-1 space-y-4 text-xs font-semibold">
        <h3 className="text-base font-extrabold text-slate-850 dark:text-white">ID Card Generator</h3>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
          Your digital identity card is generated automatically from your registered profile. Please upload a clear passport-sized face photo to finalize the card details.
        </p>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase">Upload Portrait Photo</label>
          <div className="relative border border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50 dark:bg-slate-950">
            <input
              type="file"
              onChange={handlePhotoUpload}
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-bold">
              <Upload size={16} />
              <span>Select Face Photo</span>
            </div>
          </div>
        </div>

        <button
          onClick={downloadCard}
          disabled={downloading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-755 disabled:bg-slate-200 text-white rounded-xl font-bold shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2"
        >
          <Download size={16} />
          <span>{downloading ? 'Generating Image...' : 'Download ID Card (PNG)'}</span>
        </button>
      </div>

      {/* ID Card Display Card */}
      <div className="shrink-0 select-none">
        <div
          ref={cardRef}
          className="w-80 h-[460px] bg-slate-900 text-white rounded-2xl relative shadow-2xl overflow-hidden flex flex-col justify-between border-2 border-slate-800"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-blue-650 to-indigo-700 p-4 border-b-2 border-blue-500/30 text-center relative overflow-hidden shrink-0">
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            <div className="relative z-10 flex items-center justify-center gap-1.5">
              <ShieldCheck size={18} className="text-blue-300" />
              <span className="text-xs font-black tracking-widest uppercase">ACADEMIA UNIVERSITY</span>
            </div>
            <p className="text-[7.5px] text-blue-200 uppercase tracking-widest font-black mt-1">Institutional Identity Card</p>
          </div>

          {/* Body Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 space-y-4">
            
            {/* Picture Frame */}
            <div className="w-24 h-28 bg-slate-800 border-2 border-blue-500/40 rounded-xl overflow-hidden flex items-center justify-center shadow-lg relative group">
              {photo ? (
                <img src={photo} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-600 flex flex-col items-center">
                  <User size={36} className="opacity-40" />
                  <span className="text-[8px] font-bold mt-1 text-slate-500">NO PHOTO</span>
                </div>
              )}
            </div>

            {/* User Bio Details */}
            <div className="text-center space-y-1 w-full">
              <h4 className="text-sm font-black tracking-wide truncate">{user.fullName}</h4>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                {isStudent ? 'Student Profile' : 'Faculty Member'}
              </p>
            </div>

            {/* Data Columns */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 w-full text-left border-t border-b border-slate-800 py-3 text-[10px] font-semibold">
              <div>
                <span className="text-slate-500 text-[8px] block font-bold uppercase tracking-wider">ID / Roll No</span>
                <span className="text-slate-200 truncate block font-bold">{user.rollNumber || user.uid.split('-')[1]?.toUpperCase() || 'FAC-0982'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[8px] block font-bold uppercase tracking-wider">Dept / Branch</span>
                <span className="text-slate-200 truncate block font-bold">{user.department !== 'N/A' ? user.department : 'Admin Staff'}</span>
              </div>
              {isStudent && (
                <div>
                  <span className="text-slate-500 text-[8px] block font-bold uppercase tracking-wider">Semester</span>
                  <span className="text-slate-200 block font-bold">Sem {user.semester}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 text-[8px] block font-bold uppercase tracking-wider">Mobile Contact</span>
                <span className="text-slate-200 block font-bold">{user.mobile || '+91 99901 02394'}</span>
              </div>
            </div>

          </div>

          {/* Barcode Footer */}
          <div className="bg-slate-950 p-4 flex flex-col items-center justify-center border-t border-slate-800 shrink-0 text-center space-y-1">
            {/* Simple Dynamic Styled Barcode (SVG) */}
            <svg className="w-48 h-8 opacity-80" viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="100" height="20" fill="transparent"/>
              {/* Generate random lines */}
              <line x1="2" y1="2" x2="2" y2="18" stroke="white" strokeWidth="1"/>
              <line x1="4" y1="2" x2="4" y2="18" stroke="white" strokeWidth="0.5"/>
              <line x1="6" y1="2" x2="6" y2="18" stroke="white" strokeWidth="2"/>
              <line x1="10" y1="2" x2="10" y2="18" stroke="white" strokeWidth="1"/>
              <line x1="12" y1="2" x2="12" y2="18" stroke="white" strokeWidth="0.5"/>
              <line x1="14" y1="2" x2="14" y2="18" stroke="white" strokeWidth="1.5"/>
              <line x1="17" y1="2" x2="17" y2="18" stroke="white" strokeWidth="3"/>
              <line x1="22" y1="2" x2="22" y2="18" stroke="white" strokeWidth="0.5"/>
              <line x1="24" y1="2" x2="24" y2="18" stroke="white" strokeWidth="1"/>
              <line x1="26" y1="2" x2="26" y2="18" stroke="white" strokeWidth="2"/>
              <line x1="30" y1="2" x2="30" y2="18" stroke="white" strokeWidth="0.5"/>
              <line x1="32" y1="2" x2="32" y2="18" stroke="white" strokeWidth="1"/>
              <line x1="34" y1="2" x2="34" y2="18" stroke="white" strokeWidth="1.5"/>
              <line x1="38" y1="2" x2="38" y2="18" stroke="white" strokeWidth="2.5"/>
              <line x1="42" y1="2" x2="42" y2="18" stroke="white" strokeWidth="0.5"/>
              <line x1="44" y1="2" x2="44" y2="18" stroke="white" strokeWidth="1"/>
              <line x1="47" y1="2" x2="47" y2="18" stroke="white" strokeWidth="2"/>
              <line x1="51" y1="2" x2="51" y2="18" stroke="white" strokeWidth="0.5"/>
              <line x1="53" y1="2" x2="53" y2="18" stroke="white" strokeWidth="1.5"/>
              <line x1="56" y1="2" x2="56" y2="18" stroke="white" strokeWidth="3"/>
              <line x1="60" y1="2" x2="60" y2="18" stroke="white" strokeWidth="1"/>
              <line x1="62" y1="2" x2="62" y2="18" stroke="white" strokeWidth="0.5"/>
              <line x1="65" y1="2" x2="65" y2="18" stroke="white" strokeWidth="2"/>
              <line x1="68" y1="2" x2="68" y2="18" stroke="white" strokeWidth="1"/>
              <line x1="71" y1="2" x2="71" y2="18" stroke="white" strokeWidth="1.5"/>
              <line x1="74" y1="2" x2="74" y2="18" stroke="white" strokeWidth="2"/>
              <line x1="77" y1="2" x2="77" y2="18" stroke="white" strokeWidth="0.5"/>
              <line x1="79" y1="2" x2="79" y2="18" stroke="white" strokeWidth="1"/>
              <line x1="82" y1="2" x2="82" y2="18" stroke="white" strokeWidth="3"/>
              <line x1="86" y1="2" x2="86" y2="18" stroke="white" strokeWidth="0.5"/>
              <line x1="88" y1="2" x2="88" y2="18" stroke="white" strokeWidth="1.5"/>
              <line x1="91" y1="2" x2="91" y2="18" stroke="white" strokeWidth="2"/>
              <line x1="94" y1="2" x2="94" y2="18" stroke="white" strokeWidth="0.5"/>
              <line x1="96" y1="2" x2="96" y2="18" stroke="white" strokeWidth="1"/>
            </svg>
            <p className="text-[7px] text-slate-500 font-bold uppercase tracking-wider">Scan for Verification</p>
          </div>

        </div>
      </div>

    </div>
  );
};
export default IDCardGenerator;
