import 'regenerator-runtime/runtime';
import GravityLogger from './logger';

if (window) {
  (<any>window).GravityLogger = GravityLogger;
}

export default GravityLogger;
