import { createClient } from '@supabase/supabase-js';

// 기능 단위: 프론트는 Supabase Auth와 DB를 직접 사용합니다. 실제 값은 .env.local에서 주입합니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upoqfcrzwugtfvhstfiu.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_zxdsXjwYEco1aJsD2DZrfQ_ze6sUn7M';

export const supabase = createClient(supabaseUrl, supabaseKey);
