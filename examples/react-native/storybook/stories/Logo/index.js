import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';

const DELAY_URL_PREFIX = 'https://www.deelay.me';

const Logo = ({ delay, logoUrl }) => (
  <Image
    style={{ width: 75, height: 75 }}
    source={{
      uri: delay ? `${DELAY_URL_PREFIX}/${delay}/${logoUrl}` : logoUrl,
    }}
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
