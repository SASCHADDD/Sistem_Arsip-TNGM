// tidak perlu lagi karna bukan untuk reload 
// import { useNavigate } from "react-router-dom"


//                                         karna tidak perlu ada render ke ui di halaaman landing
// import { useState } from "react"



//                                          karna interactive buttonnya sudah di panggil dalam card maka tidak perlu di landing page lagi
// import { InteractiveHoverButton } from "../components/InteractiveHoverButton"
import Navbar from "../components/Navbar"
import { MenuCard } from "../components/MenuCard"
import Footer from "../components/Footer"

const Landing = () => {
  const cards = [
    {
      title: "Internal",
      description: "Akses khusus untuk pegawai dan staf internal TNGM.",
      path: "/Login",
    },
    {
      title: "Eksternal",
      description: "Portal layanan untuk pihak eksternal dan umum.",
      path: "/eksternal/Eksternal",
    },
    {
      title: "Mitra",
      description: "Sistem kolaborasi dan portal khusus mitra kerja TNGM.",
      path: "/mitra/Mitra",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="text-center max-w-5xl mx-auto px-6 text-slate-600 my-12">
        <p className="text-lg md:text-xl font-normal leading-relaxed">
          Sistem ini dirancang untuk mendukung pengelolaan dokumen dan data secara terstruktur, aman, dan terintegrasi di lingkungan TNGM.
          Melalui sistem ini, proses penyimpanan, pencarian, dan distribusi dokumen dapat dilakukan secara lebih cepat, akurat, dan efisien, sehingga meminimalkan risiko kehilangan data serta meningkatkan transparansi dan akuntabilitas pengelolaan informasi.
        </p>
      </div>

      <main className="flex-1 flex items-center justify-center px-12 pb-20">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-7xl">
          {cards.map((card, index) => (
            <div key={index} className="contents">
              <div className="w-full md:w-1/3 min-w-75">
                <MenuCard
                  title={card.title}
                  description={card.description}
                  path={card.path}
                />
              </div>

              {/* Divider (dekstop)*/}
              {index < cards.length - 1 && (
                <div className="hidden md:block w-px h-100 bg-slate-200 self-center rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Landing
