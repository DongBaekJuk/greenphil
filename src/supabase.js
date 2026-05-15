import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://upoqfcrzwugtfvhstfiu.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_zxdsXjwYEco1aJsD2DZrfQ_ze6sUn7M'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)
