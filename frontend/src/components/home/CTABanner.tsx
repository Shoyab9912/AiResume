
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import { fadeUpSection } from "../../utils/animations";

const CTABanner = () => {
  return (
    <section className="py-24 px-6">
      <motion.div
        variants={fadeUpSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-3xl mx-auto glass-card p-12 text-center relative overflow-hidden"
      >
        <div
          className="orb w-64 h-64 bg-indigo-500 -top-10 -left-10"
          style={{ opacity: 0.15 }}
        />

        <div
          className="orb w-48 h-48 bg-emerald-500 -bottom-10 -right-10"
          style={{ opacity: 0.15 }}
        />

        <h2
          className="text-3xl md:text-4xl font-extrabold mb-4 relative z-10"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Your next job is
          <br />
          <span className="text-gradient">waiting for you.</span>
        </h2>

        <p className="text-white/60 mb-8 relative z-10">
          Join thousands of job seekers using Nova Forge to get hired faster.
        </p>

        <Link
          to="/analyze"
          className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold relative z-10"
        >
          Analyse My Resume Free <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  );
};

export default CTABanner;
