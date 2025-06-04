
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set up demo account
const setUpDemoAccount = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const demoUser = users.find((u: any) => u.email === 'demo@example.com');
  
  if (!demoUser) {
    users.push({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123',
    });
    localStorage.setItem('users', JSON.stringify(users));
    console.log('Demo account created: demo@example.com / password123');
  }
};

// Initialize demo account
setUpDemoAccount();

createRoot(document.getElementById("root")!).render(<App />);
