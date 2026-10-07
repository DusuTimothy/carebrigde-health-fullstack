import React, { useEffect, useMemo, useState } from 'react';
import { Building2, BedDouble, RefreshCw } from 'lucide-react';
import { apiRequest } from '../../lib/api.js';
import Button from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Select } from '../../components/ui/Input.jsx';
import Avatar from '../../components/ui/Avatar.jsx';

const ACTIVE_STATUSES = new Set(['admitted', 'transferred']);

function PatientWardsPage() {
  const [wards, setWards] = useState([]);
  const [patients, setPatients] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [wardByPatient, setWardByPatient] = useState({});
  const [bedByPatient, setBedByPatient] = useState({});
  const [doctorByPatient, setDoctorByPatient] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [saveErrors, setSaveErrors] = useState({});

  const activeByPatient = useMemo(() => {
    const map = {};
    (admissions || []).forEach((a) => {
      if (ACTIVE_STATUSES.has(a.status)) map[a.patientId] = a;
    });
    return map;
  }, [admissions]);

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      const [wardRes, patientRes, admissionRes, doctorRes] = await Promise.all([
        apiRequest('/api/wards?withBeds=true'),
        apiRequest('/api/patients'),
        apiRequest('/api/admissions'),
        apiRequest('/api/doctors'),
      ]);
      setWards(wardRes.data || []);
      setPatients(patientRes.data || []);
      setAdmissions(admissionRes.data || []);
      setDoctors(doctorRes.data || []);

      const defaultWard = {};
      const defaultBed = {};
      (admissionRes.data || []).forEach((a) => {
        if (ACTIVE_STATUSES.has(a.status)) {
          defaultWard[a.patientId] = a.wardId;
          defaultBed[a.patientId] = a.bedId;
        }
      });
      setWardByPatient(defaultWard);
      setBedByPatient(defaultBed);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const bedsFor = (patient, wardId) => {
    if (!wardId) return [];
    const allBeds = wards.find((w) => w.id === wardId)?.beds || [];
    const currentBedId = bedByPatient[patient.id];
    return allBeds
      .filter((b) => b.status === 'available' || b.id === currentBedId)
      .sort((a, b) => String(a.bedNumber).localeCompare(String(b.bedNumber), 'en', { numeric: true }));
  };

  const canSave = (patient) => {
    const wardId = wardByPatient[patient.id] || '';
    const active = activeByPatient[patient.id];
    if (!wardId && !active) return false;
    if (!wardId && active) return true;
    const beds = bedsFor(patient, wardId);
    return beds.some((b) => b.id === (bedByPatient[patient.id] || ''));
  };

  function setWardFor(patientId, wardId) {
    setWardByPatient((current) => ({ ...current, [patientId]: wardId }));
    setBedByPatient((current) => ({ ...current, [patientId]: '' }));
  }

  async function saveAssignment(patient) {
    setSavingId(patient.id);
    setSaveErrors((current) => ({ ...current, [patient.id]: '' }));
    const wardId = wardByPatient[patient.id] || '';
    const bedId = bedByPatient[patient.id] || '';
    const active = activeByPatient[patient.id];
    try {
      if (active && !wardId) {
        await apiRequest(`/api/admissions/${active.id}/discharge`, {
          method: 'PUT',
          body: JSON.stringify({ dischargeNotes: 'Released from ward management.' }),
        });
      } else if (active) {
        await apiRequest(`/api/admissions/${active.id}/transfer`, {
          method: 'PUT',
          body: JSON.stringify({ wardId, bedId, reason: 'Ward reassignment from patient wards.' }),
        });
      } else if (wardId) {
        const payload = {
          patientId: patient.id,
          doctorId: doctorByPatient[patient.id] || doctors[0]?.id,
          wardId,
          reason: 'Admitted from patient wards.',
        };
        if (bedId) payload.bedId = bedId;
        await apiRequest('/api/admissions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await load();
    } catch (error) {
      setSaveErrors((current) => ({ ...current, [patient.id]: error.message }));
    } finally {
      setSavingId(null);
    }
  }

  const activeWards = (wards || []).filter((w) => w.status === 'active');

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Patient wards</h1>
          <p className="text-sm text-ink-secondary">Assign each patient to one active ward, or leave them unassigned.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {loadError && (
        <Card className="mt-5 border-danger-ink">
          <p role="alert" className="text-sm text-danger-ink">{loadError}</p>
          <Button className="mt-3" size="sm" onClick={load}>Try again</Button>
        </Card>
      )}

      {!loadError && loading && (
        <p className="mt-8 text-center text-sm text-ink-muted" role="status">Loading patients and wards…</p>
      )}

      {!loading && !loadError && activeWards.length === 0 && (
        <Card className="mt-5">
          <p className="text-sm text-ink-secondary">No active wards are available. Ask an administrator to configure wards.</p>
        </Card>
      )}

      {!loading && !loadError && patients.length === 0 && activeWards.length > 0 && (
        <Card className="mt-5">
          <p className="text-sm text-ink-secondary">No patient accounts are registered yet.</p>
        </Card>
      )}

      {!loading && !loadError && patients.length > 0 && (
        <div className="mt-5 space-y-3">
          {patients.map((patient) => {
            const fullName = `${patient.user?.firstName || patient.firstName || ''} ${patient.user?.lastName || patient.lastName || ''}`.trim() || 'Patient';
            const active = activeByPatient[patient.id];
            const selectedWardId = wardByPatient[patient.id] ?? '';
            const beds = bedsFor(patient, selectedWardId);
            const selectedBedId = bedByPatient[patient.id] || '';
            const hasChanges =
              selectedWardId !== (active?.wardId ?? '') ||
              selectedBedId !== (active?.bedId ?? '') ||
              !active;
            return (
              <Card key={patient.id} className="flex flex-wrap items-center gap-4">
                <Avatar name={fullName} size="md" tone="primary" />
                <div className="min-w-48 flex-1">
                  <p className="text-sm font-semibold text-ink">{fullName}</p>
                  <p className="text-xs text-ink-muted">{patient.user?.email || patient.email || ''}</p>
                  {active ? (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-secondary">
                      <BedDouble className="h-3 w-3" /> {active.ward?.name || 'Ward'} · Bed {active.bed?.bedNumber || '—'}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-ink-muted">Not admitted — not assigned to a ward.</p>
                  )}
                </div>

                <div className="flex w-full flex-wrap items-end gap-2 sm:w-auto">
                  {!active && doctors.length > 0 && (
                    <Select
                      label="Admitting doctor"
                      value={doctorByPatient[patient.id] || doctors[0]?.id || ''}
                      onChange={(event) => setDoctorByPatient((current) => ({ ...current, [patient.id]: event.target.value }))}
                      disabled={savingId === patient.id}
                      className="min-w-48"
                    >
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.firstName} {doctor.lastName}
                        </option>
                      ))}
                    </Select>
                  )}
                  <Select
                    label={`Ward for ${fullName}`}
                    value={selectedWardId}
                    onChange={(event) => setWardFor(patient.id, event.target.value)}
                    disabled={savingId === patient.id || activeWards.length === 0}
                    className="min-w-48"
                  >
                    <option value="">Unassigned</option>
                    {activeWards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.name} — {ward.wardType || 'Ward'}
                      </option>
                    ))}
                  </Select>
                  {selectedWardId && (
                    <Select
                      label={`Bed for ${fullName}`}
                      value={selectedBedId}
                      onChange={(event) => setBedByPatient((current) => ({ ...current, [patient.id]: event.target.value }))}
                      disabled={savingId === patient.id}
                      className="min-w-40"
                    >
                      {beds.length === 0 && <option value="">No beds available</option>}
                      {beds.length > 0 && <option value="">Auto-assign first available</option>}
                      {beds.map((bed) => (
                        <option key={bed.id} value={bed.id}>Bed {bed.bedNumber}</option>
                      ))}
                    </Select>
                  )}
                  <Button
                    size="sm"
                    disabled={!hasChanges || !canSave(patient) || savingId === patient.id}
                    loading={savingId === patient.id}
                    onClick={() => saveAssignment(patient)}
                  >
                    {active && !selectedWardId ? 'Discharge' : 'Save assignment'}
                  </Button>
                </div>
                {saveErrors[patient.id] && (
                  <p className="w-full text-xs text-danger-ink" role="alert">{saveErrors[patient.id]}</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default PatientWardsPage;