let t;function e(e,o=500,n=!0){n?t||(t=!0,"function"==typeof e&&e(),setTimeout((()=>{t=!1}),o)):t||(t=!0,setTimeout((()=>{t=!1,"function"==typeof e&&e()}),o))}export{e as t};
