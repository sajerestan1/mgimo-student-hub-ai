// Test shim: the real router, mounted in memory at the path under test, with
// <Navigate> recorded so a redirect can be followed in a second render pass.
import React from 'react';
import * as real from '/app/node_modules/react-router-dom/dist/index.mjs';

export * from '/app/node_modules/react-router-dom/dist/index.mjs';

export const BrowserRouter = ({ children }) =>
  React.createElement(real.MemoryRouter, { initialEntries: [global.__TEST_PATH__ || '/'] }, children);

export const Navigate = ({ to }) => {
  (global.__REDIRECTS__ = global.__REDIRECTS__ || []).push(String(to));
  return null;
};