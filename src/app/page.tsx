import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"

async function getDashboardData() {
  const [
    totalProjetos,
    projetosOrcamento,
    projetosAprovados,
    projetosProducao,
    totalClientes,
    projetos
  ] = await Promise.all([
    prisma.projeto.count(),
    prisma.projeto.count({ where: { status: "orcamento" } }),
    prisma.projeto.count({ where: { status: "aprovado" } }),
    prisma.projeto.count({ where: { status: "producao" } }),
    prisma.cliente.count(),
    prisma.projeto.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { cliente: true }
    })
  ])

  const valorTotal = await prisma.projeto.aggregate({
    _sum: { valorVenda: true },
    where: { status: { in: ["aprovado", "producao", "montagem", "entregue"] } }
  })

  return {
    totalProjetos,
    projetosOrcamento,
    projetosAprovados,
    projetosProducao,
    totalClientes,
    valorTotal: valorTotal._sum.valorVenda || 0,
    projetosRecentes: projetos
  }
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "info" }> = {
  orcamento: { label: "Orçamento", variant: "secondary" },
  aprovado: { label: "Aprovado", variant: "success" },
  producao: { label: "Produção", variant: "info" },
  montagem: { label: "Montagem", variant: "warning" },
  entregue: { label: "Entregue", variant: "default" },
  cancelado: { label: "Cancelado", variant: "secondary" }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Projetos
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalProjetos}</div>
              <p className="text-xs text-gray-500 mt-1">
                {data.projetosOrcamento} em orçamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalClientes}</div>
              <p className="text-xs text-gray-500 mt-1">
                cadastrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Valor Aprovado
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                }).format(data.valorTotal)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                em projetos aprovados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Em Produção
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.projetosProducao}</div>
              <p className="text-xs text-gray-500 mt-1">
                projetos ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/projetos/novo">
            <Card className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Novo Projeto</h3>
                  <p className="text-sm text-gray-500">Criar orçamento</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/clientes/novo">
            <Card className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Novo Cliente</h3>
                  <p className="text-sm text-gray-500">Cadastrar cliente</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/materiais">
            <Card className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Materiais</h3>
                  <p className="text-sm text-gray-500">Gerenciar cadastros</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Projetos Recentes</CardTitle>
            <Link href="/projetos">
              <Button variant="ghost" size="sm">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.projetosRecentes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum projeto cadastrado ainda</p>
                <Link href="/projetos/novo">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar primeiro projeto
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data.projetosRecentes.map((projeto) => (
                  <Link
                    key={projeto.id}
                    href={`/projetos/${projeto.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{projeto.nome}</h4>
                        <p className="text-sm text-gray-500">
                          {projeto.cliente.nome}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                          }).format(projeto.valorVenda)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Intl.DateTimeFormat("pt-BR").format(
                            new Date(projeto.createdAt)
                          )}
                        </p>
                      </div>
                      <Badge variant={statusConfig[projeto.status]?.variant || "secondary"}>
                        {statusConfig[projeto.status]?.label || projeto.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
