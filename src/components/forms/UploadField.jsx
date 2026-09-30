import { useState } from 'react'
import FileDropzone from './FileDropzone'
import { uploadFile } from '../../lib/upload'
import { useToast } from '../../context/ToastContext'

/**
 * Uploads immediately on select (so the path can be saved in the form draft and survive a refresh).
 * value = storage path, name = display name; both are stored in the parent form.
 */
export default function UploadField({ folder, value, name, onChange, error }) {
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const select = async (f) => {
    setFile(f); setProgress(1)
    try {
      const path = await uploadFile(f, setProgress, folder)
      onChange(path, f.name)
    } catch (e) {
      toast(e.message, 'error'); setFile(null); setProgress(0)
    }
  }
  const clear = () => { setFile(null); setProgress(0); onChange('', '') }

  const shown = value ? (file ?? { name: name || 'Uploaded file' }) : file
  return <FileDropzone file={shown} progress={progress} done={!!value} onSelect={select} onClear={clear} error={error} />
}
