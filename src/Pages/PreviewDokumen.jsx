import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, FileText } from "lucide-react";

const PreviewDokumen = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const fileUrl = searchParams.get("url");
    const filename = searchParams.get("name") || "Dokumen";

    if (!fileUrl) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
                <p>Parameter URL tidak ditemukan.</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg">Kembali</button>
            </div>
        );
    }

    const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|heic|heif|webp)$/i);
    const isPdf = fileUrl.match(/\.(pdf)$/i);
    return (
        <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="font-bold text-gray-800 text-lg truncate max-w-xl">{filename}</h1>
                        <p className="text-xs text-gray-500">Pratinjau Dokumen</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <a 
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Download size={18} />
                        Unduh File
                    </a>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="relative flex-1 min-h-0 overflow-hidden bg-gray-100 flex items-center justify-center">
                {isImage && (
                    <div className="w-full h-full p-8 flex items-center justify-center overflow-auto">
                        <img 
                            src={fileUrl} 
                            alt={filename} 
                            className="max-w-full max-h-full object-contain shadow-lg bg-white"
                        />
                    </div>
                )}

                {isPdf && (
                    <iframe 
                        src={fileUrl}
                        className="absolute inset-0 block h-full w-full border-0 bg-gray-100"
                        title="PDF Viewer"
                    />
                )}

                {(!isImage && !isPdf) && (
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-white shadow-sm rounded-2xl border border-gray-200 m-8 max-w-lg w-full">
                        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Dokumen Microsoft Word</h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Browser tidak mendukung pratinjau file Word (.docx) secara langsung. 
                            Silakan unduh dokumen ini untuk melihat isinya.
                        </p>
                        <a 
                            href={fileUrl}
                            download
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors w-full justify-center"
                        >
                            <Download size={20} />
                            Unduh Dokumen Sekarang
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviewDokumen;
