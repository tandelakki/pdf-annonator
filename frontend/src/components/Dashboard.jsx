import React, { useEffect, useState } from 'react'
import API from '../services/api'
import { Link } from 'react-router-dom'
import UploadForm from './UploadForm'

export default function Dashboard({ files: initialFiles, onFilesUpdated }){
  const [files, setFiles] = useState(initialFiles || [])
  const [editing, setEditing] = useState(null)
  const [newName, setNewName] = useState('')

  useEffect(()=>{
    setFiles(initialFiles || [])
  }, [initialFiles])

  async function refresh(){
    try{
      const res = await API.get('/pdfs')
      setFiles(res.data)
    }catch(err){
      console.error(err)
    }
  }

  async function remove(uuid){
    if(!confirm('Delete this file?')) return
    try{
      await API.delete(`/pdfs/${uuid}`)
      refresh()
    }catch(err){
      console.error(err)
      alert('Delete failed')
    }
  }

  async function rename(uuid){
    try{
      await API.put(`/pdfs/${uuid}/rename`, { newName })
      setEditing(null)
      setNewName('')
      refresh()
    }catch(err){
      console.error(err)
      alert('Rename failed')
    }
  }

  return (
    <div className="container">
      <section className="left">
        <Link to="/dashboard"><h2>My Library</h2></Link>
        <UploadForm onUploaded={()=>onFilesUpdated && onFilesUpdated()} />
      </section>
      <section className="right">
        <h3>Files</h3>
        <ul>
          {files.length === 0 && <li>No files</li>}
          {files.map(f=>(
            <li key={f.uuid}>
              <Link to={`/view/${f.uuid}`}>{f.original_name}</Link>
              <div className="meta">Uploaded: {new Date(f.uploaded_at).toLocaleString()}</div>
              <button onClick={()=>{ setEditing(f.uuid); setNewName(f.original_name) }}>Rename</button>
              <button onClick={()=>remove(f.uuid)}>Delete</button>
            </li>
          ))}
        </ul>
        {editing && (
          <div className="card">
            <h4>Rename</h4>
            <input value={newName} onChange={e=>setNewName(e.target.value)} />
            <button onClick={()=>rename(editing)}>Save</button>
            <button onClick={()=>setEditing(null)}>Cancel</button>
          </div>
        )}
      </section>
    </div>
  )
}
