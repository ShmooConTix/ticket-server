import type { Logestic } from "logestic";
import type { Cookie } from "elysia";
import NotFoundPage from "./404";
import { db } from "..";
import type { SaleRecord } from "./hold";
import { Html } from "@elysiajs/html";

export function confirmPageRoute({
  logestic,
  confirmID,
  cookie,
}: {
  logestic: Logestic;
  confirmID: string;
  cookie: Record<string, Cookie<string | undefined>>;
}) {
  if (!cookie.XC.value || !cookie.CC.value || !cookie.CONF.value)
    return NotFoundPage();

  const findSessionQuery = db.query(
    "SELECT * FROM sessions WHERE xc = $xc AND cc = $cc AND conf = $conf AND confirmation_id = $conf_id AND completed_sale = TRUE"
  );

  const sessionRecord = findSessionQuery.get({
    $xc: cookie.XC.value,
    $cc: cookie.CC.value,
    $conf: cookie.CONF.value,
    $conf_id: confirmID,
  }) as SaleRecord | null;

  if (!sessionRecord) return NotFoundPage();

  logestic.info(`sale confirmed for ${sessionRecord.email}!`);

  return (
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <link href="files/tix-style.css" rel="stylesheet" type="text/css" />
        <title>Ticket Reservation Confirmation</title>
      </head>
      <body>
        <div style="width: 100%; height: 100%;" class="align-center">
          <div class="header"></div>
          <div class="print-header"> ShmooCon Tickets!! </div>
          <table id="mainTable" class="mainTable" width="850" align="center">
            <tbody>
              <tr id="contentRow">
                <td id="content">
                  <table
                    width="775"
                    id="contentTable"
                    align="center"
                    class="table-border"
                  >
                    <tbody>
                      <tr>
                        <td>
                          <h1 style="text-align: center;" class="title">
                            <span style="color: #a0a0a0;"></span> ShmooCon
                            Ticket Reservations
                          </h1>
                          <table class="newsposts" width="775">
                            <tr>
                              <td>
                                <div style="width: 725px; margin-left: 25px; margin-right: 25px; padding-bottom: 2em;">
                                  <p>
                                    <b>Congratulations!</b> You have
                                    successfully reserved{" "}
                                    <span style="color: red;">
                                      ** {sessionRecord.ticket_count} **
                                    </span>{" "}
                                    tickets.
                                  </p>
                                  <p>
                                    Later today, we will send an email
                                    containing purchasing information to:{" "}
                                  </p>
                                  <div class="key-data">
                                    {sessionRecord.email}
                                  </div>
                                  This email will include the following
                                  reservation ID:{" "}
                                  <div class="key-data">
                                    {sessionRecord.xc?.substring(0, 39)}
                                  </div>
                                  <p>
                                    And just in case that email gets lost or
                                    deleted as spam, please write this
                                    reservation id down as you will need it to
                                    complete your purchase later today.
                                  </p>
                                  <br />
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="text-align: center;">
                  <div style="width: 850px; height: 25px;" class="footer"></div>
                  <p style="margin-bottom: 3em;">Copyright © ShmooCon</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  );
}