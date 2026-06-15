import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Lock, Phone, Eye, EyeOff, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const ParentLogin = () => {
  const { login } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ contactValue: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.contactValue.trim()) newErrors.contactValue = lang === 'ar' ? 'رقم الهاتف أو البريد مطلوب' : 'Phone or email required';
    if (!formData.password) newErrors.password = 'Password required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setIsLoading(true);
    const result = await login({ contactValue: formData.contactValue, password: formData.password }, 'parent');
    if (result.success) navigate('/parent/dashboard');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-accent-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{lang === 'ar' ? 'دخول ولي الأمر' : 'Parent Login'}</h1>
          <p className="text-white/60">{lang === 'ar' ? 'أولوية خاصة في الطابور' : 'Special priority in queue'}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-hard">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">{lang === 'ar' ? 'الهاتف أو البريد' : 'Phone or Email'}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input type="text" name="contactValue" value={formData.contactValue} onChange={handleChange}
                  placeholder={lang === 'ar' ? 'أدخل رقم الهاتف أو البريد' : 'Enter phone or email'}
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none ${errors.contactValue ? 'border-danger-400' : 'border-white/20 focus:border-accent-400'}`} />
              </div>
              {errors.contactValue && <p className="text-danger-400 text-sm mt-1">{errors.contactValue}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  placeholder="Enter password"
                  className={`w-full pl-12 pr-12 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none ${errors.password ? 'border-danger-400' : 'border-white/20 focus:border-accent-400'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-danger-400 text-sm mt-1">{errors.password}</p>}
            </div>
            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 rounded-xl bg-accent-600 text-white font-semibold hover:bg-accent-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap className="w-5 h-5" /> {lang === 'ar' ? 'دخول' : 'Login'}</>}
            </motion.button>
          </form>
          <p className="text-center mt-6 text-white/60">
            {lang === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
            <Link to="/parent/signup" className="text-accent-400 hover:text-accent-300 font-semibold transition-colors">{lang === 'ar' ? 'سجل هنا' : 'Sign up here'}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
export default ParentLogin;
