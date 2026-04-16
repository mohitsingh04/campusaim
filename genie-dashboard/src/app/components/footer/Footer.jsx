import React from 'react';

const Footer = () => {
  return (
    /* Reduced vertical padding from py-8 to py-6 */
    <footer className="mt-auto py-6 border-t border-slate-100">
      {/* Changed px-2 to px-0 to align with the parent container's boundaries */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-0">
        <p className="text-sm text-slate-400 font-medium tracking-tight">
          &copy; 2026 <span className="text-slate-600 font-bold italic">Campusaim LMS</span>. All rights reserved.
        </p>

        <div className="flex items-center gap-6 text-xs font-semibold text-slate-400 uppercase tracking-widest">
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Help</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;