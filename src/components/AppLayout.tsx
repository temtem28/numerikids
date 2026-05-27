import Navigation from './Navigation';
import Hero from './Hero';
import CoursesGrid from './CoursesGrid';
import Pricing from './Pricing';
import Footer from './Footer';
import { OfflineIndicator } from './OfflineIndicator';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Navigation />
      <Hero />
      <CoursesGrid />
      <Pricing />
      <Footer />
      <OfflineIndicator />
    </div>
  );
}
