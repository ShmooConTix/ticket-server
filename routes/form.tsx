import { Html } from "@elysiajs/html";
import { generateUniqueCookieID, generateUniqueID } from "../utils";
import { db } from "..";
import type { Logestic } from "logestic";
import NotFoundPage from "./404";
import type { Cookie } from "elysia";

export type RiddleState = {
  r: Riddle;
};

export type Riddle = {
  id: number;
  riddle: string;
  answer: string;
  image_url: string | null;
  secret_key: string;
} | null;

// same riddle across all clients
export const riddleState: RiddleState = {
  r: null,
};

export function formPageRoute({
  formID,
  logestic,
  cookie,
}: {
  logestic: Logestic;
  formID: string;
  cookie: Record<string, Cookie<string | undefined>>;
}) {
  if (!riddleState?.r) return <NotFoundPage />;

  const findSessionQuery = db.query(
    "SELECT * FROM sessions WHERE form_id = $form_id AND completed_sale = FALSE"
  ); // cached

  if (!findSessionQuery.get({ $form_id: formID })) return <NotFoundPage />;

  const holdID = generateUniqueID(8);
  const XCcookieID = generateUniqueCookieID();

  // xc is pre-answer and is used in reservation (first 39 chars)
  cookie.XC.set({
    value: XCcookieID,
    // expiry for XC is never, but in this case session is fine
  });

  const updateSession = db.query(
    `UPDATE sessions SET hold_id = $hold_id, xc = $xc WHERE form_id = $form_id`
  ); // cached

  try {
    updateSession.run({
        $hold_id: holdID,
        $xc: XCcookieID,
        $form_id: formID,
    });
    logestic.info(
      `updated session in database: ${XCcookieID.substring(0, 20)}...`
    );
  } catch (e) {
    logestic.error(
      `an error occured adding the hold id (or sale session) to the database: ${e}`
    );
    return "An error occured adding the hold id or sale session.";
  }

  return (
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="files/alt-style.css" rel="stylesheet" type="text/css" />
        <title>ShmooCon - Registration</title>
      </head>
      <body>
        <h1 style="text-align: center;" class="title">
          <span style="color: #a0a0a0;"></span> ShmooCon Ticket Reservations
        </h1>
        <h3 style="text-align: center;">Ticket Time!</h3>
        <p>
          Hello! Welcome to the ticket round. To weed out bots...you gotta play
          a little game.
        </p>
        <form action={`/hold_${holdID}`}>
          <br />
          {riddleState.r.riddle}
          <br /> Answer:{" "}
          <input
            type="text"
            size="10"
            value=""
            name={riddleState.r.secret_key}
          />
          <br />
          <input type="submit" value="Submit!" />
        </form>
      </body>
    </html>
  );
}
