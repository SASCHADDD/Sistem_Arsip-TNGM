import { useNavigate } from "react-router-dom"
import { useState } from "react"
import Footer from "../components/Footer"
import logo from "../assets/logo-tngm.png"
import { Eye, EyeOff } from "lucide-react"
import { login } from "../api/auth"
const Login = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const data = await login(email, password);

            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Navigate based on role (Strictly Internal)
            if (data.user.role === 'staff') {
                navigate('/user/dashboard');
            } else if (['admin_balai', 'admin_wilayah', 'kepala_wilayah'].includes(data.user.role)) {
                navigate('/admin/dashboard');
            } else {
                // If somehow an external user gets through, force logout and show error
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setError("Akses ditolak. Silakan gunakan portal login yang sesuai.");
            }
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Login gagal');
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col">

            <main className="flex-1 flex items-center justify-center p-8">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 flex flex-col items-center w-full max-w-md border border-white/20 shadow-xl">
                    <img src={logo} alt="Logo" className="h-20 w-auto object-contain mb-6" />

                    <h2 className="text-3xl font-bold text-green-800 mb-2 font-graduate">LOGIN</h2>
                    <p className="text-green-700/80 font-medium mb-8 text-center">
                        Masuk ke sistem internal TNGM
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded w-full text-center text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="w-full space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-green-900 ml-1">Email / Username</label>
                            <input
                                type="text"
                                placeholder="Masukkan email atau username"
                                className="w-full px-4 py-3 rounded-xl bg-green-50/50 border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all text-green-900 placeholder:text-green-800/40"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-green-900 ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Masukkan password"
                                    className="w-full px-4 py-3 rounded-xl bg-green-50/50 border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all text-green-900 placeholder:text-green-800/40 pr-12"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-green-700 hover:text-green-900 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-center">
                            <button
                                className="btn w-1/2 rounded-full bg-[#F3D37C] border-none text-green-900 hover:bg-[#FFEFC3]"
                                disabled={loading}
                            >
                                {loading ? "Memuat..." : "Masuk"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default Login