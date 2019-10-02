import React from 'react';
import PropTypes from 'prop-types';

const DELAY_URL_PREFIX = 'http://www.deelay.me';

const Logo = ({ delay, logoUrl }) => (
  <img
    style={{ width: 75, height: 75 }}
    alt=""
    src={delay ? `${DELAY_URL_PREFIX}/${delay}/${logoUrl}` : logoUrl}
  />
);

Logo.propTypes = {
  delay: PropTypes.number,
  logoUrl: PropTypes.string,
};

Logo.defaultProps = {
  delay: 0,
  logoUrl: 'https://loki.js.org/img/favicon.png',
};

export default Logo;
