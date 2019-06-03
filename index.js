const parties = [
  [10, 50, 10],
  [5, 20, 30, 10],
  [5, 5, 5, 5, 5, 5],
];

const links = [
  [[0], [1, 2], [3]],
  [[0], [0, 4], [4], [5]],
];

const svg = document.getElementById("root");

// Corresponds to the shape of `parties`, but with the party sizes replaced with
// the [x, y, height] details of the rectangle for the party.
const partyCoords = [];

for (const [year, parliament] of parties.entries()) {
  const x = year * 30;
  const parliamentSize = parliament.reduce((a, b) => a + b, 0);

  const padding = 30 / (parliament.length - 1);

  const coords = [];
  let y = 0;
  for (const party of parliament) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", "10");
    rect.setAttribute("height", (100 * party / parliamentSize).toString());

    coords.push([x, y, 100 * party / parliamentSize]);
    svg.appendChild(rect);
    y += (100 * party / parliamentSize) + padding;
  }

  partyCoords.push(coords);
}

for (const [year, yearLinks] of links.entries()) {
  for (const [fromIndex, outIndices] of yearLinks.entries()) {
    // For each outIndex, we will need to determine how much of our outgoing
    // weight is going to each party. That will be determined by the sum of the
    // size of all the parties we are splitting into.
    let targetPartySizeSum = 0;
    for (const outIndex of outIndices) {
      targetPartySizeSum += parties[year + 1][outIndex];
    }

    let heightOffset = 0; // the amount of height consumed by preceding polygons
    for (const outIndex of outIndices) {
      const path = [];
      const [fromX, fromY, fromHeight] = partyCoords[year][fromIndex];
      const [toX, toY, toHeight] = partyCoords[year + 1][outIndex];

      const proportionalFromHeight = fromHeight * (parties[year + 1][outIndex] / targetPartySizeSum);

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
          sumPeerSize += parties[year][peerIndex];
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
          offsetFromPeers += toHeight * parties[year][peerIndex] / sumPeerSize;
        }
      }

      // The height of our polygon's contribution is proportial to our size
      // against all other peers.
      const proportionalPeerHeight = toHeight * parties[year][fromIndex] / sumPeerSize;

      path.push([fromX + 10, heightOffset + fromY]);
      path.push([fromX + 10, heightOffset + fromY + proportionalFromHeight]);
      path.push([toX, toY + offsetFromPeers + proportionalPeerHeight]);
      path.push([toX, toY + offsetFromPeers]);

      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polygon.setAttribute("points", path.map((coords) => coords.join(",")).join(" "));
      polygon.setAttribute("opacity", "0.1");
      svg.appendChild(polygon);

      heightOffset += proportionalFromHeight;
    }
  }
}
