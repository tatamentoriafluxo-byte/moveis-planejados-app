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
import { Plus, FileText, User, Calendar, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Projeto {
  id: string
  nome: string
  status: string
  ambiente: string | null
  valorVenda: number
  custoTotal: number
  createdAt: string
  cliente: {
    id: string
    nome: string
  }
  modulos: Array<{ id: string }>
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "info" | "destructive" }> = {
  orcamento: { label: "Orçamento", variant: "secondary" },
  aprovado: { label: "Aprovado", variant: "success" },
  producao: { label: "Produção", variant: "info" },
  montagem: { label: "Montagem", variant: "warning" },
  entregue: { label: "Entregue", variant: "default" },
  cancelado: { label: "Cancelado", variant: "destructive" }
}

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("todos")

  useEffect(() => {
    fetchProjetos()
  }, [statusFilter])

  const fetchProjetos = async () => {
    setLoading(true)
    try {
      const url = statusFilter && statusFilter !== "todos"
        ? `/api/projetos?status=${statusFilter}`
        : "/api/projetos"
      const res = await fetch(url)
      setProjetos(await res.json())
    } catch (error) {
      console.error("Erro ao carregar projetos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este projeto?")) {
      await fetch(`/api/projetos/${id}`, { method: "DELETE" })
      fetchProjetos()
    }
  }

  return (
    <>
      <Header title="Projetos" />
      <div className="p-6 space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="orcamento">Orçamento</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="producao">Produção</SelectItem>
                <SelectItem value="montagem">Montagem</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/projetos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projetos.map((projeto) => (
            <Card key={projeto.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{projeto.nome}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <User className="h-3 w-3" />
                      {projeto.cliente.nome}
                    </div>
                  </div>
                  <Badge variant={statusConfig[projeto.status]?.variant || "secondary"}>
                    {statusConfig[projeto.status]?.label || projeto.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projeto.ambiente && (
                    <div className="text-sm text-gray-500">
                      Ambiente: {projeto.ambiente}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Módulos:</span>
                    <span className="font-medium">{projeto.modulos.length}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Custo:</span>
                    <span className="font-medium">{formatCurrency(projeto.custoTotal)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Valor Venda:</span>
                    <span className="font-medium text-green-600">{formatCurrency(projeto.valorVenda)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {formatDate(projeto.createdAt)}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Link href={`/projetos/${projeto.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                    </Link>
                    <Link href={`/projetos/${projeto.id}/editar`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(projeto.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {projetos.length === 0 && !loading && (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum projeto encontrado</p>
                  <Link href="/projetos/novo">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar primeiro projeto
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
