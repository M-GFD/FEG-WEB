"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  INSCRIPCION_CLUB_OTRO,
  INSCRIPCION_CLUBS,
} from "@/lib/inscripcion-torneos-menores/constants";
import type { YouthTournamentSignupConfigPublic } from "@/lib/inscripcion-torneos-menores/config";
import {
  ageOnReferenceDate,
  categoryAtSignup,
  parseBirthDateInput,
} from "@/lib/empadronamiento-menores/category";
import type { YouthEnrollmentLookup } from "@/lib/inscripcion-torneos-menores/lookup";
import { searchPlayerByDni, submitInscripcionTorneoForm } from "./actions";
import {
  FieldLabel,
  FormSection,
  inputClassName,
  selectClassName,
} from "@/app/empadronamiento-menores/form-ui";

type Props = {
  config: YouthTournamentSignupConfigPublic;
};

export function InscripcionTorneoMenoresForm({ config }: Props) {
  const t = useTranslations("tournamentSignup");
  const tc = useTranslations("common");
  const formError = (key: string) => t(`errors.${key}` as "errors.ackRequired");

  const [ack, setAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [playerFound, setPlayerFound] = useState(false);

  const [dniSearch, setDniSearch] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");

  const [responsibleName, setResponsibleName] = useState("");
  const [responsiblePhone, setResponsiblePhone] = useState("");
  const [responsibleEmail, setResponsibleEmail] = useState("");

  const [clubName, setClubName] = useState("");
  const [clubOther, setClubOther] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState<"Varón" | "Mujer" | "">("");
  const [hasHandicap, setHasHandicap] = useState<boolean | null>(null);
  const [matricula, setMatricula] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [playsPrejuveniles, setPlaysPrejuveniles] = useState(false);
  const [dietaryRestriction, setDietaryRestriction] = useState<boolean | null>(null);
  const [dietaryFoods, setDietaryFoods] = useState("");
  const [comments, setComments] = useState("");

  const disabled = !ack || submitting || success || notEnrolled;
  const playerLocked = playerFound;

  const { ageToday, category } = useMemo(() => {
    const bd = parseBirthDateInput(birthDate);
    if (!bd) return { ageToday: null as number | null, category: "" };
    const now = new Date();
    return {
      ageToday: ageOnReferenceDate(bd, now),
      category: categoryAtSignup(bd, now),
    };
  }, [birthDate]);

  const showPrejuvenilesOption = category === "Albatros";

  function applyPlayer(p: YouthEnrollmentLookup) {
    setEnrollmentId(p.enrollmentId);
    setLastName(p.lastName);
    setFirstName(p.firstName);
    setGender(p.gender as "Varón" | "Mujer");
    setBirthDate(p.birthDate);
    setClubName(
      INSCRIPCION_CLUBS.includes(p.clubName as (typeof INSCRIPCION_CLUBS)[number])
        ? p.clubName
        : INSCRIPCION_CLUB_OTRO
    );
    if (!INSCRIPCION_CLUBS.includes(p.clubName as (typeof INSCRIPCION_CLUBS)[number])) {
      setClubOther(p.clubName);
    }
    setHasHandicap(p.hasHandicap);
    setMatricula(p.matricula ?? "");
    setPlayerFound(true);
    setNotEnrolled(false);
  }

  async function handleSearchDni() {
    setError(null);
    setNotEnrolled(false);
    setPlayerFound(false);
    setSearching(true);
    try {
      const res = await searchPlayerByDni(dniSearch);
      if (!res.found) {
        setNotEnrolled(true);
        setEnrollmentId("");
        setLastName("");
        setFirstName("");
        setGender("");
        setBirthDate("");
        setClubName("");
        setHasHandicap(null);
        setMatricula("");
        return;
      }
      applyPlayer(res.player);
    } catch (e) {
      setError(e instanceof Error ? e.message : formError("searchFailed"));
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!ack) {
      setError(formError("ackRequired"));
      return;
    }
    if (!playerFound || !enrollmentId) {
      setError(formError("playerRequired"));
      return;
    }
    if (!gender || !clubName || hasHandicap === null || dietaryRestriction === null) {
      setError(formError("fieldsRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitInscripcionTorneoForm({
        tournamentKey: config.tournamentKey,
        enrollmentId,
        dni: dniSearch,
        responsibleName,
        responsiblePhone,
        responsibleEmail,
        clubName: clubName as (typeof INSCRIPCION_CLUBS)[number],
        clubOther: clubName === INSCRIPCION_CLUB_OTRO ? clubOther : undefined,
        lastName,
        firstName,
        gender,
        hasHandicap,
        matricula: hasHandicap ? matricula : undefined,
        birthDate,
        playsPrejuvenilesAlso: showPrejuvenilesOption ? playsPrejuveniles : false,
        isPrincipiante: false,
        dietaryRestriction,
        dietaryFoods: dietaryRestriction ? dietaryFoods : undefined,
        comments: comments || undefined,
      });

      if (!result.ok) {
        setError(formError(result.errorKey));
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : formError("unexpected"));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <h2 className="font-heading text-2xl font-semibold text-emerald-900">
          {t("successTitle")}
        </h2>
        <p className="mt-3 text-sm font-medium text-emerald-800">
          {t("successBody", { tournament: config.title })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--feg-green)]/15 bg-white p-4">
        <input
          type="checkbox"
          checked={ack}
          onChange={(e) => setAck(e.target.checked)}
          className="mt-1 h-4 w-4"
        />
        <span className="text-sm font-medium text-[var(--feg-ink)]">{tc("ackOk")}</span>
      </label>

      <fieldset disabled={!ack || submitting} className="space-y-6">
        <FormSection title={t("sections.responsible")}>
          <div className="space-y-2">
            <FieldLabel htmlFor="resp-name" required>
              {t("fields.responsibleName")}
            </FieldLabel>
            <input
              id="resp-name"
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              placeholder={t("fields.responsibleNamePlaceholder")}
              className={inputClassName}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="resp-phone" required>
                {t("fields.responsiblePhone")}
              </FieldLabel>
              <input
                id="resp-phone"
                type="tel"
                value={responsiblePhone}
                onChange={(e) => setResponsiblePhone(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="resp-email" required>
                {t("fields.responsibleEmail")}
              </FieldLabel>
              <input
                id="resp-email"
                type="email"
                value={responsibleEmail}
                onChange={(e) => setResponsibleEmail(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
          </div>
        </FormSection>

        <FormSection title={t("sections.search")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <FieldLabel htmlFor="dni-search" required>
                {t("fields.dniSearch")}
              </FieldLabel>
              <input
                id="dni-search"
                value={dniSearch}
                onChange={(e) => setDniSearch(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
            <button
              type="button"
              onClick={handleSearchDni}
              disabled={searching || dniSearch.replace(/\D/g, "").length < 7}
              className="shrink-0 rounded-full bg-[var(--feg-green-2)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
            >
              {searching ? t("searching") : t("searchPlayer")}
            </button>
          </div>

          {notEnrolled ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
              <p className="font-semibold">{t("notEnrolledTitle")}</p>
              <p className="mt-2">
                {t("notEnrolledBody")}{" "}
                <Link
                  href="/empadronamiento-menores"
                  className="font-semibold underline underline-offset-2"
                >
                  {t("enrollmentLink")}
                </Link>
                .
              </p>
            </div>
          ) : null}

          {playerFound ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {t("playerFound")}
            </p>
          ) : null}
        </FormSection>

        <fieldset disabled={disabled || !playerFound} className="space-y-6">
          <FormSection title={t("sections.player")}>
            <div className="space-y-2">
              <FieldLabel htmlFor="club" required>
                {t("fields.club")}
              </FieldLabel>
              <select
                id="club"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className={selectClassName}
                required
                disabled={playerLocked}
              >
                <option value="">{tc("select")}</option>
                {INSCRIPCION_CLUBS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {clubName === INSCRIPCION_CLUB_OTRO ? (
              <div className="space-y-2">
                <FieldLabel htmlFor="club-other" required>
                  {t("fields.clubOther")}
                </FieldLabel>
                <input
                  id="club-other"
                  value={clubOther}
                  onChange={(e) => setClubOther(e.target.value)}
                  className={inputClassName}
                  required
                  disabled={playerLocked}
                />
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="ln" required>
                  {t("fields.lastName")}
                </FieldLabel>
                <input
                  id="ln"
                  value={lastName}
                  onChange={(e) => {
                    if (!playerLocked) setLastName(e.target.value);
                  }}
                  readOnly={playerLocked}
                  className={inputClassName}
                  required
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="fn" required>
                  {t("fields.firstName")}
                </FieldLabel>
                <input
                  id="fn"
                  value={firstName}
                  onChange={(e) => {
                    if (!playerLocked) setFirstName(e.target.value);
                  }}
                  readOnly={playerLocked}
                  className={inputClassName}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-[var(--feg-green)]">
                {t("fields.gender")} <span className="text-red-600">*</span>
              </span>
              <div className="flex gap-4">
                {(["Varón", "Mujer"] as const).map((g) => (
                  <label key={g} className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      disabled={playerLocked}
                      required
                    />
                    {g === "Varón" ? tc("genderMale") : tc("genderFemale")}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-[var(--feg-green)]">
                {t("fields.hasHandicap")} <span className="text-red-600">*</span>
              </span>
              <div className="flex gap-4">
                {[
                  { v: true, l: tc("yes") },
                  { v: false, l: tc("no") },
                ].map(({ v, l }) => (
                  <label key={l} className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="radio"
                      name="hc"
                      checked={hasHandicap === v}
                      onChange={() => setHasHandicap(v)}
                      disabled={playerLocked}
                      required
                    />
                    {l}
                  </label>
                ))}
              </div>
            </div>

            {hasHandicap ? (
              <div className="space-y-2">
                <FieldLabel htmlFor="mat" required>
                  {t("fields.matricula")}
                </FieldLabel>
                <input
                  id="mat"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  readOnly={playerLocked}
                  className={inputClassName}
                  required
                />
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <FieldLabel htmlFor="bd" required>
                  {t("fields.birthDate")}
                </FieldLabel>
                <input
                  id="bd"
                  type="date"
                  value={birthDate}
                  onChange={(e) => {
                    if (!playerLocked) setBirthDate(e.target.value);
                  }}
                  readOnly={playerLocked}
                  className={inputClassName}
                  required
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>{t("fields.ageToday")}</FieldLabel>
                <input readOnly value={ageToday ?? tc("dash")} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <FieldLabel>{t("fields.category")}</FieldLabel>
                <input readOnly value={category || tc("dash")} className={inputClassName} />
              </div>
            </div>
          </FormSection>

          <FormSection title={t("sections.category")}>
            {showPrejuvenilesOption ? (
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={playsPrejuveniles}
                  onChange={(e) => setPlaysPrejuveniles(e.target.checked)}
                />
                {t("fields.playsPrejuveniles")}
              </label>
            ) : (
              <p className="text-sm text-[var(--feg-green)]/70">
                {t("fields.noSpecialParticipation")}
              </p>
            )}
          </FormSection>

          <FormSection title={t("sections.dietary")}>
            <div className="space-y-2">
              <span className="text-sm font-medium text-[var(--feg-green)]">
                {t("fields.dietaryRestriction")} <span className="text-red-600">*</span>
              </span>
              <div className="flex gap-4">
                {[
                  { v: true, l: tc("yes") },
                  { v: false, l: tc("no") },
                ].map(({ v, l }) => (
                  <label key={l} className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="radio"
                      name="diet"
                      checked={dietaryRestriction === v}
                      onChange={() => setDietaryRestriction(v)}
                      required
                    />
                    {l}
                  </label>
                ))}
              </div>
            </div>
            {dietaryRestriction ? (
              <div className="space-y-2">
                <FieldLabel htmlFor="diet-foods" required>
                  {t("fields.dietaryFoods")}
                </FieldLabel>
                <input
                  id="diet-foods"
                  value={dietaryFoods}
                  onChange={(e) => setDietaryFoods(e.target.value)}
                  className={inputClassName}
                  required
                />
              </div>
            ) : null}
          </FormSection>

          <FormSection title={t("sections.comments")}>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder={t("fields.commentsPlaceholder")}
              className={inputClassName}
            />
          </FormSection>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={disabled || !playerFound}
            className="w-full rounded-full bg-[var(--feg-yellow)] px-8 py-3 font-heading text-sm font-semibold text-[var(--feg-ink)] transition hover:brightness-95 disabled:opacity-50 sm:w-auto"
          >
            {submitting ? tc("submitting") : t("submit")}
          </button>
        </fieldset>
      </fieldset>
    </form>
  );
}
