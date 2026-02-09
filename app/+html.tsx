import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// This file is web-only and used to configure the root HTML for every page.
// The <head> and <body> elements here are rendered on the server (SSG).
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Load Jua font from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Jua&display=swap" rel="stylesheet" />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, for the centered mobile view, we might want body scrolling if the viewport is small?
          Actually, we want the app to be contained within a centered frame.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS to set global font and background for the body (outside the app root) */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { 
            background-color: #1a1a1a; 
            background-image: radial-gradient(#333 1px, transparent 1px);
            background-size: 20px 20px;
            font-family: 'Jua', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
          }
          /* Ensure the root element takes full height but is centered and constrained */
          #root {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
          }
          /* Force font for all components */
          input, button, select, textarea, div, span, p {
            font-family: 'Jua', sans-serif !important;
          }
        `}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
