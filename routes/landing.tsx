import { Html } from "@elysiajs/html";
import { generateUniqueID } from "../utils";
import { db } from "..";
import type { Logestic } from "logestic";

export const landingState = {
  ticketMode: false,
};

/*
  Notes:
  - URL is random and can go anywhere (list at bottom, title, etc.)
  - Non-visible links won't work, and could flag as bot
  - Compare what has changed with the text and include that in trust score
  - Site links change a few seconds before sales start, change will be obvious and after 12:00 PM
  - Answer is ALWAYS STATED.
  - Control Panel shows HTML inside the page for answer
  - Riddles can contain images and such (circle k!)
  - TODO: add image
  - Time limit!
  - Sold out screen!
  - email and sctickets can be different
  - 5 min time limit
  - Referer
*/

export function landingPageRoute({ logestic }: { logestic: Logestic }) {
  const formID = generateUniqueID(8);

  const insertFormQuery = db.query("INSERT INTO sessions (form_id) VALUES ($form_id)"); // cached

  if (landingState.ticketMode) {
    try {
      insertFormQuery.run({ $form_id: formID });
      logestic.info(`added form id to database: ${formID}`);
    } catch (e) {
      logestic.error(
        `an error occured adding the form id to the database: ${e}`
      );
      return "An error occured adding the form ID.";
    }
  }

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>ShmooCon 2025 Ticket Sales</title>
        <link
          href="http://fonts.googleapis.com/css?family=Open+Sans"
          rel="stylesheet"
          type="text/css"
        />
        <link href="files/style.css" rel="stylesheet" type="text/css" />
      </head>
      <body>
        {!landingState.ticketMode && (
          <>
            <h1>ShmooCon Tickets</h1>

            <img src="files/Shmoocon-logo.png" alt="The ShmooCon Logo" />

            <p>
              Round one is SOLD OUT. The last round of tickets will go on sale
              at noon EST Nov 15, 2024. Check back then.
            </p>
          </>
        )}

        {landingState.ticketMode && (
          <>
            <h1>
              ShmooCon Ticket
              <a
                style="text-decoration:none"
                href={`/form_${generateUniqueID(8)}.html`}
              >
                s
              </a>
            </h1>
            <a href={`/form_${generateUniqueID(8)}`}>
              <img src="/files/Shmoocon-logo.png" alt="The ShmooCon Logo" />
            </a>
            <p>
              Round 2 ticket sales are here.{" "}
              <a href={`/form_${generateUniqueID(8)}`}></a>
            </p>
            <p>
              Head over to {/* This link below is the **REAL LINK** */}
              <a href={`http://localhost:1000/form_${formID}`}>our registration system</a>.{" "}
            </p>
            <p>One more time. Ticket sales are live at the link above.</p>
          </>
        )}

        <ul>
          <li>
            <a href="https://shmoocon.org/">ShmooCon</a>
          </li>
          {landingState.ticketMode && (
            <li>
              <a
                href={`/form_${generateUniqueID(8)}`}
                title="Click here"
              >
                Ticket Sales
              </a>{" "}
              Info
            </li>
          )}

          {!landingState.ticketMode && (
            <li>
              <a href="https://www.shmoocon.org/human-registration/">
                Ticket Sales Info
              </a>
            </li>
          )}
          <li>
            <a href="https://www.google.com/search?q=Moose+acting+funny&sclient=img">
              Moose
            </a>
          </li>
        </ul>

        <p>
          If you're looking for all ShmoOCon archives, we've got{" "}
          <a href="https://archive.org/details/shmoocon2024">that online too</a>
          .
        </p>
      </body>
    </html>
  );
}
