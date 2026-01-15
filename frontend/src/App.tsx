import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { VendorList } from './pages/VendorList';
import { CreateRFP } from './pages/CreateRFP';
import { RFPDetail } from './pages/RFPDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/create-rfp" element={<CreateRFP />} />
          <Route path="/rfps/:id" element={<RFPDetail />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
