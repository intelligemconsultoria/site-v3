import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Filter, 
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Edit
} from "lucide-react";
import { meetingService, type MeetingRequest } from "../services/meetingServiceCompat";
import { toast } from "sonner";

interface MeetingsDashboardProps {
  onBack: () => void;
}

export function MeetingsDashboard({ onBack }: MeetingsDashboardProps) {
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<MeetingRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [solutionFilter, setSolutionFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    filterMeetings();
  }, [meetings, searchTerm, statusFilter, solutionFilter]);

  const loadMeetings = async () => {
    try {
      const allMeetings = await meetingService.getAllMeetingRequestsAsync();
      const meetingStats = await meetingService.getMeetingStatsAsync();
      
      setMeetings(allMeetings);
      setStats(meetingStats);
    } catch (error) {
      console.error('Erro ao carregar reuniões:', error);
      toast.error('Erro ao carregar reuniões');
    }
  };

  const filterMeetings = () => {
    let filtered = meetings;

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.status === statusFilter);
    }

    // Filtro por solução
    if (solutionFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.interested_solution === solutionFilter);
    }

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(meeting =>
        meeting.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por data mais recente
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredMeetings(filtered);
  };

  const handleStatusUpdate = async (meetingId: string, newStatus: MeetingRequest['status']) => {
    try {
      await meetingService.updateMeetingStatus(meetingId, newStatus);
      loadMeetings();
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
      case 'confirmed': return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'completed': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
      case 'cancelled': return 'bg-red-400/10 text-red-400 border-red-400/20';
      case 'no_show': return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
      default: return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
    }
  };

  const getSolutionColor = (solution: string) => {
    switch (solution) {
      case 'GemFlow': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
      case 'GemInsights': return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'GemMind': return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
      default: return 'bg-gradient-to-r from-emerald-400/10 via-blue-400/10 to-purple-400/10 text-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack}>
                ← Voltar
              </Button>
              <div>
                <h1 className="text-2xl">Dashboard de Reuniões</h1>
                <p className="text-foreground/60">Gerencie todas as solicitações de reunião</p>
              </div>
            </div>
            <Button onClick={loadMeetings}>
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="meetings">Reuniões</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Total de Reuniões</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Todas as solicitações
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Pendentes</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.pending || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando confirmação
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Confirmadas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.confirmed || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Reuniões marcadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Concluídas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.completed || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Reuniões realizadas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Reuniões Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Reuniões Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meetings.slice(0, 5).map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getSolutionColor(meeting.interested_solution)}`}>
                          {getStatusIcon(meeting.status)}
                        </div>
                        <div>
                          <p className="font-medium">{meeting.contact_name}</p>
                          <p className="text-sm text-foreground/60">{meeting.company}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(meeting.status)}>
                          {meeting.status}
                        </Badge>
                        <p className="text-xs text-foreground/60 mt-1">
                          {new Date(meeting.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <Input
                      placeholder="Buscar por nome, email ou empresa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmada</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                      <SelectItem value="no_show">Não compareceu</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={solutionFilter} onValueChange={setSolutionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Solução" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Soluções</SelectItem>
                      <SelectItem value="GemFlow">GemFlow</SelectItem>
                      <SelectItem value="GemInsights">GemInsights</SelectItem>
                      <SelectItem value="GemMind">GemMind</SelectItem>
                      <SelectItem value="All">Todas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Reuniões */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Reuniões ({filteredMeetings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMeetings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                      <p className="text-foreground/60">Nenhuma reunião encontrada</p>
                    </div>
                  ) : (
                    filteredMeetings.map((meeting) => (
                      <div key={meeting.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-semibold">{meeting.contact_name}</h3>
                              <p className="text-sm text-foreground/60">{meeting.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getSolutionColor(meeting.interested_solution)}>
                              {meeting.interested_solution}
                            </Badge>
                            <Badge className={getStatusColor(meeting.status)}>
                              {meeting.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-foreground/60">Empresa</p>
                            <p className="text-sm">{meeting.company}</p>
                          </div>
                          <div>
                            <p className="text-xs text-foreground/60">Tipo de Reunião</p>
                            <p className="text-sm capitalize">{meeting.meeting_type}</p>
                          </div>
                          <div>
                            <p className="text-xs text-foreground/60">Horário Preferido</p>
                            <p className="text-sm">
                              {new Date(meeting.preferred_time).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        {meeting.specific_challenges && (
                          <div className="mb-4">
                            <p className="text-xs text-foreground/60 mb-1">Desafios Específicos</p>
                            <p className="text-sm bg-muted/30 p-2 rounded">
                              {meeting.specific_challenges}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-foreground/60">
                            Origem: {meeting.source_page} • Criado em {new Date(meeting.created_at).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex gap-2">
                            {meeting.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(meeting.id!, 'confirmed')}
                                  className="bg-blue-400 hover:bg-blue-500 text-white"
                                >
                                  Confirmar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(meeting.id!, 'cancelled')}
                                >
                                  Cancelar
                                </Button>
                              </>
                            )}
                            {meeting.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(meeting.id!, 'completed')}
                                className="bg-emerald-400 hover:bg-emerald-500 text-white"
                              >
                                Marcar como Concluída
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Por Solução */}
              <Card>
                <CardHeader>
                  <CardTitle>Reuniões por Solução</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.bySolution || {}).map(([solution, count]) => (
                      <div key={solution} className="flex items-center justify-between">
                        <Badge className={getSolutionColor(solution)}>
                          {solution}
                        </Badge>
                        <span className="font-semibold">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Por Fonte */}
              <Card>
                <CardHeader>
                  <CardTitle>Reuniões por Origem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.bySource || {}).map(([source, count]) => (
                      <div key={source} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{source.replace('-', ' ')}</span>
                        <span className="font-semibold">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}