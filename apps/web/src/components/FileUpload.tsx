import { Download, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { filesService, type UploadedFileDto } from '../services/files.service';

type FileUploadProps = {
  accept?: string;
  purpose?: string;
  label?: string;
  value?: string;
  onUploaded: (file: UploadedFileDto) => void;
};

export const FileUpload = ({ accept, purpose, label = 'Importer un fichier', value, onUploaded }: FileUploadProps) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFileDto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError('');
    setIsUploading(true);
    try {
      const uploaded = await filesService.upload(file, purpose);
      setUploadedFile(uploaded);
      onUploaded(uploaded);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload impossible.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-2 text-sm font-semibold text-ink">
      <span className="text-[0.82rem]">{label}</span>
      <label className="flex min-h-[54px] cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-ocean/25 bg-sky/55 px-4 text-sm font-bold text-ocean transition hover:bg-white">
        <span className="flex min-w-0 items-center gap-2">
          <UploadCloud size={18} className="shrink-0" />
          <span className="truncate">{isUploading ? 'Upload en cours...' : uploadedFile?.originalName || 'Choisir un fichier'}</span>
        </span>
        <input className="sr-only" type="file" accept={accept} disabled={isUploading} onChange={(event) => handleFile(event.target.files?.[0])} />
      </label>
      {uploadedFile ? (
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-ocean/15 bg-white px-3 text-xs font-bold text-ocean transition hover:bg-sky"
          onClick={() => filesService.download(uploadedFile)}
        >
          <Download size={15} />
          Télécharger
        </button>
      ) : value ? (
        <span className="text-xs font-semibold text-ink/50">Fichier actuel conservé.</span>
      ) : null}
      {error ? <p className="text-xs font-bold text-clay">{error}</p> : null}
    </div>
  );
};
