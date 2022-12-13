import React from 'react';
import PropTypes from 'prop-types';

const getDelayUrl = (url, delay) =>
  `http://${
    window.navigator.webdriver ? 'host.docker.internal' : 'localhost'
  }:4567/${delay}/${url}`;

const Logo = ({ delay, logoUrl }) => (
  <img
    style={{ width: 75, height: 75 }}
    alt=""
    src={delay ? getDelayUrl(logoUrl, delay) : logoUrl}
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
