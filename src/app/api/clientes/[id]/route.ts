import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Buscar cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        projetos: {
          orderBy: { createdAt: "desc" }
        }
      }
    })

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error("Erro ao buscar cliente:", error)
    return NextResponse.json(
      { error: "Erro ao buscar cliente" },
      { status: 500 }
    )
  }
}

// PUT - Atualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      nome,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
      cpfCnpj,
      comoConheceu,
      observacoes
    } = body

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome,
        email,
        telefone,
        endereco,
        cidade,
        estado,
        cep,
        cpfCnpj,
        comoConheceu,
        observacoes
      }
    })

    return NextResponse.json(cliente)
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
      { status: 500 }
    )
  }
}

// DELETE - Desativar cliente (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.cliente.update({
      where: { id },
      data: { ativo: false }
    })

    return NextResponse.json({ message: "Cliente desativado com sucesso" })
  } catch (error) {
    console.error("Erro ao desativar cliente:", error)
    return NextResponse.json(
      { error: "Erro ao desativar cliente" },
      { status: 500 }
    )
  }
}
