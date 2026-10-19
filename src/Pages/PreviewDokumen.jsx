import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, FileText } from "lucide-react";
import api from "../api/axios";

const PreviewDokumen = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const fileReference = searchParams.get("url");
    const filename = searchParams.get("name") || "Dokumen";
    const [preview, setPreview] = useState({ reference: null, url: "", error: "" });

    useEffect(() => {
        if (!fileReference) return undefined;

        let objectUrl;
        let isMounted = true;
        const loadPreview = async () => {
            try {
                const [folder, encodedFilename, ...extra] = fileReference.split("/");
                if (extra.length || !["laporan", "buktihardfile", "output"].includes(folder) || !encodedFilename) {
                    throw new Error("Referensi file tidak valid.");
                }

                const { data } = await api.get(`/files/${folder}/${encodedFilename}`, { responseType: "blob" });
                objectUrl = URL.createObjectURL(data);
                if (isMounted) setPreview({ reference: fileReference, url: objectUrl, error: "" });
                else URL.revokeObjectURL(objectUrl);
            } catch (error) {
                console.error("Gagal memuat pratinjau file:", error);
                if (isMounted) {
                    setPreview({
                        reference: fileReference,
                        url: "",
                        error: error.response?.data?.message || error.message || "File tidak dapat dimuat."
                    });
                }
            }
        };
        loadPreview();

        return () => {
            isMounted = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [fileReference]);
    const isCurrentPreview = preview.reference === fileReference;
    const fileUrl = isCurrentPreview ? preview.url : "";
    const loadError = isCurrentPreview ? preview.error : "";

    if (!fileReference) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
                <p>Parameter URL tidak ditemukan.</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg">Kembali</button>
            </div>
        );
    }

    const isImage = filename.match(/\.(jpeg|jpg|gif|png|heic|heif|webp)$/i);
    const isPdf = filename.match(/\.(pdf)$/i);
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
                        download={filename}
                        aria-disabled={!fileUrl}
                        onClick={(event) => {
                            if (!fileUrl) event.preventDefault();
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${fileUrl ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                    >
                        <Download size={18} />
                        Unduh File
                    </a>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="relative flex-1 min-h-0 overflow-hidden bg-gray-100 flex items-center justify-center">
                {loadError && <p className="rounded-lg bg-white p-6 text-red-700 shadow">{loadError}</p>}
                {!fileUrl && !loadError && <p className="text-gray-500">Memuat pratinjau...</p>}
                {isImage && (
                    <div className={`w-full h-full p-8 flex items-center justify-center overflow-auto ${!fileUrl || loadError ? "hidden" : ""}`}>
                        <img 
                            src={fileUrl} 
                            alt={filename} 
                            className="max-w-full max-h-full object-contain shadow-lg bg-white"
                        />
                    </div>
                )}

                {isPdf && fileUrl && !loadError && (
                    <iframe 
                        src={fileUrl}
                        className="absolute inset-0 block h-full w-full border-0 bg-gray-100"
                        title="PDF Viewer"
                    />
                )}

                {(!isImage && !isPdf) && fileUrl && !loadError && (
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
