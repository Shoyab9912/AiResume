function Footer() {
  return (
    <footer className="border-t border-white/6 px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-white/25 text-xs">
      <span
        style={{ fontFamily: "'Syne', sans-serif" }}
        className="font-bold text-white/40 text-sm"
      >
        CareerAI
      </span>
      <span>©️ {new Date().getFullYear()} CareerAI. All rights reserved.</span>
      <div className="flex gap-5">
        {["Privacy", "Terms", "Contact"].map((i) => (
          <a key={i} href="#" className="hover:text-white/60 transition-colors">
            {i}
          </a>
        ))}
      </div>
    </footer>
  );
}

export default Footer;