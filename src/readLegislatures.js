import yaml from 'js-yaml';
import fs from 'fs';

export default function readYaml(fileName) {
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
