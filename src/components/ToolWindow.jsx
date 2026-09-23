// Window-chrome frame echoing the mock browser windows on jonathanweyermann.com.
export default function ToolWindow({ title, children, className = '' }) {
  return (
    <div className={`tool-window ${className}`}>
      <div className="tool-window__bar" aria-hidden="true">
        <span className="tool-window__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="tool-window__title">{title}</span>
      </div>
      <div className="tool-window__body">{children}</div>
    </div>
  );
}
