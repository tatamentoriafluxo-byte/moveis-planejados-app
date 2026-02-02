import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Função para calcular as peças de um módulo baseado nas dimensões
function calcularPecas(modulo: {
  largura: number
  altura: number
  profundidade: number
  qtdPortas: number
  qtdPrateleiras: number
  qtdGavetas: number
  recuoPrateleira: number
  dobradicasPorPorta: number
}, espessuras: {
  corpo: number
  fundo: number
  porta: number
}) {
  const pecas: Array<{
    quantidade: number
    comprimento: number
    largura: number
    funcao: string
    fitaC1: number
    fitaC2: number
    fitaL1: number
    fitaL2: number
    tipoChapa: 'corpo' | 'fundo' | 'porta'
  }> = []

  const { largura, altura, profundidade, qtdPortas, qtdPrateleiras } = modulo
  const espCorpo = espessuras.corpo

  // Base (largura interna)
  const larguraInterna = largura - (2 * espCorpo)
  pecas.push({
    quantidade: 1,
    comprimento: larguraInterna,
    largura: profundidade,
    funcao: "Base",
    fitaC1: larguraInterna,
    fitaC2: 0,
    fitaL1: 0,
    fitaL2: 0,
    tipoChapa: 'corpo'
  })

  // Laterais (2 peças)
  pecas.push({
    quantidade: 2,
    comprimento: altura,
    largura: profundidade,
    funcao: "Lateral",
    fitaC1: altura,
    fitaC2: 0,
    fitaL1: 0,
    fitaL2: 0,
    tipoChapa: 'corpo'
  })

  // Travessas (2 peças - superior e inferior frontal)
  pecas.push({
    quantidade: 2,
    comprimento: larguraInterna,
    largura: 70, // largura padrão de travessa
    funcao: "Travessa",
    fitaC1: larguraInterna,
    fitaC2: larguraInterna,
    fitaL1: 0,
    fitaL2: 0,
    tipoChapa: 'corpo'
  })

  // Fundo
  pecas.push({
    quantidade: 1,
    comprimento: altura,
    largura: largura,
    funcao: "Fundo",
    fitaC1: 0,
    fitaC2: 0,
    fitaL1: 0,
    fitaL2: 0,
    tipoChapa: 'fundo'
  })

  // Prateleiras
  if (qtdPrateleiras > 0) {
    const larguraPrateleira = larguraInterna
    const profundidadePrateleira = profundidade - modulo.recuoPrateleira
    pecas.push({
      quantidade: qtdPrateleiras,
      comprimento: larguraPrateleira,
      largura: profundidadePrateleira,
      funcao: "Prateleira",
      fitaC1: larguraPrateleira,
      fitaC2: 0,
      fitaL1: 0,
      fitaL2: 0,
      tipoChapa: 'corpo'
    })
  }

  // Portas
  if (qtdPortas > 0) {
    // Cálculo básico: divide a largura total pelas portas
    // Desconta 3mm de folga entre portas
    const larguraPorta = (largura - ((qtdPortas - 1) * 3)) / qtdPortas
    const alturaPorta = altura - 3 // 3mm de folga
    pecas.push({
      quantidade: qtdPortas,
      comprimento: alturaPorta,
      largura: larguraPorta,
      funcao: "Porta",
      fitaC1: alturaPorta,
      fitaC2: alturaPorta,
      fitaL1: larguraPorta,
      fitaL2: larguraPorta,
      tipoChapa: 'porta'
    })
  }

  return pecas
}

// POST - Adicionar módulo ao projeto
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projetoId } = await params
    const body = await request.json()
    const {
      nome,
      quantidade,
      largura,
      altura,
      profundidade,
      qtdPortas,
      qtdGavetas,
      qtdPrateleiras,
      dobradicasPorPorta,
      recuoPrateleira,
      chapaCorpoId,
      chapaFundoId,
      chapaPortaId
    } = body

    // Buscar configurações globais (espessuras)
    let config = await prisma.configuracao.findFirst()
    if (!config) {
      config = await prisma.configuracao.create({ data: {} })
    }

    // Calcular peças
    const pecasCalculadas = calcularPecas(
      {
        largura: parseFloat(largura),
        altura: parseFloat(altura),
        profundidade: parseFloat(profundidade),
        qtdPortas: parseInt(qtdPortas) || 0,
        qtdGavetas: parseInt(qtdGavetas) || 0,
        qtdPrateleiras: parseInt(qtdPrateleiras) || 0,
        recuoPrateleira: parseFloat(recuoPrateleira) || 5,
        dobradicasPorPorta: parseInt(dobradicasPorPorta) || 2
      },
      {
        corpo: config.espessuraCorpo,
        fundo: config.espessuraFundoModulo,
        porta: config.espessuraPorta
      }
    )

    // Buscar chapas para cálculo de custo
    const [chapaCorpo, chapaFundo, chapaPorta] = await Promise.all([
      chapaCorpoId ? prisma.chapa.findUnique({ where: { id: chapaCorpoId } }) : null,
      chapaFundoId ? prisma.chapa.findUnique({ where: { id: chapaFundoId } }) : null,
      chapaPortaId ? prisma.chapa.findUnique({ where: { id: chapaPortaId } }) : null
    ])

    // Calcular custos
    let custoChapas = 0
    let custoBordas = 0

    // Buscar borda padrão (22mm)
    const bordaPadrao = await prisma.borda.findFirst({ where: { ativo: true } })

    for (const peca of pecasCalculadas) {
      // Área da peça em m²
      const areaM2 = (peca.comprimento * peca.largura) / 1000000

      // Determinar qual chapa usar
      let chapaUsada = null
      if (peca.tipoChapa === 'corpo' && chapaCorpo) chapaUsada = chapaCorpo
      else if (peca.tipoChapa === 'fundo' && chapaFundo) chapaUsada = chapaFundo
      else if (peca.tipoChapa === 'porta' && chapaPorta) chapaUsada = chapaPorta

      if (chapaUsada) {
        custoChapas += areaM2 * chapaUsada.custoM2ComPerda * peca.quantidade
      }

      // Calcular custo de bordas
      if (bordaPadrao) {
        const metrosBorda = ((peca.fitaC1 + peca.fitaC2 + peca.fitaL1 + peca.fitaL2) / 1000) * peca.quantidade
        custoBordas += metrosBorda * bordaPadrao.custoMetro
      }
    }

    const custoTotal = custoChapas + custoBordas

    // Contar módulos existentes para definir ordem
    const countModulos = await prisma.modulo.count({ where: { projetoId } })

    // Criar módulo
    const modulo = await prisma.modulo.create({
      data: {
        projetoId,
        nome,
        quantidade: parseInt(quantidade) || 1,
        largura: parseFloat(largura),
        altura: parseFloat(altura),
        profundidade: parseFloat(profundidade),
        qtdPortas: parseInt(qtdPortas) || 0,
        qtdGavetas: parseInt(qtdGavetas) || 0,
        qtdPrateleiras: parseInt(qtdPrateleiras) || 0,
        dobradicasPorPorta: parseInt(dobradicasPorPorta) || 2,
        recuoPrateleira: parseFloat(recuoPrateleira) || 5,
        chapaCorpoId,
        chapaFundoId,
        chapaPortaId,
        custoChapas,
        custoBordas,
        custoTotal,
        ordem: countModulos
      }
    })

    // Criar peças
    for (let i = 0; i < pecasCalculadas.length; i++) {
      const peca = pecasCalculadas[i]
      let chapaId = null
      if (peca.tipoChapa === 'corpo') chapaId = chapaCorpoId
      else if (peca.tipoChapa === 'fundo') chapaId = chapaFundoId
      else if (peca.tipoChapa === 'porta') chapaId = chapaPortaId

      await prisma.peca.create({
        data: {
          moduloId: modulo.id,
          quantidade: peca.quantidade,
          comprimento: peca.comprimento,
          largura: peca.largura,
          funcao: peca.funcao,
          chapaId,
          fitaC1: peca.fitaC1,
          fitaC2: peca.fitaC2,
          fitaL1: peca.fitaL1,
          fitaL2: peca.fitaL2,
          areaM2: (peca.comprimento * peca.largura) / 1000000,
          ordem: i
        }
      })
    }

    // Atualizar totais do projeto
    const todosModulos = await prisma.modulo.findMany({ where: { projetoId } })
    const custoMateriais = todosModulos.reduce((acc, m) => acc + m.custoTotal * m.quantidade, 0)

    await prisma.projeto.update({
      where: { id: projetoId },
      data: {
        custoMateriais,
        custoTotal: custoMateriais
      }
    })

    // Retornar módulo com peças
    const moduloCompleto = await prisma.modulo.findUnique({
      where: { id: modulo.id },
      include: {
        pecas: {
          include: { chapa: true }
        }
      }
    })

    return NextResponse.json(moduloCompleto, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar módulo:", error)
    return NextResponse.json(
      { error: "Erro ao criar módulo" },
      { status: 500 }
    )
  }
}
