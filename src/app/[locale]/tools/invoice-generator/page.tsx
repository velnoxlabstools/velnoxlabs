'use client';

import React, { useState, useMemo } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

const CURRENCIES = [
  { code: 'USD', label: 'USD ($)' },
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'GBP', label: 'GBP (£)' },
  { code: 'INR', label: 'INR (₹)' },
  { code: 'CAD', label: 'CAD (C$)' },
  { code: 'AUD', label: 'AUD (A$)' },
];

function formatCurrency(amount: number, code: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(amount);
  } catch {
    return amount.toFixed(2);
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
  // ============ State ============
  const [currency, setCurrency] = useState('USD');
  const [businessName, setBusinessName] = useState('VelnoxLabs Inc.');
  const [businessEmail, setBusinessEmail] = useState('billing@velnoxlabs.com');
  const [businessAddress, setBusinessAddress] = useState(
    '123 Business Street\nNew York, NY 10001\nUnited States'
  );
  const [businessPhone, setBusinessPhone] = useState('+1 (555) 123-4567');

  const [clientName, setClientName] = useState('Acme Corporation');
  const [clientEmail, setClientEmail] = useState('accounts@acme.com');
  const [clientAddress, setClientAddress] = useState(
    '456 Client Avenue\nSan Francisco, CA 94102\nUnited States'
  );

  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-0001');
  const [invoiceDate, setInvoiceDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(addDays(todayISO(), 30));

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Website Development Services', quantity: 1, rate: 2500 },
    { id: '2', description: 'Monthly Maintenance Plan', quantity: 3, rate: 150 },
  ]);

  const [taxRate, setTaxRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [notes, setNotes] = useState('Thank you for your business. Payment is due within 30 days.');

  // ============ Calculations ============
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + (it.quantity || 0) * (it.rate || 0), 0);
    const discountAmount = subtotal * ((discountRate || 0) / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * ((taxRate || 0) / 100);
    const total = taxableAmount + taxAmount;
    return { subtotal, discountAmount, taxableAmount, taxAmount, total };
  }, [items, taxRate, discountRate]);

  // ============ Item Handlers ============
  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0 }]);
  };
  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((it) => it.id !== id));
  };
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const handlePrint = () => {
    window.print();
  };

  // ============ Render ============
  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area,
          #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: #ffffff;
            color: #000000;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title="Free Invoice Generator"
            subtitle="Create professional invoices in seconds — download as PDF, no sign-up, no limits."
          />

          {/* Launch Offer Banner */}
          <div
            style={{
              marginTop: 'var(--space-6)',
              background:
                'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span
                style={{
                  backgroundColor: '#10b981',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                🎉 Launch Offer
              </span>
              <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                Free for a limited time{' '}
                <span
                  style={{
                    color: '#94a3b8',
                    fontWeight: 400,
                    textDecoration: 'line-through',
                    marginLeft: '8px',
                  }}
                >
                  Normally $19/month
                </span>
              </span>
            </div>
            <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
              ✓ No credit card required
            </span>
          </div>

          {/* ============ TOOL UI ============ */}
          <div
            className="no-print"
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: '20px',
            }}
          >
            {/* Business + Client + Invoice Details */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '24px',
              }}
            >
              {/* Business Info */}
              <div
                style={{
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '16px',
                }}
              >
                <h3
                  style={{
                    color: '#60a5fa',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px',
                  }}
                >
                  From (Your Business)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Business Name"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="Email"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  <input
                    type="tel"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    placeholder="Phone"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  <textarea
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="Address"
                    rows={3}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              {/* Client Info */}
              <div
                style={{
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '16px',
                }}
              >
                <h3
                  style={{
                    color: '#a78bfa',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px',
                  }}
                >
                  Bill To (Client)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client Name"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Client Email"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  <textarea
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Client Address"
                    rows={3}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              {/* Invoice Details */}
              <div
                style={{
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '16px',
                }}
              >
                <h3
                  style={{
                    color: '#34d399',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px',
                  }}
                >
                  Invoice Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Invoice Number"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  <div>
                    <label
                      style={{
                        color: '#64748b',
                        fontSize: '0.7rem',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: '#fff',
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
                        marginBottom: '4px',
                      }}
                    >
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: '#fff',
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
                        marginBottom: '4px',
                      }}
                    >
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: '#fff',
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

            {/* Line Items */}
            <div style={{ marginBottom: '20px' }}>
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
                <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700 }}>Line Items</h3>
                <button
                  onClick={addItem}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  + Add Item
                </button>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  borderRadius: '10px',
                  padding: '12px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3fr 80px 110px 110px 40px',
                    gap: '8px',
                    marginBottom: '8px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span
                    style={{
                      color: '#64748b',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Description
                  </span>
                  <span
                    style={{
                      color: '#64748b',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Qty
                  </span>
                  <span
                    style={{
                      color: '#64748b',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Rate
                  </span>
                  <span
                    style={{
                      color: '#64748b',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: 'right',
                    }}
                  >
                    Amount
                  </span>
                  <span></span>
                </div>

                {/* Rows */}
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '3fr 80px 110px 110px 40px',
                      gap: '8px',
                      marginBottom: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: '#fff',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: '#fff',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
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
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: '#fff',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <span
                      style={{
                        color: '#34d399',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textAlign: 'right',
                        padding: '8px 0',
                      }}
                    >
                      {formatCurrency((item.quantity || 0) * (item.rate || 0), currency)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1}
                      style={{
                        backgroundColor:
                          items.length <= 1 ? 'rgba(255,255,255,0.03)' : 'rgba(239, 68, 68, 0.15)',
                        color: items.length <= 1 ? '#475569' : '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        padding: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax + Discount + Notes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label
                  style={{
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Notes / Payment Terms
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '10px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Totals Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <div
                style={{
                  minWidth: '280px',
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '16px',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
                >
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Subtotal</span>
                  <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {formatCurrency(totals.subtotal, currency)}
                  </span>
                </div>
                {discountRate > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      Discount ({discountRate}%)
                    </span>
                    <span style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      -{formatCurrency(totals.discountAmount, currency)}
                    </span>
                  </div>
                )}
                {taxRate > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Tax ({taxRate}%)</span>
                    <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {formatCurrency(totals.taxAmount, currency)}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    marginTop: '4px',
                  }}
                >
                  <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>
                    Total Due
                  </span>
                  <span
                    style={{
                      color: '#34d399',
                      fontFamily: 'monospace',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                    }}
                  >
                    {formatCurrency(totals.total, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handlePrint}
                style={{
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 28px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🖨️ Download PDF / Print
              </button>
              <button
                onClick={() => {
                  if (confirm('Reset invoice to default values?')) window.location.reload();
                }}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '12px' }}>
              💡 Click &quot;Download PDF / Print&quot; → in the dialog, choose{' '}
              <strong style={{ color: '#94a3b8' }}>&quot;Save as PDF&quot;</strong> as destination.
            </p>
          </div>

          {/* ============ PRINT-ONLY INVOICE PREVIEW ============ */}
          <div id="invoice-print-area" style={{ display: 'none' }}>
            <div
              style={{
                padding: '40px',
                maxWidth: '800px',
                margin: '0 auto',
                fontFamily: 'Arial, sans-serif',
                color: '#000',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '40px',
                  borderBottom: '2px solid #000',
                  paddingBottom: '20px',
                }}
              >
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, color: '#000' }}>
                    INVOICE
                  </h1>
                  <p style={{ fontSize: '14px', color: '#555', margin: '4px 0 0 0' }}>
                    #{invoiceNumber}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#000' }}>
                    {businessName}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#555',
                      whiteSpace: 'pre-line',
                      marginTop: '4px',
                    }}
                  >
                    {businessAddress}
                  </div>
                  <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                    {businessEmail}
                  </div>
                  <div style={{ fontSize: '12px', color: '#555' }}>{businessPhone}</div>
                </div>
              </div>

              {/* Bill To + Details */}
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#555',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '6px',
                    }}
                  >
                    Bill To
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#000' }}>
                    {clientName}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#555',
                      whiteSpace: 'pre-line',
                      marginTop: '4px',
                    }}
                  >
                    {clientAddress}
                  </div>
                  <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                    {clientEmail}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#555',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      Invoice Date
                    </div>
                    <div style={{ fontSize: '13px', color: '#000' }}>{invoiceDate}</div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#555',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      Due Date
                    </div>
                    <div style={{ fontSize: '13px', color: '#000' }}>{dueDate}</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#333',
                        borderBottom: '2px solid #000',
                      }}
                    >
                      Description
                    </th>
                    <th
                      style={{
                        textAlign: 'center',
                        padding: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#333',
                        borderBottom: '2px solid #000',
                        width: '70px',
                      }}
                    >
                      Qty
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#333',
                        borderBottom: '2px solid #000',
                        width: '110px',
                      }}
                    >
                      Rate
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#333',
                        borderBottom: '2px solid #000',
                        width: '120px',
                      }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td
                        style={{
                          padding: '10px',
                          fontSize: '13px',
                          color: '#000',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        {it.description || '—'}
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          fontSize: '13px',
                          color: '#000',
                          textAlign: 'center',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        {it.quantity}
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          fontSize: '13px',
                          color: '#000',
                          textAlign: 'right',
                          borderBottom: '1px solid #e5e7eb',
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatCurrency(it.rate, currency)}
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          fontSize: '13px',
                          color: '#000',
                          textAlign: 'right',
                          borderBottom: '1px solid #e5e7eb',
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatCurrency((it.quantity || 0) * (it.rate || 0), currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
                <div style={{ minWidth: '280px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      fontSize: '13px',
                      color: '#333',
                    }}
                  >
                    <span>Subtotal</span>
                    <span style={{ fontFamily: 'monospace' }}>
                      {formatCurrency(totals.subtotal, currency)}
                    </span>
                  </div>
                  {discountRate > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        fontSize: '13px',
                        color: '#333',
                      }}
                    >
                      <span>Discount ({discountRate}%)</span>
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
                        padding: '6px 0',
                        fontSize: '13px',
                        color: '#333',
                      }}
                    >
                      <span>Tax ({taxRate}%)</span>
                      <span style={{ fontFamily: 'monospace' }}>
                        {formatCurrency(totals.taxAmount, currency)}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderTop: '2px solid #000',
                      marginTop: '6px',
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#000',
                    }}
                  >
                    <span>Total Due</span>
                    <span style={{ fontFamily: 'monospace' }}>
                      {formatCurrency(totals.total, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {notes && (
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#555',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '6px',
                    }}
                  >
                    Notes
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#333',
                      whiteSpace: 'pre-line',
                      lineHeight: 1.6,
                    }}
                  >
                    {notes}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div
                style={{ marginTop: '40px', textAlign: 'center', fontSize: '11px', color: '#888' }}
              >
                Generated with VelnoxLabs Invoice Generator — velnoxlabs.vercel.app
              </div>
            </div>
          </div>

          <ToolSeoContent toolSlug="invoice-generator" toolName="Invoice Generator" />
        </div>
      </GlobalContainer>
    </>
  );
}
