import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { loginEksternal } from '../../api/eksternal';
import Swal from 'sweetalert2';
import Footer from '../../components/Footer';
import logo from '../../assets/logo-tngm.png';

const LoginEksternal = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const result = await loginEksternal(formData.email, formData.password);

            if (result.user.role !== 'eksternal') {
                setError('Akun ini bukan akun Eksternal. Gunakan halaman login yang sesuai.');
                return;
            }

            localStorage.setItem('eksternal_token', result.token);
            localStorage.setItem('eksternal_user', JSON.stringify(result.user));

            Swal.fire({
                icon: 'success',
                title: 'Login Berhasil!',
                text: `Selamat datang, ${result.user.nama}`,
                timer: 1500,
                showConfirmButton: false,
                confirmButtonColor: '#1B5E20'
            });

            navigate('/eksternal/dashboard');
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Email atau password salah');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">

            <main className="flex-1 flex items-center justify-center p-8">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 flex flex-col items-center w-full max-w-md border border-white/20 shadow-xl">
                    <img src={logo} alt="Logo" className="h-20 w-auto object-contain mb-6" />

                    <h2 className="text-2xl font-bold text-green-800 mb-2 font-graduate uppercase">LOGIN EKSTERNAL</h2>
                    <p className="text-green-700/80 font-medium mb-8 text-center text-sm">
                        Gunakan akun yang terdaftar di sistem kami
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl w-full text-center text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-green-900 ml-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="email@instansi.com"
                                className="w-full px-4 py-3 rounded-xl bg-green-50/50 border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all text-green-900 placeholder:text-green-800/40"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-green-900 ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Masukkan password"
                                    className="w-full px-4 py-3 rounded-xl bg-green-50/50 border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all text-green-900 placeholder:text-green-800/40 pr-12"
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
                                type="submit"
                                disabled={isLoading}
                                className="btn w-full rounded-full bg-[#F3D37C] border-none text-green-900 hover:bg-[#FFEFC3] font-bold py-3 transition-colors shadow-sm disabled:opacity-70"
                            >
                                {isLoading ? "Memuat..." : "Masuk"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-4 border-t border-gray-100 w-full text-center">
                        <p className="text-xs text-gray-400">
                            Bukan pengguna eksternal?{' '}
                            <Link to="/Login" className="text-green-700 font-bold hover:underline">
                                Login Staf Internal
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LoginEksternal;
