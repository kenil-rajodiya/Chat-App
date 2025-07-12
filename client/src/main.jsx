import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AuthProvider } from '../context/AuthContext.jsx'
import { ChatProvider } from '../context/ChatContext.jsx'
import { GroupChatProvider } from '../context/GroupChatContext.jsx'
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ChatProvider>
        <GroupChatProvider>
          <App />
        </GroupChatProvider>
      </ChatProvider>
    </AuthProvider>
  </BrowserRouter>
);
