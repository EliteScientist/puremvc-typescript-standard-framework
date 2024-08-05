import { JestConfigWithTsJest, pathsToModuleNameMapper } from "ts-jest";

const config: JestConfigWithTsJest = {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	roots: ['<rootDir>/spec', "<rootDir>/src"],
	collectCoverage: true,
	collectCoverageFrom: ['<rootDir>/src/**'],
	coverageDirectory: '<rootDir>/coverage/jest',
	transformIgnorePatterns: [`node_modules`],
	moduleDirectories: ["<rootDir>/node_modules"],
	transform: {
		'^.+\\.tsx?$':
		[
			'ts-jest',
			{
				useESM: true,
				tsconfig: "tsconfig.json"
			}
		]
	}
}

export default config;