import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import App from '../App';
import { inspectPdf } from '../lib/pdf';

vi.mock('../lib/pdf', () => ({
  PdfReadError: class PdfReadError extends Error {},
  inspectPdf: vi.fn(),
}));

const BUCKET = 'https://bucket.test/';
const API = 'https://api.test/prodpdfs';

class FakeXHR {
  static instances = [];

  constructor() {
    this.upload = {};
    this.headers = {};
    FakeXHR.instances.push(this);
  }

  open(method, url) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(key, value) {
    this.headers[key] = value;
  }

  send(body) {
    this.body = body;
    setTimeout(() => {
      if (this.upload.onprogress) this.upload.onprogress({ lengthComputable: true, loaded: 1, total: 1 });
      this.status = 200;
      this.onload();
    }, 0);
  }

  abort() {
    if (this.onabort) this.onabort();
  }
}

// HEAD requests: `status(url)` decides the response code.
const mockFetch = (status = () => 200) => {
  const fetchMock = vi.fn(async (url, options = {}) => {
    if (url === API) {
      return new Response(
        JSON.stringify({ body: { signedRequest: `${BUCKET}pdfs/signed?X-Amz-Signature=abc` } }),
        { status: 200 },
      );
    }
    return new Response(null, { status: status(url, options) });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const renderAt = (path, props) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App {...props} />
    </MemoryRouter>,
  );

const seedHistory = (entries) => localStorage.setItem('previous_uploads', JSON.stringify(entries));

beforeEach(() => {
  FakeXHR.instances = [];
  vi.stubGlobal('XMLHttpRequest', FakeXHR);
  inspectPdf.mockReset();
});

describe('home page', () => {
  it('shows the converter and an empty recent menu', async () => {
    mockFetch();
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('PDF to JPG, page by page.');
    expect(screen.getAllByText('Drop your PDF here').length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('button', { name: /recent/i }));
    expect(screen.getByText(/Nothing yet/)).toBeInTheDocument();
  });

  it('rejects files that are not PDFs', async () => {
    mockFetch();
    const { container } = renderAt('/');
    const user = userEvent.setup({ applyAccept: false });
    await user.upload(container.querySelector('#pdf-input'), new File(['x'], 'photo.png', { type: 'image/png' }));
    expect(screen.getByRole('alert')).toHaveTextContent(`"photo.png" isn't a PDF`);
    expect(inspectPdf).not.toHaveBeenCalled();
  });

  it('shows a readable error for PDFs that cannot be opened', async () => {
    mockFetch();
    const { PdfReadError } = await import('../lib/pdf');
    inspectPdf.mockRejectedValue(new PdfReadError('This PDF is password-protected. Remove the password and try again.'));
    const { container } = renderAt('/');
    await userEvent.upload(container.querySelector('#pdf-input'), new File(['%PDF'], 'locked.pdf', { type: 'application/pdf' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('password-protected');
    expect(screen.getByRole('button', { name: 'Choose another file' })).toBeInTheDocument();
  });

  it('uploads a PDF with the same contract as before and opens the results', async () => {
    const fetchMock = mockFetch();
    localStorage.setItem('pcid', '4242');
    inspectPdf.mockResolvedValue({ numPages: 3, thumbnail: null });
    const { container } = renderAt('/');

    await userEvent.upload(container.querySelector('#pdf-input'), new File(['%PDF'], 'My Report.pdf', { type: 'application/pdf' }));

    expect(await screen.findByRole('heading', { name: 'My Report.pdf' })).toBeInTheDocument();

    const post = fetchMock.mock.calls.find(([url]) => url === API);
    expect(JSON.parse(post[1].body)).toEqual({ fileName: '4242MyReport.pdf', fileType: 'pdf' });
    expect(FakeXHR.instances[0].method).toBe('PUT');
    expect(FakeXHR.instances[0].headers['Content-Type']).toBe('application/pdf');

    const zip = await screen.findByRole('link', { name: /download all/i });
    expect(zip).toHaveAttribute('href', `${BUCKET}4242MyReport.zip`);
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /view page \d full size/i })).toHaveLength(3);

    const history = JSON.parse(localStorage.getItem('previous_uploads'));
    expect(history).toEqual([
      expect.objectContaining({ uploadFileName: 'My Report', numPages: 3, s3SafeFileName: '4242MyReport.pdf' }),
    ]);
  });
});

describe('results page', () => {
  const entry = { uploadFileName: 'deck', numPages: 4, s3SafeFileName: '1deck.pdf' };

  it('reports progress while pages are still converting', async () => {
    seedHistory([entry]);
    mockFetch((url) => (url.endsWith('image1.jpg') || url.endsWith('image2.jpg') || url.endsWith('.pdf') ? 200 : 403));
    renderAt('/uploaded/0', { validateHistory: false });
    expect(await screen.findByText('2 of 4 pages ready')).toBeInTheDocument();
    expect(screen.getByText('Converting', { selector: '.badge' })).toBeInTheDocument();
    expect(screen.getAllByText('Converting', { selector: '.page-card__pending' })).toHaveLength(2);
    expect(screen.getByRole('button', { name: /converting/i })).toBeDisabled();
  });

  it('shows an expired state once the PDF has been deleted', async () => {
    seedHistory([entry]);
    mockFetch(() => 403);
    renderAt('/uploaded/0', { validateHistory: false });
    expect(await screen.findByRole('heading', { name: 'This conversion has expired' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove from history' }));
    expect(localStorage.getItem('previous_uploads')).toBeNull();
  });

  it('handles links to conversions that are not in history', () => {
    mockFetch();
    renderAt('/uploaded/9');
    expect(screen.getByRole('heading', { name: "We couldn't find that conversion" })).toBeInTheDocument();
  });

  it('opens the viewer from the recent menu flow and closes with Escape', async () => {
    seedHistory([entry]);
    mockFetch();
    renderAt('/uploaded/0', { validateHistory: false });
    await screen.findByRole('link', { name: /download all/i });
    // jsdom never loads images, so fire the load event by hand.
    const images = screen.getAllByRole('img', { name: /page \d/i });
    images.forEach((img) => img.dispatchEvent(new Event('load')));
    await userEvent.click(await screen.findByRole('button', { name: 'View page 2 full size' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('deck.pdf, page 2 of 4');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('dialog')).toHaveAccessibleName('deck.pdf, page 3 of 4');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('history validation', () => {
  it('drops recent uploads whose files have been cleaned up', async () => {
    seedHistory([
      { uploadFileName: 'old', numPages: 1, s3SafeFileName: '1old.pdf' },
      { uploadFileName: 'new', numPages: 2, s3SafeFileName: '1new.pdf' },
    ]);
    mockFetch((url) => (url.includes('1old') ? 403 : 200));
    renderAt('/');
    await waitFor(() => expect(JSON.parse(localStorage.getItem('previous_uploads'))).toHaveLength(1));
    expect(screen.getAllByText('new.pdf').length).toBeGreaterThan(0);
    expect(screen.queryByText('old.pdf')).not.toBeInTheDocument();
  });

  it('keeps entries when the network check fails', async () => {
    seedHistory([{ uploadFileName: 'offline', numPages: 1, s3SafeFileName: '1offline.pdf' }]);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderAt('/');
    await new Promise((r) => setTimeout(r, 20));
    expect(JSON.parse(localStorage.getItem('previous_uploads'))).toHaveLength(1);
  });
});

describe('theme toggle', () => {
  afterEach(() => document.documentElement.removeAttribute('data-theme'));

  it('switches between dark (default) and light and remembers the choice', async () => {
    mockFetch();
    renderAt('/');
    expect(document.documentElement).not.toHaveAttribute('data-theme');

    await userEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem('theme')).toBe('light');

    await userEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('starts in light mode when the page loaded with it applied', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    mockFetch();
    renderAt('/');
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
  });
});

describe('about page', () => {
  it('renders', () => {
    mockFetch();
    renderAt('/about');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A small tool with one simple job.');
    expect(screen.getByRole('img', { name: 'Jonathan Weyermann' })).toBeInTheDocument();
  });
});
