import CTABanner from "../components/home/CTABanner";
import Features from "../components/home/Fetures";
import Hero from "../components/home/Hero";
import Pricing from "../components/home/Pricing";
import { ErrorBoundary } from "../components/Errorboundary";
import { DefaultFallback } from "../components/DefaultFallback";

const Home = () => {
  return (
    <>
      <Hero />
      <Features />
      <ErrorBoundary fallback={DefaultFallback}>
      <Pricing />
      </ErrorBoundary>
      <CTABanner />
    </>
  );
};

export default Home;
