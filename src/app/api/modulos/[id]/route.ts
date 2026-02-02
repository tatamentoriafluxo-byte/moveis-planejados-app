import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Buscar módulo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const modulo = await prisma.modulo.findUnique({
      where: { id },
      include: {
        pecas: {
          include: { chapa: true },
          orderBy: { ordem: "asc" }
        }
      }
    })

    if (!modulo) {
      return NextResponse.json(
        { error: "Módulo não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(modulo)
  } catch (error) {
    console.error("Erro ao buscar módulo:", error)
    return NextResponse.json(
      { error: "Erro ao buscar módulo" },
      { status: 500 }
    )
  }
}

// DELETE - Excluir módulo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Buscar módulo para saber o projeto
    const modulo = await prisma.modulo.findUnique({
      where: { id },
      select: { projetoId: true }
    })

    if (!modulo) {
      return NextResponse.json(
        { error: "Módulo não encontrado" },
        { status: 404 }
      )
    }

    // Excluir módulo (peças são excluídas automaticamente via cascade)
    await prisma.modulo.delete({
      where: { id }
    })

    // Recalcular totais do projeto
    const todosModulos = await prisma.modulo.findMany({
      where: { projetoId: modulo.projetoId }
    })

    const custoMateriais = todosModulos.reduce((acc, m) => acc + m.custoTotal * m.quantidade, 0)

    await prisma.projeto.update({
      where: { id: modulo.projetoId },
      data: {
        custoMateriais,
        custoTotal: custoMateriais
      }
    })

    return NextResponse.json({ message: "Módulo excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir módulo:", error)
    return NextResponse.json(
      { error: "Erro ao excluir módulo" },
      { status: 500 }
    )
  }
}

// PUT - Atualizar módulo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const modulo = await prisma.modulo.update({
      where: { id },
      data: body,
      include: {
        pecas: {
          include: { chapa: true }
        }
      }
    })

    return NextResponse.json(modulo)
  } catch (error) {
    console.error("Erro ao atualizar módulo:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar módulo" },
      { status: 500 }
    )
  }
}
