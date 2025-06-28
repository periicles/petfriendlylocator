import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password, firstname, lastname } = await req.json()

    if (!email || !password || !firstname || !lastname) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
    }

    const hashedPassword = await hash(password, 10)

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstname,
        lastname,
      },
    })

    return NextResponse.json({ message: 'Utilisateur créé avec succès' }, { status: 201 })
  } catch (error) {
    console.error('Erreur d’inscription:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
