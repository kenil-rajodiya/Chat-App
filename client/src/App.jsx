
// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import HomePage        from "./pages/HomePage";
import LoginPage       from "./pages/LoginPage";
import ProfilePage     from "./pages/ProfilePage";
import GroupHomePage   from "./pages/GroupHomePage";
import GroupMembers    from "./components/GroupMembers";
import GroupAdminPanel from "./components/GroupAdminPanel";
import ProtectedRoute  from "./lib/ProtectedRoute";
import CreateGroup from "./components/CreateGroup";

export default function App() {
  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain">
      <Toaster />
      <Routes>
        {/* Protected */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route index           element={<HomePage />} />
          <Route path="profile"  element={<ProfilePage />} />
          <Route path="group"    element={<GroupHomePage />} />
          <Route path="members"  element={<GroupMembers />} />
          <Route path="admin" element={<GroupAdminPanel />} />
          <Route path="createGroup" element={<CreateGroup/>} />
        </Route>

        {/* Public */}
        <Route path="login" element={<LoginPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}






























// import { Navigate, Route, Routes } from 'react-router-dom'
// import HomePage from './pages/HomePage'
// import LoginPage from './pages/LoginPage'
// import ProfilePage from './pages/ProfilePage'
// import {Toaster} from 'react-hot-toast'
// import { useContext } from 'react'
// import { AuthContext } from '../context/AuthContext.jsx'
// import GroupHomePage from './pages/GroupHomePage.jsx'
// import GroupMembers from './components/GroupMembers.jsx'
// import GroupAdminPanel from './components/GroupAdminPanel.jsx'

// const App = () => {
//   const { authUser } = useContext(AuthContext);
//   return (
//     <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain">
//       <Toaster />
//       <Routes>
//         <Route
//           index
//           element={authUser ? <HomePage /> : <Navigate to="/login" />}
//         />
//         <Route
//           path="/login"
//           element={authUser ? <Navigate to="/" /> : <LoginPage />}
//         />
//         <Route
//           path="/profile"
//           element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
//         />

//         {/* Group Routes */}
//         <Route
//           path="/group"
//           element={authUser ? <GroupHomePage /> : <Navigate to="/login" />}
//         />
//         <Route
//           path="/members"
//           element={authUser ? <GroupMembers /> : <Navigate to="/login" />}
//         />
//         <Route
//           path="/admin"
//           element={authUser ? <GroupAdminPanel /> : <Navigate to="/login" />}
//         />
//       </Routes>
//     </div>
//   );
// }

// export default App
