import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  te: {
    // App
    appName: 'శోధించు సాధించు',
    appTagline: 'నిధి వేట ఆట',
    
    // Auth
    hostLogin: 'నిర్వాహకుడు లాగిన్',
    teamLogin: 'జట్టు లాగిన్',
    password: 'పాస్‌వర్డ్',
    pincode: 'పిన్‌కోడ్',
    pathColor: 'మార్గం రంగు',
    login: 'లాగిన్',
    logout: 'లాగ్అవుట్',
    loginAsHost: 'నిర్వాహకుడిగా లాగిన్',
    loginAsTeam: 'జట్టుగా లాగిన్',
    
    // Host Dashboard
    hostDashboard: 'నిర్వాహకుడి డాష్‌బోర్డ్',
    paths: 'మార్గాలు',
    teams: 'జట్లు',
    leaderboard: 'లీడర్‌బోర్డ్',
    createPath: 'మార్గం సృష్టించు',
    registerTeam: 'జట్టు నమోదు',
    totalTeams: 'మొత్తం జట్లు',
    completed: 'పూర్తయింది',
    active: 'చురుకుగా',
    notStarted: 'ప్రారంభించలేదు',
    
    // Path Management
    pathNumber: 'మార్గం నంబర్',
    pathName: 'మార్గం పేరు',
    colorName: 'రంగు పేరు',
    addPlace: 'స్థలం చేర్చు',
    placeName: 'స్థలం పేరు',
    clue: 'సూచన',
    clueInEnglish: 'సూచన (ఆంగ్లం)',
    generateQR: 'QR కోడ్ తయారు',
    printQR: 'QR ముద్రించు',
    save: 'సేవ్',
    cancel: 'రద్దు',
    delete: 'తొలగించు',
    edit: 'మార్చు',
    place: 'స్థలం',
    destination: 'గమ్యస్థానం',
    startingPoint: 'ప్రారంభ స్థానం',
    
    // Team Registration
    teamName: 'జట్టు పేరు',
    teamMembers: 'జట్టు సభ్యులు',
    assignPath: 'మార్గం కేటాయించు',
    credentials: 'లాగిన్ వివరాలు',
    yourPincode: 'మీ పిన్‌కోడ్',
    yourPathColor: 'మీ మార్గం రంగు',
    
    // Game - Team View
    currentClue: 'ప్రస్తుత సూచన',
    scanQR: 'QR స్కాన్ చేయి',
    enterCode: 'కోడ్ నమోదు చేయి',
    submit: 'సమర్పించు',
    progress: 'పురోగతి',
    step: 'దశ',
    of: 'లో',
    congratulations: 'అభినందనలు!',
    huntComplete: 'నిధి వేట పూర్తయింది!',
    yourTime: 'మీ సమయం',
    minutes: 'నిమిషాలు',
    
    // Colors
    colors: {
      red: 'ఎరుపు',
      blue: 'నీలం',
      green: 'ఆకుపచ్చ',
      yellow: 'పసుపు',
      orange: 'నారింజ',
      purple: 'ఊదా',
      pink: 'గులాబీ',
      brown: 'గోధుమ',
      black: 'నలుపు',
      white: 'తెలుపు',
      gold: 'బంగారు',
      silver: 'వెండి'
    },
    
    // Messages
    scanSuccess: 'సరైనది! మీరు స్థలాన్ని కనుగొన్నారు!',
    wrongCode: 'తప్పు కోడ్! మళ్ళీ ప్రయత్నించండి.',
    loading: 'లోడ్ అవుతోంది...',
    error: 'లోపం సంభవించింది',
    noPathsYet: 'ఇంకా మార్గాలు లేవు',
    noTeamsYet: 'ఇంకా జట్లు లేవు',
    rank: 'స్థానం',
    time: 'సమయం',
    min: 'నిమి'
  },
  en: {
    appName: 'Shodhinchu Saadinchu',
    appTagline: 'Treasure Hunt Game',
    
    hostLogin: 'Host Login',
    teamLogin: 'Team Login',
    password: 'Password',
    pincode: 'Pincode',
    pathColor: 'Path Color',
    login: 'Login',
    logout: 'Logout',
    loginAsHost: 'Login as Host',
    loginAsTeam: 'Login as Team',
    
    hostDashboard: 'Host Dashboard',
    paths: 'Paths',
    teams: 'Teams',
    leaderboard: 'Leaderboard',
    createPath: 'Create Path',
    registerTeam: 'Register Team',
    totalTeams: 'Total Teams',
    completed: 'Completed',
    active: 'Active',
    notStarted: 'Not Started',
    
    pathNumber: 'Path Number',
    pathName: 'Path Name',
    colorName: 'Color Name',
    addPlace: 'Add Place',
    placeName: 'Place Name',
    clue: 'Clue',
    clueInEnglish: 'Clue (English)',
    generateQR: 'Generate QR',
    printQR: 'Print QR',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    place: 'Place',
    destination: 'Destination',
    startingPoint: 'Starting Point',
    
    teamName: 'Team Name',
    teamMembers: 'Team Members',
    assignPath: 'Assign Path',
    credentials: 'Login Credentials',
    yourPincode: 'Your Pincode',
    yourPathColor: 'Your Path Color',
    
    currentClue: 'Current Clue',
    scanQR: 'Scan QR Code',
    enterCode: 'Enter Code Manually',
    submit: 'Submit',
    progress: 'Progress',
    step: 'Step',
    of: 'of',
    congratulations: 'Congratulations!',
    huntComplete: 'Treasure Hunt Complete!',
    yourTime: 'Your Time',
    minutes: 'minutes',
    
    colors: {
      red: 'Red', blue: 'Blue', green: 'Green', yellow: 'Yellow',
      orange: 'Orange', purple: 'Purple', pink: 'Pink', brown: 'Brown',
      black: 'Black', white: 'White', gold: 'Gold', silver: 'Silver'
    },
    
    scanSuccess: 'Correct! You found the location!',
    wrongCode: 'Wrong code! Please try again.',
    loading: 'Loading...',
    error: 'An error occurred',
    noPathsYet: 'No paths created yet',
    noTeamsYet: 'No teams registered yet',
    rank: 'Rank',
    time: 'Time',
    min: 'min'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('te');
  
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'te' ? 'en' : 'te');
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, translations: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
