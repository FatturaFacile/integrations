export function generateCopilotDeclarativeManifest(): Record<string, unknown> {
  return {
    $schema: 'https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.0/schema.json',
    version: '1.0.0',
    name: 'FatturaFacile ERP Agent',
    description: 'Assistente AI per la gestione di fatture, preventivi, clienti e report contabili su FatturaFacile ERP',
    instructions: 'Sei un assistente contabile esperto integrato con il sistema ERP FatturaFacile. Quando ti viene chiesto di emettere una fattura, cerca prima il cliente e conferma i dettagli prima di invocare il tool.',
    capabilities: [
      {
        name: 'customer_lookup',
        description: 'Cerca un cliente nel database FatturaFacile tramite Partita IVA, Codice Fiscale o Email'
      },
      {
        name: 'invoice_create',
        description: 'Emette una nuova fattura per un cliente specificato'
      },
      {
        name: 'quote_create',
        description: 'Crea una fattura proforma o preventivo per un cliente'
      },
      {
        name: 'reporting',
        description: 'Ottiene statistiche di fatturato, fatture incassate e aperte'
      }
    ]
  };
}
