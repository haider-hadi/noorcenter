import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://lqcdfysynegysckwzkwc.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_m_sUuDgmsI3_MRWRxVBxWg__aVu_0hj';
export const PRODUCT_BUCKET = 'product-images';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function getPublicUrl(path){
  if(!path) return null;
  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}
