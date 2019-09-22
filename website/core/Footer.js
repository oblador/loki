/* eslint-disable react/prop-types */
const React = require('react');

function Footer(props) {
  const { config, language } = props;
  const { baseUrl, docsUrl } = config;

  const docUrl = doc => {
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  };

  const pageUrl = doc => {
    return baseUrl + (language ? `${language}/` : '') + doc;
  };

  return (
    <footer className="nav-footer" id="footer">
      <section className="sitemap">
        <a href={baseUrl} className="nav-home">
          {config.footerIcon && (
            <img
              src={baseUrl + config.footerIcon}
              alt={config.title}
              width="52"
              height="52"
            />
          )}
        </a>
        <div>
          <h5>Docs</h5>
          <a href={docUrl('getting-started.html')}>Getting Started</a>
          <a href={docUrl('configuration.html')}>API Reference</a>
          <a href={docUrl('continuous-integration.html')}>Guides</a>
        </div>
        <div>
          <h5>Community</h5>
          <a href={pageUrl('users.html')}>User Showcase</a>
        </div>
        <div>
          <h5>More</h5>
          <a href="https://github.com/oblador/loki">GitHub</a>
          <a
            className="github-button"
            href={config.repoUrl}
            data-icon="octicon-star"
            data-count-href="/oblador/loki/stargazers"
            data-show-count="true"
            data-count-aria-label="# stargazers on GitHub"
            aria-label="Star this project on GitHub"
          >
            Star
          </a>
          {config.twitterUsername && (
            <div className="social">
              <a
                href={`https://twitter.com/${config.twitterUsername}`}
                className="twitter-follow-button"
              >
                Follow @{config.twitterUsername}
              </a>
            </div>
          )}
          {config.facebookAppId && (
            <div className="social">
              <div
                className="fb-like"
                data-href={config.url}
                data-colorscheme="dark"
                data-layout="standard"
                data-share="true"
                data-width="225"
                data-show-faces="false"
              />
            </div>
          )}
        </div>
      </section>

      <section className="copyright">{config.copyright}</section>
    </footer>
  );
}

module.exports = Footer;
