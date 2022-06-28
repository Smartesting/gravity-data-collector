export default interface TLogHandler {
    run: (log: Log) => void;
}
