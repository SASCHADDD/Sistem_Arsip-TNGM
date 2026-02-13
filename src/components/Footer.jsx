import { Facebook, Twitter, Instagram } from "lucide-react"

const Footer = () => {
    return (
        <footer
            className="w-full text-green-900 py-12 mt-auto"
            style={{
                background: 'linear-gradient(178deg, rgba(212, 187, 118, 1) 0%, rgba(242, 220, 172, 1) 100%)'
            }}
        >
            <div className="container mx-auto px-4 flex flex-col items-center text-center space-y-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-serif mb-4">Balai Taman Nasional Gunung Merapi</h2>
                    <p className="max-w-2xl mx-auto text-green-800 font-medium leading-relaxed">
                        Jalan Kaliurang No.km.22,6, Banteng, Hargobinangun, Kec. Pakem, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55582
                    </p>
                </div>

                <div className="flex justify-center space-x-6 pt-4">
                    <a href="#" className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors duration-300">
                        <Facebook size={24} color="white" />
                    </a>
                    <a href="#" className="bg-sky-500 p-2 rounded-full hover:bg-sky-600 transition-colors duration-300">
                        <Twitter size={24} color="white" />
                    </a>
                    <a href="#" className="bg-pink-600 p-2 rounded-full hover:bg-pink-700 transition-colors duration-300">
                        <Instagram size={24} color="white" />
                    </a>
                </div>
            </div>
        </footer>
    )
}

export default Footer
