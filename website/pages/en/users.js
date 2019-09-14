/* eslint-disable react/prop-types */
const React = require('react');
const { Container } = require('../../core/CompLibrary.js');

function Users(props) {
  const { config: siteConfig } = props;
  if ((siteConfig.users || []).length === 0) {
    return null;
  }

  const editUrl = `${siteConfig.repoUrl}/edit/master/website/siteConfig.js`;
  const showcase = siteConfig.users.map(user => (
    <a href={user.infoLink} key={user.infoLink}>
      <img src={user.image} alt={user.caption} title={user.caption} />
    </a>
  ));

  return (
    <div className="mainContainer">
      <Container padding={['bottom', 'top']}>
        <div className="showcaseSection">
          <div className="prose">
            <h1>Users of {siteConfig.title}</h1>
            <p>This project is used by the following companies:</p>
          </div>
          <div className="logos">{showcase}</div>
          <p>Are you using this project?</p>
          <a href={editUrl} className="button">
            Add your company
          </a>
        </div>
      </Container>
    </div>
  );
}

module.exports = Users;
