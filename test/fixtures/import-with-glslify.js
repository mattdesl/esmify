import { format } from 'util';
import glslify from 'glslify';

console.log(format('shader: %s', glslify('void main () {}')));
