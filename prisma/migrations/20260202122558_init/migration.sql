-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metodoConstrutivo" TEXT NOT NULL DEFAULT 'A',
    "espessuraCorpo" REAL NOT NULL DEFAULT 15,
    "espessuraFundoModulo" REAL NOT NULL DEFAULT 6,
    "espessuraPorta" REAL NOT NULL DEFAULT 18,
    "espessuraTamponamento" REAL NOT NULL DEFAULT 18,
    "espessuraFundoGaveta" REAL NOT NULL DEFAULT 6,
    "margemLucro" REAL NOT NULL DEFAULT 100,
    "multiplicadorMaterial" REAL NOT NULL DEFAULT 2.8,
    "valorMetroQuadrado" REAL NOT NULL DEFAULT 945,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Chapa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "espessura" REAL NOT NULL,
    "valorChapa" REAL NOT NULL,
    "larguraChapa" REAL NOT NULL DEFAULT 2750,
    "alturaChapa" REAL NOT NULL DEFAULT 1850,
    "custoM2ComPerda" REAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Borda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "largura" REAL NOT NULL,
    "valorRolo" REAL NOT NULL,
    "metrosRolo" REAL NOT NULL,
    "custoMetro" REAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Acessorio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT,
    "valorUnitario" REAL NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ModuloTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT,
    "imagemUrl" TEXT,
    "larguraPadrao" REAL NOT NULL DEFAULT 600,
    "alturaPadrao" REAL NOT NULL DEFAULT 720,
    "profundidadePadrao" REAL NOT NULL DEFAULT 560,
    "temPortas" BOOLEAN NOT NULL DEFAULT false,
    "temGavetas" BOOLEAN NOT NULL DEFAULT false,
    "temPrateleiras" BOOLEAN NOT NULL DEFAULT false,
    "temFundo" BOOLEAN NOT NULL DEFAULT true,
    "temTravessas" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "formulasPecas" TEXT NOT NULL DEFAULT '[]'
);

-- CreateTable
CREATE TABLE "ModuloAcessorio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduloTemplateId" TEXT NOT NULL,
    "acessorioId" TEXT NOT NULL,
    "quantidade" REAL NOT NULL DEFAULT 1,
    "formulaQtd" TEXT,
    CONSTRAINT "ModuloAcessorio_moduloTemplateId_fkey" FOREIGN KEY ("moduloTemplateId") REFERENCES "ModuloTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ModuloAcessorio_acessorioId_fkey" FOREIGN KEY ("acessorioId") REFERENCES "Acessorio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "cpfCnpj" TEXT,
    "comoConheceu" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "ambiente" TEXT,
    "status" TEXT NOT NULL DEFAULT 'orcamento',
    "dataOrcamento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAprovacao" DATETIME,
    "dataPrevisao" DATETIME,
    "dataEntrega" DATETIME,
    "custoMateriais" REAL NOT NULL DEFAULT 0,
    "custoAcessorios" REAL NOT NULL DEFAULT 0,
    "custoTotal" REAL NOT NULL DEFAULT 0,
    "valorVenda" REAL NOT NULL DEFAULT 0,
    "lucro" REAL NOT NULL DEFAULT 0,
    "metodoPrecificacao" TEXT NOT NULL DEFAULT 'margem',
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Projeto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Modulo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projetoId" TEXT NOT NULL,
    "templateId" TEXT,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "largura" REAL NOT NULL,
    "altura" REAL NOT NULL,
    "profundidade" REAL NOT NULL,
    "qtdPortas" INTEGER NOT NULL DEFAULT 0,
    "qtdGavetas" INTEGER NOT NULL DEFAULT 0,
    "qtdPrateleiras" INTEGER NOT NULL DEFAULT 0,
    "dobradicasPorPorta" INTEGER NOT NULL DEFAULT 2,
    "recuoPrateleira" REAL NOT NULL DEFAULT 5,
    "avancoTamponamento" REAL NOT NULL DEFAULT 0,
    "descontoFundo" REAL NOT NULL DEFAULT 0,
    "chapaCorpoId" TEXT,
    "chapaFundoId" TEXT,
    "chapaPortaId" TEXT,
    "custoChapas" REAL NOT NULL DEFAULT 0,
    "custoBordas" REAL NOT NULL DEFAULT 0,
    "custoAcessorios" REAL NOT NULL DEFAULT 0,
    "custoTotal" REAL NOT NULL DEFAULT 0,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Modulo_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Modulo_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ModuloTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Peca" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduloId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "comprimento" REAL NOT NULL,
    "largura" REAL NOT NULL,
    "funcao" TEXT NOT NULL,
    "chapaId" TEXT,
    "fitaC1" REAL NOT NULL DEFAULT 0,
    "fitaC2" REAL NOT NULL DEFAULT 0,
    "fitaL1" REAL NOT NULL DEFAULT 0,
    "fitaL2" REAL NOT NULL DEFAULT 0,
    "areaM2" REAL NOT NULL DEFAULT 0,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Peca_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Peca_chapaId_fkey" FOREIGN KEY ("chapaId") REFERENCES "Chapa" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjetoAcessorio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projetoId" TEXT NOT NULL,
    "acessorioId" TEXT NOT NULL,
    "quantidade" REAL NOT NULL,
    "valorUnit" REAL NOT NULL,
    "valorTotal" REAL NOT NULL,
    CONSTRAINT "ProjetoAcessorio_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjetoAcessorio_acessorioId_fkey" FOREIGN KEY ("acessorioId") REFERENCES "Acessorio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HistoricoPreco" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemNome" TEXT NOT NULL,
    "precoAntigo" REAL NOT NULL,
    "precoNovo" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ModuloTemplate_codigo_key" ON "ModuloTemplate"("codigo");
