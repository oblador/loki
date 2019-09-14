/* eslint-disable react/prop-types */
const React = require('react');
const { Container, GridBlock } = require('../../core/CompLibrary.js');

function HomeSplash(props) {
  const { siteConfig } = props;
  const { docsUrl } = siteConfig;
  const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;

  return (
    <div className="index-hero">
      <div className="index-hero-inner">
        <h1 className="index-hero-project-tagline">
          <img
            alt="Loki logo"
            className="index-hero-logo"
            src={`${siteConfig.baseUrl}img/favicon.svg`}
          />
          {siteConfig.title} makes it easy to test your{' '}
          <span className="index-hero-project-keywords">Storybook</span> project
          for visual regressions.
        </h1>
        <div className="index-ctas">
          <a
            className="button index-ctas-get-started-button"
            href={`${siteConfig.baseUrl}${docsPart}getting-started.html`}
          >
            Get Started
          </a>
          <span className="index-ctas-github-button">
            <iframe
              src="https://ghbtns.com/github-btn.html?user=oblador&amp;repo=loki&amp;type=star&amp;count=true&amp;size=large"
              frameBorder={0}
              scrolling={0}
              width={160}
              height={30}
              title="GitHub Stars"
            />
          </span>
        </div>
      </div>
    </div>
  );
}

const Block = ({ id, background, children, layout }) => (
  <Container padding={['bottom', 'top']} id={id} background={background}>
    <GridBlock contents={children} layout={layout} />
  </Container>
);

function Index(props) {
  const { config: siteConfig, language = '' } = props;
  const { baseUrl } = siteConfig;

  const Rationale = () => (
    <Block id="rationale">
      {[
        {
          content:
            "There's a few visual regression tools for the web, but most either cannot be run headless or use phantomjs which is deprecated and a browser nobody is _actually_ using. They generally also require you to maintain fixtures and/or only support one platform.",
          image: `${baseUrl}img/undraw_specs.svg`,
          imageAlign: 'right',
          title: 'Rationale',
        },
      ]}
    </Block>
  );

  const Aims = () => (
    <Block background="light">
      {[
        {
          content: `* Easy setup
* No additional maintenance cost
* Reproducible tests independent of OS
* Support all platforms storybook does`,
          image: `${baseUrl}img/undraw_target.svg`,
          imageAlign: 'left',
          title: 'Aims',
        },
      ]}
    </Block>
  );

  const SupportedPlatforms = () => (
    <Block>
      {[
        {
          content: `* Chrome in docker (recommended)
* Local Chrome application
* iOS simulator
* Android emulator`,
          image: `${baseUrl}img/undraw_real-time_sync.svg`,
          imageAlign: 'right',
          title: 'Supported Platforms',
        },
      ]}
    </Block>
  );

  const Showcase = () => {
    if ((siteConfig.users || []).length === 0) {
      return null;
    }

    const showcase = siteConfig.users
      .filter(user => user.pinned)
      .map(user => (
        <a href={user.infoLink} key={user.infoLink}>
          <img src={user.image} alt={user.caption} title={user.caption} />
        </a>
      ));

    const editUrl = `${siteConfig.repoUrl}/edit/master/website/siteConfig.js`;

    return (
      <div className="productShowcaseSection paddingBottom">
        <h2>Users of {siteConfig.title}</h2>
        <div className="logos">
          {showcase}{' '}
          <a href={editUrl} className="button">
            Add your company
          </a>
        </div>
      </div>
    );
  };

  return (
    <div>
      <HomeSplash siteConfig={siteConfig} language={language} />
      <div className="mainContainer">
        <Rationale />
        <Aims />
        <SupportedPlatforms />
        <Showcase />
      </div>
    </div>
  );
}

module.exports = Index;
