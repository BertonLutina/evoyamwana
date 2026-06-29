import { API_URL, apiClient } from './api';

export type UploadedFileDto = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  purpose?: string | null;
  downloadUrl: string;
  createdAt: string;
};

const absoluteUrl = (url: string) => (url.startsWith('http') ? url : `${API_URL}${url}`);

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem('evoyamwana.token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const filesService = {
  async upload(file: File, purpose?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (purpose) formData.append('purpose', purpose);

    const response = await apiClient<{ success: true; data: { file: UploadedFileDto } }>('/files/upload', {
      method: 'POST',
      body: formData
    });
    return response.data.file;
  },

  async download(file: Pick<UploadedFileDto, 'downloadUrl' | 'originalName'>) {
    const response = await fetch(absoluteUrl(file.downloadUrl), {
      headers: authHeaders()
    });
    if (!response.ok) {
      throw new Error('Impossible de télécharger ce fichier.');
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }
};
