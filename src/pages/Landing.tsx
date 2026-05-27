import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Rocket,
  Code,
  Palette,
  Gamepad2,
  Trophy,
  Shield,
  ArrowRight,
  Sparkles,
  Users,
  BookOpen,
  CheckCircle2,
  Star,
  ChevronRight,
  Clock,
  Target,
  Heart,
  Zap,
  Lock,
  HelpCircle,
  Quote,
  BadgeCheck,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

const faqItems = [
  {
    q: "À partir de quel âge ?",
    a: "Nos parcours sont conçus pour les 6–14 ans. Les plus jeunes commencent par des activités type bloc (Scratch), les plus grands peuvent enchaîner sur Python. L’âge est demandé à l’inscription pour adapter le contenu.",
  },
  {
    q: "Faut-il s’engager ?",
    a: "Non. Vous testez 15 jours gratuitement, sans carte bancaire. Si vous souscrivez ensuite, vous pouvez annuler à tout moment en 1 clic. Aucun engagement de durée.",
  },
  {
    q: "Combien de temps par jour ?",
    a: "C’est vous qui décidez. Nous recommandons 15–30 minutes régulières. Vous pouvez définir des limites de temps et des plages horaires dans le tableau de bord parent.",
  },
  {
    q: "Mon enfant n’a jamais codé. Par où commencer ?",
    a: "Par le parcours « Débutant » : il commence par des blocs visuels, puis des défis courts. Aucun prérequis. La progression est guidée étape par étape.",
  },
  {
    q: "Puis-je avoir plusieurs enfants sur le même compte ?",
    a: "Oui. Un compte parent peut avoir plusieurs profils enfants. Chacun a son espace (XP, pièces, objectifs). Les tarifs Famille permettent d’ajouter plus d’enfants à prix réduit.",
  },
  {
    q: "Comment annuler ?",
    a: "Depuis votre compte : Paramètres → Facturation → Annuler l’abonnement. L’accès reste actif jusqu’à la fin de la période déjà payée. Aucun formulaire à remplir.",
  },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Barre sticky CTA (apparaît au scroll) - conversion */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-cyan-500/20 backdrop-blur-lg py-3 px-4 md:hidden">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <span className="text-sm text-slate-300">Parents : 15 jours gratuits</span>
          <Link to="/signup">
            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 whitespace-nowrap">
              Commencer
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Numerikids
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login-student">
              <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                Espace Élève
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300">
                Connexion parent
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                Créer un compte parent
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">
              La plateforme n°1 pour apprendre le code dès 6 ans
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            Donnez à votre enfant un vrai superpouvoir&nbsp;: le code
          </h1>

          <p className="text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
            Numerikids transforme la programmation en aventure. Quêtes, défis et récompenses
            pour que votre enfant apprenne Scratch, Python et la logique du code — sans qu’il
            s’ennuie une seconde.
          </p>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">
            Suivi parental intégré, contenu sécurisé, progression adaptée. Essai gratuit, sans carte bancaire.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg px-8 py-6 shadow-lg shadow-cyan-500/20 w-full sm:w-auto"
              >
                Démarrer l’essai gratuit <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 text-lg px-8 py-6 w-full sm:w-auto"
              >
                J’ai déjà un compte
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-slate-400 text-sm mb-6">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 15 jours gratuits
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sans engagement
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Annulation en 1 clic
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-slate-500 text-xs">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Paiement sécurisé
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Données protégées
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5" /> Sans publicité
            </span>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-6 text-center">
            {[
              { value: '50+', label: 'Heures de contenu' },
              { value: '6–14 ans', label: 'Tranche d’âge' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-700/50 rounded-xl py-4 px-4">
                <p className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-1">
                  {stat.value}
                  {stat.icon && <stat.icon className="w-6 h-6 text-amber-400 fill-amber-400" />}
                </p>
                <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour qui ? - identification */}
      <section className="container mx-auto px-4 py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Numerikids, c’est pour vous si…
          </h2>
          <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
            Vous voulez que votre enfant apprenne en s’amusant, sans écran passif ni cours rébarbatifs.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              {
                title: 'Vous êtes parent d’un 6–14 ans',
                desc: 'Vous cherchez une activité constructive sur écran, avec un vrai suivi et des limites que vous contrôlez.',
              },
              {
                title: 'Vous voulez préparer l’avenir',
                desc: 'La logique et la créativité du code servent partout : maths, raisonnement, projets personnels.',
              },
              {
                title: 'Vous en avez marre du « tout YouTube »',
                desc: 'Ici il crée, il réfléchit et il progresse. Pas de scroll infini ni de contenu inadapté.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold mb-4">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/signup">
              <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                Oui, c’est pour moi — Essai gratuit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pourquoi le code ? */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pourquoi apprendre à coder dès maintenant ?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">
            Les métiers de demain demandent de la logique, de la créativité et une aisance avec le
            numérique. Numerikids pose les bases sans écran passif : votre enfant crée,
            réfléchit et progresse à son rythme.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: Target,
                title: 'Logique & raisonnement',
                desc: 'Comprendre les algorithmes et la résolution de problèmes, utiles partout à l’école et dans la vie.',
              },
              {
                icon: Palette,
                title: 'Créativité & projets',
                desc: 'Créer des jeux, des histoires interactives et de l’art numérique plutôt que de seulement consommer.',
              },
              {
                icon: Zap,
                title: 'Confiance & autonomie',
                desc: 'Chaque défi relevé renforce l’estime de soi et l’envie d’apprendre par l’action.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all"
              >
                <item.icon className="w-10 h-10 text-cyan-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="container mx-auto px-4 py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            En quelques minutes, votre enfant peut commencer sa première quête. Vous gardez la main
            sur le temps d’écran et les progrès.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Créez votre compte', desc: 'Inscription en 2 minutes. Ajoutez le prénom et l’âge de votre enfant pour un parcours adapté.' },
              { step: '2', title: 'Choisissez le profil enfant', desc: 'Chaque enfant a son espace : XP, pièces, objectifs et quêtes personnalisées.' },
              { step: '3', title: 'Il apprend en jouant', desc: 'Scratch, Python, Pixel Kingdom… Des missions courtes et motivantes, comme un jeu.' },
              { step: '4', title: 'Vous suivez les progrès', desc: 'Tableau de bord parent : temps passé, leçons terminées, objectifs et rapports.' },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all"
              >
                <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold text-sm">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-white mb-2 mt-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                Commencer maintenant <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ce qu’on évite vs ce qu’on offre - contraste conversion */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Écran passif ou écran actif : vous choisissez
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
                <h3 className="text-lg font-bold text-white">Sans Numerikids</h3>
              </div>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>• Vidéos à regarder sans vraiment pratiquer</li>
                <li>• Pas de suivi ni de limites claires</li>
                <li>• Enfant qui consomme au lieu de créer</li>
                <li>• Difficile de savoir s’il progresse</li>
              </ul>
            </div>
            <div className="bg-slate-900/50 border border-cyan-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Avec Numerikids</h3>
              </div>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>• Il code vraiment : blocs puis Python</li>
                <li>• Limites de temps et plages horaires</li>
                <li>• Quêtes, défis, récompenses, création</li>
                <li>• Tableau de bord parent en temps réel</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités détaillées */}
      <section className="container mx-auto px-4 py-20 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Tout ce dont vous avez besoin, dans une seule plateforme
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Conçu pour les familles : contenu adapté aux enfants, outils de suivi pour les parents.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Code, title: 'Parcours progressif', desc: 'Du bloc (Scratch) au texte (Python), avec des défis qui s’adaptent au niveau. Pas de cours ennuyeux : on apprend en faisant.' },
              { icon: Gamepad2, title: 'Gamification complète', desc: 'XP, pièces, badges et quêtes dans le Pixel Kingdom. Votre enfant débloque des récompenses et voit sa progression en temps réel.' },
              { icon: Shield, title: 'Contrôle parental', desc: 'Limites de temps, plages horaires, rapports d’activité et alertes. Vous décidez de l’usage sans surveiller l’écran en permanence.' },
              { icon: Palette, title: 'Créativité & art numérique', desc: 'Projets créatifs, dessin et jeux personnalisés. Le code devient un outil pour s’exprimer, pas seulement une matière.' },
              { icon: Trophy, title: 'Défis & objectifs', desc: 'Objectifs fixés par vous (leçons, temps, niveaux). Récompenses en pièces à échanger dans la boutique pour motiver sans écran bonus.' },
              { icon: Users, title: 'Multi-enfants', desc: 'Un seul compte parent, plusieurs profils enfants. Chacun a son tableau de bord, ses stats et son espace sécurisé.' },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all flex flex-col"
              >
                <feature.icon className="w-12 h-12 text-cyan-400 mb-4 flex-shrink-0" />
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm flex-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offre / Prix teaser - bloc conversion principal */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-cyan-500/15 via-purple-500/15 to-slate-900 border border-cyan-500/30 rounded-3xl p-10 md:p-14 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-6">
              <Clock className="w-4 h-4" /> Offre limitée
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              15 jours d’essai gratuit
            </h2>
            <p className="text-slate-300 text-lg mb-6">
              Accès complet à tous les parcours, le Pixel Kingdom et le tableau de bord parent.
              Aucune carte bancaire demandée pour commencer.
            </p>
            <ul className="text-slate-400 text-left max-w-sm mx-auto mb-8 space-y-3">
              {[
                'Tous les parcours (Scratch, Python, quêtes)',
                'Pixel Kingdom et défis gamifiés',
                'Tableau de bord parent et rapports',
                'Multi-profils enfants inclus',
                'Sans engagement, annulable à tout moment',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg px-10 py-6 shadow-lg shadow-cyan-500/20 w-full sm:w-auto"
              >
                Démarrer gratuitement <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-slate-500 text-sm mt-4">
              Plans : Gratuit 9,99 €/mois — Premium 14,99 €/mois — Famille 20 €/mois. Annulation en 1 clic.
            </p>
          </div>
        </div>
      </section>

      {/* Section témoignages supprimée */}
      <section className="container mx-auto px-4 py-20 hidden">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Ce que les parents en disent
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            Rejoignez nous pour l’apprentissage du code.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-2xl p-8">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-cyan-500/30 mb-2" />
              <p className="text-slate-200 text-base italic mb-6">
                « Mon fils de 9 ans réclame sa “quête du soir”. En quelques semaines il a compris les
                boucles et les conditions sans que ça ressemble à des devoirs. En tant que parent je
                vois exactement où il en est. Exactement ce qu’on cherchait. »
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Marie L.</p>
                  <p className="text-slate-500 text-sm">Parent, 2 enfants sur Numerikids</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-2xl p-8">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-cyan-500/30 mb-2" />
              <p className="text-slate-200 text-base italic mb-6">
                « Ma fille a commencé à 7 ans. Au début elle touchait à peine au clavier. Aujourd’hui
                elle me montre ses petits jeux en Scratch. Les limites de temps m’ont changé la vie :
                plus de négociation sans fin. »
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Thomas M.</p>
                  <p className="text-slate-500 text-sm">Parent d’une fille de 8 ans</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Garantie - levée d’objection conversion */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-8 md:p-10">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Satisfait ou remboursé sous 30 jours
            </h2>
            <p className="text-slate-400 mb-6">
              Si Numerikids ne convient pas à votre enfant, écrivez-nous dans les 30 jours suivant
              votre souscription et nous vous remboursons intégralement. Sans condition, sans justification.
            </p>
            <Link to="/signup">
              <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                Essayer sans risque
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ - réduction des frictions */}
      <section className="container mx-auto px-4 py-20 border-t border-slate-800/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4 flex items-center justify-center gap-2">
            <HelpCircle className="w-8 h-8 text-cyan-400" />
            Questions fréquentes
          </h2>
          <p className="text-slate-400 text-center mb-12">
            Les réponses aux questions que les parents nous posent le plus.
          </p>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="bg-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-4 px-5 text-left"
                >
                  <span className="font-medium text-white">{item.q}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-cyan-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 pt-0">
                    <p className="text-slate-400 text-sm">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                Commencer mon essai gratuit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-3xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à donner le goût du code à votre enfant ?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez nous. Essai gratuit 15 jours, sans carte bancaire.
            Annulation en 1 clic.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg px-8 py-6"
              >
                Créer un compte gratuit
              </Button>
            </Link>
            <Link to="/login-student">
              <Button size="lg" variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                Accès élève
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-slate-900/50 py-10 pb-20 md:pb-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Rocket className="w-6 h-6 text-cyan-400" />
              <span className="font-bold text-white">Numerikids</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-slate-400 text-sm">
              <Link to="/signup" className="hover:text-cyan-400 transition-colors">
                Inscription
              </Link>
              <Link to="/login" className="hover:text-cyan-400 transition-colors">
                Connexion
              </Link>
              <Link to="/login-student" className="hover:text-cyan-400 transition-colors">
                Espace élève
              </Link>
            </div>
          </div>
          <p className="text-center text-slate-500 text-sm mt-6">
            &copy; {new Date().getFullYear()} Numerikids. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
