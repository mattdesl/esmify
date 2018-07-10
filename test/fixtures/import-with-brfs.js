import fs from 'fs';
import path from 'path';

console.log(fs.readFileSync(path.resolve(__dirname, 'shader.vert'), 'utf-8'))