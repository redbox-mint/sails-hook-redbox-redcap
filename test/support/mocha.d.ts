declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: (done: (error?: unknown) => void) => unknown): void;
declare function beforeEach(fn: () => unknown): void;
declare function afterEach(fn: () => unknown): void;
