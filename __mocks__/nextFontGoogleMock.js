// Any next/font/google loader (Geist, Inter, …) returns a usable stub.
module.exports = new Proxy(
  {},
  {
    get: () => () => ({
      className: 'mock-font',
      variable: '--font-sans',
      style: { fontFamily: 'mock-font' },
    }),
  }
);
