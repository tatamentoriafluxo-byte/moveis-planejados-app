import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Listar todos os clientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const where: { ativo: boolean; OR?: Array<{ nome?: { contains: string }; email?: { contains: string }; telefone?: { contains: string } }> } = { ativo: true }

    if (search) {
      where.OR = [
        { nome: { contains: search } },
        { email: { contains: search } },
        { telefone: { contains: search } }
      ]
    }

    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: { nome: "asc" },
      include: {
        _count: {
          select: { projetos: true }
        }
      }
    })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    return NextResponse.json(
      { error: "Erro ao buscar clientes" },
      { status: 500 }
    )
  }
}

// POST - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nome,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
      cpfCnpj,
      comoConheceu,
      observacoes
    } = body

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        telefone,
        endereco,
        cidade,
        estado,
        cep,
        cpfCnpj,
        comoConheceu,
        observacoes
      }
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar cliente:", error)
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    )
  }
}
