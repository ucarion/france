import yaml from 'js-yaml';
import fs from 'fs';

function readYaml(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }
      try {
        const doc = yaml.safeLoad(data);
        return resolve(doc);
      } catch(err2) {
        return reject(err2);
      }
    })
  });
}

export default function readLegislatures(fileName) {
  return readYaml(fileName)
    .then((doc) => {
      console.log('@@@@ doc:');
      console.log(JSON.stringify(doc, null, '  '));
    })
    .catch((err) => {
      console.log(err);
    });
}

readLegislatures('./data/legislatures.yml');
