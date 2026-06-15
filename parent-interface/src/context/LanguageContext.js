import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // General
    appName: 'Smart Queue',
    tagline: 'University Queue Management',
    welcome: 'Welcome',
    hello: 'Hello',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    save: 'Save',
    close: 'Close',
    done: 'Done',
    yes: 'Yes',
    no: 'No',
    or: 'or',
    and: 'and',

    // Language
    selectLanguage: 'Select Your Language',
    english: 'English',
    arabic: 'العربية',

    // Auth
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    firstName: 'First Name',
    lastName: 'Last Name',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    password: 'Password',
    contactMethod: 'Contact Method',
    contactValue: 'Contact Value',
    enterDetails: 'Enter Your Details',
    haveAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    loginHere: 'Login here',
    signupHere: 'Sign up here',

    // QR / Landing
    scanQR: 'Scan QR Code',
    scanToStart: 'Scan the QR code to start',
    welcomeParent: 'Welcome, Parent',
    startQueue: 'Start Queue Process',

    // Microphone
    useMicrophone: 'Use Microphone',
    speakNow: 'Speak Now',
    listening: 'Listening...',
    tapToSpeak: 'Tap the microphone and speak',
    speechToText: 'Speech to Text',

    // Issue Types
    selectIssue: 'Select Issue Type',
    selectIssueDesc: 'Choose the type of issue you need help with',
    issueTypes: 'Issue Types',
    admission: 'Admission',
    financial: 'Financial',
    academic: 'Academic',
    itSupport: 'IT Support',
    studentAffairs: 'Student Affairs',
    other: 'Other',

    // Staff
    assignedStaff: 'Assigned Staff',
    staffDetails: 'Staff Details',
    selectStaff: 'Select Staff',
    room: 'Room',
    block: 'Block',
    floor: 'Floor',
    directions: 'Directions',
    noStaffAvailable: 'No Staff Available',
    noStaffForIssue: 'No staff members are currently available for {issue}. Please try again later or select a different issue.',
    backToIssues: 'Back to Issues',

    // Queue
    confirmQueue: 'Confirm Queue',
    queueConfirmed: 'Queue Confirmed!',
    yourNumber: 'Your Number',
    estimatedWait: 'Estimated Wait',
    peopleBefore: 'People Before You',
    queuePosition: 'Queue Position',
    priority: 'Priority',
    standard: 'Standard',
    parentPriority: 'Parent Priority',

    // Waiting Screen
    waitingForTurn: 'Waiting for Your Turn',
    pleaseWait: 'Please wait patiently',
    yourTurnSoon: 'Your turn is coming soon',
    approxWait: 'Approximate wait time',
    minWarning: 'You will be called in about 3 minutes',
    turnNow: 'It\'s Your Turn!',
    enterOffice: 'Please enter the office now',

    // Description
    addDescription: 'Add Description (Optional)',
    descriptionPlaceholder: 'Describe your issue in detail...',

    // Notifications
    notifications: 'Notifications',
    noNotifications: 'No notifications yet',
    markRead: 'Mark as read',

    // Cancel
    cancelQueue: 'Cancel Queue',
    cancelConfirm: 'Are you sure you want to cancel your queue?',
    cancelSuccess: 'Queue cancelled successfully',

    // Errors
    fillAllFields: 'Please fill all required fields',
    invalidContact: 'Please enter a valid contact',
    selectIssueType: 'Please select an issue type',
    queueFull: 'Queue is full. Please try again later.',
    alreadyInQueue: 'You already have an active queue. Please wait for it to complete.',

    // Status
    waiting: 'Waiting',
    serving: 'Now Serving',
    served: 'Completed',
    cancelled: 'Cancelled',

    // Time
    minutes: 'minutes',
    minute: 'minute',
    seconds: 'seconds',

    // Footer
    poweredBy: 'Powered by Smart Queue',
    university: 'University Queue System',

    // Resolution
    resolvedRemotely: 'Resolved Remotely',
    resolutionNote: 'Staff Note',
    issueResolved: 'Your issue has been resolved remotely. No need to visit the office.',
    resolvedBy: 'Resolved by',
  },
  ar: {
    // General
    appName: 'الطابور الذكي',
    tagline: 'نظام إدارة طوابير الجامعة',
    welcome: 'أهلاً وسهلاً',
    hello: 'مرحباً',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    back: 'رجوع',
    next: 'التالي',
    submit: 'إرسال',
    save: 'حفظ',
    close: 'إغلاق',
    done: 'تم',
    yes: 'نعم',
    no: 'لا',
    or: 'أو',
    and: 'و',

    // Language
    selectLanguage: 'اختر لغتك',
    english: 'English',
    arabic: 'العربية',

    // Auth
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    password: 'كلمة المرور',
    contactMethod: 'طريقة التواصل',
    contactValue: 'قيمة التواصل',
    enterDetails: 'أدخل بياناتك',
    haveAccount: 'لديك حساب بالفعل؟',
    noAccount: 'ليس لديك حساب؟',
    loginHere: 'سجل الدخول هنا',
    signupHere: 'سجل هنا',

    // QR / Landing
    scanQR: 'مسح رمز QR',
    scanToStart: 'امسح رمز QR للبدء',
    welcomeParent: 'أهلاً بك، ولي الأمر',
    startQueue: 'ابدأ عملية الطابور',

    // Microphone
    useMicrophone: 'استخدم الميكروفون',
    speakNow: 'تكلم الآن',
    listening: 'جاري الاستماع...',
    tapToSpeak: 'اضغط على الميكروفون وتكلم',
    speechToText: 'تحويل الكلام إلى نص',

    // Issue Types
    selectIssue: 'اختر نوع المشكلة',
    selectIssueDesc: 'اختر نوع المشكلة التي تحتاج مساعدة فيها',
    issueTypes: 'أنواع المشاكل',
    admission: 'القبول',
    financial: 'المالية',
    academic: 'الأكاديمية',
    itSupport: 'دعم تقني',
    studentAffairs: 'شؤون الطلاب',
    other: 'أخرى',

    // Staff
    assignedStaff: 'الموظف المخصص',
    staffDetails: 'تفاصيل الموظف',
    selectStaff: 'اختيار الموظف',
    room: 'الغرفة',
    block: 'المبنى',
    floor: 'الطابق',
    directions: 'الاتجاهات',
    noStaffAvailable: 'لا يوجد موظفون متاحون',
    noStaffForIssue: 'لا يوجد موظفون متاحون حالياً لـ {issue}. يرجى المحاولة لاحقاً أو اختيار قضية أخرى.',
    backToIssues: 'العودة للقضايا',

    // Queue
    confirmQueue: 'تأكيد الطابور',
    queueConfirmed: 'تم تأكيد الطابور!',
    yourNumber: 'رقمك',
    estimatedWait: 'الوقت المتوقع',
    peopleBefore: 'الأشخاص قبلك',
    queuePosition: 'موقعك في الطابور',
    priority: 'أولوية',
    standard: 'عادي',
    parentPriority: 'أولوية ولي الأمر',

    // Waiting Screen
    waitingForTurn: 'في انتظار دورك',
    pleaseWait: 'يرجى الانتظار بصبر',
    yourTurnSoon: 'دورك قادم قريباً',
    approxWait: 'الوقت التقريبي للانتظار',
    minWarning: 'سيتم استدعاؤك خلال 3 دقائق',
    turnNow: 'دورك الآن!',
    enterOffice: 'يرجى الدخول إلى المكتب الآن',

    // Description
    addDescription: 'إضافة وصف (اختياري)',
    descriptionPlaceholder: 'صف مشكلتك بالتفصيل...',

    // Notifications
    notifications: 'الإشعارات',
    noNotifications: 'لا توجد إشعارات بعد',
    markRead: 'تحديد كمقروء',

    // Cancel
    cancelQueue: 'إلغاء الطابور',
    cancelConfirm: 'هل أنت متأكد من إلغاء طابورك؟',
    cancelSuccess: 'تم إلغاء الطابور بنجاح',

    // Errors
    fillAllFields: 'يرجى ملء جميع الحقول المطلوبة',
    invalidContact: 'يرجى إدخال بيانات تواصل صحيحة',
    selectIssueType: 'يرجى اختيار نوع المشكلة',
    queueFull: 'الطابور ممتلئ. يرجى المحاولة لاحقاً.',
    alreadyInQueue: 'لديك طابور نشط بالفعل. يرجى الانتظار حتى يكتمل.',

    // Status
    waiting: 'في الانتظار',
    serving: 'يتم المعالجة',
    served: 'تمت',
    cancelled: 'ملغى',

    // Time
    minutes: 'دقائق',
    minute: 'دقيقة',
    seconds: 'ثواني',

    // Footer
    poweredBy: 'بواسطة الطابور الذكي',
    university: 'نظام طوابير الجامعة',

    // Resolution
    resolvedRemotely: 'تم الحل عن بعد',
    resolutionNote: 'ملاحظة الموظف',
    issueResolved: 'تم حل مشكلتك عن بعد. لا حاجة لزيارة المكتب.',
    resolvedBy: 'تم الحل بواسطة',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('parentLanguage') || 'en';
  });
  const [dir, setDir] = useState(language === 'ar' ? 'rtl' : 'ltr');

  useEffect(() => {
    localStorage.setItem('parentLanguage', language);
    setDir(language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  }, []);

  return (
    <LanguageContext.Provider value={{ language, dir, t, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};