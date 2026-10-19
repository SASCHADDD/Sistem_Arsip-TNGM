import api from './axios';

export const getProtectedFileReference = (folder, filename) =>
    `${folder}/${encodeURIComponent(filename)}`;

export const downloadProtectedFile = async (folder, filename) => {
    const response = await api.get(`/files/${folder}/${encodeURIComponent(filename)}`, {
        responseType: 'blob',
    });
    const objectUrl = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};
