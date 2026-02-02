import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Buscar acessório por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const acessorio = await prisma.acessorio.findUnique({
      where: { id }
    })

    if (!acessorio) {
      return NextResponse.json(
        { error: "Acessório não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(acessorio)
  } catch (error) {
    console.error("Erro ao buscar acessório:", error)
    return NextResponse.json(
      { error: "Erro ao buscar acessório" },
      { status: 500 }
    )
  }
}

// PUT - Atualizar acessório
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nome, categoria, descricao, valorUnitario, unidade } = body

    const acessorio = await prisma.acessorio.update({
      where: { id },
      data: {
        nome,
        categoria,
        descricao,
        valorUnitario: parseFloat(valorUnitario),
        unidade
      }
    })

    return NextResponse.json(acessorio)
  } catch (error) {
    console.error("Erro ao atualizar acessório:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar acessório" },
      { status: 500 }
    )
  }
}

// DELETE - Desativar acessório (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.acessorio.update({
      where: { id },
      data: { ativo: false }
    })

    return NextResponse.json({ message: "Acessório desativado com sucesso" })
  } catch (error) {
    console.error("Erro ao desativar acessório:", error)
    return NextResponse.json(
      { error: "Erro ao desativar acessório" },
      { status: 500 }
    )
  }
}
