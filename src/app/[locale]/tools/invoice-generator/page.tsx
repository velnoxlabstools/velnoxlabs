'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { getCurrencyCode } from '@/lib/format';
import {
  FileText,
  Download,
  Printer,
  Eye,
  Edit3,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  Building2,
  User,
  CreditCard,
  ShieldCheck,
  Palette,
} from 'lucide-react';

interface LineItem {
  id: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  rate: number;
}

type TemplateType = 'modern' | 'corporate' | 'gst' | 'minimal';

const CURRENCIES = [
  { code: 'USD', label: 'USD ($)', symbol: '$' },
  { code: 'EUR', label: 'EUR (€)', symbol: '€' },
  { code: 'INR', label: 'INR (₹)', symbol: '₹' },
  { code: 'GBP', label: 'GBP (£)', symbol: '£' },
  { code: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { code: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
  { code: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { code: 'CNY', label: 'CNY (¥)', symbol: '¥' },
  { code: 'BRL', label: 'BRL (R$)', symbol: 'R$' },
  { code: 'RUB', label: 'RUB (₽)', symbol: '₽' },
  { code: 'KRW', label: 'KRW (₩)', symbol: '₩' },
];

function formatCurrencyWithLocale(amount: number, code: string, locale: string = 'en') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function InvoiceGeneratorPage() {
  const locale = useLocale();
  const tUI = useTranslations('ToolUI.invoiceGenerator');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active view tab: 'edit' or 'preview'
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [template, setTemplate] = useState<TemplateType>('modern');

  // Business Information
  const [businessLogo, setBusinessLogo] = useState<string>('');
  const [businessName, setBusinessName] = useState('VelnoxLabs Digital');
  const [businessTaxId, setBusinessTaxId] = useState('GSTIN: 27AAAAA0000A1Z5');
  const [businessEmail, setBusinessEmail] = useState('billing@velnoxlabs.com');
  const [businessPhone, setBusinessPhone] = useState('+1 (555) 234-5678');
  const [businessAddress, setBusinessAddress] = useState(
    '742 Evergreen Terrace, Suite 400\nSpringfield, OR 97477\nUnited States'
  );

  // Client Information
  const [clientName, setClientName] = useState('Acme Corporation');
  const [clientTaxId, setClientTaxId] = useState('GSTIN / Tax ID: US-987654321');
  const [clientEmail, setClientEmail] = useState('accounts@acme.com');
  const [clientAddress, setClientAddress] = useState(
    '100 Market Street, 12th Floor\nSan Francisco, CA 94105\nUnited States'
  );

  // Invoice Meta
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-001');
  const [poNumber, setPoNumber] = useState('PO-94821');
  const [invoiceDate, setInvoiceDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(addDays(todayISO(), 14));
  const [currency, setCurrency] = useState(() => getCurrencyCode(locale) || 'USD');

  // Line Items
  const [items, setItems] = useState<LineItem[]>([
    {
      id: '1',
      description: 'Full-Stack Web Application Development',
      hsnCode: '998314',
      quantity: 1,
      rate: 3200,
    },
    {
      id: '2',
      description: 'Cloud Infrastructure & DevOps Setup',
      hsnCode: '998313',
      quantity: 1,
      rate: 1400,
    },
    {
      id: '3',
      description: 'Monthly Retainer & Technical Support',
      hsnCode: '998315',
      quantity: 2,
      rate: 450,
    },
  ]);

  // Tax, Discount & Shipping
  const [taxRate, setTaxRate] = useState(18); // Default 18% standard GST / VAT
  const [discountRate, setDiscountRate] = useState(5);
  const [shippingFee, setShippingFee] = useState(0);

  // Payment Details
  const [bankName, setBankName] = useState('Chase Commercial Bank');
  const [accountNumber, setAccountNumber] = useState('987654321098');
  const [ifscSwift, setIfscSwift] = useState('CHASUS33 / IFSC: HDFC0001234');
  const [upiId, setUpiId] = useState('billing@velnoxlabs');
  const [paymentTerms, setPaymentTerms] = useState(
    'Payment is due within 14 days of invoice date. Late payments are subject to a 1.5% monthly fee.'
  );
  const [notes, setNotes] = useState(
    'Thank you for partnering with VelnoxLabs! For billing inquiries, email billing@velnoxlabs.com.'
  );
  const [signatoryName, setSignatoryName] = useState('Authorized Signatory');

  // Load / Save to LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('velnox_saved_invoice_biz');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.businessName) setBusinessName(parsed.businessName);
        if (parsed.businessTaxId) setBusinessTaxId(parsed.businessTaxId);
        if (parsed.businessEmail) setBusinessEmail(parsed.businessEmail);
        if (parsed.businessPhone) setBusinessPhone(parsed.businessPhone);
        if (parsed.businessAddress) setBusinessAddress(parsed.businessAddress);
        if (parsed.bankName) setBankName(parsed.bankName);
        if (parsed.accountNumber) setAccountNumber(parsed.accountNumber);
        if (parsed.ifscSwift) setIfscSwift(parsed.ifscSwift);
        if (parsed.upiId) setUpiId(parsed.upiId);
        if (parsed.businessLogo) setBusinessLogo(parsed.businessLogo);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveBusinessDefaults = () => {
    try {
      const data = {
        businessName,
        businessTaxId,
        businessEmail,
        businessPhone,
        businessAddress,
        bankName,
        accountNumber,
        ifscSwift,
        upiId,
        businessLogo,
      };
      localStorage.setItem('velnox_saved_invoice_biz', JSON.stringify(data));
      alert(tUI('savedToBrowserAlert'));
    } catch {
      // Ignore
    }
  };

  // Calculations
  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.rate) || 0),
      0
    );
    const discountAmount = subtotal * ((Number(discountRate) || 0) / 100);
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxableAmount * ((Number(taxRate) || 0) / 100);
    const total = taxableAmount + taxAmount + (Number(shippingFee) || 0);

    // GST Specific calculations for Indian GST Template
    const cgstAmount = taxAmount / 2;
    const sgstAmount = taxAmount / 2;

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      cgstAmount,
      sgstAmount,
      total,
    };
  }, [items, taxRate, discountRate, shippingFee]);

  const formatCurrency = (amount: number, code: string) =>
    formatCurrencyWithLocale(amount, code, locale);

  // Logo uploader
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo image should be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setBusinessLogo(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setBusinessLogo('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Industry Presets
  const applyPreset = (type: 'freelance' | 'consulting' | 'retail' | 'saas') => {
    if (type === 'freelance') {
      setItems([
        {
          id: '1',
          description: 'UI/UX Design Mockups & Wireframes',
          hsnCode: '998314',
          quantity: 1,
          rate: 1200,
        },
        {
          id: '2',
          description: 'Next.js Frontend Implementation',
          hsnCode: '998314',
          quantity: 1,
          rate: 2500,
        },
        {
          id: '3',
          description: 'API Integration & Responsive QA',
          hsnCode: '998313',
          quantity: 1,
          rate: 800,
        },
      ]);
      setTaxRate(18);
      setDiscountRate(0);
    } else if (type === 'consulting') {
      setItems([
        {
          id: '1',
          description: 'Business Strategy Consulting Session (Hours)',
          hsnCode: '998311',
          quantity: 10,
          rate: 150,
        },
        {
          id: '2',
          description: 'Market Research & Competitive Audit Report',
          hsnCode: '998311',
          quantity: 1,
          rate: 1800,
        },
      ]);
      setTaxRate(10);
      setDiscountRate(5);
    } else if (type === 'retail') {
      setItems([
        {
          id: '1',
          description: 'Ergonomic Office Chair - Model Pro',
          hsnCode: '940130',
          quantity: 5,
          rate: 220,
        },
        {
          id: '2',
          description: 'Wireless Mechanical Keyboard',
          hsnCode: '847160',
          quantity: 5,
          rate: 95,
        },
      ]);
      setTaxRate(18);
      setDiscountRate(10);
      setShippingFee(45);
    } else {
      setItems([
        {
          id: '1',
          description: 'Enterprise Cloud Platform - Annual License',
          hsnCode: '997331',
          quantity: 1,
          rate: 4800,
        },
        {
          id: '2',
          description: 'Dedicated Account Manager & 24/7 SLA',
          hsnCode: '998315',
          quantity: 1,
          rate: 1200,
        },
      ]);
      setTaxRate(18);
      setDiscountRate(15);
    }
  };

  // Line Item Handlers
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), description: '', hsnCode: '', quantity: 1, rate: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const handlePrint = () => {
    window.print();
  };

  // Template accent colors
  const templateConfig = useMemo(() => {
    switch (template) {
      case 'corporate':
        return {
          primary: '#1e3a8a',
          secondary: '#3b82f6',
          headerBg: '#1e3a8a',
          headerText: '#ffffff',
          accentBorder: '#1e3a8a',
          tableHeadBg: '#eff6ff',
        };
      case 'gst':
        return {
          primary: '#0f766e',
          secondary: '#14b8a6',
          headerBg: '#0f766e',
          headerText: '#ffffff',
          accentBorder: '#0f766e',
          tableHeadBg: '#f0fdfa',
        };
      case 'minimal':
        return {
          primary: '#18181b',
          secondary: '#71717a',
          headerBg: '#ffffff',
          headerText: '#000000',
          accentBorder: '#000000',
          tableHeadBg: '#f4f4f5',
        };
      case 'modern':
      default:
        return {
          primary: '#059669',
          secondary: '#10b981',
          headerBg: '#059669',
          headerText: '#ffffff',
          accentBorder: '#059669',
          tableHeadBg: '#ecfdf5',
        };
    }
  }, [template]);

  // Reusable Full Rendered Invoice Document (used in both Live On-Screen Preview & Print-Area)
  const renderInvoiceDocument = (isPrint: boolean = false) => (
    <div
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        padding: isPrint ? '32px' : '36px',
        maxWidth: '820px',
        margin: '0 auto',
        borderRadius: isPrint ? '0' : '12px',
        boxShadow: isPrint ? 'none' : '0 10px 30px rgba(0,0,0,0.12)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        lineHeight: 1.5,
      }}
    >
      {/* Invoice Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: `3px solid ${templateConfig.accentBorder}`,
          paddingBottom: '20px',
          marginBottom: '24px',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {businessLogo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={businessLogo}
              alt="Business Logo"
              style={{
                maxHeight: '65px',
                maxWidth: '180px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: templateConfig.primary,
                letterSpacing: '-0.02em',
              }}
            >
              {businessName || 'Business Name'}
            </div>
          )}
          <div style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'pre-line' }}>
            {businessAddress}
          </div>
          {businessTaxId && (
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
              {businessTaxId}
            </div>
          )}
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {businessEmail} {businessPhone ? `• ${businessPhone}` : ''}
          </div>
        </div>

        {/* Invoice Title & Metadata */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: templateConfig.primary,
              margin: '0 0 4px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {template === 'gst' ? tUI('taxInvoiceTitle') : tUI('invoiceTitle')}
          </h1>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
            #{invoiceNumber}
          </div>
          {poNumber && (
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {tUI('poNumber')}: {poNumber}
            </div>
          )}
          <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '6px' }}>
            <strong>{tUI('invoiceDate')}:</strong> {invoiceDate}
          </div>
          <div style={{ fontSize: '0.825rem', color: '#475569' }}>
            <strong>{tUI('dueDate')}:</strong> {dueDate}
          </div>
        </div>
      </div>

      {/* Bill To & Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.725rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: templateConfig.secondary,
              marginBottom: '6px',
            }}
          >
            {tUI('billTo')}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
            {clientName || 'Client Name'}
          </div>
          <div
            style={{
              fontSize: '0.825rem',
              color: '#475569',
              whiteSpace: 'pre-line',
              marginTop: '4px',
            }}
          >
            {clientAddress}
          </div>
          {clientTaxId && (
            <div
              style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}
            >
              {clientTaxId}
            </div>
          )}
          {clientEmail && (
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              {clientEmail}
            </div>
          )}
        </div>

        {/* Payment Summary Box */}
        <div
          style={{
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#64748b',
            }}
          >
            {tUI('totalAmountDue')}
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: templateConfig.primary,
              fontFamily: 'monospace',
              marginTop: '4px',
            }}
          >
            {formatCurrency(totals.total, currency)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
            {tUI('dueBy')}: <strong>{dueDate}</strong>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <thead>
          <tr style={{ backgroundColor: templateConfig.tableHeadBg }}>
            <th
              style={{
                textAlign: 'left',
                padding: '12px 14px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: templateConfig.primary,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderBottom: `2px solid ${templateConfig.accentBorder}`,
              }}
            >
              {tUI('description')}
            </th>
            {template === 'gst' && (
              <th
                style={{
                  textAlign: 'center',
                  padding: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: templateConfig.primary,
                  textTransform: 'uppercase',
                  borderBottom: `2px solid ${templateConfig.accentBorder}`,
                  width: '90px',
                }}
              >
                HSN/SAC
              </th>
            )}
            <th
              style={{
                textAlign: 'center',
                padding: '12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: templateConfig.primary,
                textTransform: 'uppercase',
                borderBottom: `2px solid ${templateConfig.accentBorder}`,
                width: '70px',
              }}
            >
              {tUI('qty')}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: templateConfig.primary,
                textTransform: 'uppercase',
                borderBottom: `2px solid ${templateConfig.accentBorder}`,
                width: '120px',
              }}
            >
              {tUI('rate')}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px 14px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: templateConfig.primary,
                textTransform: 'uppercase',
                borderBottom: `2px solid ${templateConfig.accentBorder}`,
                width: '130px',
              }}
            >
              {tUI('amount')}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr
              key={it.id}
              style={{
                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#1e293b' }}>
                <div style={{ fontWeight: 600 }}>{it.description || '—'}</div>
              </td>
              {template === 'gst' && (
                <td
                  style={{
                    padding: '12px',
                    fontSize: '0.8rem',
                    color: '#64748b',
                    textAlign: 'center',
                  }}
                >
                  {it.hsnCode || '—'}
                </td>
              )}
              <td
                style={{
                  padding: '12px',
                  fontSize: '0.85rem',
                  color: '#1e293b',
                  textAlign: 'center',
                }}
              >
                {it.quantity}
              </td>
              <td
                style={{
                  padding: '12px',
                  fontSize: '0.85rem',
                  color: '#1e293b',
                  textAlign: 'right',
                  fontFamily: 'monospace',
                }}
              >
                {formatCurrency(Number(it.rate) || 0, currency)}
              </td>
              <td
                style={{
                  padding: '12px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  textAlign: 'right',
                  fontFamily: 'monospace',
                }}
              >
                {formatCurrency((Number(it.quantity) || 0) * (Number(it.rate) || 0), currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bottom Grid: Payment Info + Totals */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Left: Bank Details & UPI */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '0.8rem',
            color: '#334155',
          }}
        >
          <div
            style={{
              fontWeight: 800,
              textTransform: 'uppercase',
              color: templateConfig.primary,
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}
          >
            {tUI('paymentDetailsTitle')}
          </div>
          {bankName && (
            <div style={{ marginBottom: '3px' }}>
              <strong>{tUI('bankName')}:</strong> {bankName}
            </div>
          )}
          {accountNumber && (
            <div style={{ marginBottom: '3px' }}>
              <strong>{tUI('accountNumber')}:</strong> {accountNumber}
            </div>
          )}
          {ifscSwift && (
            <div style={{ marginBottom: '3px' }}>
              <strong>{tUI('ifscSwift')}:</strong> {ifscSwift}
            </div>
          )}
          {upiId && (
            <div style={{ marginBottom: '6px' }}>
              <strong>{tUI('upiId')}:</strong> {upiId}
            </div>
          )}
          {paymentTerms && (
            <div
              style={{
                marginTop: '8px',
                fontSize: '0.75rem',
                color: '#64748b',
                fontStyle: 'italic',
              }}
            >
              {paymentTerms}
            </div>
          )}
        </div>

        {/* Right: Calculations Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: '#475569',
            }}
          >
            <span>{tUI('subtotal')}:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
              {formatCurrency(totals.subtotal, currency)}
            </span>
          </div>

          {discountRate > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                color: '#ef4444',
              }}
            >
              <span>{tUI('discountWithRate', { rate: discountRate })}:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                -{formatCurrency(totals.discountAmount, currency)}
              </span>
            </div>
          )}

          {template === 'gst' && taxRate > 0 ? (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#475569',
                }}
              >
                <span>CGST ({taxRate / 2}%):</span>
                <span style={{ fontFamily: 'monospace' }}>
                  {formatCurrency(totals.cgstAmount, currency)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#475569',
                }}
              >
                <span>SGST ({taxRate / 2}%):</span>
                <span style={{ fontFamily: 'monospace' }}>
                  {formatCurrency(totals.sgstAmount, currency)}
                </span>
              </div>
            </>
          ) : (
            taxRate > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  color: '#475569',
                }}
              >
                <span>{tUI('taxWithRate', { rate: taxRate })}:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {formatCurrency(totals.taxAmount, currency)}
                </span>
              </div>
            )
          )}

          {shippingFee > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                color: '#475569',
              }}
            >
              <span>{tUI('shippingFee')}:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {formatCurrency(shippingFee, currency)}
              </span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `2px solid ${templateConfig.accentBorder}`,
              paddingTop: '10px',
              marginTop: '4px',
            }}
          >
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              {tUI('totalDue')}:
            </span>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                color: templateConfig.primary,
                fontFamily: 'monospace',
              }}
            >
              {formatCurrency(totals.total, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes & Signatory Footer */}
      <div
        style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ maxWidth: '420px' }}>
          <div
            style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
            }}
          >
            {tUI('notes')}:
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: '#475569',
              whiteSpace: 'pre-line',
              marginTop: '4px',
            }}
          >
            {notes}
          </div>
        </div>

        <div style={{ textAlign: 'center', minWidth: '180px' }}>
          <div
            style={{
              borderBottom: '1px solid #94a3b8',
              height: '35px',
              marginBottom: '6px',
            }}
          ></div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
            {signatoryName}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{businessName}</div>
        </div>
      </div>

      {/* No Watermark Clean Guarantee Footer */}
      <div
        style={{
          marginTop: '28px',
          textAlign: 'center',
          fontSize: '0.725rem',
          color: '#94a3b8',
          letterSpacing: '0.02em',
        }}
      >
        {tUI('footerText')}
      </div>
    </div>
  );

  return (
    <>
      {/* High-res Print CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-print-area,
          #invoice-print-area * {
            visibility: visible !important;
          }
          #invoice-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          {/* Section Heading */}
          <SectionHeading
            title={tUI('title')}
            subtitle={tUI('subtitle')}
            toolSlug="invoice-generator"
          />

          {/* NO WATERMARK & 100% FREE TRUST HERO BANNER */}
          <div
            className="no-print"
            style={{
              marginTop: 'var(--space-6)',
              background:
                'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '14px',
              padding: '16px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  textTransform: 'uppercase',
                }}
              >
                <ShieldCheck size={14} />
                {tUI('noWatermarkBadge')}
              </span>
              <span style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                {tUI('noWatermarkSubtitle')}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={15} />
                {tUI('downloadPdf')}
              </button>
            </div>
          </div>

          {/* TEMPLATE PICKER & VIEW MODE TABS */}
          <div
            className="no-print"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '20px',
              marginBottom: '16px',
            }}
          >
            {/* View Mode Toggle: Form Edit vs Live Preview */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '3px',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === 'edit' ? 'var(--primary-color)' : 'transparent',
                  color: activeTab === 'edit' ? '#ffffff' : 'var(--text-main)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Edit3 size={15} />
                {tUI('tabEditInvoice')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === 'preview' ? 'var(--primary-color)' : 'transparent',
                  color: activeTab === 'preview' ? '#ffffff' : 'var(--text-main)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Eye size={15} />
                {tUI('tabLivePreview')}
              </button>
            </div>

            {/* Template Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Palette size={16} color="var(--primary-color)" />
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {tUI('chooseTemplate')}:
              </span>
              {[
                { id: 'modern', label: tUI('templateModern') },
                { id: 'corporate', label: tUI('templateCorporate') },
                { id: 'gst', label: tUI('templateGst') },
                { id: 'minimal', label: tUI('templateMinimal') },
              ].map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setTemplate(tpl.id as TemplateType)}
                  style={{
                    backgroundColor:
                      template === tpl.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                    color: template === tpl.id ? '#60a5fa' : 'var(--text-main)',
                    border:
                      template === tpl.id ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: FORM EDIT MODE */}
          {/* ========================================================================= */}
          {activeTab === 'edit' && (
            <div
              className="no-print"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              {/* 1-Click Industry Presets */}
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  <Sparkles size={14} color="var(--primary-color)" />
                  {tUI('quickPresetsTitle')}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => applyPreset('freelance')}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                    }}
                  >
                    💻 {tUI('presetFreelance')}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('consulting')}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                    }}
                  >
                    📊 {tUI('presetConsulting')}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('retail')}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                    }}
                  >
                    📦 {tUI('presetRetail')}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('saas')}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                    }}
                  >
                    ☁️ {tUI('presetSaas')}
                  </button>
                </div>
              </div>

              {/* Business Info + Client Info + Invoice Metadata Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  marginBottom: '24px',
                }}
              >
                {/* 1. From Business */}
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    <Building2 size={16} color="#60a5fa" />
                    <h3
                      style={{
                        color: '#60a5fa',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        margin: 0,
                      }}
                    >
                      {tUI('fromBusiness')}
                    </h3>
                  </div>

                  {/* Logo Upload Box */}
                  <div style={{ marginBottom: '12px' }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                    {businessLogo ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          backgroundColor: 'var(--bg-page)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={businessLogo}
                          alt="Logo Preview"
                          style={{ maxHeight: '35px', maxWidth: '80px', objectFit: 'contain' }}
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          style={{
                            color: '#f87171',
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          {tUI('removeLogo')}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px dashed var(--border-color)',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                        }}
                      >
                        <ImageIcon size={14} />
                        {tUI('uploadLogo')}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder={tUI('businessNamePlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={businessTaxId}
                      onChange={(e) => setBusinessTaxId(e.target.value)}
                      placeholder={tUI('taxIdPlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      placeholder={tUI('businessEmailPlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="tel"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      placeholder={tUI('businessPhonePlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <textarea
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder={tUI('businessAddressPlaceholder')}
                      rows={3}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>

                {/* 2. Bill To Client */}
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    <User size={16} color="#a78bfa" />
                    <h3
                      style={{
                        color: '#a78bfa',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        margin: 0,
                      }}
                    >
                      {tUI('billToClient')}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={tUI('clientNamePlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={clientTaxId}
                      onChange={(e) => setClientTaxId(e.target.value)}
                      placeholder={tUI('clientTaxIdPlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder={tUI('clientEmailPlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <textarea
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder={tUI('clientAddressPlaceholder')}
                      rows={4}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>

                {/* 3. Invoice Metadata */}
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    <FileText size={16} color="#34d399" />
                    <h3
                      style={{
                        color: '#34d399',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        margin: 0,
                      }}
                    >
                      {tUI('invoiceDetails')}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label
                        style={{
                          color: '#64748b',
                          fontSize: '0.7rem',
                          display: 'block',
                          marginBottom: '2px',
                        }}
                      >
                        {tUI('invoiceNumberLabel')}
                      </label>
                      <input
                        type="text"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        placeholder="INV-2026-001"
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px 10px',
                          fontSize: '0.85rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          color: '#64748b',
                          fontSize: '0.7rem',
                          display: 'block',
                          marginBottom: '2px',
                        }}
                      >
                        {tUI('poNumber')}
                      </label>
                      <input
                        type="text"
                        value={poNumber}
                        onChange={(e) => setPoNumber(e.target.value)}
                        placeholder="PO-12345"
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px 10px',
                          fontSize: '0.85rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label
                          style={{
                            color: '#64748b',
                            fontSize: '0.7rem',
                            display: 'block',
                            marginBottom: '2px',
                          }}
                        >
                          {tUI('invoiceDate')}
                        </label>
                        <input
                          type="date"
                          value={invoiceDate}
                          onChange={(e) => setInvoiceDate(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            color: 'var(--text-main)',
                            padding: '8px',
                            fontSize: '0.8rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            color: '#64748b',
                            fontSize: '0.7rem',
                            display: 'block',
                            marginBottom: '2px',
                          }}
                        >
                          {tUI('dueDate')}
                        </label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            color: 'var(--text-main)',
                            padding: '8px',
                            fontSize: '0.8rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          color: '#64748b',
                          fontSize: '0.7rem',
                          display: 'block',
                          marginBottom: '2px',
                        }}
                      >
                        {tUI('currency')}
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px 10px',
                          fontSize: '0.85rem',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {tUI('lineItems')}
                  </h3>
                  <button
                    type="button"
                    onClick={addItem}
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={14} />
                    {tUI('addItem')}
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '10px',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {/* Table Headers */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        template === 'gst'
                          ? '3fr 100px 70px 110px 110px 40px'
                          : '3fr 70px 110px 110px 40px',
                      gap: '8px',
                      marginBottom: '8px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    <div>{tUI('description')}</div>
                    {template === 'gst' && <div>HSN/SAC</div>}
                    <div style={{ textAlign: 'center' }}>{tUI('qty')}</div>
                    <div style={{ textAlign: 'center' }}>{tUI('rate')}</div>
                    <div style={{ textAlign: 'right' }}>{tUI('amount')}</div>
                    <div></div>
                  </div>

                  {/* Item Rows */}
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          template === 'gst'
                            ? '3fr 100px 70px 110px 110px 40px'
                            : '3fr 70px 110px 110px 40px',
                        gap: '8px',
                        marginBottom: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder={tUI('itemDescriptionPlaceholder')}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px 10px',
                          fontSize: '0.85rem',
                          outline: 'none',
                        }}
                      />
                      {template === 'gst' && (
                        <input
                          type="text"
                          value={item.hsnCode || ''}
                          onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value)}
                          placeholder="998314"
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            color: 'var(--text-main)',
                            padding: '8px',
                            fontSize: '0.8rem',
                            outline: 'none',
                            textAlign: 'center',
                          }}
                        />
                      )}
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px',
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          outline: 'none',
                        }}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px',
                          fontSize: '0.85rem',
                          fontFamily: 'monospace',
                          textAlign: 'center',
                          outline: 'none',
                        }}
                      />
                      <span
                        style={{
                          color: '#34d399',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                        }}
                      >
                        {formatCurrency(
                          (Number(item.quantity) || 0) * (Number(item.rate) || 0),
                          currency
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length <= 1}
                        style={{
                          backgroundColor:
                            items.length <= 1 ? 'transparent' : 'rgba(239, 68, 68, 0.15)',
                          color: items.length <= 1 ? '#475569' : '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax + Discount + Shipping + Bank Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '20px',
                  marginBottom: '24px',
                }}
              >
                {/* Bank / Payment Details */}
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    <CreditCard size={16} color="#38bdf8" />
                    <h3
                      style={{
                        color: '#38bdf8',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        margin: 0,
                      }}
                    >
                      {tUI('paymentDetailsTitle')}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder={tUI('bankNamePlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.825rem',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder={tUI('accountNumberPlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.825rem',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={ifscSwift}
                      onChange={(e) => setIfscSwift(e.target.value)}
                      placeholder={tUI('ifscSwiftPlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.825rem',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder={tUI('upiPlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.825rem',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Payment Terms (e.g. Due within 14 days)"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.825rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Tax & Discount Controls + Totals */}
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.75rem',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        {tUI('taxRate')} (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px',
                          fontSize: '0.85rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.75rem',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        {tUI('discount')} (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={discountRate}
                        onChange={(e) => setDiscountRate(Number(e.target.value))}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px',
                          fontSize: '0.85rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('shippingFee')} ({currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(Number(e.target.value))}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px',
                        fontSize: '0.85rem',
                        outline: 'none',
                        marginBottom: '14px',
                      }}
                    />
                  </div>

                  {/* Summary Rows */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.825rem',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>{tUI('subtotal')}:</span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>
                        {formatCurrency(totals.subtotal, currency)}
                      </span>
                    </div>
                    {discountRate > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.825rem',
                          marginBottom: '4px',
                          color: '#f87171',
                        }}
                      >
                        <span>{tUI('discountWithRate', { rate: discountRate })}:</span>
                        <span style={{ fontFamily: 'monospace' }}>
                          -{formatCurrency(totals.discountAmount, currency)}
                        </span>
                      </div>
                    )}
                    {taxRate > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.825rem',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>
                          {tUI('taxWithRate', { rate: taxRate })}:
                        </span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>
                          {formatCurrency(totals.taxAmount, currency)}
                        </span>
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '8px',
                        marginTop: '6px',
                        fontSize: '1rem',
                        fontWeight: 800,
                      }}
                    >
                      <span style={{ color: 'var(--text-main)' }}>{tUI('totalDue')}:</span>
                      <span style={{ color: '#34d399', fontFamily: 'monospace' }}>
                        {formatCurrency(totals.total, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes & Signatory */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    {tUI('notesTerms')}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      padding: '8px 10px',
                      fontSize: '0.825rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    {tUI('signatoryNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    placeholder="Authorized Signatory"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Eye size={16} />
                  {tUI('previewInvoice')}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 28px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Printer size={16} />
                  {tUI('downloadPdf')}
                </button>
                <button
                  type="button"
                  onClick={saveBusinessDefaults}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  💾 {tUI('saveDefaults')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(tUI('resetConfirm'))) window.location.reload();
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {tUI('reset')}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: LIVE ON-SCREEN INVOICE PREVIEW */}
          {/* ========================================================================= */}
          {activeTab === 'preview' && (
            <div className="no-print" style={{ marginBottom: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Edit3 size={15} />
                  {tUI('backToEdit')}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Download size={16} />
                  {tUI('downloadPdf')}
                </button>
              </div>

              {/* The Live Rendered Document */}
              {renderInvoiceDocument(false)}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PRINT-ONLY AREA (Targeted by @media print) */}
          {/* ========================================================================= */}
          <div id="invoice-print-area" style={{ display: 'none' }}>
            {renderInvoiceDocument(true)}
          </div>

          {/* TECHNICAL SEO SECTION */}
          <ToolSeoContent
            toolSlug="invoice-generator"
            toolName={tUI('title')}
            description={tUI('subtitle')}
            customAbout={tUI('aboutText')}
            customFeatures={[tUI('feature1'), tUI('feature2'), tUI('feature3'), tUI('feature4')]}
            customSteps={[
              { title: tUI('step1Title'), body: tUI('step1Body') },
              { title: tUI('step2Title'), body: tUI('step2Body') },
              { title: tUI('step3Title'), body: tUI('step3Body') },
            ]}
            customFaqs={[
              { q: tUI('faq1Q'), a: tUI('faq1A') },
              { q: tUI('faq2Q'), a: tUI('faq2A') },
              { q: tUI('faq3Q'), a: tUI('faq3A') },
              { q: tUI('faq4Q'), a: tUI('faq4A') },
            ]}
          />
        </div>
      </GlobalContainer>
    </>
  );
}
