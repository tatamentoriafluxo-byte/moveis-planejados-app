"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Printer, FileText, Package, Ruler, Scissors, Download } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface Peca {
  id: string
  quantidade: number
  comprimento: number
  largura: number
  funcao: string
  fitaC1: number
  fitaC2: number
  fitaL1: number
  fitaL2: number
  areaM2: number
  chapa: {
    id: string
    nome: string
    cor: string
    espessura: number
  } | null
  modulo: {
    nome: string
    quantidade: number
    projeto: {
      nome: string
      cliente: { nome: string }
    }
  }
}

interface Projeto {
  id: string
  nome: string
  cliente: { nome: string }
  status: string
}

interface PecaAgrupada {
  chapaId: string
  chapaNome: string
  chapaCor: string
  chapaEspessura: number
  pecas: Array<{
    funcao: string
    comprimento: number
    largura: number
    quantidade: number
    fitaC1: boolean
    fitaC2: boolean
    fitaL1: boolean
    fitaL2: boolean
    moduloNome: string
    projetoNome: string
  }>
  totalPecas: number
  totalArea: number
}

export default function PlanoDeCorte() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>("todos")
  const [pecas, setPecas] = useState<Peca[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjetos()
  }, [])

  useEffect(() => {
    fetchPecas()
  }, [projetoSelecionado])

  const fetchProjetos = async () => {
    try {
      const res = await fetch("/api/projetos?status=aprovado,producao")
      if (res.ok) {
        setProjetos(await res.json())
      }
    } catch (error) {
      console.error("Erro ao carregar projetos:", error)
    }
  }

  const fetchPecas = async () => {
    setLoading(true)
    try {
      const url = projetoSelecionado && projetoSelecionado !== "todos"
        ? `/api/plano-corte?projetoId=${projetoSelecionado}`
        : "/api/plano-corte"
      const res = await fetch(url)
      if (res.ok) {
        setPecas(await res.json())
      }
    } catch (error) {
      console.error("Erro ao carregar peças:", error)
    } finally {
      setLoading(false)
    }
  }

  // Agrupar peças por chapa
  const pecasAgrupadas: PecaAgrupada[] = pecas.reduce((acc, peca) => {
    if (!peca.chapa) return acc

    let grupo = acc.find(g => g.chapaId === peca.chapa!.id)
    if (!grupo) {
      grupo = {
        chapaId: peca.chapa.id,
        chapaNome: peca.chapa.nome,
        chapaCor: peca.chapa.cor,
        chapaEspessura: peca.chapa.espessura,
        pecas: [],
        totalPecas: 0,
        totalArea: 0
      }
      acc.push(grupo)
    }

    const qtdTotal = peca.quantidade * peca.modulo.quantidade
    grupo.pecas.push({
      funcao: peca.funcao,
      comprimento: peca.comprimento,
      largura: peca.largura,
      quantidade: qtdTotal,
      fitaC1: peca.fitaC1 > 0,
      fitaC2: peca.fitaC2 > 0,
      fitaL1: peca.fitaL1 > 0,
      fitaL2: peca.fitaL2 > 0,
      moduloNome: peca.modulo.nome,
      projetoNome: peca.modulo.projeto.nome
    })
    grupo.totalPecas += qtdTotal
    grupo.totalArea += peca.areaM2 * qtdTotal

    return acc
  }, [] as PecaAgrupada[])

  // Ordenar peças dentro de cada grupo por dimensão (otimização básica)
  pecasAgrupadas.forEach(grupo => {
    grupo.pecas.sort((a, b) => {
      // Ordenar por área decrescente (peças maiores primeiro)
      const areaA = a.comprimento * a.largura
      const areaB = b.comprimento * b.largura
      return areaB - areaA
    })
  })

  const totalGeralPecas = pecasAgrupadas.reduce((acc, g) => acc + g.totalPecas, 0)
  const totalGeralArea = pecasAgrupadas.reduce((acc, g) => acc + g.totalArea, 0)

  // Calcular metros lineares de fita
  const calcularFita = () => {
    let totalFita = 0
    pecas.forEach(peca => {
      const qtd = peca.quantidade * peca.modulo.quantidade
      if (peca.fitaC1 > 0) totalFita += (peca.comprimento / 1000) * qtd
      if (peca.fitaC2 > 0) totalFita += (peca.comprimento / 1000) * qtd
      if (peca.fitaL1 > 0) totalFita += (peca.largura / 1000) * qtd
      if (peca.fitaL2 > 0) totalFita += (peca.largura / 1000) * qtd
    })
    return totalFita
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <Header title="Plano de Corte" />
      <div className="p-6 space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between print:hidden">
          <div className="flex gap-4">
            <Select value={projetoSelecionado} onValueChange={setProjetoSelecionado}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os projetos aprovados</SelectItem>
                {projetos.map((projeto) => (
                  <SelectItem key={projeto.id} value={projeto.id}>
                    {projeto.nome} - {projeto.cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 print:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total de Peças</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGeralPecas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Área Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalGeralArea, 2)} m²</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Tipos de Chapa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pecasAgrupadas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Fita de Borda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(calcularFita(), 1)} m</div>
            </CardContent>
          </Card>
        </div>

        {/* Cut List by Material */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Carregando plano de corte...
            </CardContent>
          </Card>
        ) : pecasAgrupadas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Scissors className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma peça para cortar</p>
              <p className="text-sm mt-2">
                Adicione módulos a um projeto aprovado para gerar o plano de corte.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pecasAgrupadas.map((grupo) => (
              <Card key={grupo.chapaId} className="break-inside-avoid">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {grupo.chapaNome} - {grupo.chapaCor}
                      <Badge variant="secondary">{grupo.chapaEspessura}mm</Badge>
                    </CardTitle>
                    <div className="text-sm text-gray-500">
                      {grupo.totalPecas} peças | {formatNumber(grupo.totalArea, 2)} m²
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead className="text-right">Comp. (mm)</TableHead>
                        <TableHead className="text-right">Larg. (mm)</TableHead>
                        <TableHead className="text-center">Qtd</TableHead>
                        <TableHead className="text-center">C1</TableHead>
                        <TableHead className="text-center">C2</TableHead>
                        <TableHead className="text-center">L1</TableHead>
                        <TableHead className="text-center">L2</TableHead>
                        <TableHead>Módulo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grupo.pecas.map((peca, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-gray-400">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{peca.funcao}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(peca.comprimento, 0)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(peca.largura, 0)}
                          </TableCell>
                          <TableCell className="text-center font-bold">{peca.quantidade}</TableCell>
                          <TableCell className="text-center">
                            {peca.fitaC1 ? <Badge variant="info">✓</Badge> : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {peca.fitaC2 ? <Badge variant="info">✓</Badge> : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {peca.fitaL1 ? <Badge variant="info">✓</Badge> : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {peca.fitaL2 ? <Badge variant="info">✓</Badge> : "-"}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {peca.moduloNome}
                            <br />
                            <span className="text-xs">{peca.projetoNome}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Legend */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="text-sm">Legenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <p><strong>C1, C2</strong> - Fita de borda no comprimento (lado maior)</p>
                <p><strong>L1, L2</strong> - Fita de borda na largura (lado menor)</p>
              </div>
              <div>
                <p><strong>Comp.</strong> - Comprimento da peça em milímetros</p>
                <p><strong>Larg.</strong> - Largura da peça em milímetros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
