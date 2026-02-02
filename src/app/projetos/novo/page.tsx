"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Save, User, Plus } from "lucide-react"
import Link from "next/link"

interface Cliente {
  id: string
  nome: string
  email: string | null
  telefone: string | null
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

export default function NovoProjetoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [formData, setFormData] = useState({
    nome: "",
    clienteId: "",
    ambiente: "",
    observacoes: ""
  })

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      const res = await fetch("/api/clientes")
      const data = await res.json()
      setClientes(data)
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clienteId) {
      alert("Selecione um cliente")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/projetos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const projeto = await res.json()
        router.push(`/projetos/${projeto.id}`)
      } else {
        alert("Erro ao criar projeto")
      }
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao criar projeto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header title="Novo Projeto" />
      <div className="p-6">
        <div className="mb-6">
          <Link href="/projetos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Projetos
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
                <label className="text-sm font-medium">Cliente *</label>
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
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{cliente.nome}</span>
                          {cliente.telefone && (
                            <span className="text-gray-400 text-xs">- {cliente.telefone}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clientes.length === 0 && (
                  <div className="text-sm text-gray-500">
                    Nenhum cliente cadastrado.{" "}
                    <Link href="/clientes/novo" className="text-blue-600 hover:underline">
                      Cadastrar cliente
                    </Link>
                  </div>
                )}
              </div>

              {/* Nome do Projeto */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Projeto *</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Cozinha Planejada - Apartamento Centro"
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

              {/* Observações */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Informações adicionais sobre o projeto..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Criar Projeto
                    </>
                  )}
                </Button>
                <Link href="/projetos">
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
