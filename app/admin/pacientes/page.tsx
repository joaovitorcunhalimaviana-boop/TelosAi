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
import { getSurgeryTypeLabel } from "@/lib/constants/surgery-types";

interface Paciente {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  age: number | null;
  sex: string | null;
  isActive: boolean;
  createdAt: string;
  medico: {
    id: string;
    nomeCompleto: string;
    email: string;
  };
  lastSurgery: {
    id: string;
    type: string;
    date: string;
    status: string;
    dataCompleteness: number;
  } | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 20;

export default function PacientesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [surgeryTypeFilter, setSurgeryTypeFilter] = useState("all");
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalCount: 0,
    totalPages: 0,
  });

  // Get page from URL query params
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const loadPacientes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        surgeryType: surgeryTypeFilter,
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      const res = await fetch(`/api/admin/pacientes?${params}`);
      const result = await res.json();

      if (res.ok) {
        setPacientes(result.data);
        setPagination(result.pagination);
      } else {
        console.error("Error loading pacientes:", result.error);
      }
    } catch (error) {
      console.error("Error loading pacientes:", error);
    } finally {
      setLoading(false);
    }
  }, [search, surgeryTypeFilter, currentPage]);

  useEffect(() => {
    loadPacientes();
  }, [loadPacientes]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/pacientes?${params.toString()}`);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.push(`/admin/pacientes?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, surgeryTypeFilter]);

  const handleExport = async (format: "csv" | "excel") => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/pacientes/export?format=${format}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pacientes-${new Date().toISOString().split("T")[0]}.${format === "csv" ? "csv" : "xlsx"
        }`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting:", error);
    } finally {
      setExporting(false);
    }
  };

  const columns: Column<Paciente>[] = [
    {
      key: "name",
      label: "Nome",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{row.phone}</div>
        </div>
      ),
    },
    {
      key: "age",
      label: "Idade/Sexo",
      render: (value, row) => (
        <div className="text-sm">
          {value || "N/A"} anos
          {row.sex && (
            <div className="text-xs text-gray-500">
              {row.sex === "Masculino" ? "M" : row.sex === "Feminino" ? "F" : row.sex}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "lastSurgery",
      label: "Cirurgia",
      sortable: false,
      render: (value) => {
        if (!value) {
          return (
            <Badge variant="secondary" className="text-xs">
              Sem cirurgia
            </Badge>
          );
        }
        return (
          <div>
            <Badge variant="default" className="text-xs">
              {getSurgeryTypeLabel(value.type)}
            </Badge>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(value.date).toLocaleDateString("pt-BR")}
            </div>
          </div>
        );
      },
    },
    {
      key: "medico",
      label: "Médico Responsável",
      sortable: false,
      render: (value) => (
        <div>
          <div className="font-medium text-sm">{value.nomeCompleto}</div>
          <div className="text-xs text-gray-500">{value.email}</div>
        </div>
      ),
    },
    {
      key: "lastSurgery",
      label: "Status/Completude",
      sortable: false,
      render: (value) => {
        if (!value) {
          return <span className="text-xs text-gray-400">N/A</span>;
        }
        return (
          <div>
            <Badge
              variant={value.status === "active" ? "default" : "secondary"}
              className={
                value.status === "active"
                  ? "bg-green-500 hover:bg-green-600 text-xs"
                  : "text-xs"
              }
            >
              {value.status === "active" ? "Ativo" : value.status}
            </Badge>
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${value.dataCompleteness >= 80
                      ? "bg-green-500"
                      : value.dataCompleteness >= 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                      }`}
                    style={{ width: `${value.dataCompleteness}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">
                  {value.dataCompleteness}%
                </span>
              </div>
            </div>
          </div>
        );
      },
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
    <div className="min-h-screen telos-gradient">
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
                Gerenciar Pacientes
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Visualize e exporte dados de todos os pacientes cadastrados
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
                  placeholder="Buscar por nome, telefone ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro de Tipo de Cirurgia */}
              <Select
                value={surgeryTypeFilter}
                onValueChange={(value) => setSurgeryTypeFilter(value)}
              >
                <SelectTrigger className="md:w-56">
                  <SelectValue placeholder="Tipo de cirurgia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="hemorroidectomia">Hemorroidectomia</SelectItem>
                  <SelectItem value="fistula">Fístula</SelectItem>
                  <SelectItem value="fissura">Fissura</SelectItem>
                  <SelectItem value="pilonidal">Pilonidal</SelectItem>
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
              <div className="text-sm text-gray-600">Total de Pacientes</div>
              <div className="text-2xl font-bold text-blue-600">
                {pagination.totalCount}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">Pacientes Ativos</div>
              <div className="text-2xl font-bold text-green-600">
                {pacientes.filter((p) => p.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">Com Cirurgia</div>
              <div className="text-2xl font-bold text-purple-600">
                {pacientes.filter((p) => p.lastSurgery !== null).length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">Completude Média</div>
              <div className="text-2xl font-bold text-yellow-600">
                {pacientes.length > 0
                  ? Math.round(
                    pacientes
                      .filter((p) => p.lastSurgery !== null)
                      .reduce(
                        (sum, p) => sum + (p.lastSurgery?.dataCompleteness || 0),
                        0
                      ) /
                    pacientes.filter((p) => p.lastSurgery !== null).length || 1
                  )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando pacientes...</p>
            </div>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={pacientes}
              keyField="id"
            />

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-2">
                <div className="text-sm text-gray-600">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.totalCount)} de{" "}
                  {pagination.totalCount} pacientes
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
