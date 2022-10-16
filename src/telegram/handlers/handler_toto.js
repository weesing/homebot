import _ from "lodash";
import { HandlerBase } from "./handler_base";
import { TotoLib } from "../../lib/toto";
import util from "util";

export class HandlerToto extends HandlerBase {
  async handleMessage(context) {
    const totoLib = new TotoLib();
    let msg = `<u><b>Toto Results</b></u>`;
    const { winningNumbers, additionalNumber, group1Prize } =
      await totoLib.getLatestTotoResults();
    console.log(`${winningNumbers}, ${additionalNumber}, ${group1Prize}`);
    // const data = await totoLib.getLatestTotoResults();
    // console.log(`${util.inspect(data, { depth: 99 })}`);

    msg += `

Winning numbers - ${winningNumbers.join(", ")}
Additional number - ${additionalNumber[0]}
Group 1 Prize - ${group1Prize[0]}

`;

    msg += `<a href="https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx">`;
    msg += `https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx`;
    msg += `</a>`;

    const opts = {
      parse_mode: "HTML",
    };
    this.sendMessage({ context, msg, opts });
  }
}

module.exports = HandlerToto;
