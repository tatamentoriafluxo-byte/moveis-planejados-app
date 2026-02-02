"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Search, Phone, Mail, MapPin, FileText } from "lucide-react"
import Link from "next/link"

interface Cliente {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  cpfCnpj: string | null
  comoConheceu: string | null
  observacoes: string | null
  _count: {
    projetos: number
  }
}

const fontesOrigem = [
  { value: "indicacao", label: "Indicação" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "google", label: "Google" },
  { value: "site", label: "Site" },
  { value: "visita_loja", label: "Visita à Loja" },
  { value: "outro", label: "Outro" }
]

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    cpfCnpj: "",
    comoConheceu: "",
    observacoes: ""
  })

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async (searchTerm?: string) => {
    setLoading(true)
    try {
      const url = searchTerm ? `/api/clientes?search=${encodeURIComponent(searchTerm)}` : "/api/clientes"
      const res = await fetch(url)
      setClientes(await res.json())
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchClientes(search)
  }

  const handleSave = async () => {
    try {
      const method = editingCliente ? "PUT" : "POST"
      const url = editingCliente ? `/api/clientes/${editingCliente.id}` : "/api/clientes"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      setModalOpen(false)
      setEditingCliente(null)
      resetForm()
      fetchClientes()
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
    }
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setForm({
      nome: cliente.nome,
      email: cliente.email || "",
      telefone: cliente.telefone || "",
      endereco: cliente.endereco || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "",
      cep: cliente.cep || "",
      cpfCnpj: cliente.cpfCnpj || "",
      comoConheceu: cliente.comoConheceu || "",
      observacoes: cliente.observacoes || ""
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este cliente?")) {
      await fetch(`/api/clientes/${id}`, { method: "DELETE" })
      fetchClientes()
    }
  }

  const resetForm = () => {
    setForm({
      nome: "",
      email: "",
      telefone: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      cpfCnpj: "",
      comoConheceu: "",
      observacoes: ""
    })
  }

  const openNewModal = () => {
    setEditingCliente(null)
    resetForm()
    setModalOpen(true)
  }

  return (
    <>
      <Header title="Clientes" />
      <div className="p-6 space-y-6">
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">Buscar</Button>
          </form>
          <Button onClick={openNewModal}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes ({clientes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-center">Projetos</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cliente.nome}</p>
                        {cliente.cpfCnpj && (
                          <p className="text-xs text-gray-500">{cliente.cpfCnpj}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {cliente.telefone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {cliente.telefone}
                          </div>
                        )}
                        {cliente.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {cliente.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(cliente.cidade || cliente.estado) && (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {[cliente.cidade, cliente.estado].filter(Boolean).join(" - ")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {cliente.comoConheceu && (
                        <Badge variant="secondary">
                          {fontesOrigem.find(f => f.value === cliente.comoConheceu)?.label || cliente.comoConheceu}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={cliente._count.projetos > 0 ? "default" : "secondary"}>
                        {cliente._count.projetos}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/projetos/novo?cliente=${cliente.id}`}>
                          <Button variant="ghost" size="icon" title="Novo Projeto">
                            <FileText className="h-4 w-4 text-blue-500" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cliente)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cliente.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {clientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum cliente cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <Input
                label="Nome *"
                placeholder="Nome completo"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <Input
                label="CPF/CNPJ"
                placeholder="000.000.000-00"
                value={form.cpfCnpj}
                onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
              />

              <Input
                label="Endereço"
                placeholder="Rua, número, complemento"
                value={form.endereco}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              />

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Cidade"
                  placeholder="Cidade"
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                />
                <Input
                  label="Estado"
                  placeholder="SP"
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                />
                <Input
                  label="CEP"
                  placeholder="00000-000"
                  value={form.cep}
                  onChange={(e) => setForm({ ...form, cep: e.target.value })}
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Como nos conheceu?
                </label>
                <Select
                  value={form.comoConheceu}
                  onValueChange={(value) => setForm({ ...form, comoConheceu: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fontesOrigem.map((fonte) => (
                      <SelectItem key={fonte.value} value={fonte.value}>
                        {fonte.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Anotações sobre o cliente..."
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={!form.nome}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
