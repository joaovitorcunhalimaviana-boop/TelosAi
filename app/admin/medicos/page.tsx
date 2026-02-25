"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Search, Download, FileSpreadsheet, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Medico {
  id: string;
  nomeCompleto: string;
  whatsapp: string | null;
  email: string;
  crm: string | null;
  estado: string | null;
  plan: string;
  basePrice: number;
  additionalPatientPrice: number;
  isLifetimePrice: boolean;
  currentPatients: number;
  maxPatients: number;
  whatsappConnected: boolean;
  createdAt: string;
  billing: {
    basePrice: number;
    additionalPatients: number;
    additionalCost: number;
    totalMonthly: number;
  };
  _count: {
    patients: number;
    surgeries: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 20;

export default function MedicosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalCount: 0,
    totalPages: 0,
  });

  // Get page from URL query params
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const loadMedicos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        plan: planFilter,
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      const res = await fetch(`/api/admin/medicos?${params}`);
      const result = await res.json();

      if (res.ok) {
        setMedicos(result.data);
        setPagination(result.pagination);
      } else {
        console.error("Error loading medicos:", result.error);
      }
    } catch (error) {
      console.error("Error loading medicos:", error);
    } finally {
      setLoading(false);
    }
  }, [search, planFilter, currentPage]);

  useEffect(() => {
    loadMedicos();
  }, [loadMedicos]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/medicos?${params.toString()}`);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.push(`/admin/medicos?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, planFilter]);

  const handleExport = async (format: "csv" | "excel") => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/medicos/export?format=${format}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medicos-${new Date().toISOString().split("T")[0]}.${format === "csv" ? "csv" : "xlsx"
        }`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting:", error);
    } finally {
      setExporting(false);
    }
  };

  const columns: Column<Medico>[] = [
    {
      key: "nomeCompleto",
      label: "Nome",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      render: (value, row) => (
        <div>
          <div className="text-sm">{value || "Não informado"}</div>
          {row.whatsappConnected && (
            <Badge variant="default" className="mt-1 text-xs bg-green-500">
              Conectado
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "crm",
      label: "CRM",
      render: (value, row) => (
        <div className="text-sm">
          {value ? `${value}/${row.estado}` : "Não informado"}
        </div>
      ),
    },
    {
      key: "plan",
      label: "Plano",
      sortable: true,
      render: (value, row) => (
        <div>
          <Badge
            variant={value === "founding" ? "secondary" : "default"}
            className={
              value === "founding"
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }
          >
            {value === "founding" ? "Founding" : "Professional"}
          </Badge>
          {row.isLifetimePrice && (
            <div className="text-xs text-yellow-700 mt-1">Preço vitalício</div>
          )}
        </div>
      ),
    },
    {
      key: "currentPatients",
      label: "Pacientes",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-semibold">
            {value}/{row.maxPatients}
          </div>
          {row.billing.additionalPatients > 0 && (
            <div className="text-xs text-yellow-700">
              +{row.billing.additionalPatients} adicionais
            </div>
          )}
        </div>
      ),
    },
    {
      key: "billing",
      label: "Billing Mensal",
      sortable: false,
      render: (value) => (
        <div>
          <div className="font-bold text-blue-600">
            R$ {value.totalMonthly.toFixed(2)}
          </div>
          {value.additionalPatients > 0 && (
            <div className="text-xs text-gray-500">
              Base: R$ {value.basePrice.toFixed(2)} + R${" "}
              {value.additionalCost.toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Cadastro",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString("pt-BR")}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0E14] to-[#111520]">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-blue-900">
                Gerenciar Médicos
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Visualize e exporte dados de todos os médicos cadastrados
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Filtros */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, email ou WhatsApp..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro de Plano */}
              <Select
                value={planFilter}
                onValueChange={(value) => setPlanFilter(value)}
              >
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Filtrar por plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  <SelectItem value="founding">Founding</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>

              {/* Botões de Exportação */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExport("csv")}
                  disabled={exporting}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button
                  onClick={() => handleExport("excel")}
                  disabled={exporting}
                  variant="outline"
                  className="gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">Total de Médicos</div>
              <div className="text-2xl font-bold text-blue-600">
                {pagination.totalCount}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">Total de Pacientes</div>
              <div className="text-2xl font-bold text-green-600">
                {medicos.reduce((sum, m) => sum + m.currentPatients, 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">MRR Total</div>
              <div className="text-2xl font-bold text-purple-600">
                R${" "}
                {medicos
                  .reduce((sum, m) => sum + m.billing.totalMonthly, 0)
                  .toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">Pacientes Adicionais</div>
              <div className="text-2xl font-bold text-yellow-600">
                {medicos.reduce((sum, m) => sum + m.billing.additionalPatients, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando médicos...</p>
            </div>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={medicos}
              keyField="id"
            />

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-2">
                <div className="text-sm text-gray-600">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.totalCount)} de{" "}
                  {pagination.totalCount} médicos
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="text-sm font-medium px-3">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="gap-1"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
