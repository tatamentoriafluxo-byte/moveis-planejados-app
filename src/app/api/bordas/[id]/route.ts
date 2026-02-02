import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Buscar borda por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const borda = await prisma.borda.findUnique({
      where: { id }
    })

    if (!borda) {
      return NextResponse.json(
        { error: "Borda não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(borda)
  } catch (error) {
    console.error("Erro ao buscar borda:", error)
    return NextResponse.json(
      { error: "Erro ao buscar borda" },
      { status: 500 }
    )
  }
}

// PUT - Atualizar borda
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nome, largura, valorRolo, metrosRolo } = body

    // Recalcular custo por metro
    const custoMetro = valorRolo / metrosRolo

    const borda = await prisma.borda.update({
      where: { id },
      data: {
        nome,
        largura: parseFloat(largura),
        valorRolo: parseFloat(valorRolo),
        metrosRolo: parseFloat(metrosRolo),
        custoMetro
      }
    })

    return NextResponse.json(borda)
  } catch (error) {
    console.error("Erro ao atualizar borda:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar borda" },
      { status: 500 }
    )
  }
}

// DELETE - Desativar borda (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.borda.update({
      where: { id },
      data: { ativo: false }
    })

    return NextResponse.json({ message: "Borda desativada com sucesso" })
  } catch (error) {
    console.error("Erro ao desativar borda:", error)
    return NextResponse.json(
      { error: "Erro ao desativar borda" },
      { status: 500 }
    )
  }
}
