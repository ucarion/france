"use strict";

var _readLegislatures = _interopRequireDefault(require("./readLegislatures"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const parties = [
//   [10, 50, 10],
//   [5, 20, 30, 10],
//   [5, 5, 5, 5, 5, 5],
//   [1, 1, 1, 1, 5, 1, 1],
// ];
// const links = [
//   [[0], [1, 2], [3]],
//   [[0], [0, 4], [4], [5]],
//   [[0, 4], [1, 4], [2, 4], [3, 4], [4, 5], [4, 6]],
// ];
// const sessionLengths = [
//   1,
//   5,
//   3,
// ];
async function main() {
  const {
    data
  } = await (0, _readLegislatures.default)("data/legislatures.yml");
  const {
    legislatures
  } = data;
  const partySizes = [];
  const partyLinks = [];
  const sessionLengths = [];

  for (const [index, {
    parties
  }] of legislatures) {
    partySizes.push(parties.map(p => p.seats));
    partyLinks.push(parties.map(p => p.becomes));
    sessionLengths.push(1);
  }

  console.log(partySizes);
  console.log(partyLinks);
  console.log(sessionLengths);
}

main().catch(err => console.error(err)); // const libxml = require("libxmljs");
// const svg = libxml.Document().node("svg").attr("xmlns", "http://www.w3.org/2000/svg");
// // Corresponds to the shape of `parties`, but with the party sizes replaced with
// // the [x, y, height] details of the rectangle for the party.
// const partyCoords = [];
// let x = 0;
// for (const [sessionIndex, parliament] of parties.entries()) {
//   const parliamentSize = parliament.reduce((a, b) => a + b, 0);
//   const padding = 30 / (parliament.length - 1);
//   const coords = [];
//   let y = 0;
//   for (const party of parliament) {
//     svg.node("rect")
//       .attr("x", x)
//       .attr("y", y)
//       .attr("width", "10")
//       .attr("height", (100 * party / parliamentSize).toString())
//       .parent();
//     coords.push([x, y, 100 * party / parliamentSize]);
//     y += (100 * party / parliamentSize) + padding;
//   }
//   partyCoords.push(coords);
//   x += sessionLengths[sessionIndex] * 30;
// }
// for (const [year, yearLinks] of links.entries()) {
//   for (const [fromIndex, outIndices] of yearLinks.entries()) {
//     // For each outIndex, we will need to determine how much of our outgoing
//     // weight is going to each party. That will be determined by the sum of the
//     // size of all the parties we are splitting into.
//     let targetPartySizeSum = 0;
//     for (const outIndex of outIndices) {
//       targetPartySizeSum += parties[year + 1][outIndex];
//     }
//     let heightOffset = 0; // the amount of height consumed by preceding polygons
//     for (const outIndex of outIndices) {
//       const [fromX, fromY, fromHeight] = partyCoords[year][fromIndex];
//       const [toX, toY, toHeight] = partyCoords[year + 1][outIndex];
//       const proportionalFromHeight = fromHeight * (parties[year + 1][outIndex] / targetPartySizeSum);
//       // Determine the height and offset of the "to" side. How much of to's
//       // height we can take up here is proportional to our size relative to
//       // other parties feeding into to.
//       //
//       // How much our height into to is offset by is determined by the sum of
//       // the contributions of all parties that contribute to to before us.
//       // Leftmost parties contribute first.
//       //
//       // We therefore must scan our year's links to find out who else is
//       // contributing to our target. Call the other parties contributing to the
//       // same target as us our "peers".
//       let sumPeerSize = 0;
//       for (const [peerIndex, peerLink] of yearLinks.entries()) {
//         if (peerLink.includes(outIndex)) {
//           sumPeerSize += parties[year][peerIndex];
//         }
//       }
//       // Now determine the offset. Only parties with an index inferior to ours
//       // contribute to our offset.
//       let offsetFromPeers = 0;
//       for (const [peerIndex, peerLink] of yearLinks.entries()) {
//         if (peerIndex == fromIndex) {
//           break;
//         }
//         if (peerLink.includes(outIndex)) {
//           offsetFromPeers += toHeight * parties[year][peerIndex] / sumPeerSize;
//         }
//       }
//       // The height of our polygon's contribution is proportial to our size
//       // against all other peers.
//       const proportionalPeerHeight = toHeight * parties[year][fromIndex] / sumPeerSize;
//       // To have the bezier be the midpoint between the two sessions, use:
//       //
//       //   const deltaX = toX - (fromX + 10);
//       //
//       // It turns out, in my opinion, that a simple constant looks better.
//       const deltaX = 10;
//       svg.node("path")
//         .attr("opacity", "0.1")
//         .attr("d", `
//           M ${fromX + 10} ${heightOffset + fromY}
//           L ${fromX + 10} ${heightOffset + fromY + proportionalFromHeight}
//           C ${fromX + 10 + deltaX / 2} ${heightOffset + fromY + proportionalFromHeight} ${toX - deltaX / 2} ${toY + offsetFromPeers + proportionalPeerHeight} ${toX} ${toY + offsetFromPeers + proportionalPeerHeight}
//           L ${toX} ${toY + offsetFromPeers}
//           C ${toX - deltaX} ${toY + offsetFromPeers} ${fromX + 10 + deltaX} ${heightOffset + fromY} ${fromX + 10} ${heightOffset + fromY}
//         `);
//       heightOffset += proportionalFromHeight;
//     }
//   }
// }
// console.log(svg.toString());