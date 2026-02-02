import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Buscar projeto por ID com todos os dados
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const projeto = await prisma.projeto.findUnique({
      where: { id },
      include: {
        cliente: true,
        modulos: {
          include: {
            pecas: {
              include: {
                chapa: true
              }
            }
          },
          orderBy: { ordem: "asc" }
        },
        acessorios: {
          include: {
            acessorio: true
          }
        }
      }
    })

    if (!projeto) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(projeto)
  } catch (error) {
    console.error("Erro ao buscar projeto:", error)
    return NextResponse.json(
      { error: "Erro ao buscar projeto" },
      { status: 500 }
    )
  }
}

// PUT - Atualizar projeto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      nome,
      ambiente,
      status,
      observacoes,
      metodoPrecificacao,
      custoMateriais,
      custoAcessorios,
      custoTotal,
      valorVenda,
      lucro,
      dataAprovacao,
      dataPrevisao,
      dataEntrega
    } = body

    const projeto = await prisma.projeto.update({
      where: { id },
      data: {
        nome,
        ambiente,
        status,
        observacoes,
        metodoPrecificacao,
        custoMateriais,
        custoAcessorios,
        custoTotal,
        valorVenda,
        lucro,
        dataAprovacao: dataAprovacao ? new Date(dataAprovacao) : null,
        dataPrevisao: dataPrevisao ? new Date(dataPrevisao) : null,
        dataEntrega: dataEntrega ? new Date(dataEntrega) : null
      },
      include: {
        cliente: true,
        modulos: true
      }
    })

    return NextResponse.json(projeto)
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar projeto" },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar parcialmente o projeto
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const projeto = await prisma.projeto.update({
      where: { id },
      data: body,
      include: {
        cliente: true,
        modulos: true
      }
    })

    return NextResponse.json(projeto)
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar projeto" },
      { status: 500 }
    )
  }
}

// DELETE - Excluir projeto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Primeiro exclui os módulos e peças relacionados
    await prisma.projeto.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Projeto excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir projeto:", error)
    return NextResponse.json(
      { error: "Erro ao excluir projeto" },
      { status: 500 }
    )
  }
}
