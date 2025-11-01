// Debug helper
export const debugProviders = () => {
    const poeKey = import.meta.env.VITE_POE_API_KEY;
    const togetherKey = import.meta.env.VITE_TOGETHER_API_KEY;
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    
    console.log('🔍 Debug Providers:');
    console.log('Poe:', poeKey ? '✅ Configured' : '❌ Missing');
    console.log('Together:', togetherKey ? '✅ Configured' : '❌ Missing');
    console.log('Groq:', groqKey ? '✅ Configured' : '❌ Missing');
    
    return {
        poe: !!poeKey,
        together: !!togetherKey,
        groq: !!groqKey,
    };
};
