const fetch = require("node-fetch");
const { createClient } = require("@supabase/supabase-js");

// Create a single supabase client for interacting with your database
const supabase = createClient(
	"https://tjnmhtumhyawziflqzso.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqbm1odHVtaHlhd3ppZmxxenNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjM5NzI5NjQsImV4cCI6MTk3OTU0ODk2NH0.uEnkQpKqTZUY6zmDb7o3NDjk08dgQZAYy7M47siDU2Y"
);

const handler = async function (event, context) {
	if (event.httpMethod !== "GET")
		return { statusCode: 405, body: "Must GET to this function" };

	const token = event.headers["authorization"]

	if (!token) {
		return {
			statusCode: 401,
			body: JSON.stringify({ message: "Token is required" }),
		};
	}

	try {
		const { error, user } = await supabase.auth.api.getUser(token)

		if(error) {
			return {
				statusCode: error.status,
				body: JSON.stringify({ message: "Invalid token, signOut and retry later"}),
			};
		}

		const response = await fetch("https://api.chucknorris.io/jokes/random", {
			headers: { Accept: "application/json" },
		});

		if (response.status !== 200) {
			return {
				statusCode: response.status,
				body: JSON.stringify({ message: "Sorry, We can't get your joke" }),
				headers: {
					"Content-Type": "application/json",
				},
			};
		}

		const data = await response.json();

		return {
			statusCode: 200,
			body: JSON.stringify(data),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ message: error.message }),
		};
	}
};

module.exports = { handler };
