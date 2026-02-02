import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Listar todas as bordas
export async function GET() {
  try {
    const bordas = await prisma.borda.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" }
    })
    return NextResponse.json(bordas)
  } catch (error) {
    console.error("Erro ao buscar bordas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar bordas" },
      { status: 500 }
    )
  }
}

// POST - Criar nova borda
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, largura, valorRolo, metrosRolo } = body

    // Calcular custo por metro
    const custoMetro = valorRolo / metrosRolo

    const borda = await prisma.borda.create({
      data: {
        nome,
        largura: parseFloat(largura),
        valorRolo: parseFloat(valorRolo),
        metrosRolo: parseFloat(metrosRolo),
        custoMetro
      }
    })

    return NextResponse.json(borda, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar borda:", error)
    return NextResponse.json(
      { error: "Erro ao criar borda" },
      { status: 500 }
    )
  }
}
