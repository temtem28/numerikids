import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Rocket } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-white py-16 border-t-2 border-cyan-500/30 relative overflow-hidden">
      {/* Starfield */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Rocket className="w-8 h-8 text-cyan-400" />
                <div className="absolute inset-0 blur-lg bg-cyan-400/30"></div>
              </div>
              <span className="text-2xl font-black neon-text" style={{fontFamily: 'Orbitron, sans-serif'}}>NumériKids</span>
            </div>
            <p className="text-cyan-200 leading-relaxed">
              La plateforme qui transforme l'apprentissage en aventure épique pour les 7-16 ans.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-6 h-6 text-cyan-400 hover:text-cyan-300 cursor-pointer transition-all hover:scale-110 neon-glow" />
              <Twitter className="w-6 h-6 text-cyan-400 hover:text-cyan-300 cursor-pointer transition-all hover:scale-110 neon-glow" />
              <Instagram className="w-6 h-6 text-cyan-400 hover:text-cyan-300 cursor-pointer transition-all hover:scale-110 neon-glow" />
              <Youtube className="w-6 h-6 text-cyan-400 hover:text-cyan-300 cursor-pointer transition-all hover:scale-110 neon-glow" />
            </div>
          </div>

          <div>
            <h3 className="font-black text-lg mb-4 text-cyan-400" style={{fontFamily: 'Orbitron, sans-serif'}}>SAGAS</h3>
            <ul className="space-y-2 text-cyan-200">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Le Royaume des Pixels</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Temple du Serpent</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Gardiens de l'IA</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Architectes du Futur</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Chevaliers du Pare-Feu</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Artistes de la Lumière</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-lg mb-4 text-cyan-400" style={{fontFamily: 'Orbitron, sans-serif'}}>SUPPORT</h3>
            <ul className="space-y-2 text-cyan-200">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Guide parents</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-lg mb-4 text-cyan-400" style={{fontFamily: 'Orbitron, sans-serif'}}>CONTACT</h3>
            <div className="space-y-3 text-cyan-200">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <span>contact@numerikids.fr</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-cyan-400" />
                <span>01 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-cyan-500/30 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-cyan-300 text-sm">
              © 2025 NumériKids. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-sm text-cyan-200">
              <a href="#" className="hover:text-cyan-400 transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">CGU</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
