import {
  baseName,
  daysLeft,
  displayName,
  fileExtension,
  formatBytes,
  imageUrl,
  isPdf,
  pdfUrl,
  safeFileName,
  timeAgo,
  zipUrl,
} from './files';

const bucket = 'https://bucket.test/';

describe('S3 naming (must match the conversion lambda)', () => {
  it('prefixes the device id and strips unsafe characters', () => {
    expect(safeFileName('123', 'My Report (final).pdf')).toBe('123MyReportfinal.pdf');
    expect(safeFileName('123', 'scan_2024.PDF')).toBe('123scan_2024.PDF');
  });

  it('uses everything before the first dot as the base name, like the lambda', () => {
    expect(baseName('123a.b.pdf')).toBe('123a');
    expect(baseName('123report.pdf')).toBe('123report');
  });

  it('builds pdf, page image and zip URLs', () => {
    expect(pdfUrl(bucket, '123report.pdf')).toBe('https://bucket.test/pdfs/123report.pdf');
    expect(imageUrl(bucket, '123report.pdf', 3)).toBe('https://bucket.test/123report/image3.jpg');
    expect(zipUrl(bucket, '123report.pdf')).toBe('https://bucket.test/123report.zip');
  });
});

describe('file helpers', () => {
  it('reads the real extension and a display name', () => {
    expect(fileExtension('a.b.PDF')).toBe('PDF');
    expect(fileExtension('noext')).toBe('pdf');
    expect(displayName('Quarterly.Report.PDF')).toBe('Quarterly.Report');
  });

  it('recognises PDFs by type or extension', () => {
    expect(isPdf({ name: 'x.bin', type: 'application/pdf' })).toBe(true);
    expect(isPdf({ name: 'X.PDF', type: '' })).toBe(true);
    expect(isPdf({ name: 'photo.png', type: 'image/png' })).toBe(false);
    expect(isPdf(null)).toBe(false);
  });

  it('formats sizes and times', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
    const now = Date.UTC(2026, 0, 31);
    expect(timeAgo(now - 30 * 1000, now)).toBe('just now');
    expect(timeAgo(now - 5 * 60 * 1000, now)).toBe('5m ago');
    expect(timeAgo(now - 3 * 3600 * 1000, now)).toBe('3h ago');
    expect(timeAgo(now - 2 * 86400 * 1000, now)).toBe('2d ago');
    expect(daysLeft(now - 2 * 86400 * 1000, now)).toBe(28);
    expect(daysLeft(now - 40 * 86400 * 1000, now)).toBe(0);
    expect(daysLeft(undefined, now)).toBeNull();
  });
});
