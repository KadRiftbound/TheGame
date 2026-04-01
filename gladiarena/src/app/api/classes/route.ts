import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get('tier')
    const forCreation = searchParams.get('forCreation')
    
    const whereClause: any = {}
    if (tier) {
      whereClause.tier = tier
    } else if (forCreation === 'true') {
      // Only base classes for character creation
      whereClause.tier = 'base'
    } else {
      // Default: base + advanced (for Destin screen)
      whereClause.tier = { in: ['base', 'advanced'] }
    }
    
    const classes = await prisma.characterClass.findMany({
      where: whereClause,
      orderBy: { tier: 'asc' }
    })
    
    return NextResponse.json({ classes })
  } catch (error: any) {
    console.error('Get classes error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}

// Get origins
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'get_origins') {
      const origins = await prisma.origin.findMany({
        orderBy: { name: 'asc' }
      })
      return NextResponse.json({ origins })
    }
    
    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    console.error('Origins error:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
