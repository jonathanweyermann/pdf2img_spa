import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, body, children }) {
  return (
    <section className="empty-state surface-brand grid-bg">
      <title>{`${title} · PDF 2 JPGs`}</title>
      <div className="hero__glow hero__glow--blue" aria-hidden="true" />
      <div className="container empty-state__inner">
        {Icon && (
          <span className="empty-state__icon">
            <Icon aria-hidden="true" />
          </span>
        )}
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="empty-state__actions">
          <Link to="/#convert" className="btn btn--primary">
            Convert a PDF <ArrowRight aria-hidden="true" />
          </Link>
          {children}
        </div>
      </div>
    </section>
  );
}
