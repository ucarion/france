import readLegislatures from "./readLegislatures";
import libxml from "libxmljs";

const barWidth = 1;
const paddingPerCol = 10;
const partyPerCol = 200;
const sessionLengthScaleFactor = 500000000;

async function main() {
  const { data } = await readLegislatures("data/legislatures.yml");
  const { legislatures } = data;

  const partySizes = [];
  const partyColors = [];
  const partyLinks = [];
  const sessionLengths = [];

  for (const [index, { parties }] of legislatures.entries()) {
    partySizes.push(parties.map(p => p.seats));
    partyColors.push(parties.map(p => p.color));
    partyLinks.push(parties.map(p => p.becomes));

    if (index !== legislatures.length - 1) {
      const delta = new Date(legislatures[index + 1].date) - new Date(legislatures[index].date);
      sessionLengths.push(delta / sessionLengthScaleFactor);
    }
  }

  const svg = libxml.Document().node("svg").attr("xmlns", "http://www.w3.org/2000/svg");
  const defs = svg.node("defs");

  // Corresponds to the shape of `partySizes`, but with the party sizes replaced
  // with the [x, y, height] details of the rectangle for the party.
  const partyCoords = [];

  let x = 0;
  for (const [sessionIndex, parliament] of partySizes.entries()) {
    const parliamentSize = parliament.reduce((a, b) => a + b, 0);

    const padding = paddingPerCol / (parliament.length - 1);

    const coords = [];
    let y = 0;
    for (const [partyIndex, party] of parliament.entries()) {
      svg.node("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", barWidth)
        .attr("height", (partyPerCol * party / parliamentSize).toString())
        .attr("fill", partyColors[sessionIndex][partyIndex])
        .parent();

      coords.push([x, y, partyPerCol * party / parliamentSize]);
      y += (partyPerCol * party / parliamentSize) + padding;
    }

    partyCoords.push(coords);
    x += sessionLengths[sessionIndex];
  }

  for (const [year, yearLinks] of partyLinks.entries()) {
    for (const [fromIndex, outIndices] of yearLinks.entries()) {
      // For each outIndex, we will need to determine how much of our outgoing
      // weight is going to each party. That will be determined by the sum of the
      // size of all the parties we are splitting into.
      let targetPartySizeSum = 0;
      for (const outIndex of outIndices) {
        targetPartySizeSum += partySizes[year + 1][outIndex];
      }

      let heightOffset = 0; // the amount of height consumed by preceding polygons
      for (const outIndex of outIndices) {
        const [fromX, fromY, fromHeight] = partyCoords[year][fromIndex];
        const [toX, toY, toHeight] = partyCoords[year + 1][outIndex];

        const proportionalFromHeight = fromHeight * (partySizes[year + 1][outIndex] / targetPartySizeSum);

        // Determine the height and offset of the "to" side. How much of to's
        // height we can take up here is proportional to our size relative to
        // other parties feeding into to.
        //
        // How much our height into to is offset by is determined by the sum of
        // the contributions of all parties that contribute to to before us.
        // Leftmost parties contribute first.
        //
        // We therefore must scan our year's links to find out who else is
        // contributing to our target. Call the other parties contributing to the
        // same target as us our "peers".
        let sumPeerSize = 0;
        for (const [peerIndex, peerLink] of yearLinks.entries()) {
          if (peerLink.includes(outIndex)) {
            sumPeerSize += partySizes[year][peerIndex];
          }
        }

        // Now determine the offset. Only parties with an index inferior to ours
        // contribute to our offset.
        let offsetFromPeers = 0;
        for (const [peerIndex, peerLink] of yearLinks.entries()) {
          if (peerIndex == fromIndex) {
            break;
          }

          if (peerLink.includes(outIndex)) {
            offsetFromPeers += toHeight * partySizes[year][peerIndex] / sumPeerSize;
          }
        }

        // The height of our polygon's contribution is proportial to our size
        // against all other peers.
        const proportionalPeerHeight = toHeight * partySizes[year][fromIndex] / sumPeerSize;

        // To have the bezier be the midpoint between the two sessions, use:
        //
        //   const deltaX = toX - (fromX + 10);
        //
        // It turns out, in my opinion, that a simple constant looks better.
        const deltaX = 10;

        defs.node("linearGradient")
          .attr("id", `${year}-${fromIndex}-${outIndex}`)
          .node("stop").attr("offset", "0%").attr("stop-color", partyColors[year][fromIndex]).parent()
          .node("stop").attr("offset", "100%").attr("stop-color", partyColors[year + 1][outIndex]).parent();

        svg.node("path")
          .attr("opacity", "0.1")
          .attr("fill", `url(#${year}-${fromIndex}-${outIndex})`)
          .attr("d", `
            M ${fromX + barWidth} ${heightOffset + fromY}
            L ${fromX + barWidth} ${heightOffset + fromY + proportionalFromHeight}
            C ${fromX + barWidth + deltaX / 2} ${heightOffset + fromY + proportionalFromHeight} ${toX - deltaX / 2} ${toY + offsetFromPeers + proportionalPeerHeight} ${toX} ${toY + offsetFromPeers + proportionalPeerHeight}
            L ${toX} ${toY + offsetFromPeers}
            C ${toX - deltaX} ${toY + offsetFromPeers} ${fromX + 10 + deltaX} ${heightOffset + fromY} ${fromX + barWidth} ${heightOffset + fromY}
          `);

        heightOffset += proportionalFromHeight;
      }
    }
  }

  console.log(svg.toString());
}

main().catch(err => console.error(err));
