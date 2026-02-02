import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Listar todos os acessórios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get("categoria")

    const where: { ativo: boolean; categoria?: string } = { ativo: true }
    if (categoria) {
      where.categoria = categoria
    }

    const acessorios = await prisma.acessorio.findMany({
      where,
      orderBy: [{ categoria: "asc" }, { nome: "asc" }]
    })
    return NextResponse.json(acessorios)
  } catch (error) {
    console.error("Erro ao buscar acessórios:", error)
    return NextResponse.json(
      { error: "Erro ao buscar acessórios" },
      { status: 500 }
    )
  }
}

// POST - Criar novo acessório
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, categoria, descricao, valorUnitario, unidade } = body

    const acessorio = await prisma.acessorio.create({
      data: {
        nome,
        categoria,
        descricao,
        valorUnitario: parseFloat(valorUnitario),
        unidade: unidade || "un"
      }
    })

    return NextResponse.json(acessorio, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar acessório:", error)
    return NextResponse.json(
      { error: "Erro ao criar acessório" },
      { status: 500 }
    )
  }
}
