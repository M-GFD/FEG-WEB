"use client";

import { useMemo, useState } from "react";
import {
  EMPADRONAMIENTO_BLOOD_GROUPS,
  EMPADRONAMIENTO_CLUBS,
  EMPADRONAMIENTO_DEPARTMENTS,
  EMPADRONAMIENTO_HEALTH_CONDITIONS,
  EMPADRONAMIENTO_PROFESSORS,
  type EmpadronamientoHealthConditionKey,
  type EmpadronamientoHealthData,
} from "@/lib/empadronamiento-menores/constants";
import {
  ageOnReferenceDate,
  categoryFromBirthDate,
  parseBirthDateInput,
} from "@/lib/empadronamiento-menores/category";
import type { ClubCodeOption } from "@/lib/empadronamiento-menores/persistence";
import { matchEnrollmentClub } from "@/lib/empadronamiento-menores/club-match";
import { checkYouthEnrollmentDni, submitYouthEnrollmentForm } from "./actions";
import { FieldLabel, FormSection, inputClassName, selectClassName } from "./form-ui";

type Props = {
  clubCodes: ClubCodeOption[];
};

const emptyHealth = (): EmpadronamientoHealthData => ({
  hasHealthInsurance: false,
  takesMedication: false,
  tetanusVaccine: null,
  conditions: {},
});

export function EmpadronamientoMenoresForm({ clubCodes }: Props) {
  const [ack, setAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dniWarning, setDniWarning] = useState<string | null>(null);

  const [responsibleName, setResponsibleName] = useState("");
  const [responsiblePhone, setResponsiblePhone] = useState("");

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState<"Varón" | "Mujer" | "">("");
  const [birthDate, setBirthDate] = useState("");
  const [dni, setDni] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [locality, setLocality] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [clubName, setClubName] = useState("");

  const [school, setSchool] = useState("");
  const [hasHandicap, setHasHandicap] = useState<boolean | null>(null);
  const [matricula, setMatricula] = useState("");
  const [professors, setProfessors] = useState<string[]>([]);
  const [professorOther, setProfessorOther] = useState("");

  const [tutor1Name, setTutor1Name] = useState("");
  const [tutor1Dni, setTutor1Dni] = useState("");
  const [tutor1Phone, setTutor1Phone] = useState("");
  const [tutor1Email, setTutor1Email] = useState("");
  const [tutor2Name, setTutor2Name] = useState("");
  const [tutor2Dni, setTutor2Dni] = useState("");
  const [tutor2Email, setTutor2Email] = useState("");

  const [health, setHealth] = useState<EmpadronamientoHealthData>(emptyHealth);
  const [comments, setComments] = useState("");

  const disabled = !ack || submitting || success;

  const clubCodeDisplay = useMemo(() => {
    if (!clubName) return "";
    return matchEnrollmentClub(clubName, clubCodes)?.code ?? "";
  }, [clubName, clubCodes]);

  const { ageDec31, category } = useMemo(() => {
    const bd = parseBirthDateInput(birthDate);
    if (!bd) return { ageDec31: null as number | null, category: "" };
    return {
      ageDec31: ageOnReferenceDate(bd),
      category: categoryFromBirthDate(bd),
    };
  }, [birthDate]);

  function toggleProfessor(name: string) {
    setProfessors((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  }

  function toggleCondition(key: EmpadronamientoHealthConditionKey) {
    setHealth((h) => ({
      ...h,
      conditions: { ...h.conditions, [key]: !h.conditions[key] },
    }));
  }

  async function handleDniBlur() {
    if (dni.replace(/\D/g, "").length < 7) {
      setDniWarning(null);
      return;
    }
    const res = await checkYouthEnrollmentDni(dni);
    if (res.enrolled) {
      setDniWarning(
        "Este jugador ya está empadronado para la temporada 2026. No es necesario completar el formulario nuevamente."
      );
    } else {
      setDniWarning(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!ack) {
      setError("Debés aceptar las condiciones del aviso importante.");
      return;
    }
    if (dniWarning) {
      setError(dniWarning);
      return;
    }
    if (!gender) {
      setError("Seleccioná el sexo del jugador.");
      return;
    }
    if (!department) {
      setError("Seleccioná el departamento.");
      return;
    }
    if (!clubName) {
      setError("Seleccioná el club de opción.");
      return;
    }
    if (hasHandicap === null) {
      setError("Indicá si el jugador tiene Handicap.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitYouthEnrollmentForm({
        responsibleName,
        responsiblePhone,
        lastName,
        firstName,
        gender,
        birthDate,
        dni,
        address,
        department: department as (typeof EMPADRONAMIENTO_DEPARTMENTS)[number],
        locality,
        phone,
        email,
        clubName: clubName as (typeof EMPADRONAMIENTO_CLUBS)[number],
        school: school || undefined,
        hasHandicap,
        matricula: hasHandicap ? matricula : undefined,
        professors: professors as (typeof EMPADRONAMIENTO_PROFESSORS)[number][],
        professorOther: professors.includes("Otro") ? professorOther : undefined,
        tutor1Name,
        tutor1Dni,
        tutor1Phone,
        tutor1Email,
        tutor2Name: tutor2Name || undefined,
        tutor2Dni: tutor2Dni || undefined,
        tutor2Email: tutor2Email || undefined,
        healthData: health,
        comments: comments || undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <h2 className="font-heading text-2xl font-semibold text-emerald-900">
          Gracias por su participación
        </h2>
        <p className="mt-3 text-sm font-medium text-emerald-800">
          El empadronamiento fue registrado correctamente para la temporada 2026.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border-2 border-[var(--feg-yellow)]/50 bg-[var(--feg-yellow)]/15 p-5">
        <p className="text-sm font-semibold leading-relaxed text-[var(--feg-ink)]">
          <span className="font-heading uppercase tracking-wide">Importante:</span> la planilla
          debe ser completada por los padres del jugador (madre, padre y/o tutor) en carácter de
          declaración jurada. Es un proceso anual y solo debe realizarse{" "}
          <strong>una vez</strong> durante la temporada. La FEG asegura su trato confidencial.
        </p>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[var(--feg-green)]/30 text-[var(--feg-green-2)] focus:ring-[var(--feg-green-2)]"
          />
          <span className="text-sm font-medium text-[var(--feg-ink)]">
            He leído y acepto las condiciones — <strong>OK</strong>
          </span>
        </label>
      </div>

      <fieldset disabled={disabled} className="space-y-6">
        <FormSection title="1 — Responsable de la carga">
          <div className="space-y-2">
            <FieldLabel htmlFor="responsibleName" required>
              Nombre del responsable de la carga
            </FieldLabel>
            <input
              id="responsibleName"
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              placeholder="Padre, madre o tutor"
              className={inputClassName}
              required
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="responsiblePhone" required>
              Teléfono de contacto del responsable
            </FieldLabel>
            <input
              id="responsiblePhone"
              type="tel"
              value={responsiblePhone}
              onChange={(e) => setResponsiblePhone(e.target.value)}
              placeholder="Ej. 3434876922"
              className={inputClassName}
              required
            />
          </div>
        </FormSection>

        <FormSection title="2 — Datos del jugador">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="lastName" required>
                Apellido del jugador
              </FieldLabel>
              <input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="firstName" required>
                Nombres del jugador
              </FieldLabel>
              <input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--feg-green)]">
              Sexo <span className="text-red-600">*</span>
            </span>
            <div className="flex flex-wrap gap-4">
              {(["Varón", "Mujer"] as const).map((g) => (
                <label key={g} className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === g}
                    onChange={() => setGender(g)}
                    required
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="birthDate" required>
                Fecha de nacimiento
              </FieldLabel>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={inputClassName}
                required
              />
              <p className="text-xs text-[var(--feg-green)]/80">
                Podés seleccionar el año haciendo clic arriba en el selector de fecha.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Edad al 31/12/2026</FieldLabel>
                <input
                  readOnly
                  value={ageDec31 != null ? String(ageDec31) : "—"}
                  className={inputClassName}
                  aria-readonly
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Categoría</FieldLabel>
                <input readOnly value={category || "—"} className={inputClassName} aria-readonly />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="dni" required>
              DNI
            </FieldLabel>
            <input
              id="dni"
              inputMode="numeric"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              onBlur={handleDniBlur}
              className={inputClassName}
              required
            />
            {dniWarning ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900" role="alert">
                {dniWarning}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="address" required>
              Dirección
            </FieldLabel>
            <input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClassName}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="department" required>
                Departamento
              </FieldLabel>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={selectClassName}
                required
              >
                <option value="">Seleccionar…</option>
                {EMPADRONAMIENTO_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="locality" required>
                Localidad
              </FieldLabel>
              <input
                id="locality"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="phone" required>
                Teléfono
              </FieldLabel>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="email" required>
                Correo electrónico
              </FieldLabel>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="clubName" required>
                Nombre del club de opción
              </FieldLabel>
              <select
                id="clubName"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className={selectClassName}
                required
              >
                <option value="">Seleccionar…</option>
                {EMPADRONAMIENTO_CLUBS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="clubCode">Código de club</FieldLabel>
              <input
                id="clubCode"
                readOnly
                value={clubCodeDisplay}
                placeholder="Se completa al elegir club"
                className={inputClassName}
                aria-readonly
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="3 — Datos escolares y deportivos">
          <div className="space-y-2">
            <FieldLabel htmlFor="school">Establecimiento educativo</FieldLabel>
            <input
              id="school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Según nivel educativo que corresponda"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--feg-green)]">
              ¿Tiene Handicap? <span className="text-red-600">*</span>
            </span>
            <div className="flex gap-4">
              {[
                { v: true, l: "Sí" },
                { v: false, l: "No" },
              ].map(({ v, l }) => (
                <label key={l} className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="hasHandicap"
                    checked={hasHandicap === v}
                    onChange={() => setHasHandicap(v)}
                    required
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {hasHandicap ? (
            <div className="space-y-2">
              <FieldLabel htmlFor="matricula" required>
                Matrícula
              </FieldLabel>
              <input
                id="matricula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--feg-green)]">Profesor a cargo</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {EMPADRONAMIENTO_PROFESSORS.map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={professors.includes(p)}
                    onChange={() => toggleProfessor(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>

          {professors.includes("Otro") ? (
            <div className="space-y-2">
              <FieldLabel htmlFor="professorOther" required>
                ¿Quién es el Profesor? (otro)
              </FieldLabel>
              <input
                id="professorOther"
                value={professorOther}
                onChange={(e) => setProfessorOther(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
          ) : null}
        </FormSection>

        <FormSection title="4 — Padre / Madre / Tutor 1">
          <div className="space-y-2">
            <FieldLabel htmlFor="tutor1Name" required>
              Nombre y Apellido
            </FieldLabel>
            <input
              id="tutor1Name"
              value={tutor1Name}
              onChange={(e) => setTutor1Name(e.target.value)}
              className={inputClassName}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <FieldLabel htmlFor="tutor1Dni" required>
                DNI
              </FieldLabel>
              <input
                id="tutor1Dni"
                value={tutor1Dni}
                onChange={(e) => setTutor1Dni(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="tutor1Phone" required>
                Teléfono móvil
              </FieldLabel>
              <input
                id="tutor1Phone"
                type="tel"
                value={tutor1Phone}
                onChange={(e) => setTutor1Phone(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="tutor1Email" required>
                Correo electrónico
              </FieldLabel>
              <input
                id="tutor1Email"
                type="email"
                value={tutor1Email}
                onChange={(e) => setTutor1Email(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="5 — Padre / Madre / Tutor 2 (si corresponde)">
          <div className="space-y-2">
            <FieldLabel htmlFor="tutor2Name">Nombre y Apellido</FieldLabel>
            <input
              id="tutor2Name"
              value={tutor2Name}
              onChange={(e) => setTutor2Name(e.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="tutor2Dni">DNI</FieldLabel>
              <input
                id="tutor2Dni"
                value={tutor2Dni}
                onChange={(e) => setTutor2Dni(e.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="tutor2Email">Correo electrónico</FieldLabel>
              <input
                id="tutor2Email"
                type="email"
                value={tutor2Email}
                onChange={(e) => setTutor2Email(e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="6 — Salud">
          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--feg-green)]">
              ¿Tiene obra social? <span className="text-red-600">*</span>
            </span>
            <div className="flex gap-4">
              {[
                { v: true, l: "Sí" },
                { v: false, l: "No" },
              ].map(({ v, l }) => (
                <label key={l} className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="hasHealthInsurance"
                    checked={health.hasHealthInsurance === v}
                    onChange={() =>
                      setHealth((h) => ({ ...h, hasHealthInsurance: v }))
                    }
                    required
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {health.hasHealthInsurance ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="healthInsurance" required>
                  Obra social
                </FieldLabel>
                <input
                  id="healthInsurance"
                  value={health.healthInsurance ?? ""}
                  onChange={(e) =>
                    setHealth((h) => ({ ...h, healthInsurance: e.target.value }))
                  }
                  className={inputClassName}
                  required
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="memberNumber">Número de asociado</FieldLabel>
                <input
                  id="memberNumber"
                  value={health.memberNumber ?? ""}
                  onChange={(e) =>
                    setHealth((h) => ({ ...h, memberNumber: e.target.value }))
                  }
                  className={inputClassName}
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <FieldLabel>Grupo sanguíneo</FieldLabel>
            <div className="flex flex-wrap gap-3">
              {EMPADRONAMIENTO_BLOOD_GROUPS.map((g) => (
                <label key={g} className="flex items-center gap-1.5 text-sm font-medium">
                  <input
                    type="radio"
                    name="bloodGroup"
                    checked={health.bloodGroup === g}
                    onChange={() => setHealth((h) => ({ ...h, bloodGroup: g }))}
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--feg-green)]">
              ¿Toma regularmente alguna medicación? <span className="text-red-600">*</span>
            </span>
            <div className="flex gap-4">
              {[
                { v: true, l: "Sí" },
                { v: false, l: "No" },
              ].map(({ v, l }) => (
                <label key={l} className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="takesMedication"
                    checked={health.takesMedication === v}
                    onChange={() => setHealth((h) => ({ ...h, takesMedication: v }))}
                    required
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {health.takesMedication ? (
            <div className="space-y-2">
              <FieldLabel htmlFor="medication" required>
                ¿Qué medicación?
              </FieldLabel>
              <input
                id="medication"
                value={health.medication ?? ""}
                onChange={(e) => setHealth((h) => ({ ...h, medication: e.target.value }))}
                className={inputClassName}
                required
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--feg-green)]">
              ¿Recibió vacuna antitetánica?
            </span>
            <div className="flex gap-4">
              {[
                { v: true, l: "Sí" },
                { v: false, l: "No" },
              ].map(({ v, l }) => (
                <label key={l} className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="tetanusVaccine"
                    checked={health.tetanusVaccine === v}
                    onChange={() => setHealth((h) => ({ ...h, tetanusVaccine: v }))}
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--feg-green)]">
              Condiciones de salud (marcar las que correspondan)
            </span>
            <div className="space-y-2">
              {EMPADRONAMIENTO_HEALTH_CONDITIONS.map(({ key, label }) => (
                <label key={key} className="flex items-start gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={Boolean(health.conditions[key])}
                    onChange={() => toggleCondition(key)}
                    className="mt-0.5"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {health.conditions.allergic ? (
            <div className="space-y-2">
              <FieldLabel htmlFor="allergiesDetail" required>
                Especifique a qué es alérgico
              </FieldLabel>
              <input
                id="allergiesDetail"
                value={health.allergiesDetail ?? ""}
                onChange={(e) =>
                  setHealth((h) => ({ ...h, allergiesDetail: e.target.value }))
                }
                className={inputClassName}
                required
              />
            </div>
          ) : null}

          {health.conditions.other ? (
            <div className="space-y-2">
              <FieldLabel htmlFor="otherConditions" required>
                ¿Cuáles? (otras condiciones)
              </FieldLabel>
              <input
                id="otherConditions"
                value={health.otherConditions ?? ""}
                onChange={(e) =>
                  setHealth((h) => ({ ...h, otherConditions: e.target.value }))
                }
                className={inputClassName}
                required
              />
            </div>
          ) : null}

          {health.conditions.recentSurgery ? (
            <div className="space-y-2">
              <FieldLabel htmlFor="surgeryDetail" required>
                ¿De qué fue operado?
              </FieldLabel>
              <input
                id="surgeryDetail"
                value={health.surgeryDetail ?? ""}
                onChange={(e) =>
                  setHealth((h) => ({ ...h, surgeryDetail: e.target.value }))
                }
                className={inputClassName}
                required
              />
            </div>
          ) : null}
        </FormSection>

        <FormSection title="7 — Comentarios">
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            className={inputClassName}
            placeholder="Comentarios adicionales (opcional)"
          />
        </FormSection>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={disabled || Boolean(dniWarning)}
          className="w-full rounded-full bg-[var(--feg-yellow)] px-8 py-3 font-heading text-sm font-semibold text-[var(--feg-ink)] transition hover:brightness-95 disabled:opacity-50 sm:w-auto"
        >
          {submitting ? "Enviando…" : "Enviar empadronamiento"}
        </button>
      </fieldset>
    </form>
  );
}
