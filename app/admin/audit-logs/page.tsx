/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuditLog {
  id: string;
  createdAt: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  metadata: any;
  ipAddress: string;
  userAgent: string;
  isSensitive: boolean;
  isDataAccess: boolean;
  user: {
    id: string;
    email: string;
    nomeCompleto: string;
    role: string;
  };
}

interface Filters {
  userId: string;
  action: string;
  startDate: string;
  endDate: string;
  isSensitive: string;
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [users, setUsers] = useState<Array<{ id: string; nomeCompleto: string; email: string }>>([]);

  const [filters, setFilters] = useState<Filters>({
    userId: '',
    action: '',
    startDate: '',
    endDate: '',
    isSensitive: '',
  });

  // Verificar se é admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Carregar usuários para o filtro
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/medicos');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.medicos || []);
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };

    if (session?.user?.role === 'admin') {
      fetchUsers();
    }
  }, [session]);

  // Carregar logs
  useEffect(() => {
    const fetchLogs = async () => {
      if (session?.user?.role !== 'admin') return;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          ...(filters.userId && { userId: filters.userId }),
          ...(filters.action && { action: filters.action }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
          ...(filters.isSensitive && { isSensitive: filters.isSensitive }),
        });

        const response = await fetch(`/api/admin/audit-logs?${params}`);

        if (response.ok) {
          const data = await response.json();
          setLogs(data.data);
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.totalCount);
        } else {
          console.error('Erro ao carregar logs');
        }
      } catch (error) {
        console.error('Erro ao carregar logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [session, page, filters]);

  const handleExportCSV = () => {
    const params = new URLSearchParams({
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.action && { action: filters.action }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      ...(filters.isSensitive && { isSensitive: filters.isSensitive }),
    });

    window.open(`/api/admin/audit-logs/export?${params}`, '_blank');
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset para primeira página ao filtrar
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'patient.created': 'Paciente Criado',
      'patient.updated': 'Paciente Atualizado',
      'patient.viewed': 'Paciente Visualizado',
      'export.dataset': 'Export Dataset',
      'export.research': 'Export Pesquisa',
      'consent.signed': 'Consentimento Assinado',
      'followup.analyzed': 'Follow-up Analisado',
      'user.registered': 'Usuário Registrado',
      'template.created': 'Template Criado',
      'protocol.created': 'Protocolo Criado',
      'research.created': 'Pesquisa Criada',
    };
    return labels[action] || action;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Logs de Auditoria</h1>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Usuário</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
            >
              <option value="">Todos</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nomeCompleto} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ação</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="">Todas</option>
              <option value="patient.created">Paciente Criado</option>
              <option value="patient.updated">Paciente Atualizado</option>
              <option value="patient.viewed">Paciente Visualizado</option>
              <option value="export.dataset">Export Dataset</option>
              <option value="export.research">Export Pesquisa</option>
              <option value="consent.signed">Consentimento Assinado</option>
              <option value="followup.analyzed">Follow-up Analisado</option>
              <option value="user.registered">Usuário Registrado</option>
              <option value="template.created">Template Criado</option>
              <option value="protocol.created">Protocolo Criado</option>
              <option value="research.created">Pesquisa Criada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Dados Sensíveis</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.isSensitive}
              onChange={(e) => handleFilterChange('isSensitive', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="true">Apenas Sensíveis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data Início</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data Fim</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExportCSV}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <p className="text-sm text-gray-600">
          Total de registros: <span className="font-semibold">{totalCount}</span>
        </p>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.user.nomeCompleto}</div>
                    <div className="text-sm text-gray-500">{log.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      {log.isSensitive && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Sensível
                        </span>
                      )}
                      {log.isDataAccess && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Acesso
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Página <span className="font-medium">{page}</span> de{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Próxima
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
