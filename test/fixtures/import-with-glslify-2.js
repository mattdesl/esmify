import { format } from 'util';
import glslify from 'glslify';
import path from 'path';

console.log(format('shader2: %s', glslify(path.resolve(__dirname, 'shader.vert'))));
