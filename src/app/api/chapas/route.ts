import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Listar todas as chapas
export async function GET() {
  try {
    const chapas = await prisma.chapa.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" }
    })
    return NextResponse.json(chapas)
  } catch (error) {
    console.error("Erro ao buscar chapas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar chapas" },
      { status: 500 }
    )
  }
}

// POST - Criar nova chapa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, espessura, valorChapa, larguraChapa, alturaChapa } = body

    // Calcular custo por m² com 15% de perda
    const areaChapa = (larguraChapa * alturaChapa) / 1000000
    const areaUtil = areaChapa * 0.85 // 15% de perda
    const custoM2ComPerda = valorChapa / areaUtil

    const chapa = await prisma.chapa.create({
      data: {
        nome,
        espessura: parseFloat(espessura),
        valorChapa: parseFloat(valorChapa),
        larguraChapa: parseFloat(larguraChapa) || 2750,
        alturaChapa: parseFloat(alturaChapa) || 1850,
        custoM2ComPerda
      }
    })

    return NextResponse.json(chapa, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar chapa:", error)
    return NextResponse.json(
      { error: "Erro ao criar chapa" },
      { status: 500 }
    )
  }
}
