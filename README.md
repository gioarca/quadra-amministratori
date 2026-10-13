## Quadra per condomini (termotecnici e amministratori)

Seconda app nello stesso progetto, in `apps/centrali`: le centrali termiche condominiali viste da chi le mantiene e da chi amministra i condomini.

```bash
npm run dev:centrali    # http://localhost:5180 — demo con dati simulati nel browser
```

Si entra come **Mario Rossetto** (termotecnico e terzo responsabile, 9 centrali) o **Laura Bressan** (amministratrice, 7 condomini seguiti da tre ditte). Le modifiche valgono per tutta la sessione anche cambiando persona: un preventivo mandato dalla ditta compare subito nel portale dell'amministratrice.

**Per la ditta**
- *Centrali*: tutte le centrali, dalla più grave; prove di prima accensione prima della stagione; agenda di oggi.
- *Schema della centrale*: generatori, mandata e ritorno (le tubazioni si animano solo quando la pompa gira), utenze, manometro, combustibile, collegamento. Sotto, il grafico delle ultime 24 ore con valori al passaggio del dito e la tabella ora per ora.
- *Cosa dicono i dati*: diagnosi spiegabili (blocco, pressione in calo, circolazione, accensioni frequenti, ore oltre il limite di zona, acqua calda, condensazione, centrale muta), ognuna con "cosa controllare" e il pulsante per aprire l'intervento già compilato.
- *Interventi*: assegnazione, "sono arrivato", chiusura con controlli fatti, analisi fumi, foto, note e costo. Le scadenze ripartono da sole.
- *Scadenze*: manutenzione, RCEE (periodicità DPR 74/2013 per tipo, combustibile e potenza), invio al catasto, CPI oltre 116 kW, F-gas, delega.
- *Preventivi* da mandare all'amministratore, con voci e urgenza.

**Per l'amministratore**
- *Condomini*: tutti i suoi, qualunque ditta li segua, con una frase semplice su cosa succede e chi se ne occupa; scadenze di legge a 60 giorni; lavori aperti.
- *Condominio*: stato semplice (con lo schema completo a richiesta), consumi stagione su stagione corretti per i gradi giorno, lavori e costi, documenti, avvisi.
- *Preventivi*: approvo, porto in assemblea, chiedo chiarimenti, non approvo; per l'urgente il richiamo all'art. 1135 c.c.
- *Avvisi* ai condomini da modelli riempiti con i dati del condominio: bacheca, email, SMS.
- *Relazione per l'assemblea*: una pagina da stampare o salvare in PDF.
- Condominio con ditta non collegata: solo documenti e scadenze, con l'invito alla ditta.

La logica (stagioni e orari per zona climatica, scadenze, diagnosi, allarmi, consumi, permessi, comandi) sta in `packages/shared/src/centrali` ed è **la stessa nella demo e sul server**: `service.ts` risponde alle schermate, la demo tiene i dati in memoria, il server li carica da MongoDB e salva solo ciò che è cambiato.
