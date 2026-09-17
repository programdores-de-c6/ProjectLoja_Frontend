import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import DataTable from '@/components/common/DataTable';
import ModalForm from '@/components/forms/ModalForm';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { useLocationService, Location, LocationFormData } from './LocationService';
import LocationForm, { LocationFormRef } from './LocationForm';

const LocationsPage: React.FC = () => {

  // ====================================================
  // ESTADOS
  // ====================================================

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [currentLocation, setCurrentLocation] = useState<LocationFormData>({
    nome: '',
    sigla: '',
    distritoid: ''
   
  });

  const [deleteLocation, setDeleteLocation] = useState<Location | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formRef = useRef<LocationFormRef>(null);
  const { listar, criar, editar, deletar } = useLocationService();

  // ====================================================
  // CARREGAR LOCALIDADES
  // ====================================================

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setLocations(data);
    } catch {
      showErrorToast('Erro ao carregar localidades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // ====================================================
  // CRIAR
  // ====================================================

  const handleCreate = () => {
    setCurrentLocation({ nome: '', sigla: '', distritoid: '' });
    setIsEditMode(false);
    setModalOpen(true);
  };

  // ====================================================
  // EDITAR
  // ====================================================

  const handleEdit = useCallback((location: Location) => {
    
    setCurrentLocation({
      id: location.id,
      nome: location.nome,
      sigla: location.sigla,
     distritoid: String(location.distritoid?? '')
    });

    setIsEditMode(true);
    setModalOpen(true);
  }, []);

  // ====================================================
  // FECHAR MODAL
  // ====================================================

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // ====================================================
  // EXCLUIR
  // ====================================================

  const handleDeleteClick = useCallback((location: Location) => {
    setDeleteLocation(location);
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteLocation) return;

    try {
      await deletar(deleteLocation.id);
      showSuccessToast('Localidade excluída com sucesso!');
      fetchLocations();
    } catch {
      showErrorToast('Erro ao excluir localidade.');
    } finally {
      setShowDeleteDialog(false);
      setDeleteLocation(null);
    }
  };

  // ====================================================
  // SALVAR (CRIAR / EDITAR)
  // ====================================================

  const handleSubmit = async () => {

    if (!formRef.current) return;

    const isValid = await formRef.current.trigger();
    console.log('Formulário válido:', isValid);
    
    if (!isValid) {
      showErrorToast('Por favor, corrija os erros no formulário.'+ isValid );
      return;
    }

    const data = formRef.current.getValues();
    setFormLoading(true);

    try {
      if (isEditMode && data.id) {
        await editar(data);
        showSuccessToast(`Localidade "${data.nome}" atualizada com sucesso!`);
      } else {
        await criar(data);
        showSuccessToast(`Localidade "${data.nome}" criada com sucesso!`);
      }

      setModalOpen(false);
      fetchLocations();

    } catch {
      showErrorToast('Erro ao salvar localidade.');
    } finally {
      setFormLoading(false);
    }
  };
// ====================================================
// CÁLCULOS DE RESUMO (SUMMARY)
// ====================================================
const summary = useMemo(() => {
  const total = locations.length;

  // Distritos únicos
  const uniqueDistricts = new Set(
    locations.map(l => l.nomedistrito).filter(Boolean)
  ).size;

  // Com sigla
  const withSigla = locations.filter(l => l.sigla && l.sigla !== '').length;

  // Sem sigla
  const withoutSigla = total - withSigla;

  return {
    total,
    uniqueDistricts,
    withSigla,
    withoutSigla
  };
}, [locations]);
  // ====================================================
  // COLUNAS
  // ====================================================

  const columns = useMemo(() => [
    { 
      key: 'nome' as keyof Location, 
      label: 'Nome', 
      sortable: true,
      render: (value: string | number | boolean | null | undefined) =>
        <div className="font-medium">{value}</div>
    },
    { 
      key: 'sigla' as keyof Location, 
      label: 'Sigla', 
      sortable: true 
    },
    { 
      key: 'nomedistrito' as keyof Location, 
      label: 'Distrito' 
    }
  ], []);

  const actions = useMemo(() => [
    { 
      label: 'Editar', 
      icon: Edit, 
      onClick: (row: Record<string, string | number | boolean | null | undefined>) =>
        handleEdit(row as unknown as Location) 
    },
    { 
      label: 'Excluir', 
      icon: Trash2, 
      variant: 'destructive' as const,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) =>
        handleDeleteClick(row as unknown as Location) 
    },
  ], [handleEdit, handleDeleteClick]);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MapPin className="h-8 w-8" />
          Localidades
        </h1>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Localidade
        </Button>
      </div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

  {/* Total */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Total de Localidades</p>
          <h3 className="text-2xl font-bold">{summary.total}</h3>
        </div>
        <MapPin className="h-6 w-6 text-primary" />
      </div>
    </CardContent>
  </Card>

  {/* Distritos */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Distritos</p>
          <h3 className="text-2xl font-bold">{summary.uniqueDistricts}</h3>
        </div>
        <MapPin className="h-6 w-6 text-blue-600" />
      </div>
    </CardContent>
  </Card>

  {/* Com Sigla */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Com Sigla</p>
          <h3 className="text-2xl font-bold">{summary.withSigla}</h3>
        </div>
        <MapPin className="h-6 w-6 text-green-600" />
      </div>
    </CardContent>
  </Card>

  {/* Sem Sigla */}
  {/*  
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Sem Sigla</p>
          <h3 className="text-2xl font-bold">{summary.withoutSigla}</h3>
        </div>
        <MapPin className="h-6 w-6 text-red-600" />
      </div>
    </CardContent>
  </Card>
*/}
</div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Localidades</CardTitle>
          <CardDescription>
            {locations.length} localidade(s) encontrada(s)
          </CardDescription>
        </CardHeader>

        <CardContent>
          <DataTable
            data={locations as unknown as Record<string, string | number | boolean | null | undefined>[]}
            columns={columns}
            actions={actions}
            loading={loading}
            searchable
            searchPlaceholder="Buscar localidades..."
            emptyMessage="Nenhuma localidade encontrada."
            paginated={true}
            pageSize={5}
          />
        </CardContent>
      </Card>

      <ModalForm
      
        open={modalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? 'Editar Localidade' : 'Nova Localidade'}
        description="Preencha os dados da localidade abaixo."
        onSubmit={handleSubmit}
        loading={formLoading}
        isEditMode={isEditMode}
      >
        <LocationForm
          ref={formRef}
          initialData={currentLocation}
          isLoading={formLoading}
        />
      </ModalForm>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a localidade "{deleteLocation?.nome}"? Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={formLoading}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default LocationsPage;