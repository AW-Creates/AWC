import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import Marquee from './components/Marquee';
import Services from './components/Services';
import Process from './components/Process';
import CaseStudies from './components/CaseStudies';
import StopBurningCash from './components/StopBurningCash';
import AICritique from './components/AICritique';
import FounderVideo from './components/FounderVideo';
import LeadCapture from './components/LeadCapture';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen selection:bg-brand-primary selection:text-black bg-brand-dark overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Marquee />
        <Services />
        <Process />
        <CaseStudies />
        <StopBurningCash />
        <AICritique />
        <FounderVideo />
        <LeadCapture />
      </main>
      <Footer />
    </div>
  );
}
