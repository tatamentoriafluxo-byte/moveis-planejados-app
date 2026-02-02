"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Plus, Pencil, Trash2, Package, Layers, Wrench } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Chapa {
  id: string
  nome: string
  espessura: number
  valorChapa: number
  larguraChapa: number
  alturaChapa: number
  custoM2ComPerda: number
}

interface Borda {
  id: string
  nome: string
  largura: number
  valorRolo: number
  metrosRolo: number
  custoMetro: number
}

interface Acessorio {
  id: string
  nome: string
  categoria: string
  descricao: string | null
  valorUnitario: number
  unidade: string
}

const categoriasAcessorios = [
  { value: "dobradica", label: "Dobradiça" },
  { value: "puxador", label: "Puxador" },
  { value: "corrediça", label: "Corrediça" },
  { value: "pistao", label: "Pistão" },
  { value: "cantoneira", label: "Cantoneira" },
  { value: "parafuso", label: "Parafuso/Bucha" },
  { value: "outro", label: "Outro" }
]

export default function MateriaisPage() {
  const [chapas, setChapas] = useState<Chapa[]>([])
  const [bordas, setBordas] = useState<Borda[]>([])
  const [acessorios, setAcessorios] = useState<Acessorio[]>([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [chapaModal, setChapaModal] = useState(false)
  const [bordaModal, setBordaModal] = useState(false)
  const [acessorioModal, setAcessorioModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Chapa | Borda | Acessorio | null>(null)

  // Form states
  const [chapaForm, setChapaForm] = useState({
    nome: "",
    espessura: "",
    valorChapa: "",
    larguraChapa: "2750",
    alturaChapa: "1850"
  })

  const [bordaForm, setBordaForm] = useState({
    nome: "",
    largura: "",
    valorRolo: "",
    metrosRolo: ""
  })

  const [acessorioForm, setAcessorioForm] = useState({
    nome: "",
    categoria: "",
    descricao: "",
    valorUnitario: "",
    unidade: "un"
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [chapasRes, bordasRes, acessoriosRes] = await Promise.all([
        fetch("/api/chapas"),
        fetch("/api/bordas"),
        fetch("/api/acessorios")
      ])

      setChapas(await chapasRes.json())
      setBordas(await bordasRes.json())
      setAcessorios(await acessoriosRes.json())
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  // CHAPAS
  const handleSaveChapa = async () => {
    try {
      const method = editingItem ? "PUT" : "POST"
      const url = editingItem ? `/api/chapas/${editingItem.id}` : "/api/chapas"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chapaForm)
      })

      setChapaModal(false)
      setEditingItem(null)
      setChapaForm({ nome: "", espessura: "", valorChapa: "", larguraChapa: "2750", alturaChapa: "1850" })
      fetchData()
    } catch (error) {
      console.error("Erro ao salvar chapa:", error)
    }
  }

  const handleEditChapa = (chapa: Chapa) => {
    setEditingItem(chapa)
    setChapaForm({
      nome: chapa.nome,
      espessura: chapa.espessura.toString(),
      valorChapa: chapa.valorChapa.toString(),
      larguraChapa: chapa.larguraChapa.toString(),
      alturaChapa: chapa.alturaChapa.toString()
    })
    setChapaModal(true)
  }

  const handleDeleteChapa = async (id: string) => {
    if (confirm("Deseja realmente excluir esta chapa?")) {
      await fetch(`/api/chapas/${id}`, { method: "DELETE" })
      fetchData()
    }
  }

  // BORDAS
  const handleSaveBorda = async () => {
    try {
      const method = editingItem ? "PUT" : "POST"
      const url = editingItem ? `/api/bordas/${editingItem.id}` : "/api/bordas"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bordaForm)
      })

      setBordaModal(false)
      setEditingItem(null)
      setBordaForm({ nome: "", largura: "", valorRolo: "", metrosRolo: "" })
      fetchData()
    } catch (error) {
      console.error("Erro ao salvar borda:", error)
    }
  }

  const handleEditBorda = (borda: Borda) => {
    setEditingItem(borda)
    setBordaForm({
      nome: borda.nome,
      largura: borda.largura.toString(),
      valorRolo: borda.valorRolo.toString(),
      metrosRolo: borda.metrosRolo.toString()
    })
    setBordaModal(true)
  }

  const handleDeleteBorda = async (id: string) => {
    if (confirm("Deseja realmente excluir esta borda?")) {
      await fetch(`/api/bordas/${id}`, { method: "DELETE" })
      fetchData()
    }
  }

  // ACESSÓRIOS
  const handleSaveAcessorio = async () => {
    try {
      const method = editingItem ? "PUT" : "POST"
      const url = editingItem ? `/api/acessorios/${editingItem.id}` : "/api/acessorios"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(acessorioForm)
      })

      setAcessorioModal(false)
      setEditingItem(null)
      setAcessorioForm({ nome: "", categoria: "", descricao: "", valorUnitario: "", unidade: "un" })
      fetchData()
    } catch (error) {
      console.error("Erro ao salvar acessório:", error)
    }
  }

  const handleEditAcessorio = (acessorio: Acessorio) => {
    setEditingItem(acessorio)
    setAcessorioForm({
      nome: acessorio.nome,
      categoria: acessorio.categoria,
      descricao: acessorio.descricao || "",
      valorUnitario: acessorio.valorUnitario.toString(),
      unidade: acessorio.unidade
    })
    setAcessorioModal(true)
  }

  const handleDeleteAcessorio = async (id: string) => {
    if (confirm("Deseja realmente excluir este acessório?")) {
      await fetch(`/api/acessorios/${id}`, { method: "DELETE" })
      fetchData()
    }
  }

  return (
    <>
      <Header title="Materiais" />
      <div className="p-6">
        <Tabs defaultValue="chapas" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="chapas" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Chapas
            </TabsTrigger>
            <TabsTrigger value="bordas" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Bordas
            </TabsTrigger>
            <TabsTrigger value="acessorios" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Acessórios
            </TabsTrigger>
          </TabsList>

          {/* CHAPAS TAB */}
          <TabsContent value="chapas">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Chapas de MDF</CardTitle>
                <Button onClick={() => { setEditingItem(null); setChapaForm({ nome: "", espessura: "", valorChapa: "", larguraChapa: "2750", alturaChapa: "1850" }); setChapaModal(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Chapa
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-center">Espessura</TableHead>
                      <TableHead className="text-center">Dimensão</TableHead>
                      <TableHead className="text-right">Valor Chapa</TableHead>
                      <TableHead className="text-right">Custo m²</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chapas.map((chapa) => (
                      <TableRow key={chapa.id}>
                        <TableCell className="font-medium">{chapa.nome}</TableCell>
                        <TableCell className="text-center">{chapa.espessura}mm</TableCell>
                        <TableCell className="text-center">{chapa.larguraChapa}x{chapa.alturaChapa}mm</TableCell>
                        <TableCell className="text-right">{formatCurrency(chapa.valorChapa)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(chapa.custoM2ComPerda)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditChapa(chapa)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteChapa(chapa.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {chapas.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Nenhuma chapa cadastrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BORDAS TAB */}
          <TabsContent value="bordas">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fitas de Borda</CardTitle>
                <Button onClick={() => { setEditingItem(null); setBordaForm({ nome: "", largura: "", valorRolo: "", metrosRolo: "" }); setBordaModal(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Borda
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-center">Largura</TableHead>
                      <TableHead className="text-right">Valor Rolo</TableHead>
                      <TableHead className="text-center">Metros/Rolo</TableHead>
                      <TableHead className="text-right">Custo/Metro</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bordas.map((borda) => (
                      <TableRow key={borda.id}>
                        <TableCell className="font-medium">{borda.nome}</TableCell>
                        <TableCell className="text-center">{borda.largura}mm</TableCell>
                        <TableCell className="text-right">{formatCurrency(borda.valorRolo)}</TableCell>
                        <TableCell className="text-center">{borda.metrosRolo}m</TableCell>
                        <TableCell className="text-right">{formatCurrency(borda.custoMetro)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditBorda(borda)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteBorda(borda.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {bordas.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Nenhuma borda cadastrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACESSÓRIOS TAB */}
          <TabsContent value="acessorios">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Acessórios e Ferragens</CardTitle>
                <Button onClick={() => { setEditingItem(null); setAcessorioForm({ nome: "", categoria: "", descricao: "", valorUnitario: "", unidade: "un" }); setAcessorioModal(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Acessório
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-center">Unidade</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acessorios.map((acessorio) => (
                      <TableRow key={acessorio.id}>
                        <TableCell className="font-medium">{acessorio.nome}</TableCell>
                        <TableCell>
                          {categoriasAcessorios.find(c => c.value === acessorio.categoria)?.label || acessorio.categoria}
                        </TableCell>
                        <TableCell className="text-gray-500">{acessorio.descricao || "-"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(acessorio.valorUnitario)}</TableCell>
                        <TableCell className="text-center">{acessorio.unidade}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditAcessorio(acessorio)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAcessorio(acessorio.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {acessorios.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Nenhum acessório cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* MODAL CHAPA */}
        <Dialog open={chapaModal} onOpenChange={setChapaModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Chapa" : "Nova Chapa"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                label="Nome"
                placeholder="Ex: Branco TX 15MM"
                value={chapaForm.nome}
                onChange={(e) => setChapaForm({ ...chapaForm, nome: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Espessura (mm)"
                  type="number"
                  placeholder="15"
                  value={chapaForm.espessura}
                  onChange={(e) => setChapaForm({ ...chapaForm, espessura: e.target.value })}
                />
                <Input
                  label="Valor da Chapa (R$)"
                  type="number"
                  step="0.01"
                  placeholder="175.00"
                  value={chapaForm.valorChapa}
                  onChange={(e) => setChapaForm({ ...chapaForm, valorChapa: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Largura Chapa (mm)"
                  type="number"
                  value={chapaForm.larguraChapa}
                  onChange={(e) => setChapaForm({ ...chapaForm, larguraChapa: e.target.value })}
                />
                <Input
                  label="Altura Chapa (mm)"
                  type="number"
                  value={chapaForm.alturaChapa}
                  onChange={(e) => setChapaForm({ ...chapaForm, alturaChapa: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSaveChapa}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL BORDA */}
        <Dialog open={bordaModal} onOpenChange={setBordaModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Borda" : "Nova Borda"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                label="Nome"
                placeholder="Ex: Branco TX 22MM"
                value={bordaForm.nome}
                onChange={(e) => setBordaForm({ ...bordaForm, nome: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Largura (mm)"
                  type="number"
                  placeholder="22"
                  value={bordaForm.largura}
                  onChange={(e) => setBordaForm({ ...bordaForm, largura: e.target.value })}
                />
                <Input
                  label="Valor do Rolo (R$)"
                  type="number"
                  step="0.01"
                  placeholder="132.14"
                  value={bordaForm.valorRolo}
                  onChange={(e) => setBordaForm({ ...bordaForm, valorRolo: e.target.value })}
                />
              </div>
              <Input
                label="Metros por Rolo"
                type="number"
                placeholder="50"
                value={bordaForm.metrosRolo}
                onChange={(e) => setBordaForm({ ...bordaForm, metrosRolo: e.target.value })}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSaveBorda}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL ACESSÓRIO */}
        <Dialog open={acessorioModal} onOpenChange={setAcessorioModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Acessório" : "Novo Acessório"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                label="Nome"
                placeholder="Ex: Dobradiça Reta com Amortecedor"
                value={acessorioForm.nome}
                onChange={(e) => setAcessorioForm({ ...acessorioForm, nome: e.target.value })}
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <Select
                  value={acessorioForm.categoria}
                  onValueChange={(value) => setAcessorioForm({ ...acessorioForm, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasAcessorios.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                label="Descrição (opcional)"
                placeholder="Ex: 35mm soft close"
                value={acessorioForm.descricao}
                onChange={(e) => setAcessorioForm({ ...acessorioForm, descricao: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Valor Unitário (R$)"
                  type="number"
                  step="0.01"
                  placeholder="5.00"
                  value={acessorioForm.valorUnitario}
                  onChange={(e) => setAcessorioForm({ ...acessorioForm, valorUnitario: e.target.value })}
                />
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade
                  </label>
                  <Select
                    value={acessorioForm.unidade}
                    onValueChange={(value) => setAcessorioForm({ ...acessorioForm, unidade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="un">Unidade</SelectItem>
                      <SelectItem value="par">Par</SelectItem>
                      <SelectItem value="metro">Metro</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="jogo">Jogo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSaveAcessorio}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
