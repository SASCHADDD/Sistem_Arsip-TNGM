import Navbar from "../components/Navbar"
import { MenuCard } from "../components/MenuCard"
import Footer from "../components/Footer"

const Landing = () => {
  const cards = [
    {
      title: "Internal",
      description: "Akses khusus untuk pegawai dan staf internal TNGM.",
      path: "/Login",
      color: "from-green-700 to-green-900",
      details: "Sistem manajemen operasional internal terpadu. Memungkinkan pemantauan data secara real-time, pengelolaan arsip digital yang aman, dan koordinasi antar wilayah kerja Balai TNGM."
    },
    {
      title: "Eksternal",
      description: "Portal layanan untuk pihak eksternal dan umum.",
      path: "/eksternal/login",
      color: "from-teal-600 to-teal-800",
      details: "Portal khusus bagi peneliti, instansi, dan masyarakat umum untuk pelaporan kegiatan. Transparansi proses verifikasi dan kemudahan akses e-sertifikat dalam satu platform digital."
    },
    {
      title: "Mitra",
      description: "Sistem kolaborasi dan portal khusus mitra kerja TNGM.",
      path: "/mitra/login",
      color: "from-indigo-600 to-indigo-800",
      details: "Platform kolaborasi strategis bagi mitra kerja PKS. Memfasilitasi pelaporan berkala sebagai bentuk akuntabilitas publik dalam upaya pengelolaan kawasan Merapi yang berkelanjutan."
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] relative overflow-hidden">
      {/* Subtle decorative background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
        <div className="absolute top-[-5%] right-[-5%] w-100 h-100 bg-green-200/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] left-[-5%] w-125 h-125 bg-amber-100/20 rounded-full blur-[100px]"></div>
      </div>

      <Navbar />

      {/* Hero Section - Cleaner & More Focused */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6 py-24">
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 font-graduate leading-tight tracking-tight">
          Sistem Informasi <br/>
          <span className="text-green-800">Arsip Digital TNGM</span>
        </h1>
        <p className="text-lg md:text-xl font-medium text-slate-500 leading-relaxed max-w-3xl mx-auto">
          Mewujudkan transformasi tata kelola data di kawasan Taman Nasional Gunung Merapi yang terintegrasi, aman, dan akuntabel.
        </p>
      </div>

      <main className="relative z-10 flex-1 px-6 pb-40">
        <div className="max-w-6xl mx-auto space-y-40">
          {cards.map((card, index) => (
            <section 
              key={index} 
              id={card.title.toLowerCase()}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 md:gap-32 scroll-mt-40`}
            >
              {/* Card Side */}
              <div className="w-full md:w-5/12">
                <div className="relative group">
                    {/* Shadow/Glow decoration */}
                    <div className={`absolute -inset-6 bg-gradient-to-br ${card.color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 blur-3xl rounded-[3rem]`}></div>
                    
                    <div className="relative bg-white border border-slate-100 p-3 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transform group-hover:-translate-y-2 transition-transform duration-700 ease-out">
                        <MenuCard
                            title={card.title}
                            description={card.description}
                            path={card.path}
                        />
                    </div>
                </div>
              </div>

              {/* Text Side - More Balanced & Corporate */}
              <div className="w-full md:w-7/12 flex flex-col items-center md:items-start text-center md:text-left">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 font-graduate">
                  {card.title === "Internal" ? "Akses Internal Balai" : card.title === "Eksternal" ? "Layanan Publik Digital" : "Kemitraan Strategis"}
                </h2>
                
                <p className="text-lg text-slate-500 font-medium leading-[1.8] mb-10">
                  {card.details}
                </p>
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Landing
