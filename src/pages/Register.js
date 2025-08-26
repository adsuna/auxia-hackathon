 import React, { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '../contexts/AuthContext';
 
 const Register = () => {
   const { register } = useAuth();
   const navigate = useNavigate();
   const [firstName, setFirstName] = useState('');
   const [lastName, setLastName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [isTutor, setIsTutor] = useState(false);
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
 
   const onSubmit = async (e) => {
     e.preventDefault();
     setError('');
     setLoading(true);
     try {
       await register({ email, password, firstName, lastName, isTutor });
       navigate('/dashboard');
     } catch (e) {
       setError('Registration failed');
     } finally {
       setLoading(false);
     }
   };
 
   return (
     <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
       <h1 className="text-2xl font-bold text-gray-900 mb-4">Create an account</h1>
       {error && (
         <div className="p-3 rounded bg-red-50 text-red-700 text-sm mb-3">{error}</div>
       )}
       <form onSubmit={onSubmit} className="space-y-4">
         <div className="grid grid-cols-2 gap-3">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
             <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={firstName} onChange={e => setFirstName(e.target.value)} required />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
             <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={lastName} onChange={e => setLastName(e.target.value)} required />
           </div>
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
           <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={email} onChange={e => setEmail(e.target.value)} required />
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
           <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={password} onChange={e => setPassword(e.target.value)} required />
         </div>
         <label className="flex items-center space-x-2">
           <input type="checkbox" checked={isTutor} onChange={e => setIsTutor(e.target.checked)} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
           <span className="text-sm text-gray-700">I want to tutor others</span>
         </label>
         <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating...' : 'Create account'}</button>
       </form>
     </div>
   );
 };
 
 export default Register;
 

