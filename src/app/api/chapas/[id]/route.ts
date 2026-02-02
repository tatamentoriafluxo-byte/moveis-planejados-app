import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Buscar chapa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const chapa = await prisma.chapa.findUnique({
      where: { id }
    })

    if (!chapa) {
      return NextResponse.json(
        { error: "Chapa não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(chapa)
  } catch (error) {
    console.error("Erro ao buscar chapa:", error)
    return NextResponse.json(
      { error: "Erro ao buscar chapa" },
      { status: 500 }
    )
  }
}

// PUT - Atualizar chapa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nome, espessura, valorChapa, larguraChapa, alturaChapa } = body

    // Recalcular custo por m² com 15% de perda
    const areaChapa = (larguraChapa * alturaChapa) / 1000000
    const areaUtil = areaChapa * 0.85
    const custoM2ComPerda = valorChapa / areaUtil

    const chapa = await prisma.chapa.update({
      where: { id },
      data: {
        nome,
        espessura: parseFloat(espessura),
        valorChapa: parseFloat(valorChapa),
        larguraChapa: parseFloat(larguraChapa),
        alturaChapa: parseFloat(alturaChapa),
        custoM2ComPerda
      }
    })

    return NextResponse.json(chapa)
  } catch (error) {
    console.error("Erro ao atualizar chapa:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar chapa" },
      { status: 500 }
    )
  }
}

// DELETE - Desativar chapa (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.chapa.update({
      where: { id },
      data: { ativo: false }
    })

    return NextResponse.json({ message: "Chapa desativada com sucesso" })
  } catch (error) {
    console.error("Erro ao desativar chapa:", error)
    return NextResponse.json(
      { error: "Erro ao desativar chapa" },
      { status: 500 }
    )
  }
}
