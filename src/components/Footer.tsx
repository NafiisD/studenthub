import { Zap, Github, Mail, Globe, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 backdrop-blur-md relative overflow-hidden">
      {/* Footer background line decoration */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Brand Info (4 Columns) */}
          <div className="md:col-span-5 space-y-4 text-center md:text-left">
            <a href="#" className="flex items-center justify-center md:justify-start gap-2 group">
              <div className="relative p-2 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-lg shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <Zap className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white tracking-wide">
                Student<span className="text-cyan-400">Hub</span>
              </span>
            </a>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto md:mx-0 leading-relaxed">
              Ekosistem digital terpercaya untuk mempublikasikan, menjual, dan mendistribusikan karya inovasi teknologi mahasiswa Indonesia ke pasar global.
            </p>
          </div>

          {/* Navigation Links Group (3 Columns) */}
          <div className="md:col-span-3 text-center md:text-left">
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-4">
              Navigasi
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Beranda</a>
              </li>
              <li>
                <a href="#categories" className="text-slate-400 hover:text-cyan-400 transition-colors">Kategori</a>
              </li>
              <li>
                <a href="#features" className="text-slate-400 hover:text-cyan-400 transition-colors">Fitur Kami</a>
              </li>
            </ul>
          </div>

          {/* Socials / Contact (4 Columns) */}
          <div className="md:col-span-4 text-center md:text-left">
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-4">
              Hubungi Kami
            </h4>
            <p className="text-slate-400 text-xs sm:text-sm mb-4">
              Punya pertanyaan atau ingin bermitra? Silakan hubungi kami.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <a
                href="mailto:support@studenthub.id"
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
                aria-label="Kirim Email"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://studenthub.id"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
                aria-label="Website"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright details */}
        <div className="mt-12 pt-8 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} StudentHub Indonesia. Hak Cipta Dilindungi.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            Dibuat dengan <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> untuk Pendidikan Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
}
