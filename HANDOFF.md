# Sovereign Operational Hand-Off: TCG Intelligence

Dette dokumentet fungerer som din endelige guide for å drifte og skalere Sovereign TCG-plattformen som en profesjonell B2B SaaS i det norske markedet.

## 1. Discord-håndtering (To-spors system)

For å sikre profesjonell kvalitet, krever systemet to separate webhook-strømmer:

| Kanal | Mottaker | Formål | Webhook Variabel |
| :--- | :--- | :--- | :--- |
| **Merchant Alerts** | Din Kunde (Shopify-eier) | Prisoppdateringer, Panic Lock, og Daglige Briefs. | `DISCORD_WEBHOOK_URL` (per butikk) |
| **App Feedback** | Deg (SaaS Owner) | Bug-rapporter, forslag og beta-tilbakemeldinger. | `MASTER_FEEDBACK_WEBHOOK` (sentralt) |

> [!TIP]
> **Pro-tip**: Opprett en egen Discord-server ("Sovereign Admin") med en `#feedback` kanal for å holde oversikt over alle brukernes ønsker.

## 2. Norsk B2B-fokus (Roadmap)

I tråd med dine instruksjoner er plattformen kalibrert for **norske aktører**.
- **Klassifisering**: ABC-systemet er konfigurert for norske lagervolumer.
- **Språk**: Alle grensesnitt rettet mot butikkansatte er på Norsk.
- **Neste steg**: Prioriter integrasjon av norske forhandler-data (f.eks. Outland, Pokegear) når API-ene er tilgjengelige, for å supplere TCGplayer-dataene.

## 3. Sikkerhet & Vedlikehold

Plattformen er bygget for å bestå en **100/100 revisjon**:
- **RLS (Row Level Security)**: Alle tabeller er låst til `store_id`. Verifiser alltid RLS-policyer i Supabase etter DDL-endringer.
- **Nøkkel-rotasjon**: Vi anbefaler å rotere `SHOPIFY_API_SECRET` og `SUPABASE_SERVICE_ROLE` hver 6. måned.
- **Audit Logs**: Bruk `audit_logs` tabellen for å dokumentere alle prisendringer systemet gjør automatisk (krav for B2B-samsvar).

## 4. Skalering (QStash)

Når du passerer dine første 100 butikker, bør du:
1. Oppgradere Upstash-planen din for å tåle høyere webhook-frekvens.
2. Overvåke `qstash-bridge` for potensielle timeouts.

---
**Gratulerer! Systemet er nå teknisk og operasjonelt klart for lansering.**
