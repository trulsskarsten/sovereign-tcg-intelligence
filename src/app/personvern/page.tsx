import DashboardShell from "@/components/DashboardShell";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Personvern & Personopplysninger — Sovereign TCG Intelligence",
  description: "Personvernerklæring for Sovereign TCG Intelligence Shopify-appen.",
};

export default function PersonvernPage() {
  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto py-16 px-6">
        <div className="flex items-center space-x-4 mb-10">
          <div className="p-3 bg-[#f1f2f3] rounded-2xl">
            <ShieldCheck size={28} className="text-[#005bd3]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tighter">Personvern</h1>
            <p className="text-sm text-[#6d7175] font-medium">Sist oppdatert: April 2026</p>
          </div>
        </div>

        <div className="space-y-10 text-[#1a1a1a]">
          <section className="glass-panel p-8 space-y-4">
            <h2 className="text-lg font-black tracking-tight">1. Hvem vi er</h2>
            <p className="text-sm text-[#6d7175] leading-relaxed">
              Sovereign TCG Intelligence er et B2B SaaS-verktøy utviklet av Skarsten Digital for 
              norske Pokémon TCG-butikker. Appen er tilgjengelig som en Shopify Embedded App og 
              hjelper butikkeiere med lagerstyring, prisoptimalisering og markedsanalyse.
            </p>
          </section>

          <section className="glass-panel p-8 space-y-4">
            <h2 className="text-lg font-black tracking-tight">2. Hvilke data vi samler inn</h2>
            <p className="text-sm text-[#6d7175] leading-relaxed">
              Vi samler inn og behandler følgende data fra din Shopify-butikk:
            </p>
            <ul className="space-y-2 text-sm text-[#6d7175]">
              <li className="flex items-start space-x-2">
                <span className="text-[#005bd3] font-black mt-0.5">•</span>
                <span><strong className="text-[#1a1a1a]">Butikkdata:</strong> Butikknavn, domene og Shopify-butikk-ID.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#005bd3] font-black mt-0.5">•</span>
                <span><strong className="text-[#1a1a1a]">Produktdata:</strong> Produktnavn, SKU, priser, lagerbeholdning og kostpris.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#005bd3] font-black mt-0.5">•</span>
                <span><strong className="text-[#1a1a1a]">Markedsdata:</strong> Offentlig tilgjengelige priser fra norsk markedsplass.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#005bd3] font-black mt-0.5">•</span>
                <span><strong className="text-[#1a1a1a]">Systemlogger:</strong> Anonymiserte handlingslogger for revisjon og feilsøking.</span>
              </li>
            </ul>
            <p className="text-sm text-[#6d7175] leading-relaxed font-medium">
              Vi lagrer <strong>ingen personopplysninger om sluttkunder</strong> (kjøpere i butikken). 
              Vi samler ikke inn navn, e-postadresser, betalingsinformasjon eller andre personidentifiserende opplysninger om forbrukere.
            </p>
          </section>

          <section className="glass-panel p-8 space-y-4">
            <h2 className="text-lg font-black tracking-tight">3. Hvordan vi bruker dataene</h2>
            <ul className="space-y-2 text-sm text-[#6d7175]">
              <li className="flex items-start space-x-2">
                <span className="text-[#005bd3] font-black mt-0.5">•</span>
                <span>Generere prisanbefalinger basert på markedsdata og innkjøpskost.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#005bd3] font-black mt-0.5">•</span>
                <span>Synkronisere lagerbeholdning med Shopify.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#005bd3] font-black mt-0.5">•</span>
                <span>Vise statistikk og analyse i dashbordet.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#005bd3] font-black mt-0.5">•</span>
                <span>Sende varslinger ved systemhendelser via Discord-integrasjon.</span>
              </li>
            </ul>
          </section>

          <section className="glass-panel p-8 space-y-4">
            <h2 className="text-lg font-black tracking-tight">4. Datalagring og sikkerhet</h2>
            <p className="text-sm text-[#6d7175] leading-relaxed">
              Alle data lagres i Supabase (EU-region) med Row Level Security aktivert. 
              Tilgangstoken krypteres med AES-256 ved lagring. Data overføres kun via HTTPS.
              Vi deler ikke data med tredjeparter utover det som er nødvendig for tjenestens drift 
              (Supabase, Vercel, Shopify Partner Platform).
            </p>
          </section>

          <section className="glass-panel p-8 space-y-4">
            <h2 className="text-lg font-black tracking-tight">5. GDPR og dine rettigheter</h2>
            <p className="text-sm text-[#6d7175] leading-relaxed">
              Vi overholder Shopifys GDPR-krav og EUs personvernforordning. 
              Dersom du avinstallerer appen:
            </p>
            <ul className="space-y-2 text-sm text-[#6d7175]">
              <li className="flex items-start space-x-2">
                <span className="text-[#005bd3] font-black mt-0.5">•</span>
                <span>Tilgangstokenet ditt slettes umiddelbart.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#005bd3] font-black mt-0.5">•</span>
                <span>Alle butikkdata slettes innen 48 timer i henhold til Shopifys <em>shop/redact</em>-webhook.</span>
              </li>
            </ul>
          </section>

          <section className="glass-panel p-8 space-y-4">
            <h2 className="text-lg font-black tracking-tight">6. Kontakt</h2>
            <p className="text-sm text-[#6d7175] leading-relaxed">
              Spørsmål om personvern kan rettes til:<br />
              <strong className="text-[#1a1a1a]">Skarsten Digital</strong><br />
              E-post: <a href="mailto:hei@skarsten.no" className="text-[#005bd3] hover:underline">hei@skarsten.no</a>
            </p>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
