import { ArrowUpRight } from 'lucide-react';
import jonathan from '../images/jonathan.jpg';
import './About.css';

const STACK = ['React', 'AWS Lambda', 'Amazon S3', 'Ghostscript', 'CloudFront'];

export default function About() {
  return (
    <>
      <title>About · PDF 2 JPGs</title>
      <link rel="canonical" href="https://pdf2jpgs.com/about" />
      <section className="page-hero surface-brand grid-bg">
        <div className="hero__glow hero__glow--blue" aria-hidden="true" />
        <div className="container">
          <span className="eyebrow">
            <span className="pulse-dot" aria-hidden="true" />
            About
          </span>
          <h1 className="page-hero__title">
            A small tool with <span className="gradient-text">one simple job.</span>
          </h1>
          <p className="page-hero__lead">
            Getting a page out of a PDF as an image shouldn't need a desktop app or an account. PDF 2 JPGs turns
            every page into a JPG you can preview, rotate, and download.
          </p>
        </div>
      </section>

      <section className="section surface-light">
        <div className="container about">
          <aside className="about__card">
            <img className="about__photo" src={jonathan} alt="Jonathan Weyermann" />
            <div className="about__who">
              <div className="about__name">Jonathan Weyermann</div>
              <div className="about__role">Independent web developer · Alberta &amp; remote</div>
            </div>
            <a className="btn btn--outline about__link" href="https://jonathanweyermann.com">
              jonathanweyermann.com <ArrowUpRight aria-hidden="true" />
            </a>
          </aside>

          <div className="about__body">
            <div className="about__block">
              <span className="section__kicker">Who made this</span>
              <h2>Built and maintained by Jonathan Weyermann.</h2>
              <p>
                PDF 2 JPGs is designed, built, and run by Jonathan Weyermann, an independent web developer. It's free
                to use, with no account, no watermarks, and no software to install.
              </p>
            </div>

            <div className="about__block">
              <span className="section__kicker">How it works under the hood</span>
              <h2>Serverless, start to finish.</h2>
              <p>
                The site is a React single-page app. Your PDF uploads straight to Amazon S3, where an AWS Lambda function
                renders each page with Ghostscript and bundles the results into a ZIP. Everything is served through CloudFront,
                and files are cleaned up automatically after 30 days.
              </p>
              <ul className="about__stack">
                {STACK.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="about__block about__block--cta">
              <div>
                <h2>Need something built?</h2>
                <p>
                  PDF 2 JPGs is made by Weyermann Web Development, which builds clear, resilient websites and digital products.
                </p>
              </div>
              <a className="btn btn--primary" href="https://jonathanweyermann.com">
                Start a project <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
