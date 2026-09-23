import { localIdentifier, readHistory, upsertEntry, writeHistory } from './history';

describe('history storage', () => {
  it('reads entries saved by the previous version of the site', () => {
    localStorage.setItem(
      'previous_uploads',
      JSON.stringify([
        { uploadFileName: 'template', numPages: 2, s3SafeFileName: '78559523template.pdf' },
        { uploadFileName: 'broken' },
      ]),
    );
    expect(readHistory()).toEqual([
      { uploadFileName: 'template', numPages: 2, s3SafeFileName: '78559523template.pdf' },
    ]);
  });

  it('survives corrupt storage', () => {
    localStorage.setItem('previous_uploads', '{nope');
    expect(readHistory()).toEqual([]);
  });

  it('removes the key when the list is emptied', () => {
    writeHistory([{ uploadFileName: 'a', numPages: 1, s3SafeFileName: '1a.pdf' }]);
    expect(localStorage.getItem('previous_uploads')).not.toBeNull();
    writeHistory([]);
    expect(localStorage.getItem('previous_uploads')).toBeNull();
  });

  it('appends new uploads and reuses the slot for a re-upload of the same file', () => {
    const a = { uploadFileName: 'a', numPages: 1, s3SafeFileName: '1a.pdf' };
    const b = { uploadFileName: 'b', numPages: 3, s3SafeFileName: '1b.pdf' };
    let result = upsertEntry([a], b);
    expect(result).toEqual({ list: [a, b], index: 1 });
    result = upsertEntry(result.list, { ...a, convertedAt: 5 });
    expect(result.index).toBe(0);
    expect(result.list[0].convertedAt).toBe(5);
    expect(result.list).toHaveLength(2);
  });

  it('keeps a stable per-device identifier', () => {
    const id = localIdentifier();
    expect(id).toMatch(/^\d+$/);
    expect(localIdentifier()).toBe(id);
  });
});
