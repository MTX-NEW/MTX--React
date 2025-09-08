import path from 'path';
import fs from 'fs';

class FileStorage {
  constructor(basePath) {
    this.basePath = basePath;
  }

  saveFile(fileName, data) {
    const filePath = path.join(this.basePath, fileName);
    fs.writeFileSync(filePath, data);
  }

}

export default FileStorage;
