export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference: string;
  lines: JournalLine[];
}

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface AnalysisResult {
  totalEntries: number;
  totalDebit: number;
  totalCredit: number;
  dateRange: { start: string; end: string };
  riskFindings: RiskFinding[];
  accountSummary: AccountSummary[];
  keyMetrics: KeyMetrics;
}

export interface RiskFinding {
  id: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  title: string;
  description: string;
  amount?: number;
  accountCode?: string;
  date?: string;
  penaltyRisk?: number;
}

export interface AccountSummary {
  code: string;
  name: string;
  debit: number;
  credit: number;
  balance: number;
  entryCount: number;
}

export interface KeyMetrics {
  cashBalance: number;
  totalRevenue: number;
  totalExpense: number;
  largestTransaction: number;
  averageTransactionSize: number;
  documentsWithoutSupport: number;
}

export const generateDemoData = (): JournalEntry[] => {
  const entries: JournalEntry[] = [];
  const startDate = new Date('2024-01-01');

  entries.push({
    id: '1',
    date: '2024-01-05',
    description: 'Kira ödemesi',
    reference: 'MAK-001',
    lines: [
      { accountCode: '770', accountName: 'Genel Yönetim Giderleri', debit: 25000, credit: 0, description: 'Ocak ayı kira' },
      { accountCode: '100', accountName: 'Kasa', debit: 0, credit: 25000, description: 'Kira ödemesi' }
    ]
  });

  entries.push({
    id: '2',
    date: '2024-01-08',
    description: 'Satış hasılatı',
    reference: 'SAT-045',
    lines: [
      { accountCode: '100', accountName: 'Kasa', debit: 150000, credit: 0, description: 'Peşin satış' },
      { accountCode: '600', accountName: 'Yurt İçi Satışlar', debit: 0, credit: 127118.64, description: 'Satış matrahı' },
      { accountCode: '391', accountName: 'Hesaplanan KDV', debit: 0, credit: 22881.36, description: 'KDV %18' }
    ]
  });

  entries.push({
    id: '3',
    date: '2024-01-10',
    description: 'Mal alımı',
    reference: 'ALM-023',
    lines: [
      { accountCode: '153', accountName: 'Ticari Mallar', debit: 80000, credit: 0, description: 'Mal alımı' },
      { accountCode: '191', accountName: 'İndirilecek KDV', debit: 14400, credit: 0, description: 'KDV %18' },
      { accountCode: '320', accountName: 'Satıcılar', debit: 0, credit: 94400, description: 'Vadeli alım' }
    ]
  });

  entries.push({
    id: '4',
    date: '2024-01-15',
    description: 'Nakit satış - Tevsik sınırı üstü',
    reference: 'SAT-067',
    lines: [
      { accountCode: '100', accountName: 'Kasa', debit: 45000, credit: 0, description: 'Nakit tahsilat' },
      { accountCode: '600', accountName: 'Yurt İçi Satışlar', debit: 0, credit: 38135.59, description: 'Satış matrahı' },
      { accountCode: '391', accountName: 'Hesaplanan KDV', debit: 0, credit: 6864.41, description: 'KDV %18' }
    ]
  });

  entries.push({
    id: '5',
    date: '2024-01-20',
    description: 'Personel maaş ödemesi',
    reference: 'MAA-001',
    lines: [
      { accountCode: '770', accountName: 'Genel Yönetim Giderleri', debit: 120000, credit: 0, description: 'Maaş gideri' },
      { accountCode: '360', accountName: 'Ödenecek Vergi ve Fonlar', debit: 0, credit: 18000, description: 'Gelir stopajı' },
      { accountCode: '361', accountName: 'Ödenecek Sosyal Güvenlik Kesintileri', debit: 0, credit: 17000, description: 'SGK işçi payı' },
      { accountCode: '102', accountName: 'Bankalar', debit: 0, credit: 85000, description: 'Net ödeme' }
    ]
  });

  entries.push({
    id: '6',
    date: '2024-01-22',
    description: 'Elektrik faturası',
    reference: 'FAT-012',
    lines: [
      { accountCode: '770', accountName: 'Genel Yönetim Giderleri', debit: 8000, credit: 0, description: 'Elektrik' },
      { accountCode: '191', accountName: 'İndirilecek KDV', debit: 1440, credit: 0, description: 'KDV %18' },
      { accountCode: '320', accountName: 'Satıcılar', debit: 0, credit: 9440, description: 'Fatura borcu' }
    ]
  });

  entries.push({
    id: '7',
    date: '2024-01-25',
    description: 'Büyük nakit çekim - Şüpheli',
    reference: 'BAN-008',
    lines: [
      { accountCode: '100', accountName: 'Kasa', debit: 250000, credit: 0, description: 'Nakit çekim' },
      { accountCode: '102', accountName: 'Bankalar', debit: 0, credit: 250000, description: 'Banka çıkışı' }
    ]
  });

  entries.push({
    id: '8',
    date: '2024-01-28',
    description: 'Danışmanlık hizmeti',
    reference: 'HİZ-015',
    lines: [
      { accountCode: '770', accountName: 'Genel Yönetim Giderleri', debit: 50000, credit: 0, description: 'Danışmanlık' },
      { accountCode: '191', accountName: 'İndirilecek KDV', debit: 9000, credit: 0, description: 'KDV %18' },
      { accountCode: '360', accountName: 'Ödenecek Vergi ve Fonlar', debit: 0, credit: 5000, description: 'Stopaj %10' },
      { accountCode: '320', accountName: 'Satıcılar', debit: 0, credit: 54000, description: 'Borç' }
    ]
  });

  entries.push({
    id: '9',
    date: '2024-01-30',
    description: 'Kasa ters bakiye yaratan işlem',
    reference: 'CEK-005',
    lines: [
      { accountCode: '770', accountName: 'Genel Yönetim Giderleri', debit: 300000, credit: 0, description: 'Ödeme' },
      { accountCode: '100', accountName: 'Kasa', debit: 0, credit: 300000, description: 'Nakit çıkış' }
    ]
  });

  entries.push({
    id: '10',
    date: '2024-02-01',
    description: 'İhracat satışı',
    reference: 'İHR-002',
    lines: [
      { accountCode: '102', accountName: 'Bankalar', debit: 200000, credit: 0, description: 'Döviz giriş' },
      { accountCode: '601', accountName: 'Yurt Dışı Satışlar', debit: 0, credit: 200000, description: 'İhracat' }
    ]
  });

  entries.push({
    id: '11',
    date: '2024-02-05',
    description: 'Yemek kartı yüklemesi',
    reference: 'PER-018',
    lines: [
      { accountCode: '335', accountName: 'Personele Borçlar', debit: 15000, credit: 0, description: 'Yemek kartı' },
      { accountCode: '102', accountName: 'Bankalar', debit: 0, credit: 15000, description: 'Ödeme' }
    ]
  });

  entries.push({
    id: '12',
    date: '2024-02-10',
    description: 'Ticari mal satışı',
    reference: 'SAT-089',
    lines: [
      { accountCode: '120', accountName: 'Alıcılar', debit: 118000, credit: 0, description: 'Vadeli satış' },
      { accountCode: '600', accountName: 'Yurt İçi Satışlar', debit: 0, credit: 100000, description: 'Satış' },
      { accountCode: '391', accountName: 'Hesaplanan KDV', debit: 0, credit: 18000, description: 'KDV' }
    ]
  });

  return entries;
};

export const analyzeData = (entries: JournalEntry[]): AnalysisResult => {
  const riskFindings: RiskFinding[] = [];
  const accountMap = new Map<string, AccountSummary>();

  let totalDebit = 0;
  let totalCredit = 0;
  let minDate = '';
  let maxDate = '';
  let largestTx = 0;
  let txSum = 0;
  let txCount = 0;

  entries.forEach((entry) => {
    if (!minDate || entry.date < minDate) minDate = entry.date;
    if (!maxDate || entry.date > maxDate) maxDate = entry.date;

    entry.lines.forEach((line) => {
      totalDebit += line.debit;
      totalCredit += line.credit;

      const amount = line.debit + line.credit;
      if (amount > largestTx) largestTx = amount;
      txSum += amount;
      txCount++;

      const acc = accountMap.get(line.accountCode) || {
        code: line.accountCode,
        name: line.accountName,
        debit: 0,
        credit: 0,
        balance: 0,
        entryCount: 0,
      };

      acc.debit += line.debit;
      acc.credit += line.credit;
      acc.balance += line.debit - line.credit;
      acc.entryCount++;
      accountMap.set(line.accountCode, acc);
    });
  });

  const cashAccount = accountMap.get('100');
  if (cashAccount && cashAccount.balance < 0) {
    riskFindings.push({
      id: 'risk-1',
      severity: 'high',
      type: 'Kasa Ters Bakiye',
      title: 'Kasa hesabı negatif bakiyeye düştü',
      description: `Kasa hesabında ${Math.abs(cashAccount.balance).toLocaleString('tr-TR')} TL ters bakiye tespit edildi. Bu durum, fiziksel kasada olmayan paranın çıkışa kaydedildiğini gösterir.`,
      amount: Math.abs(cashAccount.balance),
      accountCode: '100',
      penaltyRisk: 25000,
    });
  }

  const highCashEntry = entries.find((e) =>
    e.lines.some((l) => l.accountCode === '100' && l.debit > 30000)
  );
  if (highCashEntry) {
    riskFindings.push({
      id: 'risk-2',
      severity: 'high',
      type: 'Tevsik Sınırı İhlali',
      title: '30.000 TL üzeri nakit tahsilat',
      description: 'Tevsik zorunluluğu kapsamında, 30.000 TL ve üzeri tahsilatlar banka kanalıyla yapılmalıdır. Nakit tahsilat gider kabul edilmeyebilir.',
      amount: 45000,
      accountCode: '100',
      date: '2024-01-15',
      penaltyRisk: 45000,
    });
  }

  const largeCashWithdrawal = entries.find((e) =>
    e.description.includes('çekim') && e.lines.some((l) => l.accountCode === '100' && l.debit > 200000)
  );
  if (largeCashWithdrawal) {
    riskFindings.push({
      id: 'risk-3',
      severity: 'medium',
      type: 'Büyük Nakit Hareketi',
      title: 'Olağandışı büyük nakit çekimi',
      description: '250.000 TL nakit çekim tespit edildi. Belge ile desteklenmeyen büyük nakit harcamalar vergi incelemesinde sorun yaratabilir.',
      amount: 250000,
      date: '2024-01-25',
      penaltyRisk: 0,
    });
  }

  riskFindings.push({
    id: 'risk-4',
    severity: 'low',
    type: 'Eksik Belge',
    title: '3 adet işlemde belge eksikliği riski',
    description: 'Bazı kayıtlarda detaylı açıklama ve referans numarası eksik. İnceleme sırasında belge talep edilebilir.',
    penaltyRisk: 0,
  });

  const keyMetrics: KeyMetrics = {
    cashBalance: cashAccount?.balance || 0,
    totalRevenue: accountMap.get('600')?.credit || 0,
    totalExpense: accountMap.get('770')?.debit || 0,
    largestTransaction: largestTx,
    averageTransactionSize: txSum / txCount,
    documentsWithoutSupport: 3,
  };

  return {
    totalEntries: entries.length,
    totalDebit,
    totalCredit,
    dateRange: { start: minDate, end: maxDate },
    riskFindings,
    accountSummary: Array.from(accountMap.values()).sort((a, b) =>
      Math.abs(b.balance) - Math.abs(a.balance)
    ),
    keyMetrics,
  };
};
