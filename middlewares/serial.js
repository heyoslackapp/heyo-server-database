let generateCodeApp = (serial) => {
  const zero = 6 - String(serial).length;
  if (zero === 2) {
    return `App-00${serial}`;
  } else if (zero === 1) {
    return `App-0${serial}`;
  }
  return `App-${serial}`;
};

let generateCodeTrans = (serial) => {
  const zero = 6 - String(serial).length;
  if (zero === 2) {
    return `Trans-00${serial}`;
  } else if (zero === 1) {
    return `Trans-0${serial}`;
  }
  return `Trans-${serial}`;
};

module.exports = {
  generateCodeApp,
  generateCodeTrans,
};
