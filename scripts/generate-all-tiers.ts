#!/usr/bin/env tsx
import { scaffoldIntegration } from './scaffold-integration.js';

interface PackageDef {
  category: string;
  name: string;
  description: string;
  tier: number;
}

const packages: PackageDef[] = [
  // Tier 2 (Enterprise Standard)
  { category: 'ecommerce', name: 'magento', description: 'Magento 2 enterprise e-commerce connector for FatturaFacile ERP', tier: 2 },
  { category: 'marketplaces', name: 'amazon', description: 'Amazon Seller Central order import and shipment sync for FatturaFacile ERP', tier: 2 },
  { category: 'shipping', name: 'dhl', description: 'DHL Express shipment creation, tracking and label printing for FatturaFacile ERP', tier: 2 },
  { category: 'shipping', name: 'gls', description: 'GLS courier logistics, tracking, and parcel labels for FatturaFacile ERP', tier: 2 },
  { category: 'productivity', name: 'google-workspace', description: 'Google Workspace Gmail notifications and Drive invoice archiving for FatturaFacile ERP', tier: 2 },
  { category: 'productivity', name: 'slack', description: 'Slack channel notifications and interactive invoice approvals for FatturaFacile ERP', tier: 2 },
  { category: 'crm', name: 'hubspot', description: 'HubSpot CRM contact, deal, and invoice synchronization for FatturaFacile ERP', tier: 2 },
  { category: 'crm', name: 'salesforce', description: 'Salesforce enterprise account, billing and order bridge for FatturaFacile ERP', tier: 2 },

  // Tier 3 (Extended Ecosystem)
  { category: 'ecommerce', name: 'prestashop', description: 'PrestaShop e-commerce order and customer synchronization for FatturaFacile ERP', tier: 3 },
  { category: 'marketplaces', name: 'ebay', description: 'eBay marketplace order import and stock level sync for FatturaFacile ERP', tier: 3 },
  { category: 'shipping', name: 'ups', description: 'UPS logistics, label generation, and worldwide tracking for FatturaFacile ERP', tier: 3 },
  { category: 'shipping', name: 'brt', description: 'BRT Bartolini parcel shipments and Italian domestic tracking for FatturaFacile ERP', tier: 3 },
  { category: 'accounting', name: 'open-banking', description: 'PSD2 Open Banking bank feeds and payment reconciliation for FatturaFacile ERP', tier: 3 },
  { category: 'accounting', name: 'peppol', description: 'Peppol eDelivery Network BIS Billing 3.0 electronic invoicing connector for FatturaFacile ERP', tier: 3 },
  { category: 'identity', name: 'keycloak', description: 'Keycloak IAM OAuth2/OIDC Single Sign-On and SCIM directory sync for FatturaFacile ERP', tier: 3 },
  { category: 'accounting', name: 'bexio', description: 'Swiss Bexio accounting export, VAT rates and QR-bill sync for FatturaFacile ERP', tier: 3 },
  { category: 'accounting', name: 'abacus', description: 'Swiss Abacus ERP enterprise accounting and booking ledger integration for FatturaFacile ERP', tier: 3 },
  { category: 'shipping', name: 'swisspost', description: 'Swiss Post barcode shipping labels and tracking for FatturaFacile ERP', tier: 3 },
  { category: 'payments', name: 'twint', description: 'Swiss TWINT mobile payment registration and reconciliation for FatturaFacile ERP', tier: 3 },
  { category: 'payments', name: 'postfinance', description: 'Swiss PostFinance Checkout payment gateway and reconciliation for FatturaFacile ERP', tier: 3 }
];

console.info(`Starting bulk scaffolding of ${packages.length} Tier-2 & Tier-3 integration packages...`);

for (const pkg of packages) {
  scaffoldIntegration({
    category: pkg.category,
    name: pkg.name,
    description: pkg.description,
    tier: pkg.tier
  });
}

console.info(`Successfully generated all ${packages.length} Tier-2 & Tier-3 packages.`);
