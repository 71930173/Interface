import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Lock, Phone, Eye, EyeOff, AlertCircle, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const ParentSignup = () => {
  const { signup } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', contactValue: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
    if (!formData.contactValue.trim()) newErrors.contactValue = 'Phone or email required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password min 6 chars';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) { if (validateStep1()) setStep(2); return; }
    if (!validateStep2()) return;
    setIsLoading(true);
    const result = await signup({
      firstName: formData.firstName, lastName: formData.lastName,
      contactValue: formData.contactValue, password: formData.password, confirmPassword: formData.confirmPassword
    }, 'parent');
    if (result.success) navigate('/parent/dashboard');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-accent-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{lang === 'ar' ? 'تسجيل ولي أمر' : 'Parent Registration'}</h1>
        </motion.div>
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s ? 'bg-accent-500 text-white shadow-glow' : 'bg-white/10 text-white/50'}`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s === 1 && <div className={`w-12 h-0.5 transition-all ${step > 1 ? 'bg-accent-500' : 'bg-white/20'}`} />}
            </div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-hard">
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none ${errors.firstName ? 'border-danger-400' : 'border-white/20 focus:border-accent-400'}`} />
                    {errors.firstName && <p className="text-danger-400 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none ${errors.lastName ? 'border-danger-400' : 'border-white/20 focus:border-accent-400'}`} />
                    {errors.lastName && <p className="text-danger-400 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>
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
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none ${errors.password ? 'border-danger-400' : 'border-white/20 focus:border-accent-400'}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-danger-400 text-sm mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none ${errors.confirmPassword ? 'border-danger-400' : 'border-white/20 focus:border-accent-400'}`} />
                  </div>
                  {errors.confirmPassword && <p className="text-danger-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </>
            )}
            <div className="flex gap-3 pt-4">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 px-4 rounded-xl border-2 border-white/20 text-white font-medium hover:bg-white/10 transition-all">
                  {lang === 'ar' ? 'رجوع' : 'Back'}
                </button>
              )}
              <button type="submit" disabled={isLoading} className="flex-1 py-3 px-4 rounded-xl bg-accent-600 text-white font-semibold hover:bg-accent-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap className="w-5 h-5" /> {step === 1 ? (lang === 'ar' ? 'التالي' : 'Next') : (lang === 'ar' ? 'تسجيل' : 'Sign Up')}</>}
              </button>
            </div>
          </form>
        </motion.div>
        <p className="text-center mt-6 text-white/60">
          {lang === 'ar' ? 'لديك حساب؟' : 'Have an account?'}{' '}
          <Link to="/parent/login" className="text-accent-400 hover:text-accent-300 font-semibold transition-colors">{lang === 'ar' ? 'سجل دخول' : 'Login here'}</Link>
        </p>
      </div>
    </div>
  );
};
export default ParentSignup;
