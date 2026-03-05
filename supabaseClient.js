// Importa a função de criação do client Supabase via CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Cria o client com a URL e a chave fornecidas
export const supabase = createClient(
  'https://llzdvsauefvavbrgnswv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsemR2c2F1ZWZ2YXZicmduc3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDg2NTEsImV4cCI6MjA4ODI4NDY1MX0.nP1qToZN057uNBs3wQKhKMhrezSmz-FgU5SkMXpFAdg'
)
  