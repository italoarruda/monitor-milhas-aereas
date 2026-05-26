import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ airports: [] })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('airports')
    .select('id, iata_code, icao_code, name, city, country, is_brazil')
    .or(`iata_code.ilike.${q}%,city.ilike.%${q}%,name.ilike.%${q}%`)
    .order('is_brazil', { ascending: false })
    .order('name', { ascending: true })
    .limit(10)

  if (error) return NextResponse.json({ airports: [] }, { status: 500 })
  return NextResponse.json({ airports: data })
}
