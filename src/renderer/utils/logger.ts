export function createLogger(id: string) {
  return {
    log: (desc: string, ...rest: any[]) => {
      console.log.apply(null, [`[${id}]: ${desc}`, ...rest]);
    },
    error: (desc: string, ...rest: any[]) => {
      console.error.apply(null, [`[${id}]: ${desc}`, ...rest]);
    },
  };
}
