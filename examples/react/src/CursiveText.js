import React from 'react';
import PropTypes from 'prop-types';
import './ShrikhandFont.css';

const CursiveText = ({ children }) => (
  <span style={{ fontFamily: 'Shrikhand, cursive' }}>{children}</span>
);

CursiveText.propTypes = {
  children: PropTypes.string.isRequired,
};

export default CursiveText;
