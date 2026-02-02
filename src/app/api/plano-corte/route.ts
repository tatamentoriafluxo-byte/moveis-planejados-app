import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Buscar peças para plano de corte
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projetoId = searchParams.get("projetoId")

    // Definir filtro de projetos
    const projetoFilter = projetoId
      ? { id: projetoId }
      : { status: { in: ["aprovado", "producao"] } }

    // Buscar todas as peças de projetos aprovados/em produção
    const pecas = await prisma.peca.findMany({
      where: {
        modulo: {
          projeto: projetoFilter
        }
      },
      include: {
        chapa: true,
        modulo: {
          select: {
            nome: true,
            quantidade: true,
            projeto: {
              select: {
                nome: true,
                cliente: {
                  select: { nome: true }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { modulo: { projeto: { nome: "asc" } } },
        { modulo: { nome: "asc" } },
        { ordem: "asc" }
      ]
    })

    return NextResponse.json(pecas)
  } catch (error) {
    console.error("Erro ao buscar plano de corte:", error)
    return NextResponse.json(
      { error: "Erro ao buscar plano de corte" },
      { status: 500 }
    )
  }
}
