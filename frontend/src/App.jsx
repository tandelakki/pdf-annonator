import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import API, { setAuthToken } from './services/api'
import Dashboard from './components/Dashboard'
import PdfViewer from './components/PdfViewer'
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default function App(){
  const [user, setUser] = useState(null)
  const [files, setFiles] = useState([])
  const navigate = useNavigate()

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(token) {
      setUser({ token })
      loadFiles()
    }
  }, [])

  async function loadFiles(){
    try{
      const res = await API.get('/pdfs')
      setFiles(res.data)
    }catch(err){
      console.error(err)
    }
  }

  function onLogout(){
    localStorage.removeItem('token')
    setAuthToken(null)
    setUser(null)
    setFiles([])
    navigate('/login')
  }

  return (
    
     <div className="app">
       <header className="topbar">
         <h1>PDF Annotator</h1>
         <nav>
           <Link to="/dashboard">My Library</Link>
           {user ? (
             <button onClick={onLogout}>Logout</button>
           ) : (
             <>
               <Link to="/login">Login</Link>
               <Link to="/register" style={{ marginLeft: '10px' }}>Register</Link>
             </>
           )}
         </nav>
       </header>
      

       <main>
         <Routes>
           <Route path="/" element={<Dashboard files={files} onFilesUpdated={loadFiles} />} />
           <Route path="/dashboard" element={<Dashboard files={files} onFilesUpdated={loadFiles} />} />
           <Route path="/view/:fileUuid" element={<PdfViewer />} />
        </Routes>
      </main>
    </div>
  )
}
