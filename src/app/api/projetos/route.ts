import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Listar todos os projetos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const clienteId = searchParams.get("clienteId")

    const where: { status?: string; clienteId?: string } = {}
    if (status) where.status = status
    if (clienteId) where.clienteId = clienteId

    const projetos = await prisma.projeto.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        cliente: true,
        modulos: true
      }
    })

    return NextResponse.json(projetos)
  } catch (error) {
    console.error("Erro ao buscar projetos:", error)
    return NextResponse.json(
      { error: "Erro ao buscar projetos" },
      { status: 500 }
    )
  }
}

// POST - Criar novo projeto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nome,
      clienteId,
      ambiente,
      observacoes,
      metodoPrecificacao
    } = body

    const projeto = await prisma.projeto.create({
      data: {
        nome,
        clienteId,
        ambiente,
        observacoes,
        metodoPrecificacao: metodoPrecificacao || "margem"
      },
      include: {
        cliente: true
      }
    })

    return NextResponse.json(projeto, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar projeto:", error)
    return NextResponse.json(
      { error: "Erro ao criar projeto" },
      { status: 500 }
    )
  }
}
