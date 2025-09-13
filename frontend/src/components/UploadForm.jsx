import React, { useState } from 'react'
import API from '../services/api'

export default function UploadForm({ onUploaded }){
  const [file, setFile] = useState(null)

  async function submit(e){
    e.preventDefault()
    if(!file) return alert('Select a PDF')
    const fd = new FormData()
    fd.append('file', file)
    try{
      const res = await API.post('/pdfs/upload', fd, { headers: {'Content-Type': 'multipart/form-data'} })
      alert('Uploaded')
      onUploaded && onUploaded(res.data.file_uuid)
    }catch(err){
      console.error(err)
      alert('Upload failed')
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>Upload PDF</h3>
      <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files[0])} />
      <button type="submit">Upload</button>
    </form>
  )
}
