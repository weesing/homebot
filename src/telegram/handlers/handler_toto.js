import _ from "lodash";
import { HandlerBase } from "./handler_base";
import { TotoLib } from "../../lib/toto";
import util from "util";

export class HandlerToto extends HandlerBase {
    async handleMessage(context) {
        const totoLib = new TotoLib();
        const {
            drawDate,
            drawNumber,
            winningNumbers,
            additionalNumber,
            group1Prize,
            nextDrawDate,
            nextJackpot,
        } = await totoLib.getLatestTotoResults();

        const { recommendedNumbersData, extraNumbersData } =
            await totoLib.getRecommendedNumbers();
        const recommendedNumbersDisplay = recommendedNumbersData.map((data) => `${data.number}`).join(', ');
        const recommendedNumbers = recommendedNumbersData
            .map((data) => `
  <b>'${data.number}'</b> occurred ${data.occurences} times`);
        const extraNumbers = extraNumbersData.length > 0 ? extraNumbersData.map((data) => data.number).join(", ") : '<em>None</em>';

        let msg = `<u><b>Toto Results</b></u>
<i>${drawDate}</i> (${drawNumber})`;

        msg += `

Winning numbers - <em>${winningNumbers.join(", ")}</em>
Additional number - <em>${additionalNumber[0]}</em>
Group 1 Prize - ${group1Prize[0] || "-"}

`;

        const opts = {
            parse_mode: "HTML",
        };
        this.sendMessage({ context, msg, opts });
        this.sendMessage({
            context,
            msg: `<u><b>Next Draw</b></u>
<em>${nextDrawDate} ----->> ${nextJackpot}</em>
Recommended: <b>${recommendedNumbersDisplay}</b>
Extra Recommended: ${extraNumbers}
Stats: <code>${recommendedNumbers}</code>
<i>**Aggregating since 23 Feb 2024**</i>

████████████████
█░▄▄▄█░▄▄▄█░▄▄▄█
█▄▄▄▒█▄▄▄▒█▄▄▄▒█
▀▄▄▄▄▀▄▄▄▄▀▄▄▄▄▀

Good Luck!
<a href="https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx">
https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx
</a>`,
            opts,
        });
    }
}

module.exports = HandlerToto;
