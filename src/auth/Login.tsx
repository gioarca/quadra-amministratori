import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, HardHat, LogIn, Mail } from "lucide-react";
import { api } from "../api/index.ts";
import { Wordmark } from "../components/bits.tsx";
import { Button, Field, inputClass } from "../components/ui.tsx";

const ICON = { termotecnico: HardHat, amministratore: Building2 } as const;

/** Demo: si sceglie con chi entrare. */
function DemoPicker() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-5">
      <p className="text-lead">Questa è una demo con dati di esempio. Scegli con chi entrare: le due persone vedono app diverse.</p>
      <ul className="flex flex-col gap-3">
        {api.personas().map((p) => {
          const I = ICON[p.role];
          return (
            <li key={p.userId}>
              <button
                type="button"
                disabled={!!busy}
                onClick={async () => {
                  setBusy(p.userId);
                  await api.loginAs(p.userId);
                  await qc.invalidateQueries({ queryKey: ["me"] });
                }}
                className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-4 rounded-xl border-2 border-ink bg-sheet p-4 text-left hover:bg-sunk disabled:opacity-60 sm:p-5"
              >
                <span className="grid size-12 place-items-center rounded-lg bg-primary-bg text-primary-fg">
                  <I size={26} aria-hidden />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-small font-bold text-ink-2">{p.title}</span>
                  <span className="text-h3 font-bold">{busy === p.userId ? "Entro…" : `Entra come ${p.name}`}</span>
                  <span className="text-ink-2">{p.description}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-small text-ink-2">Nella versione vera si entra con l'email: arriva un codice di 6 cifre, senza password da ricordare.</p>
    </div>
  );
}

/** Versione vera: email, poi codice di 6 cifre. */
function EmailLogin() {
  const qc = useQueryClient();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submitEmail(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    setBusy(true);
    try {
      const r = await api.requestCode(email.trim());
      setDevCode(r.devCode);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Riprova.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    setBusy(true);
    try {
      await api.verifyCode(email.trim(), code);
      await qc.invalidateQueries({ queryKey: ["me"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Riprova.");
      setBusy(false);
    }
  }

  if (step === "email") {
    return (
      <form onSubmit={submitEmail} className="flex flex-col gap-5" noValidate>
        <Field id="email" label="La tua email" hint="Ti mandiamo un codice di 6 cifre per entrare." error={error}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            aria-describedby="email-hint"
          />
        </Field>
        <Button type="submit" size="xl" icon={Mail} loading={busy} disabled={!email.includes("@")}>
          Mandami il codice
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={submitCode} className="flex flex-col gap-5" noValidate>
      <p className="text-lead">
        Abbiamo mandato il codice a <strong className="break-all">{email}</strong>. Controlla anche nella posta indesiderata.
      </p>
      {devCode && (
        <p className="rounded-lg bg-amber-tint p-3 font-semibold text-amber-ink">
          Sviluppo: il codice è <span className="num">{devCode}</span> (lo vedi anche nel terminale dell'API).
        </p>
      )}
      <Field id="code" label="Codice di 6 cifre" error={error}>
        <input
          id="code"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className={`${inputClass} num text-center text-h2 tracking-[0.4em]`}
        />
      </Field>
      <Button type="submit" size="xl" icon={LogIn} loading={busy} disabled={code.length !== 6}>
        Entra
      </Button>
      <Button
        variant="quiet"
        onClick={() => {
          setStep("email");
          setCode("");
          setError(undefined);
        }}
      >
        Ho sbagliato email
      </Button>
    </form>
  );
}

export function Login() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-8 px-4 py-10 sm:py-16">
      <Wordmark />
      <div className="flex flex-col gap-2">
        <h1 className="text-h1 font-extrabold tracking-tight">Entra</h1>
        <p className="text-lead text-ink-2">Le centrali termiche dei condomini: come stanno, cosa si è rotto, cosa scade.</p>
      </div>
      {api.mode === "demo" ? <DemoPicker /> : <EmailLogin />}
    </main>
  );
}
