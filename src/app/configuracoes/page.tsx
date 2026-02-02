"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Settings, Ruler, DollarSign } from "lucide-react"

interface Configuracao {
  id: string
  metodoConstrutivo: string
  espessuraCorpo: number
  espessuraPorta: number
  espessuraFundoModulo: number
  espessuraFundoGaveta: number
  espessuraTamponamento: number
  margemLucro: number
  multiplicadorMaterial: number
  valorMetroQuadrado: number
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<Configuracao | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/configuracoes")
      if (res.ok) {
        setConfig(await res.json())
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      })

      if (res.ok) {
        alert("Configurações salvas com sucesso!")
      } else {
        alert("Erro ao salvar configurações")
      }
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao salvar configurações")
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (field: keyof Configuracao, value: string | number) => {
    if (!config) return
    setConfig(prev => prev ? { ...prev, [field]: value } : null)
  }

  if (loading) {
    return (
      <>
        <Header title="Configurações" />
        <div className="p-6">Carregando...</div>
      </>
    )
  }

  if (!config) {
    return (
      <>
        <Header title="Configurações" />
        <div className="p-6">Erro ao carregar configurações</div>
      </>
    )
  }

  return (
    <>
      <Header title="Configurações" />
      <div className="p-6 space-y-6">
        <Tabs defaultValue="espessuras" className="space-y-6">
          <TabsList>
            <TabsTrigger value="espessuras" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Espessuras
            </TabsTrigger>
            <TabsTrigger value="precos" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Precificação
            </TabsTrigger>
          </TabsList>

          {/* Espessuras */}
          <TabsContent value="espessuras">
            <Card>
              <CardHeader>
                <CardTitle>Espessuras Padrão (mm)</CardTitle>
                <CardDescription>
                  Configure as espessuras padrão dos materiais usados na construção dos módulos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Espessura do Corpo</label>
                    <Input
                      type="number"
                      value={config.espessuraCorpo}
                      onChange={(e) => updateConfig("espessuraCorpo", parseFloat(e.target.value))}
                      min="0"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500">Base, laterais, travessas</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Espessura da Porta</label>
                    <Input
                      type="number"
                      value={config.espessuraPorta}
                      onChange={(e) => updateConfig("espessuraPorta", parseFloat(e.target.value))}
                      min="0"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500">Portas e frentes de gaveta</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Espessura do Fundo (Módulo)</label>
                    <Input
                      type="number"
                      value={config.espessuraFundoModulo}
                      onChange={(e) => updateConfig("espessuraFundoModulo", parseFloat(e.target.value))}
                      min="0"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500">Fundo dos armários</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Espessura do Fundo (Gaveta)</label>
                    <Input
                      type="number"
                      value={config.espessuraFundoGaveta}
                      onChange={(e) => updateConfig("espessuraFundoGaveta", parseFloat(e.target.value))}
                      min="0"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500">Fundo das gavetas</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Espessura do Tamponamento</label>
                    <Input
                      type="number"
                      value={config.espessuraTamponamento}
                      onChange={(e) => updateConfig("espessuraTamponamento", parseFloat(e.target.value))}
                      min="0"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500">Painéis de acabamento</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Método Construtivo Padrão</h4>
                  <div className="flex gap-4">
                    {["A", "B", "C"].map((metodo) => (
                      <button
                        key={metodo}
                        type="button"
                        className={`px-6 py-3 rounded-lg border-2 font-medium transition-colors ${
                          config.metodoConstrutivo === metodo
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => updateConfig("metodoConstrutivo", metodo)}
                      >
                        Método {metodo}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Método A: Base solta | Método B: Base encaixada | Método C: Base com cantoneira
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Precificação */}
          <TabsContent value="precos">
            <Card>
              <CardHeader>
                <CardTitle>Precificação Padrão</CardTitle>
                <CardDescription>
                  Configure os valores padrão para cálculo de orçamentos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Margem de Lucro (%)</label>
                    <Input
                      type="number"
                      value={config.margemLucro}
                      onChange={(e) => updateConfig("margemLucro", parseFloat(e.target.value))}
                      min="0"
                      max="300"
                      step="1"
                    />
                    <p className="text-xs text-gray-500">Aplicado sobre o custo total</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Multiplicador de Material</label>
                    <Input
                      type="number"
                      value={config.multiplicadorMaterial}
                      onChange={(e) => updateConfig("multiplicadorMaterial", parseFloat(e.target.value))}
                      min="1"
                      max="10"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500">Multiplica o custo dos materiais</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preço por m² (R$)</label>
                    <Input
                      type="number"
                      value={config.valorMetroQuadrado}
                      onChange={(e) => updateConfig("valorMetroQuadrado", parseFloat(e.target.value))}
                      min="0"
                      step="10"
                    />
                    <p className="text-xs text-gray-500">Valor de venda por m² de móvel</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? "Salvando..." : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
