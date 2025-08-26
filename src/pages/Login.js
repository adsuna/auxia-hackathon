 import React, { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '../contexts/AuthContext';
 
 const Login = () => {
   const { login } = useAuth();
   const navigate = useNavigate();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
 
   const onSubmit = async (e) => {
     e.preventDefault();
     setError('');
     setLoading(true);
     try {
       await login(email, password);
       navigate('/dashboard');
     } catch (e) {
       setError('Invalid credentials');
     } finally {
       setLoading(false);
     }
   };
 
   return (
     <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
       <h1 className="text-2xl font-bold text-gray-900 mb-4">Login</h1>
       {error && (
         <div className="p-3 rounded bg-red-50 text-red-700 text-sm mb-3">{error}</div>
       )}
       <form onSubmit={onSubmit} className="space-y-4">
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
           <input
             type="email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
             required
           />
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
           <input
             type="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
             required
           />
         </div>
         <button
           type="submit"
           disabled={loading}
           className="btn-primary w-full"
         >
           {loading ? 'Logging in...' : 'Login'}
         </button>
       </form>
     </div>
   );
 };
 
 export default Login;
 

