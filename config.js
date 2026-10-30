// Supabase Configuration
// Replace these values with your actual Supabase project credentials
// Get them from: https://app.supabase.com/project/[your-project]/settings/api

const SUPABASE_URL = 'https://tvjnrwqjqpyrnroqcetf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QlP5Pm6yOsuqxiwCw_pYMg_V6bUvVOv';

// Load Supabase JS library dynamically, then create client
function initSupabase() {
  if (window.supabase) {
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseReady = true;
    window.dispatchEvent(new Event('supabase-ready'));
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = () => {
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseReady = true;
    window.dispatchEvent(new Event('supabase-ready'));
  };
  script.onerror = () => console.error('Failed to load Supabase library');
  document.head.appendChild(script);
}

// Auto-init on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabase);
} else {
  initSupabase();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { supabase: null, SUPABASE_URL, SUPABASE_ANON_KEY };
}