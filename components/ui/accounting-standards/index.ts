// Accounting Standards UI Components
// 
// This module provides multiple variations of accounting standards display components
// for different use cases and layouts.

export { AccountingStandardsDisplay as default, AccountingStandardsDisplay } from '../accounting-standards-display';
export type { AccountingStandard, AccountingStandardsDisplayProps } from '../accounting-standards-display';

export { default as RealEstateAccountingStandards } from '../real-estate-accounting-standards';
export { default as CompactAccountingStandards } from '../compact-accounting-standards';

// Usage Examples:
//
// 1. Full-featured component with selection:
import { AccountingStandardsDisplay } from '@/components/ui/accounting-standards';
// <AccountingStandardsDisplay standards={myStandards} selectable={true} onStandardSelect={handleSelect} />
//
// 2. Simple real estate standards display:
import { RealEstateAccountingStandards } from '@/components/ui/accounting-standards';
// <RealEstateAccountingStandards />
//
// 3. Compact version for sidebars:
import { CompactAccountingStandards } from '@/components/ui/accounting-standards';
<CompactAccountingStandards maxHeight="400px" />