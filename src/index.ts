import "regenerator-runtime/runtime";
import GravityCollector from "./collector/GravityCollector";

if (window) {
    (window as any).GravityCollector = GravityCollector;
}

export default GravityCollector;
