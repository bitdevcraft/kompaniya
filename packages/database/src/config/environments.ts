import { env } from "@/env";

type Environment = "development" | "production" | "staging" | "test";

interface EnvironmentConfig {
  database: {
    idleTimeout: number;
    maxConnections: number;
    ssl: boolean;
  };
}

const configurations: Record<Environment, EnvironmentConfig> = {
  development: {
    database: {
      idleTimeout: 30,
      maxConnections: 10,
      ssl: false,
    },
  },
  production: {
    database: {
      idleTimeout: 120,
      maxConnections: 50,
      ssl: true,
    },
  },
  staging: {
    database: {
      idleTimeout: 60,
      maxConnections: 20,
      ssl: true,
    },
  },
  test: {
    database: {
      idleTimeout: 10,
      maxConnections: 5,
      ssl: true,
    },
  },
};

export function getConfig(): EnvironmentConfig {
  const nodeEnv = env.NODE_ENV as Environment;
  return configurations[nodeEnv];
}
