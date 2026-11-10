import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '@/App';

export function render(path, session) {
  global.__TEST_PATH__ = path;
  global.__SESSION__ = session;
  global.__REDIRECTS__ = [];
  let html = '';
  let error = null;
  try {
    html = renderToString(React.createElement(App));
  } catch (e) {
    error = e.message;
  }
  return { html, error, redirects: [...(global.__REDIRECTS__ || [])] };
}