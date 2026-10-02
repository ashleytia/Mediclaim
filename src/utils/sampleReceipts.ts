export interface SampleReceiptMeta {
  id: string;
  name: string;
  clinic: string;
  employee: string;
  diagnosis: string;
  total: string;
}

export const SAMPLE_RECEIPTS: SampleReceiptMeta[] = [
  {
    id: 'sample-1',
    name: 'General Practice (GP) Clinic',
    clinic: 'Healthway Medical Family Clinic',
    employee: 'Tan Wei Ming Marcus',
    diagnosis: 'Acute Upper Respiratory Tract Infection (URTI) & Fever',
    total: '$98.10',
  },
  {
    id: 'sample-2',
    name: 'Dental Care Practice',
    clinic: 'SmileCare Dental Surgery',
    employee: 'Sarah Jenkins',
    diagnosis: 'Dental Scaling, Polishing & Fluoride Application',
    total: '$152.60',
  },
  {
    id: 'sample-3',
    name: 'Specialist Orthopaedic Clinic',
    clinic: 'Orthopaedic & Sports Medicine Clinic',
    employee: 'Mohammad Farhan Bin Ismail',
    diagnosis: 'Right Ankle Sprain Grade II - Consultation & X-Ray Examination',
    total: '$294.30',
  },
];

/**
 * Generates a realistic high-resolution medical bill receipt image as a base64 PNG data URL
 */
export function generateSampleReceiptImage(sampleId: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#faf9f5'; // realistic off-white thermal receipt paper
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle paper texture / faint borders
  ctx.strokeStyle = '#e2dfd2';
  ctx.lineWidth = 2;
  ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

  // Data per sample
  let clinicName = '';
  let clinicAddress = '';
  let patientName = '';
  let nric = '';
  let billNo = '';
  let date = '2026-09-28';
  let doctorName = '';
  let diagnosis = '';
  let items: { name: string; qty: number; price: number }[] = [];
  let subTotal = 0;
  let gstRate = 0.09;

  if (sampleId === 'sample-1') {
    clinicName = 'HEALTHWAY MEDICAL FAMILY CLINIC';
    clinicAddress = 'Block 201, Toa Payoh Lorong 8 #01-124, Singapore 310201\nTel: +65 6250 8899 | Co. Reg: 201402918K';
    patientName = 'TAN WEI MING MARCUS';
    nric = 'S****482B';
    billNo = 'INV-2026-09824';
    date = '2026-09-28';
    doctorName = 'Dr. Kenneth Lim MBBS (Singapore)';
    diagnosis = 'Acute Upper Respiratory Tract Infection (URTI) with Fever';
    items = [
      { name: 'Standard Consultation (GP)', qty: 1, price: 42.00 },
      { name: 'Amoxicillin Trihydrate 500mg (Cap)', qty: 20, price: 22.00 },
      { name: 'Paracetamol 500mg Analgesic', qty: 30, price: 12.00 },
      { name: 'Dextromethorphan Cough Syrup 120ml', qty: 1, price: 14.00 },
    ];
  } else if (sampleId === 'sample-2') {
    clinicName = 'SMILECARE DENTAL SURGERY';
    clinicAddress = '10 Collyer Quay, #03-18 Ocean Financial Centre, Singapore 049315\nTel: +65 6732 1100 | GST Reg: M90382910G';
    patientName = 'SARAH JENKINS';
    nric = 'G****912K';
    billNo = 'SMILE-77419';
    date = '2026-09-29';
    doctorName = 'Dr. Amanda Wong BDS (Lond)';
    diagnosis = 'Routine Dental Checkup, Scaling, Polishing & Fluoride Therapy';
    items = [
      { name: 'Oral Dental Examination & Charting', qty: 1, price: 35.00 },
      { name: 'Ultrasonic Scaling & Prophylaxis', qty: 1, price: 75.00 },
      { name: 'Stain Polishing with Prophy-Paste', qty: 1, price: 20.00 },
      { name: 'Topical Fluoride Varnish Application', qty: 1, price: 10.00 },
    ];
  } else {
    clinicName = 'ORTHOPAEDIC & SPORTS MEDICINE SPECIALIST';
    clinicAddress = '3 Mount Elizabeth #11-04, Mount Elizabeth Medical Centre, Singapore 228510\nTel: +65 6836 5500 | GST Reg: 199804291D';
    patientName = 'MOHAMMAD FARHAN BIN ISMAIL';
    nric = 'T****631A';
    billNo = 'ORTHO-2026-1044';
    date = '2026-09-30';
    doctorName = 'Dr. Bernard Choo FRCS (Edin) Ortho';
    diagnosis = 'Right Ankle Lateral Ligament Sprain (Grade II)';
    items = [
      { name: 'First Specialist Consultation', qty: 1, price: 140.00 },
      { name: 'Digital X-Ray (Right Ankle 2 Views)', qty: 1, price: 85.00 },
      { name: 'Ankle Rigid Support Splint & Strapping', qty: 1, price: 30.00 },
      { name: 'Arcoxia (Etoricoxib 90mg) Anti-inflammatory', qty: 10, price: 15.00 },
    ];
  }

  subTotal = items.reduce((acc, it) => acc + it.price, 0);
  const gstAmount = +(subTotal * gstRate).toFixed(2);
  const grandTotal = +(subTotal + gstAmount).toFixed(2);

  // Draw Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 22px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(clinicName, 400, 65);

  ctx.fillStyle = '#64748b';
  ctx.font = '12px Arial, sans-serif';
  const addrLines = clinicAddress.split('\n');
  addrLines.forEach((line, idx) => {
    ctx.fillText(line, 400, 92 + idx * 18);
  });

  // Title Box
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('OFFICIAL TAX INVOICE / MEDICAL RECEIPT', 400, 150);

  // Horizontal divider
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 165);
  ctx.lineTo(760, 165);
  ctx.stroke();

  // Patient & Bill Info Grid
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('BILL TO / PATIENT:', 50, 195);
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillStyle = '#090d16';
  ctx.fillText(patientName, 50, 218);

  ctx.font = '12px Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(`NRIC / ID: ${nric}`, 50, 238);
  ctx.fillText(`Attending Doctor: ${doctorName}`, 50, 258);

  // Right Side: Bill Details
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('INVOICE DETAILS:', 480, 195);
  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`Invoice No: ${billNo}`, 480, 218);
  ctx.fillText(`Date of Visit: ${date}`, 480, 238);
  ctx.fillText(`Payment Mode: Credit Card / VISA`, 480, 258);

  // Diagnosis Box
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(40, 280, 720, 52);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(40, 280, 720, 52);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('CLINICAL SUMMARY / DIAGNOSIS:', 55, 302);
  ctx.fillStyle = '#0f766e';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText(diagnosis, 55, 322);

  // Table Header
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(40, 355, 720, 32);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText('ITEM / SERVICE DESCRIPTION', 55, 376);
  ctx.textAlign = 'center';
  ctx.fillText('QTY', 520, 376);
  ctx.textAlign = 'right';
  ctx.fillText('AMOUNT (SGD)', 740, 376);

  // Table Line Items
  let y = 415;
  items.forEach((item, index) => {
    ctx.textAlign = 'left';
    ctx.font = '13px Arial, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`${index + 1}.  ${item.name}`, 55, y);

    ctx.textAlign = 'center';
    ctx.fillText(`${item.qty}`, 520, y);

    ctx.textAlign = 'right';
    ctx.fillText(`$${item.price.toFixed(2)}`, 740, y);

    // dashed line
    ctx.strokeStyle = '#e2e8f0';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(40, y + 12);
    ctx.lineTo(760, y + 12);
    ctx.stroke();
    ctx.setLineDash([]);

    y += 42;
  });

  // Totals Section
  y = Math.max(y + 20, 600);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(420, y);
  ctx.lineTo(760, y);
  ctx.stroke();

  y += 28;
  ctx.textAlign = 'left';
  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Sub-Total (Excl. Tax):', 440, y);
  ctx.textAlign = 'right';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText(`$${subTotal.toFixed(2)}`, 740, y);

  y += 26;
  ctx.textAlign = 'left';
  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('GST (9.0%):', 440, y);
  ctx.textAlign = 'right';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText(`$${gstAmount.toFixed(2)}`, 740, y);

  y += 32;
  // Grand total highlight banner
  ctx.fillStyle = '#ecfdf5';
  ctx.fillRect(420, y - 22, 340, 42);
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.strokeRect(420, y - 22, 340, 42);

  ctx.textAlign = 'left';
  ctx.font = 'bold 16px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillStyle = '#065f46';
  ctx.fillText('GRAND TOTAL (SGD):', 440, y + 5);
  ctx.textAlign = 'right';
  ctx.font = 'bold 20px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(`$${grandTotal.toFixed(2)}`, 745, y + 6);

  // Footer notes & stamp
  y += 100;
  ctx.textAlign = 'left';
  ctx.font = 'italic 11px Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('* This is a computer-generated tax invoice. No signature is required for corporate medical insurance claims.', 50, y);
  ctx.fillText('* Dispensed medicines are non-refundable & non-exchangeable once checked by the patient.', 50, y + 18);
  ctx.fillText('* Medical Leave (MC) of 2 days issued for corporate HR records.', 50, y + 36);

  // Paid stamp
  ctx.save();
  ctx.translate(620, y - 10);
  ctx.rotate(-0.15);
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 3;
  ctx.strokeRect(-80, -25, 160, 50);
  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAID IN FULL', 0, 7);
  ctx.restore();

  return canvas.toDataURL('image/png');
}
