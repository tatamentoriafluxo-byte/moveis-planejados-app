"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface Cliente {
  id: string
  nome: string
}

interface Projeto {
  id: string
  nome: string
  ambiente: string | null
  status: string
  observacoes: string | null
  clienteId: string
  cliente: Cliente
  margemLucro: number
  metodoPrecificacao: string
}

const ambientes = [
  "Cozinha",
  "Quarto",
  "Sala",
  "Banheiro",
  "Lavanderia",
  "Escritório",
  "Closet",
  "Área de Serviço",
  "Varanda",
  "Outro"
]

export default function EditarProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [formData, setFormData] = useState({
    nome: "",
    clienteId: "",
    ambiente: "",
    status: "orcamento",
    observacoes: "",
    margemLucro: "30",
    metodoPrecificacao: "margem"
  })

  useEffect(() => {
    fetchProjeto()
    fetchClientes()
  }, [id])

  const fetchProjeto = async () => {
    try {
      const res = await fetch(`/api/projetos/${id}`)
      if (res.ok) {
        const projeto: Projeto = await res.json()
        setFormData({
          nome: projeto.nome,
          clienteId: projeto.clienteId,
          ambiente: projeto.ambiente || "",
          status: projeto.status,
          observacoes: projeto.observacoes || "",
          margemLucro: projeto.margemLucro.toString(),
          metodoPrecificacao: projeto.metodoPrecificacao
        })
      }
    } catch (error) {
      console.error("Erro ao carregar projeto:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClientes = async () => {
    try {
      const res = await fetch("/api/clientes")
      setClientes(await res.json())
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/projetos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          margemLucro: parseFloat(formData.margemLucro)
        })
      })

      if (res.ok) {
        router.push(`/projetos/${id}`)
      } else {
        alert("Erro ao salvar projeto")
      }
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao salvar projeto")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Carregando..." />
        <div className="p-6">Carregando...</div>
      </>
    )
  }

  return (
    <>
      <Header title="Editar Projeto" />
      <div className="p-6">
        <div className="mb-6">
          <Link href={`/projetos/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Projeto
            </Button>
          </Link>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cliente */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente</label>
                <Select
                  value={formData.clienteId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, clienteId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Projeto</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>

              {/* Ambiente */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ambiente</label>
                <Select
                  value={formData.ambiente}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, ambiente: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ambiente" />
                  </SelectTrigger>
                  <SelectContent>
                    {ambientes.map((amb) => (
                      <SelectItem key={amb} value={amb}>
                        {amb}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              </div>

              {/* Margem de Lucro */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Margem de Lucro (%)</label>
                <Input
                  type="number"
                  value={formData.margemLucro}
                  onChange={(e) => setFormData(prev => ({ ...prev, margemLucro: e.target.value }))}
                  min="0"
                  max="200"
                />
              </div>

              {/* Método de Precificação */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Método de Precificação</label>
                <Select
                  value={formData.metodoPrecificacao}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, metodoPrecificacao: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="margem">Margem sobre Custo</SelectItem>
                    <SelectItem value="multiplicador">Multiplicador de Material</SelectItem>
                    <SelectItem value="m2">Preço por m²</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
                <Link href={`/projetos/${id}`}>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
