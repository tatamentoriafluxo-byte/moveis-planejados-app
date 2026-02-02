"use client"

import { useState, useEffect, use } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  ArrowLeft,
  Plus,
  User,
  Calendar,
  FileText,
  Package,
  Pencil,
  Trash2,
  DollarSign,
  Ruler,
  ChevronDown,
  ChevronUp,
  Printer
} from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils"

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
  chapa: { nome: string; cor: string } | null
}

interface Modulo {
  id: string
  nome: string
  quantidade: number
  largura: number
  altura: number
  profundidade: number
  qtdPortas: number
  qtdGavetas: number
  qtdPrateleiras: number
  custoChapas: number
  custoBordas: number
  custoTotal: number
  pecas: Peca[]
}

interface Projeto {
  id: string
  nome: string
  status: string
  ambiente: string | null
  observacoes: string | null
  custoMateriais: number
  custoAcessorios: number
  custoMaoDeObra: number
  custoTotal: number
  margemLucro: number
  valorVenda: number
  createdAt: string
  cliente: {
    id: string
    nome: string
    email: string | null
    telefone: string | null
  }
  modulos: Modulo[]
}

interface Chapa {
  id: string
  nome: string
  cor: string
  espessura: number
  custoM2ComPerda: number
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "info" | "destructive" }> = {
  orcamento: { label: "Orçamento", variant: "secondary" },
  aprovado: { label: "Aprovado", variant: "success" },
  producao: { label: "Produção", variant: "info" },
  montagem: { label: "Montagem", variant: "warning" },
  entregue: { label: "Entregue", variant: "default" },
  cancelado: { label: "Cancelado", variant: "destructive" }
}

export default function ProjetoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [loading, setLoading] = useState(true)
  const [moduloDialogOpen, setModuloDialogOpen] = useState(false)
  const [chapas, setChapas] = useState<Chapa[]>([])
  const [expandedModulos, setExpandedModulos] = useState<Set<string>>(new Set())
  const [savingModulo, setSavingModulo] = useState(false)

  const [moduloForm, setModuloForm] = useState({
    nome: "",
    quantidade: "1",
    largura: "600",
    altura: "700",
    profundidade: "500",
    qtdPortas: "2",
    qtdGavetas: "0",
    qtdPrateleiras: "2",
    dobradicasPorPorta: "2",
    recuoPrateleira: "5",
    chapaCorpoId: "",
    chapaFundoId: "",
    chapaPortaId: ""
  })

  useEffect(() => {
    fetchProjeto()
    fetchChapas()
  }, [id])

  const fetchProjeto = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projetos/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProjeto(data)
      }
    } catch (error) {
      console.error("Erro ao carregar projeto:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChapas = async () => {
    try {
      const res = await fetch("/api/chapas")
      if (res.ok) {
        setChapas(await res.json())
      }
    } catch (error) {
      console.error("Erro ao carregar chapas:", error)
    }
  }

  const handleAddModulo = async () => {
    setSavingModulo(true)
    try {
      const res = await fetch(`/api/projetos/${id}/modulos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduloForm)
      })

      if (res.ok) {
        setModuloDialogOpen(false)
        resetModuloForm()
        fetchProjeto()
      } else {
        alert("Erro ao adicionar módulo")
      }
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao adicionar módulo")
    } finally {
      setSavingModulo(false)
    }
  }

  const handleDeleteModulo = async (moduloId: string) => {
    if (!confirm("Deseja realmente excluir este módulo?")) return

    try {
      const res = await fetch(`/api/modulos/${moduloId}`, { method: "DELETE" })
      if (res.ok) {
        fetchProjeto()
      }
    } catch (error) {
      console.error("Erro:", error)
    }
  }

  const resetModuloForm = () => {
    setModuloForm({
      nome: "",
      quantidade: "1",
      largura: "600",
      altura: "700",
      profundidade: "500",
      qtdPortas: "2",
      qtdGavetas: "0",
      qtdPrateleiras: "2",
      dobradicasPorPorta: "2",
      recuoPrateleira: "5",
      chapaCorpoId: chapas[0]?.id || "",
      chapaFundoId: chapas[0]?.id || "",
      chapaPortaId: chapas[0]?.id || ""
    })
  }

  const toggleModuloExpanded = (moduloId: string) => {
    setExpandedModulos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(moduloId)) {
        newSet.delete(moduloId)
      } else {
        newSet.add(moduloId)
      }
      return newSet
    })
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/projetos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchProjeto()
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    }
  }

  const handleUpdateValorVenda = async () => {
    const novoValor = prompt("Novo valor de venda:", projeto?.valorVenda.toString())
    if (novoValor && !isNaN(parseFloat(novoValor))) {
      try {
        const res = await fetch(`/api/projetos/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ valorVenda: parseFloat(novoValor) })
        })
        if (res.ok) {
          fetchProjeto()
        }
      } catch (error) {
        console.error("Erro:", error)
      }
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Carregando..." />
        <div className="p-6 flex items-center justify-center">
          <p>Carregando projeto...</p>
        </div>
      </>
    )
  }

  if (!projeto) {
    return (
      <>
        <Header title="Projeto não encontrado" />
        <div className="p-6">
          <Link href="/projetos">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Projetos
            </Button>
          </Link>
        </div>
      </>
    )
  }

  const lucro = projeto.valorVenda - projeto.custoTotal
  const margemReal = projeto.custoTotal > 0 ? ((lucro / projeto.custoTotal) * 100) : 0

  return (
    <>
      <Header title={projeto.nome} />
      <div className="p-6 space-y-6">
        {/* Back Button + Actions */}
        <div className="flex items-center justify-between">
          <Link href="/projetos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Link href={`/projetos/${id}/editar`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        {/* Project Info + Status */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Client Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">{projeto.cliente.nome}</p>
                  {projeto.cliente.telefone && (
                    <p className="text-sm text-gray-500">{projeto.cliente.telefone}</p>
                  )}
                  {projeto.cliente.email && (
                    <p className="text-sm text-gray-500">{projeto.cliente.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{projeto.ambiente || "Não definido"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{formatDate(projeto.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{projeto.modulos.length} módulo(s)</span>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={projeto.status} onValueChange={handleUpdateStatus}>
                <SelectTrigger>
                  <SelectValue>
                    <Badge variant={statusConfig[projeto.status]?.variant || "secondary"}>
                      {statusConfig[projeto.status]?.label || projeto.status}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orcamento">Orçamento</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="producao">Produção</SelectItem>
                  <SelectItem value="montagem">Montagem</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Custo Materiais</p>
                <p className="text-xl font-bold">{formatCurrency(projeto.custoMateriais)}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Custo Total</p>
                <p className="text-xl font-bold">{formatCurrency(projeto.custoTotal)}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 cursor-pointer" onClick={handleUpdateValorVenda}>
                <p className="text-sm text-blue-600">Valor de Venda</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(projeto.valorVenda)}</p>
                <p className="text-xs text-blue-500">Clique para editar</p>
              </div>
              <div className={`p-4 rounded-lg ${lucro >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-sm ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>Lucro</p>
                <p className={`text-xl font-bold ${lucro >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(lucro)}
                </p>
                <p className={`text-xs ${lucro >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  Margem: {formatNumber(margemReal, 1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Módulos
            </CardTitle>
            <Button onClick={() => {
              resetModuloForm()
              setModuloDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Módulo
            </Button>
          </CardHeader>
          <CardContent>
            {projeto.modulos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum módulo adicionado</p>
                <Button className="mt-4" onClick={() => {
                  resetModuloForm()
                  setModuloDialogOpen(true)
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar primeiro módulo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {projeto.modulos.map((modulo) => (
                  <div key={modulo.id} className="border rounded-lg overflow-hidden">
                    {/* Module Header */}
                    <div
                      className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                      onClick={() => toggleModuloExpanded(modulo.id)}
                    >
                      <div className="flex items-center gap-4">
                        <button className="text-gray-400">
                          {expandedModulos.has(modulo.id) ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                        <div>
                          <h4 className="font-semibold">{modulo.nome}</h4>
                          <p className="text-sm text-gray-500">
                            {modulo.largura} x {modulo.altura} x {modulo.profundidade} mm
                            {modulo.quantidade > 1 && ` (x${modulo.quantidade})`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(modulo.custoTotal * modulo.quantidade)}</p>
                          <p className="text-xs text-gray-500">{modulo.pecas.length} peças</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteModulo(modulo.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* Module Details (Expandable) */}
                    {expandedModulos.has(modulo.id) && (
                      <div className="p-4 border-t">
                        <div className="grid gap-4 md:grid-cols-3 mb-4">
                          <div className="text-sm">
                            <span className="text-gray-500">Portas:</span> {modulo.qtdPortas}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Prateleiras:</span> {modulo.qtdPrateleiras}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Gavetas:</span> {modulo.qtdGavetas}
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3 mb-4">
                          <div className="text-sm">
                            <span className="text-gray-500">Custo Chapas:</span>{" "}
                            {formatCurrency(modulo.custoChapas)}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Custo Bordas:</span>{" "}
                            {formatCurrency(modulo.custoBordas)}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Custo Unit.:</span>{" "}
                            {formatCurrency(modulo.custoTotal)}
                          </div>
                        </div>

                        {/* Pieces Table */}
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Ruler className="h-4 w-4" />
                          Lista de Peças
                        </h5>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Função</TableHead>
                              <TableHead className="text-center">Qtd</TableHead>
                              <TableHead className="text-right">Comp. (mm)</TableHead>
                              <TableHead className="text-right">Larg. (mm)</TableHead>
                              <TableHead>Material</TableHead>
                              <TableHead className="text-center">Fita C1</TableHead>
                              <TableHead className="text-center">Fita C2</TableHead>
                              <TableHead className="text-center">Fita L1</TableHead>
                              <TableHead className="text-center">Fita L2</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {modulo.pecas.map((peca) => (
                              <TableRow key={peca.id}>
                                <TableCell className="font-medium">{peca.funcao}</TableCell>
                                <TableCell className="text-center">{peca.quantidade}</TableCell>
                                <TableCell className="text-right">{formatNumber(peca.comprimento, 0)}</TableCell>
                                <TableCell className="text-right">{formatNumber(peca.largura, 0)}</TableCell>
                                <TableCell>
                                  {peca.chapa ? (
                                    <span className="text-xs">{peca.chapa.nome} ({peca.chapa.cor})</span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {peca.fitaC1 > 0 ? <Badge variant="info">S</Badge> : "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {peca.fitaC2 > 0 ? <Badge variant="info">S</Badge> : "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {peca.fitaL1 > 0 ? <Badge variant="info">S</Badge> : "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {peca.fitaL2 > 0 ? <Badge variant="info">S</Badge> : "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Module Dialog */}
        <Dialog open={moduloDialogOpen} onOpenChange={setModuloDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Módulo</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Nome e Quantidade */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Módulo *</label>
                  <Input
                    value={moduloForm.nome}
                    onChange={(e) => setModuloForm(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Armário Inferior"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantidade</label>
                  <Input
                    type="number"
                    value={moduloForm.quantidade}
                    onChange={(e) => setModuloForm(prev => ({ ...prev, quantidade: e.target.value }))}
                    min="1"
                  />
                </div>
              </div>

              {/* Dimensões */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Largura (mm)</label>
                  <Input
                    type="number"
                    value={moduloForm.largura}
                    onChange={(e) => setModuloForm(prev => ({ ...prev, largura: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Altura (mm)</label>
                  <Input
                    type="number"
                    value={moduloForm.altura}
                    onChange={(e) => setModuloForm(prev => ({ ...prev, altura: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profundidade (mm)</label>
                  <Input
                    type="number"
                    value={moduloForm.profundidade}
                    onChange={(e) => setModuloForm(prev => ({ ...prev, profundidade: e.target.value }))}
                  />
                </div>
              </div>

              {/* Portas, Prateleiras, Gavetas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Qtd. Portas</label>
                  <Input
                    type="number"
                    value={moduloForm.qtdPortas}
                    onChange={(e) => setModuloForm(prev => ({ ...prev, qtdPortas: e.target.value }))}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Qtd. Prateleiras</label>
                  <Input
                    type="number"
                    value={moduloForm.qtdPrateleiras}
                    onChange={(e) => setModuloForm(prev => ({ ...prev, qtdPrateleiras: e.target.value }))}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Qtd. Gavetas</label>
                  <Input
                    type="number"
                    value={moduloForm.qtdGavetas}
                    onChange={(e) => setModuloForm(prev => ({ ...prev, qtdGavetas: e.target.value }))}
                    min="0"
                  />
                </div>
              </div>

              {/* Chapas */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Materiais</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chapa Corpo</label>
                    <Select
                      value={moduloForm.chapaCorpoId}
                      onValueChange={(v) => setModuloForm(prev => ({ ...prev, chapaCorpoId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapas.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome} - {c.cor} ({c.espessura}mm)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chapa Fundo</label>
                    <Select
                      value={moduloForm.chapaFundoId}
                      onValueChange={(v) => setModuloForm(prev => ({ ...prev, chapaFundoId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapas.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome} - {c.cor} ({c.espessura}mm)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chapa Porta</label>
                    <Select
                      value={moduloForm.chapaPortaId}
                      onValueChange={(v) => setModuloForm(prev => ({ ...prev, chapaPortaId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapas.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome} - {c.cor} ({c.espessura}mm)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Configurações adicionais */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dobradiças por Porta</label>
                  <Input
                    type="number"
                    value={moduloForm.dobradicasPorPorta}
                    onChange={(e) => setModuloForm(prev => ({ ...prev, dobradicasPorPorta: e.target.value }))}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recuo Prateleira (mm)</label>
                  <Input
                    type="number"
                    value={moduloForm.recuoPrateleira}
                    onChange={(e) => setModuloForm(prev => ({ ...prev, recuoPrateleira: e.target.value }))}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModuloDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddModulo} disabled={savingModulo || !moduloForm.nome}>
                {savingModulo ? "Salvando..." : "Adicionar Módulo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
