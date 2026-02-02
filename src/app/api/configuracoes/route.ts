import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Buscar configurações (cria se não existir)
export async function GET() {
  try {
    let config = await prisma.configuracao.findFirst()

    if (!config) {
      config = await prisma.configuracao.create({
        data: {}
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Erro ao buscar configurações:", error)
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    )
  }
}

// PUT - Atualizar configurações
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    let config = await prisma.configuracao.findFirst()

    if (!config) {
      config = await prisma.configuracao.create({
        data: body
      })
    } else {
      config = await prisma.configuracao.update({
        where: { id: config.id },
        data: {
          metodoConstrutivo: body.metodoConstrutivo,
          espessuraCorpo: body.espessuraCorpo,
          espessuraPorta: body.espessuraPorta,
          espessuraFundoModulo: body.espessuraFundoModulo,
          espessuraFundoGaveta: body.espessuraFundoGaveta,
          espessuraTamponamento: body.espessuraTamponamento,
          margemLucro: body.margemLucro,
          multiplicadorMaterial: body.multiplicadorMaterial,
          valorMetroQuadrado: body.valorMetroQuadrado
        }
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar configurações" },
      { status: 500 }
    )
  }
}
