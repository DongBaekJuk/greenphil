import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://upoqfcrzwugtfvhstfiu.supabase.co'
const supabaseKey = 'sb_publishable_zxdsXjwYEco1aJsD2DZrfQ_ze6sUn7M'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)