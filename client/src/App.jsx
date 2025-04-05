import { useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './dashboard/layout/MainLayout';
import Login from './dashboard/pages/Login';
import ProtectDashboard from './middleware/ProtectDashboard';
import ProtectRole from './middleware/ProtectRole';
import AdminIndex from './dashboard/pages/AdminIndex';
import Unable from './dashboard/pages/Unable';
import Writers from './dashboard/pages/Writers';
import AddWriter from './dashboard/pages/AddWriter';
import News from './dashboard/pages/News';
import Profile from './dashboard/pages/Profile';
import WriterIndex from './dashboard/pages/WriterIndex';
import CreateNews from './dashboard/pages/CreateNews';
import Edit_news from './dashboard/pages/Edit_news';
import storeContext from './context/storeContext';

function App() {
  

   const { store } = useContext(storeContext)

   console.log(store, "store")
  // const userInfo = {
  //   role:"writer"
  // }

  


  return (
    <BrowserRouter>
      <Routes>
      {/* <Route path='admin' element={<AdminIndex/>} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectDashboard/>}>
          <Route path='' element={<MainLayout />}>

          <Route path="" element={store?.userInfo?.role === 'admin' ? <Navigate to="/dashboard/admin" /> : <Navigate to="/dashboard/writer" />}/>
            {/* <Route path='' element={store.userInfo.role === 'admin' ? <Navigate to ='/dashboard/admin'/> : <Navigate to ='/dashboard/writer'/>}/> */}
            <Route path='unable-access' element={<Unable/>} />
            <Route path='news' element={<News/>} />
            <Route path='profile' element={<Profile/>} />

            <Route path='' element={<ProtectRole role='admin'/>}>
              <Route path='admin' element={<AdminIndex/>} />
              <Route path='writer/add' element={<AddWriter/>} />
              <Route path='writers' element={<Writers/>} />
            </Route>

            <Route path='' element={<ProtectRole role='writer'/>}>
              <Route path='writer' element={<WriterIndex/>} />
              <Route path='news/create' element={<CreateNews/>} />
              <Route path='news/edit/:news_id' element={<Edit_news/>} />
            </Route>


          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
