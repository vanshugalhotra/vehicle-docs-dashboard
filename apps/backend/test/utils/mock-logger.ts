export const mockLogger = () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

export type MockedLogger = ReturnType<typeof mockLogger>;
