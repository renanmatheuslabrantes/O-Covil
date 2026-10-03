import { neon } from "@neondatabase/serverless";

let databaseUrl;
let client;

export function sql(strings, ...values) {
	const configuredUrl = process.env.DATABASE_URL;
	if (!configuredUrl) {
		throw new Error("DATABASE_URL não está configurada no ambiente.");
	}

	if (configuredUrl !== databaseUrl) {
		databaseUrl = configuredUrl;
		client = neon(configuredUrl);
	}

	return client(strings, ...values);
}